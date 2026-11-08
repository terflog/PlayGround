#!/usr/bin/env python3
"""
Compiles authentic Pokémon Yellow (pret/pokeyellow) assets, map data,
NPC dialogues, trainer parties, moves, base stats, and type matchups into
a self-contained ES module: src/data/pokeyellow-data.js
"""
import os
import re
import glob
import json
import zlib
import base64
import struct

POKEYELLOW = "/tmp/opencode/pokeyellow"
OUT_PATH = "/home/runner/work/PlayGround/PlayGround/src/data/pokeyellow-data.js"


def strip_debug(s: str) -> str:
    return re.sub(r"IF DEF\(_DEBUG\).*?ELSE(.*?)ENDC", r"\1", s, flags=re.S)


def clean_poke_str(raw: str) -> str:
    return (
        raw.replace("#MON", "POKéMON")
        .replace("#", "POKé")
        .replace("<PLAYER>", "RED")
        .replace("<RIVAL>", "BLUE")
        .replace("<PKMN>", "PKMN")
        .replace("<TM>", "TM")
        .replace("<TRAINER>", "TRAINER")
        .replace("<PC>", "PC")
        .replace("<ROCKET>", "ROCKET")
        .replace("<USER>", "PIKACHU")
        .replace("<TARGET>", "FOE")
        .replace("@", "")
    )


def read_png_2bit(path: str):
    with open(path, "rb") as f:
        data = f.read()
    pos = 8
    idat = b""
    w = h = bd = ct = 0
    while pos < len(data):
        length, ctype = struct.unpack(">I4s", data[pos : pos + 8])
        chunk = data[pos + 8 : pos + 8 + length]
        if ctype == b"IHDR":
            w, h, bd, ct, comp, flt, inter = struct.unpack(">IIBBBBB", chunk)
        elif ctype == b"IDAT":
            idat += chunk
        pos += 12 + length
    raw = zlib.decompress(idat)
    stride = (w * bd + 7) // 8
    rows = []
    prev = bytearray(stride)
    idx = 0
    bpp = max(1, bd // 8)
    for _ in range(h):
        ftype = raw[idx]
        idx += 1
        cur = bytearray(raw[idx : idx + stride])
        idx += stride
        if ftype == 1:
            for i in range(bpp, stride):
                cur[i] = (cur[i] + cur[i - bpp]) & 0xFF
        elif ftype == 2:
            for i in range(stride):
                cur[i] = (cur[i] + prev[i]) & 0xFF
        elif ftype == 3:
            for i in range(stride):
                left = cur[i - bpp] if i >= bpp else 0
                cur[i] = (cur[i] + ((left + prev[i]) >> 1)) & 0xFF
        elif ftype == 4:
            for i in range(stride):
                a = cur[i - bpp] if i >= bpp else 0
                b = prev[i]
                c = prev[i - bpp] if i >= bpp else 0
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                cur[i] = (cur[i] + pr) & 0xFF
        prev = cur
        row = []
        if bd == 2:
            for x in range(w):
                row.append((cur[x // 4] >> (6 - 2 * (x % 4))) & 3)
        elif bd == 1:
            for x in range(w):
                bit = (cur[x // 8] >> (7 - (x % 8))) & 1
                row.append(3 if bit else 0)
        elif bd == 4:
            for x in range(w):
                val = (cur[x // 2] >> (4 if x % 2 == 0 else 0)) & 0xF
                row.append(val >> 2)
        elif bd == 8:
            for x in range(w):
                row.append(cur[x] >> 6)
        rows.append(row)

    packed = bytearray()
    for r in rows:
        for x in range(0, w, 4):
            p0 = r[x] if x < w else 3
            p1 = r[x + 1] if x + 1 < w else 3
            p2 = r[x + 2] if x + 2 < w else 3
            p3 = r[x + 3] if x + 3 < w else 3
            b = ((p0 & 3) << 6) | ((p1 & 3) << 4) | ((p2 & 3) << 2) | (p3 & 3)
            packed.append(b)
    return w, h, base64.b64encode(bytes(packed)).decode("ascii")


def parse_palettes():
    with open(f"{POKEYELLOW}/constants/palette_constants.asm") as f:
        pal_const_txt = f.read()
    pal_names = []
    in_sgb = False
    for line in pal_const_txt.splitlines():
        if "; sgb palettes" in line:
            in_sgb = True
        elif in_sgb:
            m = re.search(r"const\s+(PAL_[A-Z0-9_]+)", line)
            if m:
                pal_names.append(m.group(1))

    with open(f"{POKEYELLOW}/data/sgb/sgb_palettes.asm") as f:
        sgb_txt = f.read()

    def extract_table(label):
        idx = sgb_txt.find(label)
        sub = sgb_txt[idx:]
        end = sub.find("assert_table_length")
        sub = sub[:end]
        out = {}
        i = 0
        for line in sub.splitlines():
            m = re.search(
                r"RGB\s+(\d+),(\d+),(\d+),\s*(\d+),(\d+),(\d+),\s*(\d+),(\d+),(\d+),\s*(\d+),(\d+),(\d+)",
                line,
            )
            if m and i < len(pal_names):
                vals = [int(v) for v in m.groups()]
                colors = []
                for c in range(4):
                    r5, g5, b5 = vals[c * 3], vals[c * 3 + 1], vals[c * 3 + 2]
                    r8 = round(r5 * 255 / 31)
                    g8 = round(g5 * 255 / 31)
                    b8 = round(b5 * 255 / 31)
                    colors.append([r8, g8, b8])
                out[pal_names[i]] = colors
                i += 1
        return out

    return {
        "sgb": extract_table("SuperPalettes:"),
        "cgb": extract_table("CGBBasePalettes:"),
    }


def parse_tilesets():
    tileset_files = {
        "Overworld": ("overworld", "overworld"),
        "RedsHouse1": ("reds_house", "reds_house"),
        "RedsHouse2": ("reds_house", "reds_house"),
        "House": ("house", "house"),
        "Mansion": ("mansion", "mansion"),
        "ShipPort": ("ship_port", "ship_port"),
        "Interior": ("interior", "interior"),
        "Plateau": ("plateau", "plateau"),
        "Dojo": ("gym", "gym"),
        "Gym": ("gym", "gym"),
        "Mart": ("pokecenter", "pokecenter"),
        "Pokecenter": ("pokecenter", "pokecenter"),
        "ForestGate": ("gate", "gate"),
        "Museum": ("gate", "gate"),
        "Gate": ("gate", "gate"),
        "Forest": ("forest", "forest"),
        "Facility": ("facility", "facility"),
        "Cemetery": ("cemetery", "cemetery"),
        "Cavern": ("cavern", "cavern"),
        "Lobby": ("lobby", "lobby"),
        "Ship": ("ship", "ship"),
        "Lab": ("lab", "lab"),
        "Club": ("club", "club"),
        "Underground": ("underground", "underground"),
        "BeachHouse": ("beach_house", "beach_house"),
    }

    with open(f"{POKEYELLOW}/data/tilesets/collision_tile_ids.asm") as f:
        coll_txt = f.read()
    coll_map = {}
    cur_labels = []
    for line in coll_txt.splitlines():
        m_lbl = re.match(r"^([A-Za-z0-9_]+)_Coll::", line.strip())
        if m_lbl:
            cur_labels.append(m_lbl.group(1))
        elif "coll_tiles" in line:
            hexes = [int(x, 16) for x in re.findall(r"\$([0-9A-Fa-f]+)", line)]
            for l in cur_labels:
                coll_map[l] = hexes
            cur_labels = []

    with open(f"{POKEYELLOW}/data/tilesets/warp_tile_ids.asm") as f:
        warp_lines = f.read().splitlines()
    warp_map = {}
    lbl_positions = []
    for idx, line in enumerate(warp_lines):
        m = re.match(r"^\.([A-Za-z0-9_]+)WarpTileIDs:", line.strip())
        if m:
            lbl_positions.append((m.group(1), idx))
    for tname, start_idx in lbl_positions:
        vals = []
        for line in warp_lines[start_idx + 1 :]:
            s = line.strip()
            if s.startswith("warp_tiles"):
                vals.extend(int(x, 16) for x in re.findall(r"\$([0-9A-Fa-f]+)", s))
                break
            elif s.startswith("db "):
                vals.extend(int(x, 16) for x in re.findall(r"\$([0-9A-Fa-f]+)", s))
        warp_map[tname] = vals

    with open(f"{POKEYELLOW}/data/tilesets/door_tile_ids.asm") as f:
        door_txt = f.read()
    door_ptrs = dict(re.findall(r"dbw\s+([A-Z0-9_]+),\s*\.([A-Za-z0-9_]+)", door_txt))
    door_lists = {}
    cur_dlbl = None
    for line in door_txt.splitlines():
        m = re.match(r"^\.([A-Za-z0-9_]+):", line.strip())
        if m:
            cur_dlbl = m.group(1)
        elif cur_dlbl and "door_tiles" in line:
            door_lists[cur_dlbl] = [
                int(x, 16) for x in re.findall(r"\$([0-9A-Fa-f]+)", line)
            ]
            cur_dlbl = None

    with open(f"{POKEYELLOW}/constants/tileset_constants.asm") as f:
        tc_txt = f.read()
    tileset_consts = re.findall(r"const\s+([A-Z0-9_]+)\s*;\s*\d+", tc_txt)

    with open(f"{POKEYELLOW}/data/tilesets/tileset_headers.asm") as f:
        th_txt = f.read()
    th_entries = re.findall(
        r"tileset\s+([A-Za-z0-9_]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*(TILEANIM_[A-Z_]+)",
        th_txt,
    )

    gfx_cache = {}
    bst_cache = {}
    for _, (png_name, bst_name) in tileset_files.items():
        if png_name not in gfx_cache:
            w, h, b64 = read_png_2bit(f"{POKEYELLOW}/gfx/tilesets/{png_name}.png")
            gfx_cache[png_name] = {"width": w, "height": h, "data": b64}
        if bst_name not in bst_cache:
            with open(f"{POKEYELLOW}/gfx/blocksets/{bst_name}.bst", "rb") as f:
                bst_cache[bst_name] = base64.b64encode(f.read()).decode("ascii")

    tilesets = []
    for idx, (tname, c1, c2, c3, grass, anim) in enumerate(th_entries):
        cname = tileset_consts[idx]

        def parse_val(v):
            v = v.strip()
            if v == "-1":
                return -1
            if v.startswith("$"):
                return int(v[1:], 16)
            return int(v)

        png_name, bst_name = tileset_files[tname]
        dlbl = door_ptrs.get(cname)
        tilesets.append(
            {
                "id": idx,
                "constName": cname,
                "name": tname,
                "gfxKey": png_name,
                "bstKey": bst_name,
                "counterTiles": [
                    x for x in (parse_val(c1), parse_val(c2), parse_val(c3)) if x != -1
                ],
                "grassTile": parse_val(grass),
                "anim": anim.replace("TILEANIM_", ""),
                "passableTiles": coll_map.get(tname, []),
                "warpTiles": warp_map.get(tname, []),
                "doorTiles": door_lists.get(dlbl, []) if dlbl else [],
            }
        )

    flowers = []
    for i in (1, 2, 3):
        w, h, b64 = read_png_2bit(f"{POKEYELLOW}/gfx/tilesets/flower/flower{i}.png")
        flowers.append(b64)

    with open(f"{POKEYELLOW}/data/tilesets/ledge_tiles.asm") as f:
        ledge_txt = f.read()
    ledges = []
    for m in re.finditer(
        r"db\s+SPRITE_FACING_([A-Z]+),\s*\$([0-9A-Fa-f]+),\s*\$([0-9A-Fa-f]+)",
        ledge_txt,
    ):
        ledges.append(
            {
                "dir": m.group(1),
                "standTile": int(m.group(2), 16),
                "ledgeTile": int(m.group(3), 16),
            }
        )

    with open(f"{POKEYELLOW}/data/tilesets/pair_collision_tile_ids.asm") as f:
        pair_txt = f.read()
    land_part = pair_txt.split("TilePairCollisionsWater::")[0]
    pair_land = []
    for m in re.finditer(
        r"db\s+([A-Z0-9_]+),\s*\$([0-9A-Fa-f]+),\s*\$([0-9A-Fa-f]+)", land_part
    ):
        pair_land.append(
            [m.group(1), int(m.group(2), 16), int(m.group(3), 16)]
        )

    return {
        "tilesets": tilesets,
        "gfx": gfx_cache,
        "bst": bst_cache,
        "flowers": flowers,
        "ledges": ledges,
        "pairCollisions": pair_land,
    }


def parse_sprites():
    with open(f"{POKEYELLOW}/constants/sprite_constants.asm") as f:
        sc_txt = f.read()
    sprite_consts = re.findall(r"const\s+(SPRITE_[A-Z0-9_]+)", sc_txt)

    sprites = {}
    for p in sorted(glob.glob(f"{POKEYELLOW}/gfx/sprites/*.png")):
        key = os.path.basename(p).replace(".png", "")
        w, h, b64 = read_png_2bit(p)
        sprites[key] = {"width": w, "height": h, "data": b64}

    const_to_key = {}
    for sc in sprite_consts:
        if sc == "SPRITE_NONE":
            const_to_key[sc] = None
            continue
        raw = sc.replace("SPRITE_", "").lower()
        if raw.startswith("unused_red"):
            raw = "red"
        elif raw.startswith("unused_old_amber"):
            raw = "old_amber"
        elif raw.startswith("unused_gambler_asleep"):
            raw = "gambler_asleep"
        const_to_key[sc] = raw if raw in sprites else "red"

    pika_faces = {}
    for name in [
        "pikachu_happy_1",
        "pikachu_happy_2",
        "pikachu_heart_1",
        "pikachu_heart_2",
        "pikachu_2_hearts_1",
        "pikachu_2_hearts_2",
        "pikachu_excited_1",
        "pikachu_excited_2",
        "pikachu_wink_1",
        "pikachu_wink_2",
        "pikachu_smile_1",
        "pikachu_smile_2",
        "pikachu_lightning_1",
        "pikachu_lightning_2",
        "pikachu_surprised_1",
        "pikachu_surprised_2",
        "pikachu_sleep_1",
        "pikachu_sleep_2",
    ]:
        p = f"{POKEYELLOW}/gfx/pikachu/{name}.png"
        if os.path.exists(p):
            w, h, b64 = read_png_2bit(p)
            pika_faces[name] = {"width": w, "height": h, "data": b64}

    emotes = {}
    for p in sorted(glob.glob(f"{POKEYELLOW}/gfx/emotes/*.png")):
        key = os.path.basename(p).replace(".png", "")
        w, h, b64 = read_png_2bit(p)
        emotes[key] = {"width": w, "height": h, "data": b64}

    # Wild & Party Pokémon front + back sprites
    mon_sprites = {}
    for p in sorted(glob.glob(f"{POKEYELLOW}/gfx/pokemon/front/*.png")):
        key = os.path.basename(p).replace(".png", "").upper().replace(".", "_")
        w, h, b64 = read_png_2bit(p)
        mon_sprites[key] = {"width": w, "height": h, "data": b64}
    if "NIDORANF" in mon_sprites:
        mon_sprites["NIDORAN_F"] = mon_sprites["NIDORANF"]
    if "NIDORANM" in mon_sprites:
        mon_sprites["NIDORAN_M"] = mon_sprites["NIDORANM"]
    if "MRMIME" in mon_sprites:
        mon_sprites["MR_MIME"] = mon_sprites["MRMIME"]

    # Back sprites for player party Pokémon
    for p in sorted(glob.glob(f"{POKEYELLOW}/gfx/pokemon/back/*.png")):
        stem = os.path.basename(p).replace(".png", "")
        if stem.endswith("b"):
            stem = stem[:-1]
        key = stem.upper().replace(".", "_") + "_BACK"
        w, h, b64 = read_png_2bit(p)
        mon_sprites[key] = {"width": w, "height": h, "data": b64}
    if "NIDORANF_BACK" in mon_sprites:
        mon_sprites["NIDORAN_F_BACK"] = mon_sprites["NIDORANF_BACK"]
    if "NIDORANM_BACK" in mon_sprites:
        mon_sprites["NIDORAN_M_BACK"] = mon_sprites["NIDORANM_BACK"]
    if "MRMIME_BACK" in mon_sprites:
        mon_sprites["MR_MIME_BACK"] = mon_sprites["MRMIME_BACK"]

    # Official Trainer front sprites from gfx/trainers/*.png
    trainer_sprites = {}
    for p in sorted(glob.glob(f"{POKEYELLOW}/gfx/trainers/*.png")):
        key = os.path.basename(p).replace(".png", "").upper().replace(".", "_")
        w, h, b64 = read_png_2bit(p)
        trainer_sprites[key] = {"width": w, "height": h, "data": b64}

    return {
        "sheets": sprites,
        "constToKey": const_to_key,
        "pikachuFaces": pika_faces,
        "emotes": emotes,
        "pokemon": mon_sprites,
        "trainers": trainer_sprites,
    }


def parse_battle_database():
    """Parses moves.asm, type_matchups.asm, base_stats/*.asm, evos_moves.asm, and trainer parties.asm."""
    # 1. Moves
    with open(f"{POKEYELLOW}/data/moves/names.asm") as f:
        mn_txt = f.read()
    move_display_names = [
        clean_poke_str(m.group(1)) for m in re.finditer(r'li\s+"([^"]+)"', mn_txt)
    ]

    with open(f"{POKEYELLOW}/data/moves/moves.asm") as f:
        mv_txt = f.read()
    moves = {}
    for idx, m in enumerate(
        re.finditer(
            r"move\s+([A-Z0-9_]+),\s*([A-Z0-9_]+),\s*(\d+),\s*([A-Z0-9_]+),\s*(\d+),\s*(\d+)",
            mv_txt,
        )
    ):
        mname, effect, pwr, mtype, acc, pp = m.groups()
        clean_type = mtype.replace("_TYPE", "")
        dname = (
            move_display_names[idx]
            if idx < len(move_display_names)
            else mname.replace("_M", "").replace("_", " ")
        )
        moves[mname] = {
            "id": mname,
            "num": idx + 1,
            "name": dname,
            "effect": effect,
            "power": int(pwr),
            "type": clean_type,
            "accuracy": int(acc),
            "pp": int(pp),
        }

    # 2. Type Matchups
    with open(f"{POKEYELLOW}/data/types/type_matchups.asm") as f:
        tm_txt = f.read()
    type_chart = []
    for m in re.finditer(
        r"db\s+([A-Z0-9_]+),\s*([A-Z0-9_]+),\s*(SUPER_EFFECTIVE|NOT_VERY_EFFECTIVE|NO_EFFECT)",
        tm_txt,
    ):
        atk_t, def_t, eff = m.groups()
        mult = 2.0 if eff == "SUPER_EFFECTIVE" else 0.5 if eff == "NOT_VERY_EFFECTIVE" else 0.0
        type_chart.append([atk_t.replace("_TYPE", ""), def_t.replace("_TYPE", ""), mult])

    # 3. Learnsets from evos_moves.asm
    with open(f"{POKEYELLOW}/data/pokemon/evos_moves.asm") as f:
        em_txt = f.read()
    learnsets = {}
    cur_mon = None
    in_moves = False
    for line in em_txt.splitlines():
        s = line.strip()
        m_lbl = re.match(r"^([A-Za-z0-9_]+)EvosMoves:", s)
        if m_lbl:
            raw_m = m_lbl.group(1)
            # Convert CamelCase to UPPER_SNAKE
            up = re.sub(r"([a-z])([A-Z])", r"\1_\2", raw_m).upper()
            if up == "NIDORAN_F":
                cur_mon = "NIDORAN_F"
            elif up == "NIDORAN_M":
                cur_mon = "NIDORAN_M"
            elif up == "MR_MIME":
                cur_mon = "MR_MIME"
            else:
                cur_mon = up.replace("_", "") if up not in ("FARFETCH_D",) else "FARFETCHD"
            learnsets[cur_mon] = []
            in_moves = False
        elif cur_mon:
            if s.startswith("; Learnset"):
                in_moves = True
            elif in_moves:
                mm = re.match(r"^db\s+(\d+),\s*([A-Z0-9_]+)", s)
                if mm:
                    learnsets[cur_mon].append([int(mm.group(1)), mm.group(2)])
                elif s == "db 0":
                    cur_mon = None

    # 4. Base Stats from data/pokemon/base_stats/*.asm
    pokemon_stats = {}
    for p in sorted(glob.glob(f"{POKEYELLOW}/data/pokemon/base_stats/*.asm")):
        with open(p) as f:
            bt = f.read()
        m_dex = re.search(r"db\s+DEX_([A-Z0-9_]+)", bt)
        if not m_dex:
            continue
        sp = m_dex.group(1)
        m_st = re.search(r"db\s+(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\s*\n\s*;\s*hp", bt)
        hp, atk, df, spd, spc = [int(x) for x in m_st.groups()] if m_st else [45, 50, 50, 50, 50]
        m_tp = re.search(r"db\s+([A-Z0-9_]+),\s*([A-Z0-9_]+)\s*;\s*type", bt)
        t1 = m_tp.group(1).replace("_TYPE", "") if m_tp else "NORMAL"
        t2 = m_tp.group(2).replace("_TYPE", "") if m_tp else t1
        m_cr = re.search(r"db\s+(\d+)\s*;\s*catch rate", bt)
        catch_rate = int(m_cr.group(1)) if m_cr else 120
        m_exp = re.search(r"db\s+(\d+)\s*;\s*base exp", bt)
        base_exp = int(m_exp.group(1)) if m_exp else 64
        m_lv1 = re.search(
            r"db\s+([A-Z0-9_]+),\s*([A-Z0-9_]+),\s*([A-Z0-9_]+),\s*([A-Z0-9_]+)\s*;\s*level 1",
            bt,
        )
        base_moves = [
            mv for mv in (m_lv1.groups() if m_lv1 else ["TACKLE"]) if mv != "NO_MOVE" and mv in moves
        ]
        lset_key = sp if sp in learnsets else sp.replace("_", "")
        pokemon_stats[sp] = {
            "species": sp,
            "hp": hp,
            "atk": atk,
            "def": df,
            "spd": spd,
            "spc": spc,
            "types": [t1] if t1 == t2 else [t1, t2],
            "catchRate": catch_rate,
            "baseExp": base_exp,
            "baseMoves": base_moves or ["TACKLE"],
            "learnset": learnsets.get(lset_key, []),
        }

    # 5. Trainer Classes, Names, and Parties from data/trainers/parties.asm
    with open(f"{POKEYELLOW}/constants/trainer_constants.asm") as f:
        tc_txt = f.read()
    trainer_consts = [
        m.group(1)
        for m in re.finditer(r"trainer_const\s+([A-Z0-9_]+)", tc_txt)
        if m.group(1) != "NOBODY"
    ]

    with open(f"{POKEYELLOW}/data/trainers/names.asm") as f:
        tn_txt = f.read()
    trainer_display_names = [
        clean_poke_str(m.group(1)) for m in re.finditer(r'li\s+"([^"]+)"', tn_txt)
    ]

    with open(f"{POKEYELLOW}/data/trainers/parties.asm") as f:
        pt_txt = f.read()
    pt_ptrs = re.findall(r"dw\s+([A-Za-z0-9_]+Data)", pt_txt)
    lbl_blocks = {}
    cur_lbl = None
    cur_lines = []
    for line in pt_txt.splitlines():
        s = line.strip()
        m_l = re.match(r"^([A-Za-z0-9_]+Data):$", s)
        if m_l:
            if cur_lbl:
                lbl_blocks[cur_lbl] = cur_lines
            cur_lbl = m_l.group(1)
            cur_lines = []
        elif cur_lbl and s.startswith("db "):
            cur_lines.append(s)
    if cur_lbl:
        lbl_blocks[cur_lbl] = cur_lines

    trainer_classes = {}
    for idx, tconst in enumerate(trainer_consts):
        opp_key = f"OPP_{tconst}"
        dname = trainer_display_names[idx] if idx < len(trainer_display_names) else tconst
        ptr_lbl = pt_ptrs[idx] if idx < len(pt_ptrs) else None
        raw_rows = lbl_blocks.get(ptr_lbl, [])
        parties = []
        for rline in raw_rows:
            body = rline.split(";")[0].replace("db ", "").strip()
            tokens = [t.strip() for t in body.split(",") if t.strip()]
            if not tokens or tokens[0] == "0":
                continue
            team = []
            if tokens[0] == "$FF":
                i = 1
                while i + 1 < len(tokens) and tokens[i] != "0":
                    lv = int(tokens[i])
                    sp = tokens[i + 1]
                    team.append([lv, sp])
                    i += 2
            else:
                lv = int(tokens[0])
                for sp in tokens[1:]:
                    if sp == "0":
                        break
                    team.append([lv, sp])
            if team:
                parties.append(team)
        trainer_classes[opp_key] = {
            "constName": opp_key,
            "classId": idx + 1,
            "displayName": dname,
            "parties": parties,
        }

    return {
        "moves": moves,
        "typeChart": type_chart,
        "pokemonStats": pokemon_stats,
        "trainerClasses": trainer_classes,
    }


def parse_texts():
    text_blocks = {}
    for pattern in [
        f"{POKEYELLOW}/text/*.asm",
        f"{POKEYELLOW}/data/text/*.asm",
    ]:
        for p in glob.glob(pattern):
            with open(p) as f:
                content = strip_debug(f.read())
            cur_labels = []
            cur_paras = []
            cur_lines = []
            for l in content.splitlines():
                m = re.match(r"^([A-Za-z0-9_]+)::?$", l.strip())
                if m:
                    if (cur_paras or cur_lines) and cur_labels:
                        if cur_lines:
                            cur_paras.append(" ".join(cur_lines))
                        txt = "\n\n".join(cur_paras).strip()
                        for lb in cur_labels:
                            text_blocks[lb] = txt
                        cur_labels = []
                        cur_paras = []
                        cur_lines = []
                    cur_labels.append(m.group(1))
                else:
                    tm = re.match(
                        r'^\s*(text|line|next|para|cont)\s+"([^"]*)"', l
                    )
                    if tm:
                        kind, raw = tm.groups()
                        s = clean_poke_str(raw)
                        if kind == "para" and cur_lines:
                            cur_paras.append(" ".join(cur_lines))
                            cur_lines = [s]
                        else:
                            cur_lines.append(s)
            if (cur_paras or cur_lines) and cur_labels:
                if cur_lines:
                    cur_paras.append(" ".join(cur_lines))
                txt = "\n\n".join(cur_paras).strip()
                for lb in cur_labels:
                    text_blocks[lb] = txt

    # Parse all global label sections across all scripts/*.asm (including *_2.asm!)
    global_sections = {}
    trainer_headers = {}
    tconst_to_hlabel = {}

    for p in sorted(glob.glob(f"{POKEYELLOW}/scripts/*.asm")):
        with open(p) as f:
            st = strip_debug(f.read())
        for hlabel, tconst in re.findall(
            r"dw_const\s+([A-Za-z0-9_]+),\s*(TEXT_[A-Z0-9_]+)", st
        ):
            tconst_to_hlabel[tconst] = hlabel

        for tm in re.finditer(
            r"([A-Za-z0-9_]+):\s*\n\s*trainer\s+[^,]+,\s*[^,]+,\s*([A-Za-z0-9_]+),\s*([A-Za-z0-9_]+),\s*([A-Za-z0-9_]+)",
            st,
        ):
            th_lbl, b_lbl, e_lbl, a_lbl = tm.groups()
            trainer_headers[th_lbl] = (b_lbl, e_lbl, a_lbl)

        lines = st.splitlines()
        cur_lbls = []
        cur_body = []
        for line in lines:
            m = re.match(r"^([A-Za-z0-9_]+)::?$", line.strip())
            if m:
                if cur_body and cur_lbls:
                    body_str = "\n".join(cur_body)
                    for lb in cur_lbls:
                        global_sections[lb] = body_str
                    cur_lbls = []
                    cur_body = []
                cur_lbls.append(m.group(1))
            else:
                cur_body.append(line)
        if cur_body and cur_lbls:
            body_str = "\n".join(cur_body)
            for lb in cur_lbls:
                global_sections[lb] = body_str

    def resolve_label_list(lbl, depth=0):
        if depth > 4 or not lbl:
            return []
        if "_" + lbl in text_blocks:
            return [text_blocks["_" + lbl]]
        if lbl in text_blocks:
            return [text_blocks[lbl]]
        sec = global_sections.get(lbl, "")
        if not sec:
            return []
        out = []
        for tf in re.findall(r"text_far\s+([A-Za-z0-9_]+)", sec):
            if tf in text_blocks and text_blocks[tf] not in out:
                out.append(text_blocks[tf])
        refs = re.findall(r"(?:farcall|call|jp|ld\s+hl,|ld\s+de,)\s+([A-Za-z0-9_]+)", sec)
        for r in refs:
            if r in (
                "PrintText",
                "TextScriptEnd",
                "TalkToTrainer",
                "DisplayTextID",
                "YesNoChoice",
                "GiveItem",
                "SaveEndBattleTextPointers",
                "EngageMapTrainer",
                "InitBattleEnemyParameters",
            ):
                continue
            if r in trainer_headers:
                b_lbl, e_lbl, a_lbl = trainer_headers[r]
                for sub_l in (b_lbl, e_lbl, a_lbl):
                    for s in resolve_label_list(sub_l, depth + 1):
                        if s not in out:
                            out.append(s)
                continue
            for s in resolve_label_list(r, depth + 1):
                if s not in out:
                    out.append(s)
        return out

    text_const_to_info = {}
    for tconst, hlabel in tconst_to_hlabel.items():
        sec = global_sections.get(hlabel, "")
        # Check if this handler points to a TrainerHeader
        th_match = re.search(r"ld\s+hl,\s*([A-Za-z0-9_]+TrainerHeader[A-Za-z0-9_]*)", sec)
        if th_match and th_match.group(1) in trainer_headers:
            b_lbl, e_lbl, a_lbl = trainer_headers[th_match.group(1)]
            b_list = resolve_label_list(b_lbl)
            e_list = resolve_label_list(e_lbl)
            a_list = resolve_label_list(a_lbl)
            b_txt = b_list[0] if b_list else ""
            e_txt = e_list[0] if e_list else "Impossible! You defeated my POKéMON!"
            a_txt = a_list[0] if a_list else b_txt
            text_const_to_info[tconst] = {
                "text": b_txt,
                "battleText": b_txt,
                "endBattleText": e_txt,
                "afterBattleText": a_txt,
            }
            continue

        parts = resolve_label_list(hlabel)
        if parts:
            text_const_to_info[tconst] = {
                "text": "\n\n".join(parts[:3]),
                "battleText": parts[0],
                "endBattleText": parts[1] if len(parts) > 1 else parts[0],
                "afterBattleText": parts[-1],
            }
            continue

        # Authentic system & shared NPC handlers in pret/pokeyellow
        hl_low = hlabel.lower()
        if "nurse" in hl_low:
            txt = (
                "Welcome to our POKéMON CENTER!\n\n"
                "We heal your POKéMON back to perfect health!\n\n"
                "We've restored your POKéMON to full health. We hope to see you again!"
            )
        elif "chansey" in hl_low:
            txt = "CHANSEY: Chaaan! Sey! ♥\n\nCHANSEY is smiling warmly beside NURSE JOY!"
        elif "linkreceptionist" in hl_low or "cableclub" in hl_low:
            txt = (
                "Welcome to the POKéMON CABLE CLUB!\n\n"
                "This area is reserved for 2 friends who are linked by a Game Link cable."
            )
        elif "clerk" in hl_low or "mart" in hl_low and "sign" not in hl_low:
            txt = (
                "Hi there! May I help you?\n\n"
                "Welcome to the POKéMON MART! We carry POKé BALLs, POTIONs, and field supplies for trainers!"
            )
        elif hlabel == "MartSignText":
            txt = "All your item needs fulfilled! POKéMON MART"
        elif hlabel == "PokeCenterSignText":
            txt = "Heal your POKéMON! POKéMON CENTER"
        elif "vendingmachine" in hl_low:
            txt = "A vending machine! Here's the menu: FRESH WATER, SODA POP, and LEMONADE!"
        elif "boulder" in hl_low:
            txt = "It's a big boulder, but a POKéMON may be able to push it aside with STRENGTH!"
        elif "pickupitem" in hl_low:
            txt = "Found an item inside the POKé BALL!"
        else:
            # Try matching prefix in text_blocks
            stem = hlabel.replace("Text", "")
            matches = [
                v for k, v in text_blocks.items() if k.startswith("_" + stem) or k.startswith(stem)
            ]
            if matches:
                txt = "\n\n".join(matches[:2])
            else:
                txt = ""

        if txt:
            text_const_to_info[tconst] = {
                "text": txt,
                "battleText": txt.split("\n\n")[0],
                "endBattleText": "What an incredible battle, RED!",
                "afterBattleText": txt.split("\n\n")[-1],
            }

    return text_const_to_info


def humanize_header_name(hname: str, cname: str) -> str:
    special = {
        "PalletTown": "Pallet Town",
        "ViridianCity": "Viridian City",
        "PewterCity": "Pewter City",
        "CeruleanCity": "Cerulean City",
        "LavenderTown": "Lavender Town",
        "VermilionCity": "Vermilion City",
        "CeladonCity": "Celadon City",
        "FuchsiaCity": "Fuchsia City",
        "CinnabarIsland": "Cinnabar Island",
        "IndigoPlateau": "Indigo Plateau",
        "SaffronCity": "Saffron City",
        "RedsHouse1F": "Red's House 1F",
        "RedsHouse2F": "Red's House 2F",
        "BluesHouse": "Blue's House",
        "OaksLab": "Oak's Research Lab",
        "BillsHouse": "Bill's Sea Cottage",
        "MrFujisHouse": "Mr. Fuji's House",
        "MrPsychicsHouse": "Mr. Psychic's House",
        "CopycatsHouse1F": "Copycat's House 1F",
        "CopycatsHouse2F": "Copycat's House 2F",
        "WardensHouse": "Safari Warden's House",
        "FuchsiaBillsGrandpasHouse": "Bill's Grandpa's House",
        "NameRatersHouse": "Name Rater's House",
        "SummerBeachHouse": "Summer Beach House (Pikachu's Beach)",
        "SSAnne1F": "S.S. Anne 1F Corridor",
        "SSAnne2F": "S.S. Anne 2F Corridor",
        "SSAnne3F": "S.S. Anne 3F Deck",
        "SSAnneB1F": "S.S. Anne B1F Corridor",
        "SSAnneBow": "S.S. Anne Bow (Deck)",
        "SSAnneKitchen": "S.S. Anne Galley Kitchen",
        "SSAnneCaptainsRoom": "S.S. Anne Captain's Quarters",
        "SSAnne1FRooms": "S.S. Anne 1F Passenger Cabins",
        "SSAnne2FRooms": "S.S. Anne 2F Passenger Cabins",
        "SSAnneB1FRooms": "S.S. Anne B1F Crew Cabins",
    }
    if hname in special:
        return special[hname]
    s = re.sub(r"([a-z])([A-Z0-9])", r"\1 \2", hname)
    s = re.sub(r"([0-9])([A-Z])", r"\1\2", s)
    s = s.replace("Pokecenter", "Pokémon Center")
    s = s.replace("Pokemon", "Pokémon")
    s = s.replace("Mt Moon", "Mt. Moon")
    s = s.replace("Silph Co", "Silph Co. ")
    s = s.replace("Digletts Cave", "Diglett's Cave")
    s = s.replace("Lances Room", "Lance's Room (Elite Four)")
    s = s.replace("Loreleis Room", "Lorelei's Room (Elite Four)")
    s = s.replace("Brunos Room", "Bruno's Room (Elite Four)")
    s = s.replace("Agathas Room", "Agatha's Room (Elite Four)")
    s = s.replace("Champions Room", "Champion's Room")
    return re.sub(r"\s+", " ", s).strip()


def build_npc_battle_profile(
    cname, obj_export_name, osprite, kind, extra, tinfo, battle_db, wild_data
):
    """
    Creates an authentic Pokémon Yellow battle profile for EVERY trainer and NPC
    so any NPC or Trainer in the game can be battled with an appropriate party!
    """
    trainer_classes = battle_db["trainerClasses"]

    # Skip pure inanimate item balls / books / clipboards / fossils / boulders
    if kind == "item" or osprite in (
        "SPRITE_POKE_BALL",
        "SPRITE_BOOK_MAP_DEX",
        "SPRITE_CLIPBOARD",
        "SPRITE_OLD_AMBER",
        "SPRITE_GAMBLER_ASLEEP",
        "SPRITE_SNORLAX",
        "SPRITE_BOULDER",
        "SPRITE_FOSSIL",
    ):
        # Wait: Snorlax IS a battleable Pokémon in Route 12 and Route 16!
        if osprite == "SPRITE_SNORLAX":
            return {
                "isWild": True,
                "trainerName": "SLEEPING SNORLAX",
                "trainerSprite": None,
                "party": [[30, "SNORLAX"]],
                "battleText": tinfo.get("battleText", "SNORLAX woke up! It attacked in a grumpy rage!"),
                "endBattleText": "SNORLAX returned to the mountains!",
                "afterBattleText": "The path is now wide open!",
            }
        return None

    # 1. Official Trainer object_event with OPP_<CLASS> #<IDX>
    if kind == "trainer" and extra:
        m = re.match(r"(OPP_[A-Z0-9_]+)\s+#(\d+)", extra)
        if m:
            opp_c, p_idx = m.group(1), int(m.group(2)) - 1
            tc = trainer_classes.get(opp_c)
            if tc and tc["parties"]:
                party = tc["parties"][p_idx % len(tc["parties"])]
                return {
                    "isWild": False,
                    "trainerClass": opp_c,
                    "trainerName": tc["displayName"],
                    "party": party,
                    "battleText": tinfo.get("battleText", tinfo.get("text", "")),
                    "endBattleText": tinfo.get("endBattleText", "What! Unbelievable!"),
                    "afterBattleText": tinfo.get("afterBattleText", tinfo.get("text", "")),
                }

    # 2. Scripted Major Characters (Rival Blue, Prof. Oak, Jessie & James, Giovanni, Gym Leaders, Karate Master, Overworld Legendaries)
    up_name = obj_export_name.upper()
    if "JESSIE" in up_name or "JAMES" in up_name:
        jj_idx = 0
        if "HIDEOUT" in cname:
            jj_idx = 1
        elif "TOWER" in cname:
            jj_idx = 2
        elif "SILPH" in cname:
            jj_idx = 3
        jj_parties = [
            [[14, "EKANS"], [14, "MEOWTH"], [14, "KOFFING"]],
            [[25, "KOFFING"], [25, "MEOWTH"], [25, "EKANS"]],
            [[27, "MEOWTH"], [27, "ARBOK"], [27, "WEEZING"]],
            [[31, "WEEZING"], [31, "ARBOK"], [31, "MEOWTH"]],
        ]
        return {
            "isWild": False,
            "trainerClass": "OPP_ROCKET",
            "trainerName": "JESSIE & JAMES",
            "trainerSprite": "JESSIEJAMES",
            "party": jj_parties[jj_idx],
            "battleText": tinfo.get("battleText") or "Prepare for trouble! Make it double! Meowth, that's right!",
            "endBattleText": "Looks like TEAM ROCKET's blasting off again!!",
            "afterBattleText": tinfo.get("afterBattleText") or "We'll get that PIKACHU next time!",
        }

    if "RIVAL" in up_name or "BLUE" in up_name or osprite == "SPRITE_BLUE":
        if "OAKS_LAB" in cname or "PALLET" in cname or "BLUES_HOUSE" in cname:
            party = [[5, "EEVEE"]]
        elif "ROUTE_22" in cname and "RIVAL2" not in up_name:
            party = [[9, "SPEAROW"], [8, "EEVEE"]]
        elif "CERULEAN" in cname:
            party = [[18, "SPEAROW"], [15, "SANDSHREW"], [15, "RATTATA"], [17, "EEVEE"]]
        elif "SS_ANNE" in cname:
            party = [[19, "SPEAROW"], [16, "RATTATA"], [18, "SANDSHREW"], [20, "EEVEE"]]
        elif "TOWER" in cname:
            party = [[25, "FEAROW"], [23, "SHELLDER"], [22, "VULPIX"], [20, "SANDSHREW"], [25, "EEVEE"]]
        elif "SILPH" in cname:
            party = [[38, "SANDSLASH"], [35, "NINETALES"], [37, "CLOYSTER"], [35, "KADABRA"], [40, "JOLTEON"]]
        else:
            party = [[61, "SANDSLASH"], [59, "ALAKAZAM"], [61, "EXEGGUTOR"], [61, "CLOYSTER"], [63, "NINETALES"], [65, "JOLTEON"]]
        return {
            "isWild": False,
            "trainerClass": "OPP_RIVAL1",
            "trainerName": "RIVAL BLUE",
            "trainerSprite": "RIVAL1",
            "party": party,
            "battleText": tinfo.get("battleText", "BLUE: Yo RED! Let's check out our POKéMON! Come on, I'll take you on!"),
            "endBattleText": "BLUE: What?! Unbelievable! I picked the wrong POKéMON!",
            "afterBattleText": tinfo.get("afterBattleText", "BLUE: Humph! At least you're raising your POKéMON! Smell ya later!"),
        }

    if osprite == "SPRITE_OAK":
        return {
            "isWild": False,
            "trainerClass": "OPP_PROF_OAK",
            "trainerName": "PROF. OAK",
            "trainerSprite": "PROF_OAK",
            "party": [[14, "TAUROS"], [15, "EXEGGUTOR"], [16, "ARCANINE"]],
            "battleText": tinfo.get("battleText", "OAK: Ahem! Let me test how well you and PIKACHU battle together, RED!"),
            "endBattleText": "OAK: Marvelous! Your bond with PIKACHU is truly special!",
            "afterBattleText": tinfo.get("afterBattleText", "OAK: Keep filling your POKéDEX and cherishing PIKACHU!"),
        }

    if "GIOVANNI" in up_name or osprite == "SPRITE_GIOVANNI":
        party = (
            [[25, "ONIX"], [24, "RHYHORN"], [29, "PERSIAN"]]
            if "HIDEOUT" in cname
            else [[37, "NIDORINO"], [35, "PERSIAN"], [37, "RHYHORN"], [41, "NIDOQUEEN"]]
        )
        return {
            "isWild": False,
            "trainerClass": "OPP_GIOVANNI",
            "trainerName": "BOSS GIOVANNI",
            "trainerSprite": "GIOVANNI",
            "party": party,
            "battleText": tinfo.get("battleText", "GIOVANNI: So! You must be RED! You cannot stop TEAM ROCKET's plans!"),
            "endBattleText": "GIOVANNI: Arrgh!! Beaten by a kid again?!",
            "afterBattleText": tinfo.get("afterBattleText", "GIOVANNI: TEAM ROCKET will never fall!"),
        }

    # Overworld Pokémon NPCs (Articuno, Zapdos, Moltres, Mewtwo, Chansey, Machop, Poliwrath, Pidgeot, etc.)
    for leg, lv in [("ARTICUNO", 50), ("ZAPDOS", 50), ("MOLTRES", 50), ("MEWTWO", 70)]:
        if leg in up_name:
            return {
                "isWild": True,
                "trainerName": f"LEGENDARY {leg}",
                "party": [[lv, leg]],
                "battleText": tinfo.get("battleText", f"{leg}: Gyaoooh!!"),
                "endBattleText": f"Legendary {leg} was calmed!",
                "afterBattleText": f"{leg} watches you with ancient respect.",
            }

    if osprite == "SPRITE_CHANSEY" or "CHANSEY" in up_name:
        return {
            "isWild": False,
            "trainerName": "POKéCENTER CHANSEY",
            "party": [[12, "CHANSEY"]],
            "battleText": "CHANSEY: Chaaan! Sey! ♥ (CHANSEY wants a friendly practice spar!)",
            "endBattleText": "CHANSEY clapped happily and healed your team!",
            "afterBattleText": "CHANSEY: Chaaan-sey! ♥",
        }

    # 3. Every other NPC in Pokémon Yellow gets a curated thematic team matching their sprite & zone!
    sprite_teams = {
        "SPRITE_MOM": ("MOM", [[8, "CLEFAIRY"], [10, "MEOWTH"]]),
        "SPRITE_DAISY": ("DAISY OAK", [[9, "CLEFAIRY"], [10, "ODDISH"]]),
        "SPRITE_NURSE": ("NURSE JOY", [[12, "CHANSEY"], [12, "JIGGLYPUFF"]]),
        "SPRITE_OFFICER_JENNY": ("OFFICER JENNY", [[14, "GROWLITHE"], [15, "SQUIRTLE"]]),
        "SPRITE_CLERK": ("POKé MART CLERK", [[10, "PIDGEY"], [11, "RATTATA"]]),
        "SPRITE_GYM_GUIDE": ("GYM GUIDE", [[12, "MACHOP"], [13, "SANDSHREW"]]),
        "SPRITE_OLD_PERSON": ("VIRIDIAN ELDER", [[8, "WEEDLE"], [10, "RATICATE"]]),
        "SPRITE_GRAMPS": ("ELDER GRAMPS", [[12, "GROWLITHE"], [14, "PONYTA"]]),
        "SPRITE_MR_FUJI": ("MR. FUJI", [[16, "CUBONE"], [18, "MAROWAK"]]),
        "SPRITE_CAPTAIN": ("S.S. ANNE CAPTAIN", [[18, "PSYDUCK"], [20, "FARFETCHD"]]),
        "SPRITE_FISHING_GURU": ("FISHING GURU", [[15, "MAGIKARP"], [18, "POLIWHIRL"], [20, "GYARADOS"]]),
        "SPRITE_SCIENTIST": ("SILPH SCIENTIST", [[16, "MAGNEMITE"], [17, "VOLTORB"], [18, "PORYGON"]]),
        "SPRITE_SUPER_NERD": ("POKéMANIAC", [[12, "EEVEE"], [13, "MAGNEMITE"]]),
        "SPRITE_ROCKET": ("TEAM ROCKET GRUNT", [[14, "RATTATA"], [14, "ZUBAT"], [15, "KOFFING"]]),
        "SPRITE_GUARD": ("SAFFRON GUARD", [[14, "GROWLITHE"], [15, "MACHOP"]]),
        "SPRITE_SAILOR": ("HARBOR SAILOR", [[15, "MACHOP"], [15, "TENTACOOL"]]),
        "SPRITE_GENTLEMAN": ("GENTLEMAN", [[16, "GROWLITHE"], [16, "PONYTA"]]),
        "SPRITE_CHANNELER": ("TOWER CHANNELER", [[16, "GASTLY"], [18, "HAUNTER"]]),
        "SPRITE_HIKER": ("MOUNTAIN HIKER", [[13, "GEODUDE"], [15, "ONIX"]]),
        "SPRITE_BIKER": ("KANTO BIKER", [[18, "KOFFING"], [18, "GRIMER"]]),
        "SPRITE_FISHER": ("KANTO FISHERMAN", [[12, "GOLDEEN"], [14, "POLIWAG"]]),
        "SPRITE_SWIMMER": ("SEA SWIMMER", [[16, "STARYU"], [17, "HORSEA"]]),
        "SPRITE_BEAUTY": ("KANTO BEAUTY", [[14, "CLEFAIRY"], [15, "BELLSPROUT"]]),
        "SPRITE_COOLTRAINER_M": ("ACE TRAINER♂", [[15, "NIDORINO"], [16, "CHARMELEON"]]),
        "SPRITE_COOLTRAINER_F": ("ACE TRAINER♀", [[15, "CLEFAIRY"], [16, "IVYSAUR"]]),
        "SPRITE_YOUNGSTER": ("YOUNGSTER", [[8, "RATTATA"], [9, "PIDGEY"]]),
        "SPRITE_GIRL": ("KANTO LASS", [[8, "PIDGEY"], [9, "JIGGLYPUFF"]]),
        "SPRITE_LITTLE_GIRL": ("JR. TRAINER", [[8, "PIKACHU"], [8, "CLEFAIRY"]]),
        "SPRITE_SAFARI_ZONE_WORKER": ("SAFARI RANGER", [[18, "TAUROS"], [18, "SCYTHER"]]),
    }

    role_title, party = sprite_teams.get(
        osprite, ("KANTO TRAINER", [[10, "PIDGEY"], [11, "PIKACHU"]])
    )
    # If the zone has wild Pokémon, blend one of the local wild species into civilian NPC's team!
    if wild_data and wild_data.get("grass"):
        w_lv, w_sp = wild_data["grass"][0]
        party = [[max(5, w_lv), w_sp], party[0]]

    clean_label = obj_export_name.split("_", 1)[-1].replace("_", " ")
    return {
        "isWild": False,
        "trainerName": f"{role_title} ({clean_label})",
        "party": party,
        "battleText": tinfo.get("battleText", tinfo.get("text", "Let's have a POKéMON battle!")),
        "endBattleText": tinfo.get("endBattleText", "Wow! You and PIKACHU are tough!"),
        "afterBattleText": tinfo.get("afterBattleText", tinfo.get("text", "That was a great match!")),
    }


def parse_maps(text_const_to_info, tilesets, battle_db):
    tileset_by_const = {t["constName"]: t for t in tilesets}

    with open(f"{POKEYELLOW}/constants/map_constants.asm") as f:
        mc_txt = f.read()

    map_consts = []
    indoor_groups = []
    cur_group_maps = []
    for line in mc_txt.splitlines():
        m = re.search(
            r"map_const\s+([A-Z0-9_]+),\s*(\d+),\s*(\d+)\s*;\s*\$([0-9A-Fa-f]+)",
            line,
        )
        if m:
            cname, w, h, hx = m.groups()
            cid = int(hx, 16)
            entry = {
                "romId": cid,
                "constName": cname,
                "width": int(w),
                "height": int(h),
            }
            map_consts.append(entry)
            if cid >= 0x25:
                cur_group_maps.append(cname)
        m_grp = re.search(r"end_indoor_group\s+([A-Z0-9_]+)", line)
        if m_grp:
            indoor_groups.append((m_grp.group(1), list(cur_group_maps)))
            cur_group_maps = []

    const_by_name = {m["constName"]: m for m in map_consts}

    with open(f"{POKEYELLOW}/data/maps/names.asm") as f:
        names_txt = f.read()
    region_names = {}
    for m in re.finditer(r"([A-Za-z0-9_]+):\s*db\s+\"([^\"]+)@\"", names_txt):
        lbl, rname = m.groups()
        region_names[lbl] = (
            rname.replace("#MON", "POKéMON").replace("<PKMN>", "PKMN")
        )

    with open(f"{POKEYELLOW}/data/maps/town_map_entries.asm") as f:
        tm_txt = f.read()
    outdoor_tm = re.findall(
        r"outdoor_map\s+(\d+),\s*(\d+),\s*([A-Za-z0-9_]+)", tm_txt
    )
    indoor_tm = re.findall(
        r"indoor_map\s+([A-Z0-9_]+),\s*(\d+),\s*(\d+),\s*([A-Za-z0-9_]+)",
        tm_txt,
    )
    map_tm_info = {}
    for idx, (x, y, nlbl) in enumerate(outdoor_tm):
        if idx < len(map_consts):
            cname = map_consts[idx]["constName"]
            map_tm_info[cname] = {
                "x": int(x),
                "y": int(y),
                "regionName": region_names.get(nlbl, cname),
            }
    grp_lookup = dict(indoor_groups)
    for grp_name, x, y, nlbl in indoor_tm:
        for cname in grp_lookup.get(grp_name, []):
            map_tm_info[cname] = {
                "x": int(x),
                "y": int(y),
                "regionName": region_names.get(nlbl, grp_name),
                "indoorGroup": grp_name,
            }

    with open(f"{POKEYELLOW}/data/maps/songs.asm") as f:
        songs_txt = f.read()
    song_rows = re.findall(
        r"db\s+(MUSIC_[A-Z0-9_]+),\s*BANK\([^\)]+\)\s*;\s*([A-Z0-9_]+)",
        songs_txt,
    )
    map_songs = {cname: music for music, cname in song_rows}

    with open(f"{POKEYELLOW}/data/maps/toggleable_objects.asm") as f:
        tog_txt = f.read()
    toggle_states = {}
    for m in re.finditer(
        r"toggle_object_state\s+([A-Z0-9_]+),\s*(ON|OFF)", tog_txt
    ):
        toggle_states[m.group(1)] = m.group(2) == "ON"

    with open(f"{POKEYELLOW}/maps.asm") as f:
        maps_asm_lines = f.read().splitlines()
    block_label_to_blk = {}
    pending = []
    for line in maps_asm_lines:
        m = re.match(
            r"^([A-Za-z0-9_]+)_Blocks:\s*(?:INCBIN\s+\"([^\"]+)\")?", line
        )
        if m:
            lbl, path = m.groups()
            pending.append(lbl)
            if path:
                for p_lbl in pending:
                    block_label_to_blk[p_lbl] = path
                pending = []

    with open(f"{POKEYELLOW}/data/wild/grass_water.asm") as f:
        gw_txt = f.read()
    wild_ptrs = re.findall(r"dw\s+([A-Za-z0-9_]+)", gw_txt)
    wild_tables = {}
    for p in glob.glob(f"{POKEYELLOW}/data/wild/maps/*.asm"):
        with open(p) as f:
            wt = f.read()
        m_lbl = re.match(r"^([A-Za-z0-9_]+):", wt.strip())
        if not m_lbl:
            continue
        wname = m_lbl.group(1)
        gm = re.search(
            r"def_grass_wildmons\s+(\d+)(.*?)end_grass_wildmons", wt, re.S
        )
        wm = re.search(
            r"def_water_wildmons\s+(\d+)(.*?)end_water_wildmons", wt, re.S
        )
        g_rate = int(gm.group(1)) if gm else 0
        g_mons = (
            [
                [int(lv), sp]
                for lv, sp in re.findall(
                    r"db\s+(\d+),\s*([A-Z0-9_]+)", gm.group(2)
                )
            ]
            if gm and g_rate > 0
            else []
        )
        w_rate = int(wm.group(1)) if wm else 0
        w_mons = (
            [
                [int(lv), sp]
                for lv, sp in re.findall(
                    r"db\s+(\d+),\s*([A-Z0-9_]+)", wm.group(2)
                )
            ]
            if wm and w_rate > 0
            else []
        )
        wild_tables[wname] = {
            "grassRate": g_rate,
            "grass": g_mons,
            "waterRate": w_rate,
            "water": w_mons,
        }

    headers_raw = []
    for p in sorted(glob.glob(f"{POKEYELLOW}/data/maps/headers/*.asm")):
        file_stem = os.path.basename(p).replace(".asm", "")
        with open(p) as f:
            ht = f.read()
        m = re.search(
            r"map_header\s+([A-Za-z0-9_]+),\s*([A-Z0-9_]+),\s*([A-Z0-9_]+)",
            ht,
        )
        hname, cname, tileset_const = m.groups()
        if file_stem == "UndergroundPathRoute7Copy":
            cname = "UNDERGROUND_PATH_ROUTE_7_COPY"
        conns = {}
        for d, th, tc, off in re.findall(
            r"connection\s+(north|south|west|east),\s*([A-Za-z0-9_]+),\s*([A-Z0-9_]+),\s*(-?\d+)",
            ht,
        ):
            conns[d] = {
                "direction": d,
                "targetHeader": th,
                "targetConst": tc,
                "offset": int(off),
            }
        headers_raw.append((file_stem, hname, cname, tileset_const, conns))

    headers_raw.sort(key=lambda x: const_by_name[x[2]]["romId"])

    incoming_warps = {}
    parsed_objects = {}
    for file_stem, hname, cname, tileset_const, conns in headers_raw:
        cinfo = const_by_name[cname]
        rom_id = cinfo["romId"]
        wild_ptr = wild_ptrs[rom_id] if rom_id < len(wild_ptrs) else "NothingWildMons"
        wild_data = wild_tables.get(
            wild_ptr, {"grassRate": 0, "grass": [], "waterRate": 0, "water": []}
        )

        obj_path = f"{POKEYELLOW}/data/maps/objects/{file_stem}.asm"
        with open(obj_path) as f:
            ot = f.read()
        obj_consts = re.findall(r"const_export\s+([A-Z0-9_]+)", ot)
        m_border = re.search(r"db\s+\$([0-9A-Fa-f]+)\s*;\s*border block", ot)
        border_block = int(m_border.group(1), 16) if m_border else 0

        warps = []
        for idx, wm in enumerate(
            re.finditer(
                r"warp_event\s+(\d+),\s*(\d+),\s*([A-Z0-9_]+),\s*(\d+)", ot
            )
        ):
            wx, wy, dest_c, dwarp = wm.groups()
            warps.append(
                {
                    "index": idx,
                    "x": int(wx),
                    "y": int(wy),
                    "destConst": dest_c,
                    "destWarpIndex": int(dwarp) - 1,
                }
            )
            if dest_c != "LAST_MAP":
                incoming_warps.setdefault(dest_c, []).append(
                    {
                        "fromConst": cname,
                        "fromWarpIndex": idx,
                        "toWarpIndex": int(dwarp) - 1,
                        "x": int(wx),
                        "y": int(wy),
                    }
                )

        signs = []
        for sm in re.finditer(
            r"bg_event\s+(\d+),\s*(\d+),\s*([A-Z0-9_]+)", ot
        ):
            sx, sy, stext = sm.groups()
            sinfo = text_const_to_info.get(stext, {})
            signs.append(
                {
                    "x": int(sx),
                    "y": int(sy),
                    "textConst": stext,
                    "text": sinfo.get("text")
                    or f"[{stext.replace('TEXT_', '')}]",
                }
            )

        objects = []
        obj_lines = [
            l.strip()
            for l in ot.splitlines()
            if l.strip().startswith("object_event ")
        ]
        for oidx, oline in enumerate(obj_lines):
            parts = [
                p.strip()
                for p in oline.replace("object_event", "", 1).split(",")
            ]
            ox, oy = int(parts[0]), int(parts[1])
            osprite = parts[2]
            omove = parts[3]
            orange = parts[4]
            otext = parts[5]
            obj_export_name = (
                obj_consts[oidx] if oidx < len(obj_consts) else f"{cname}_OBJ_{oidx+1}"
            )
            default_vis = toggle_states.get(obj_export_name, True)
            kind = "npc"
            extra = None
            if len(parts) == 7:
                kind = "item"
                extra = parts[6]
            elif len(parts) >= 8:
                kind = "trainer"
                extra = f"{parts[6]} #{parts[7]}"

            tinfo = dict(text_const_to_info.get(otext, {}))
            resolved_txt = tinfo.get("text")
            if not resolved_txt:
                if kind == "item":
                    resolved_txt = f"RED found {extra.replace('_', ' ')}!"
                elif kind == "trainer":
                    resolved_txt = f"Trainer ({extra.replace('OPP_', '')}): Our eyes met! Let's battle with our POKéMON!"
                else:
                    resolved_txt = f"{obj_export_name.replace('_', ' ')}: Welcome to {humanize_header_name(hname, cname)}!"
                tinfo["text"] = resolved_txt

            battle_prof = build_npc_battle_profile(
                cname,
                obj_export_name,
                osprite,
                kind,
                extra,
                tinfo,
                battle_db,
                wild_data,
            )

            objects.append(
                {
                    "id": oidx + 1,
                    "name": obj_export_name,
                    "x": ox,
                    "y": oy,
                    "sprite": osprite,
                    "movement": omove,
                    "dir": orange,
                    "kind": kind,
                    "extra": extra,
                    "defaultVisible": default_vis,
                    "text": resolved_txt,
                    "battle": battle_prof,
                }
            )

        parsed_objects[cname] = {
            "borderBlock": border_block,
            "warps": warps,
            "signs": signs,
            "objects": objects,
        }

    def find_outdoor_parent(start_cname):
        visited = set()
        queue = [(start_cname, 0)]
        while queue:
            cur, warp_idx = queue.pop(0)
            if cur in visited:
                continue
            visited.add(cur)
            cinfo = const_by_name.get(cur)
            if cinfo and cinfo["romId"] < 0x25:
                return {"mapConst": cur, "warpIndex": warp_idx}
            for inc in incoming_warps.get(cur, []):
                queue.append((inc["fromConst"], inc["fromWarpIndex"]))
        tm = map_tm_info.get(start_cname, {})
        grp = tm.get("indoorGroup", "PALLET_TOWN")
        if grp in const_by_name and const_by_name[grp]["romId"] < 0x25:
            return {"mapConst": grp, "warpIndex": 0}
        return {"mapConst": "PALLET_TOWN", "warpIndex": 0}

    city_pals = [
        "PAL_PALLET",
        "PAL_VIRIDIAN",
        "PAL_PEWTER",
        "PAL_CERULEAN",
        "PAL_LAVENDER",
        "PAL_VERMILION",
        "PAL_CELADON",
        "PAL_FUCHSIA",
        "PAL_CINNABAR",
        "PAL_INDIGO",
        "PAL_SAFFRON",
    ]

    def get_map_palette(cname, rom_id, tileset_const, parent_outdoor_const):
        if tileset_const == "CEMETERY":
            return "PAL_GRAYMON"
        if tileset_const == "CAVERN":
            return "PAL_CAVE"
        if cname in ("CERULEAN_CAVE_1F", "CERULEAN_CAVE_2F", "CERULEAN_CAVE_B1F", "BRUNOS_ROOM"):
            return "PAL_CAVE"
        if cname == "LORELEIS_ROOM":
            return "PAL_PALLET"
        if cname in ("TRADE_CENTER", "COLOSSEUM"):
            return "PAL_GRAYMON"
        if cname == "SUMMER_BEACH_HOUSE":
            return "PAL_PIKACHUS_BEACH"
        target_id = rom_id
        if rom_id >= 0x25:
            target_id = const_by_name.get(parent_outdoor_const, {"romId": 0})["romId"]
        if target_id < 11:
            return city_pals[target_id]
        return "PAL_ROUTE"

    aux_consts = {
        "UNDERGROUND_PATH_ROUTE_7_COPY",
        "TRADE_CENTER",
        "COLOSSEUM",
        "SILPH_CO_ELEVATOR",
    }

    dungeon_tilesets = {
        "FOREST",
        "CAVERN",
        "CEMETERY",
        "FACILITY",
        "SHIP",
        "UNDERGROUND",
        "MANSION",
        "PLATEAU",
    }

    all_zones = []
    canonical_idx = 0
    aux_idx = 220
    for file_stem, hname, cname, tileset_const, conns in headers_raw:
        cinfo = const_by_name[cname]
        rom_id = cinfo["romId"]
        w, h = cinfo["width"], cinfo["height"]
        blk_rel = block_label_to_blk.get(hname, f"maps/{file_stem}.blk")
        blk_path = f"{POKEYELLOW}/{blk_rel}"
        with open(blk_path, "rb") as f:
            blk_bytes = f.read()
        if len(blk_bytes) < w * h:
            blk_bytes = blk_bytes + bytes([parsed_objects[cname]["borderBlock"]] * (w * h - len(blk_bytes)))
        else:
            blk_bytes = blk_bytes[: w * h]

        parent_outdoor = find_outdoor_parent(cname)
        pal_const = get_map_palette(
            cname, rom_id, tileset_const, parent_outdoor["mapConst"]
        )
        tm = map_tm_info.get(
            cname, {"x": 2, "y": 11, "regionName": "PALLET TOWN"}
        )
        wild_ptr = (
            wild_ptrs[rom_id]
            if rom_id < len(wild_ptrs)
            else "NothingWildMons"
        )
        wild_data = wild_tables.get(
            wild_ptr,
            {"grassRate": 0, "grass": [], "waterRate": 0, "water": []},
        )

        if rom_id < 0x0B:
            cat = "town"
        elif rom_id < 0x25:
            cat = "route"
        elif (
            tileset_const in dungeon_tilesets
            or "SAFARI_ZONE_" in cname
            or "SEAFOAM_" in cname
            or "MT_MOON" in cname
            or "VICTORY_ROAD" in cname
            or "ROCK_TUNNEL" in cname
            or "CERULEAN_CAVE" in cname
            or "POWER_PLANT" in cname
            or "POKEMON_TOWER" in cname
            or "POKEMON_MANSION" in cname
            or "ROCKET_HIDEOUT" in cname
            or "DIGLETTS_CAVE" in cname
        ):
            cat = "dungeon"
        else:
            cat = "indoor"

        is_canonical = cname not in aux_consts
        if is_canonical:
            canonical_idx += 1
            znum = canonical_idx
        else:
            aux_idx += 1
            znum = aux_idx

        obj_data = parsed_objects[cname]
        all_zones.append(
            {
                "zoneNumber": znum,
                "isCanonical220": is_canonical,
                "romId": rom_id,
                "romHex": f"0x{rom_id:02X}",
                "constName": cname,
                "headerName": hname,
                "displayName": humanize_header_name(hname, cname),
                "regionName": tm["regionName"],
                "townMapX": tm["x"],
                "townMapY": tm["y"],
                "category": cat,
                "tileset": tileset_const,
                "tilesetId": tileset_by_const[tileset_const]["id"],
                "palette": pal_const,
                "music": map_songs.get(cname, "MUSIC_PALLET_TOWN"),
                "width": w,
                "height": h,
                "borderBlock": obj_data["borderBlock"],
                "blocks": base64.b64encode(blk_bytes).decode("ascii"),
                "connections": conns,
                "warps": obj_data["warps"],
                "defaultParent": parent_outdoor,
                "signs": obj_data["signs"],
                "objects": obj_data["objects"],
                "wild": wild_data,
            }
        )

    return all_zones


def parse_music():
    tracks_to_parse = {
        "MUSIC_PALLET_TOWN": "pallettown.asm",
        "MUSIC_CITIES1": "cities1.asm",
        "MUSIC_CITIES2": "cities2.asm",
        "MUSIC_LAVENDER": "lavender.asm",
        "MUSIC_VERMILION": "vermilion.asm",
        "MUSIC_CELADON": "celadon.asm",
        "MUSIC_CINNABAR": "cinnabar.asm",
        "MUSIC_INDIGO_PLATEAU": "indigoplateau.asm",
        "MUSIC_ROUTES1": "routes1.asm",
        "MUSIC_ROUTES2": "routes2.asm",
        "MUSIC_ROUTES3": "routes3.asm",
        "MUSIC_ROUTES4": "routes4.asm",
        "MUSIC_OAKS_LAB": "oakslab.asm",
        "MUSIC_POKECENTER": "pokecenter.asm",
        "MUSIC_GYM": "gym.asm",
        "MUSIC_DUNGEON1": "dungeon1.asm",
        "MUSIC_DUNGEON2": "dungeon2.asm",
        "MUSIC_DUNGEON3": "dungeon3.asm",
        "MUSIC_POKEMON_TOWER": "pokemontower.asm",
        "MUSIC_SS_ANNE": "ssanne.asm",
        "MUSIC_SILPH_CO": "silphco.asm",
        "MUSIC_CINNABAR_MANSION": "cinnabarmansion.asm",
        "MUSIC_GAME_CORNER": "gamecorner.asm",
    }
    semitones = {
        "C_": 0,
        "C#": 1,
        "D_": 2,
        "D#": 3,
        "E_": 4,
        "F_": 5,
        "F#": 6,
        "G_": 7,
        "G#": 8,
        "A_": 9,
        "A#": 10,
        "B_": 11,
    }
    music_data = {}
    for mconst, fname in tracks_to_parse.items():
        path = f"{POKEYELLOW}/audio/music/{fname}"
        if not os.path.exists(path):
            continue
        with open(path) as f:
            txt = f.read()
        tempo_m = re.search(r"tempo\s+(\d+)", txt)
        tempo = int(tempo_m.group(1)) if tempo_m else 150
        channels = []
        parts = re.split(r"Music_[A-Za-z0-9_]+_Ch([123])::", txt)
        for i in range(1, len(parts), 2):
            ch_num = int(parts[i])
            ch_body = parts[i + 1]
            ch_body = re.split(r"Music_[A-Za-z0-9_]+_Ch4::", ch_body)[0]
            octave = 4
            note_len_mul = 12
            events = []
            total_ticks = 0
            for line in ch_body.splitlines():
                s = line.strip()
                m_oct = re.match(r"octave\s+(\d+)", s)
                if m_oct:
                    octave = int(m_oct.group(1))
                    continue
                m_nt = re.match(r"note_type\s+(\d+)", s)
                if m_nt:
                    note_len_mul = int(m_nt.group(1))
                    continue
                m_note = re.match(r"note\s+([A-G][#_]?),?\s*(\d+)", s)
                if m_note:
                    nname, dur = m_note.groups()
                    midi = (octave + 1) * 12 + semitones.get(nname, 0)
                    ticks = int(dur) * note_len_mul
                    events.append([midi, ticks])
                    total_ticks += ticks
                m_rest = re.match(r"rest\s+(\d+)", s)
                if m_rest:
                    ticks = int(m_rest.group(1)) * note_len_mul
                    events.append([0, ticks])
                    total_ticks += ticks
                if total_ticks > 1800:
                    break
            if events:
                channels.append({"ch": ch_num, "notes": events})
        music_data[mconst] = {"tempo": tempo, "channels": channels}
    return music_data


def main():
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    palettes = parse_palettes()
    tileset_bundle = parse_tilesets()
    sprite_bundle = parse_sprites()
    battle_db = parse_battle_database()
    texts = parse_texts()
    zones = parse_maps(texts, tileset_bundle["tilesets"], battle_db)
    music = parse_music()

    canonical_count = sum(1 for z in zones if z["isCanonical220"])
    battleable_count = sum(
        1 for z in zones for o in z["objects"] if o.get("battle") is not None
    )
    print(f"Total headers compiled: {len(zones)} (Canonical 220 count: {canonical_count})")
    print(f"Total tilesets: {len(tileset_bundle['tilesets'])}")
    print(f"Total sprite sheets: {len(sprite_bundle['sheets'])}")
    print(f"Total Pokemon sprites: {len(sprite_bundle['pokemon'])}")
    print(f"Total Trainer sprites: {len(sprite_bundle['trainers'])}")
    print(f"Total Moves: {len(battle_db['moves'])}, BaseStats: {len(battle_db['pokemonStats'])}")
    print(f"Total battleable NPCs & Trainers: {battleable_count}")

    payload = {
        "palettes": palettes,
        "tilesets": tileset_bundle,
        "sprites": sprite_bundle,
        "battle": battle_db,
        "zones": zones,
        "music": music,
    }

    with open(OUT_PATH, "w") as f:
        f.write("// Auto-generated from official pret/pokeyellow disassembly\n")
        f.write("export const POKEYELLOW_DATA = ")
        json.dump(payload, f, separators=(",", ":"))
        f.write(";\n")

    size_kb = os.path.getsize(OUT_PATH) / 1024
    print(f"Wrote {OUT_PATH} ({size_kb:.1f} KB)")


if __name__ == "__main__":
    main()
