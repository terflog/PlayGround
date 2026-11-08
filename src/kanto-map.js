import {
  MAP_WIDTH,
  MAP_HEIGHT,
  TILE,
  SOLID_TILES,
  CITIES,
  LANDMARKS,
  ROUTES,
  GYM_BADGES,
  NPCS,
  SIGNS,
  CRYSTAL_EVENTS,
} from './kanto-data.js';

export class KantoMap {
  constructor() {
    this.width = MAP_WIDTH;
    this.height = MAP_HEIGHT;
    this.tiles = new Uint8Array(this.width * this.height);
    this.buildings = []; // Metadata for roof labels & doors
    this.buildWorld();
  }

  idx(x, y) {
    return y * this.width + x;
  }

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  getTile(x, y) {
    if (!this.inBounds(x, y)) return TILE.DEEP_WATER;
    return this.tiles[this.idx(x, y)];
  }

  setTile(x, y, tile) {
    if (!this.inBounds(x, y)) return;
    this.tiles[this.idx(x, y)] = tile;
  }

  fillRect(x1, y1, x2, y2, tile) {
    const minX = Math.max(0, Math.min(x1, x2));
    const maxX = Math.min(this.width - 1, Math.max(x1, x2));
    const minY = Math.max(0, Math.min(y1, y2));
    const maxY = Math.min(this.height - 1, Math.max(y1, y2));
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        this.tiles[this.idx(x, y)] = tile;
      }
    }
  }

  strokeRect(x1, y1, x2, y2, tile) {
    for (let x = x1; x <= x2; x++) {
      this.setTile(x, y1, tile);
      this.setTile(x, y2, tile);
    }
    for (let y = y1; y <= y2; y++) {
      this.setTile(x1, y, tile);
      this.setTile(x2, y, tile);
    }
  }

  placeBuilding(x, y, w, h, roofTile, label, type = 'house') {
    // Roof occupies top h-1 rows, bottom row is front facade wall with a door
    this.fillRect(x, y, x + w - 1, y + h - 2, roofTile);
    this.fillRect(x, y + h - 1, x + w - 1, y + h - 1, TILE.BUILDING_WALL);
    const doorX = x + Math.floor(w / 2);
    const doorY = y + h - 1;
    this.setTile(doorX, doorY, TILE.DOOR);
    // Ensure walkable step in front of door
    this.setTile(doorX, doorY + 1, TILE.PAVED);
    if (type === 'pokecenter') {
      this.setTile(doorX, doorY + 1, TILE.HEAL_PAD);
    }
    this.buildings.push({ x, y, w, h, roofTile, label, type, doorX, doorY });
  }

  buildWorld() {
    // 1. Base ocean around the Kanto peninsula
    this.fillRect(0, 0, this.width - 1, this.height - 1, TILE.DEEP_WATER);

    // 2. Main Kanto Continental Landmass
    // Northern & Central Kanto mainland
    this.fillRect(12, 6, 148, 108, TILE.GRASS);
    // Southwest peninsula around Pallet Town & Viridian
    this.fillRect(28, 56, 52, 104, TILE.GRASS);
    // Southern sea carved out below Route 18/Fuchsia/Vermilion
    this.fillRect(10, 105, 148, 134, TILE.WATER);
    // Ocean bay between Pallet Town/Cinnabar and Cycling Road/Fuchsia
    this.fillRect(48, 62, 82, 97, TILE.WATER);
    // Vermilion Harbor Bay south of Vermilion City
    this.fillRect(83, 91, 122, 99, TILE.WATER);
    // Eastern Ocean outside Route 12/13/14
    this.fillRect(142, 48, 159, 135, TILE.DEEP_WATER);
    this.fillRect(139, 62, 146, 106, TILE.WATER);

    // 3. Outer Border Forest & Mountain Ring
    this.fillRect(12, 6, 148, 9, TILE.MOUNTAIN);
    this.fillRect(12, 6, 15, 104, TILE.MOUNTAIN);
    this.fillRect(145, 6, 148, 62, TILE.MOUNTAIN);

    // Scatter natural forest clusters on mainland edges so routes feel framed
    for (let y = 10; y < 102; y++) {
      for (let x = 16; x < 144; x++) {
        const hash = ((x * 73856093) ^ (y * 19349663)) >>> 0;
        const t = this.getTile(x, y);
        if (t === TILE.GRASS) {
          if (hash % 17 === 0) this.setTile(x, y, TILE.TREE);
          else if (hash % 23 === 0) this.setTile(x, y, TILE.FLOWER);
        }
      }
    }

    // =========================================================================
    // 4. ROUTES (Carve walkable roads, tall grass, ledges, bridges & water routes)
    // =========================================================================

    // --- ROUTE 1 (Pallet Town <-> Viridian City) ---
    this.fillRect(37, 74, 47, 90, TILE.GRASS);
    this.fillRect(41, 74, 43, 90, TILE.ROAD);
    this.fillRect(38, 76, 40, 80, TILE.TALL_GRASS);
    this.fillRect(44, 77, 46, 81, TILE.TALL_GRASS);
    this.fillRect(38, 84, 40, 88, TILE.TALL_GRASS);
    this.fillRect(44, 85, 46, 88, TILE.TALL_GRASS);
    // Classic Route 1 ledges (with road gap in center)
    this.fillRect(37, 82, 40, 82, TILE.CLIFF_LEDGE);
    this.fillRect(44, 82, 47, 82, TILE.CLIFF_LEDGE);

    // --- ROUTE 2 & VIRIDIAN FOREST (Viridian City <-> Pewter City) ---
    this.fillRect(36, 36, 48, 60, TILE.GRASS);
    this.fillRect(41, 36, 43, 60, TILE.ROAD);
    // Viridian Forest Canopy Zone (y: 42..54)
    this.fillRect(36, 42, 48, 54, TILE.FOREST_TREE);
    // Winding walkable maze inside Viridian Forest
    this.fillRect(41, 42, 43, 54, TILE.ROAD);
    this.fillRect(38, 44, 46, 46, TILE.TALL_GRASS);
    this.fillRect(38, 50, 46, 52, TILE.TALL_GRASS);
    this.fillRect(40, 45, 44, 49, TILE.ROAD); // Clearing for GS Ball Celebi Shrine
    this.setTile(42, 46, TILE.CRYSTAL_SHRINE); // GS Ball Shrine!

    // --- ROUTE 3 (Pewter City <-> Mt. Moon) ---
    this.fillRect(50, 26, 68, 33, TILE.GRASS);
    this.fillRect(50, 29, 68, 31, TILE.ROAD);
    this.fillRect(53, 27, 58, 28, TILE.TALL_GRASS);
    this.fillRect(61, 31, 66, 32, TILE.TALL_GRASS);

    // --- MT. MOON (x: 68..80, y: 20..32) ---
    this.fillRect(68, 20, 80, 32, TILE.MOUNTAIN);
    this.fillRect(70, 24, 78, 31, TILE.SAND);
    this.fillRect(68, 28, 80, 30, TILE.ROAD);
    this.setTile(74, 24, TILE.CAVE_DOOR);
    this.fillRect(71, 25, 72, 27, TILE.TALL_GRASS);
    this.fillRect(76, 25, 77, 27, TILE.TALL_GRASS);

    // --- ROUTE 4 (Mt. Moon <-> Cerulean City) ---
    this.fillRect(80, 26, 96, 33, TILE.GRASS);
    this.fillRect(80, 28, 96, 30, TILE.ROAD);
    this.fillRect(84, 27, 90, 27, TILE.CLIFF_LEDGE);
    this.fillRect(83, 31, 89, 32, TILE.TALL_GRASS);

    // --- ROUTE 24 & 25 (Nugget Bridge & Cerulean Cape) ---
    this.fillRect(100, 10, 108, 22, TILE.WATER);
    this.fillRect(103, 11, 105, 22, TILE.BRIDGE); // Nugget Bridge!
    this.fillRect(103, 8, 125, 16, TILE.GRASS);
    this.fillRect(103, 11, 121, 14, TILE.ROAD);
    this.fillRect(108, 9, 114, 10, TILE.TALL_GRASS);
    this.fillRect(109, 14, 115, 15, TILE.FLOWER);
    // Bill's Sea Cottage at Cerulean Cape
    this.placeBuilding(118, 9, 5, 4, TILE.ROOF_BLUE, 'BILL’S COTTAGE', 'landmark');
    this.fillRect(114, 11, 117, 13, TILE.PLAZA);
    this.setTile(116, 10, TILE.CRYSTAL_SHRINE); // Crystal Clear Bell Sanctuary!

    // --- ROUTE 5 (Cerulean City <-> Saffron City) ---
    this.fillRect(100, 36, 108, 48, TILE.GRASS);
    this.fillRect(103, 36, 105, 48, TILE.ROAD);
    this.fillRect(100, 39, 102, 43, TILE.TALL_GRASS);
    this.placeBuilding(106, 39, 4, 3, TILE.ROOF_GREEN, 'DAYCARE', 'house');

    // --- ROUTE 6 (Saffron City <-> Vermilion City) ---
    this.fillRect(100, 64, 108, 76, TILE.GRASS);
    this.fillRect(103, 64, 105, 76, TILE.ROAD);
    this.fillRect(100, 67, 102, 72, TILE.TALL_GRASS);
    this.fillRect(106, 67, 108, 72, TILE.FLOWER);

    // --- ROUTE 7 (Celadon City <-> Saffron City) ---
    this.fillRect(84, 52, 94, 60, TILE.GRASS);
    this.fillRect(84, 55, 94, 57, TILE.ROAD);
    this.fillRect(86, 53, 92, 54, TILE.TALL_GRASS);
    this.fillRect(86, 58, 92, 59, TILE.FLOWER);

    // --- ROUTE 8 (Saffron City <-> Lavender Town) ---
    this.fillRect(114, 52, 130, 60, TILE.GRASS);
    this.fillRect(114, 55, 130, 57, TILE.ROAD);
    this.fillRect(117, 53, 126, 54, TILE.TALL_GRASS);
    this.fillRect(118, 58, 125, 58, TILE.FENCE);

    // --- ROUTE 9 & 10 & ROCK TUNNEL & POWER PLANT ---
    this.fillRect(112, 26, 138, 33, TILE.GRASS);
    this.fillRect(112, 28, 138, 30, TILE.ROAD);
    this.fillRect(116, 27, 126, 27, TILE.CLIFF_LEDGE);
    this.fillRect(118, 31, 128, 32, TILE.TALL_GRASS);
    // Route 10 & Rock Tunnel canyon pass down to Lavender Town
    this.fillRect(132, 28, 143, 50, TILE.SAND);
    this.fillRect(135, 28, 138, 50, TILE.ROAD);
    this.fillRect(139, 32, 142, 46, TILE.MOUNTAIN);
    this.setTile(139, 36, TILE.CAVE_DOOR);
    // Kanto Power Plant (west of Route 10)
    this.fillRect(123, 33, 135, 41, TILE.PAVED);
    this.fillRect(128, 37, 136, 39, TILE.ROAD);
    this.placeBuilding(124, 33, 7, 4, TILE.ROOF_GOLD, 'POWER PLANT', 'landmark');

    // --- ROUTE 11 (Vermilion City <-> Route 12) ---
    this.fillRect(112, 79, 136, 86, TILE.GRASS);
    this.fillRect(112, 81, 136, 83, TILE.ROAD);
    this.fillRect(115, 79, 128, 80, TILE.TALL_GRASS);
    this.fillRect(116, 84, 129, 85, TILE.TALL_GRASS);

    // --- ROUTE 12, 13, 14, 15 (Silence Bridge & Coastal Boardwalk) ---
    this.fillRect(133, 62, 141, 94, TILE.WATER);
    this.fillRect(135, 62, 138, 94, TILE.BRIDGE); // Silence Bridge Wooden Pier!
    this.fillRect(122, 92, 139, 105, TILE.GRASS);
    this.fillRect(122, 93, 138, 96, TILE.BRIDGE);
    this.fillRect(122, 95, 126, 103, TILE.ROAD);
    this.fillRect(104, 99, 125, 105, TILE.GRASS);
    this.fillRect(104, 101, 125, 103, TILE.ROAD);
    this.fillRect(108, 99, 119, 100, TILE.TALL_GRASS);
    this.fillRect(128, 98, 135, 101, TILE.TALL_GRASS);

    // --- ROUTE 16, 17 (CYCLING ROAD), 18 (Celadon <-> Fuchsia) ---
    this.fillRect(54, 52, 64, 60, TILE.GRASS);
    this.fillRect(55, 55, 64, 57, TILE.CYCLING_ROAD);
    // Route 17 Elevated Cycling Road over the Western Bay
    this.fillRect(55, 55, 59, 103, TILE.CYCLING_ROAD);
    this.fillRect(54, 58, 54, 101, TILE.FENCE);
    this.fillRect(60, 58, 60, 101, TILE.FENCE);
    // Route 18 into Fuchsia City
    this.fillRect(55, 99, 84, 105, TILE.GRASS);
    this.fillRect(55, 101, 84, 103, TILE.CYCLING_ROAD);
    this.fillRect(64, 99, 76, 100, TILE.TALL_GRASS);

    // --- ROUTE 19, 20 & SEAFOAM ISLANDS (Fuchsia <-> Cinnabar) ---
    this.fillRect(88, 108, 98, 126, TILE.WATER);
    this.fillRect(91, 108, 95, 112, TILE.SAND); // Fuchsia South Beach
    this.fillRect(50, 118, 95, 127, TILE.WATER);
    // Seafoam Islands (x: 68..78, y: 118..126)
    this.fillRect(68, 118, 78, 126, TILE.ICE_FLOOR);
    this.fillRect(69, 119, 77, 125, TILE.SAND);
    this.fillRect(71, 119, 75, 123, TILE.ICE_FLOOR);
    this.setTile(73, 119, TILE.CAVE_DOOR);

    // --- ROUTE 21 (Pallet Town <-> Cinnabar Island) ---
    this.fillRect(38, 102, 46, 118, TILE.WATER);
    this.fillRect(40, 106, 44, 110, TILE.GRASS);
    this.fillRect(40, 107, 44, 109, TILE.TALL_GRASS);

    // --- ROUTE 22 & 23 (Viridian City <-> Victory Road <-> Indigo Plateau) ---
    this.fillRect(19, 63, 34, 71, TILE.GRASS);
    this.fillRect(21, 66, 34, 68, TILE.ROAD);
    this.fillRect(25, 64, 31, 65, TILE.TALL_GRASS);
    // Route 23 / Victory Road Pass going north to Indigo Plateau
    this.fillRect(18, 24, 26, 68, TILE.SAND);
    this.fillRect(21, 24, 23, 68, TILE.ROAD);
    this.fillRect(18, 34, 20, 48, TILE.TALL_GRASS);
    this.fillRect(24, 36, 26, 50, TILE.MOUNTAIN);

    // =========================================================================
    // 5. CITIES & TOWNS (Detailed architecture, plazas, gyms, PokéCenters, signs)
    // =========================================================================

    // --- 1. PALLET TOWN (x: 35..49, y: 90..102) ---
    this.fillRect(35, 90, 49, 102, TILE.GRASS);
    this.fillRect(37, 91, 47, 101, TILE.PAVED);
    this.fillRect(41, 90, 43, 102, TILE.ROAD);
    this.fillRect(37, 99, 40, 100, TILE.FLOWER);
    this.fillRect(35, 90, 39, 90, TILE.FENCE);
    this.fillRect(45, 90, 49, 90, TILE.FENCE);
    this.placeBuilding(37, 91, 4, 3, TILE.ROOF_RED, 'RED’S HOUSE', 'house');
    this.placeBuilding(43, 91, 4, 3, TILE.ROOF_BLUE, 'BLUE’S HOUSE', 'house');
    this.placeBuilding(43, 95, 5, 4, TILE.ROOF_SLATE, 'OAK’S LAB', 'lab');

    // --- 2. VIRIDIAN CITY (x: 34..50, y: 60..74) ---
    this.fillRect(34, 60, 50, 74, TILE.GRASS);
    this.fillRect(36, 61, 48, 73, TILE.PAVED);
    this.fillRect(41, 60, 43, 74, TILE.ROAD);
    this.fillRect(34, 66, 48, 68, TILE.ROAD);
    this.fillRect(36, 69, 39, 72, TILE.WATER); // Viridian Pond
    this.placeBuilding(36, 61, 4, 3, TILE.ROOF_BLUE, 'MART', 'mart');
    this.placeBuilding(44, 61, 5, 4, TILE.ROOF_GOLD, 'VIRIDIAN GYM', 'gym');
    this.placeBuilding(44, 69, 4, 3, TILE.ROOF_RED, 'POKÉMON CENTER', 'pokecenter');

    // --- 3. PEWTER CITY (x: 34..50, y: 22..36) ---
    this.fillRect(34, 22, 50, 36, TILE.GRASS);
    this.fillRect(35, 23, 49, 35, TILE.PAVED);
    this.fillRect(41, 23, 43, 36, TILE.ROAD);
    this.fillRect(36, 29, 50, 31, TILE.ROAD);
    this.placeBuilding(40, 22, 6, 4, TILE.ROOF_SLATE, 'PEWTER MUSEUM', 'landmark');
    this.placeBuilding(36, 27, 5, 4, TILE.ROOF_GOLD, 'PEWTER GYM', 'gym');
    this.placeBuilding(44, 31, 4, 3, TILE.ROOF_RED, 'POKÉMON CENTER', 'pokecenter');
    this.placeBuilding(36, 32, 4, 3, TILE.ROOF_BLUE, 'MART', 'mart');

    // --- 4. CERULEAN CITY (x: 96..112, y: 22..36) ---
    this.fillRect(96, 22, 112, 36, TILE.GRASS);
    this.fillRect(97, 23, 111, 35, TILE.PAVED);
    this.fillRect(103, 22, 105, 36, TILE.ROAD);
    this.fillRect(96, 28, 112, 30, TILE.ROAD);
    // Cerulean Cave on NW riverbank
    this.fillRect(92, 20, 96, 24, TILE.MOUNTAIN);
    this.setTile(94, 23, TILE.CAVE_DOOR);
    this.fillRect(94, 24, 97, 28, TILE.SAND);
    this.placeBuilding(98, 23, 4, 3, TILE.ROOF_GREEN, 'BIKE SHOP', 'house');
    this.placeBuilding(106, 25, 5, 4, TILE.ROOF_GOLD, 'CERULEAN GYM', 'gym');
    this.placeBuilding(98, 31, 4, 3, TILE.ROOF_RED, 'POKÉMON CENTER', 'pokecenter');
    this.placeBuilding(106, 31, 4, 3, TILE.ROOF_BLUE, 'MART', 'mart');

    // --- 5. SAFFRON CITY (x: 94..114, y: 48..64) ---
    this.fillRect(94, 48, 114, 64, TILE.PAVED);
    this.fillRect(96, 50, 112, 62, TILE.PLAZA);
    this.fillRect(103, 48, 105, 64, TILE.ROAD);
    this.fillRect(94, 55, 114, 57, TILE.ROAD);
    // Silph Co. Central Skyscraper
    this.placeBuilding(101, 51, 6, 4, TILE.ROOF_SLATE, 'SILPH CO. HQ', 'landmark');
    this.placeBuilding(107, 49, 5, 4, TILE.ROOF_GOLD, 'SAFFRON GYM', 'gym');
    this.placeBuilding(96, 49, 4, 3, TILE.ROOF_PURPLE, 'DOJO', 'house');
    this.placeBuilding(96, 59, 4, 3, TILE.ROOF_RED, 'POKÉMON CENTER', 'pokecenter');
    this.placeBuilding(108, 59, 4, 3, TILE.ROOF_BLUE, 'MART', 'mart');

    // --- 6. CELADON CITY (x: 64..84, y: 48..64) ---
    this.fillRect(64, 48, 84, 64, TILE.GRASS);
    this.fillRect(65, 49, 83, 63, TILE.PAVED);
    this.fillRect(64, 55, 84, 57, TILE.ROAD);
    this.fillRect(74, 49, 76, 63, TILE.ROAD);
    this.setTile(75, 54, TILE.FOUNTAIN);
    this.placeBuilding(66, 49, 6, 5, TILE.ROOF_BLUE, 'DEPT. STORE', 'mart');
    this.placeBuilding(77, 49, 5, 4, TILE.ROOF_PURPLE, 'MANSION', 'landmark');
    this.placeBuilding(78, 58, 4, 3, TILE.ROOF_RED, 'POKÉMON CENTER', 'pokecenter');
    this.placeBuilding(68, 58, 5, 4, TILE.ROOF_GOLD, 'CELADON GYM', 'gym');

    // --- 7. VERMILION CITY & S.S. ANNE HARBOR (x: 94..112, y: 76..95) ---
    this.fillRect(94, 76, 112, 90, TILE.PAVED);
    this.fillRect(102, 76, 105, 92, TILE.ROAD);
    this.fillRect(95, 80, 112, 82, TILE.ROAD);
    this.placeBuilding(96, 76, 4, 3, TILE.ROOF_RED, 'POKÉMON CENTER', 'pokecenter');
    this.placeBuilding(106, 76, 4, 3, TILE.ROOF_BLUE, 'MART', 'mart');
    this.placeBuilding(97, 82, 5, 4, TILE.ROOF_GOLD, 'VERMILION GYM', 'gym');
    // Vermilion Harbor Pier & S.S. Anne Luxury Ship
    this.fillRect(102, 88, 106, 94, TILE.BRIDGE);
    this.fillRect(100, 94, 110, 97, TILE.SHIP_DECK);
    this.placeBuilding(102, 94, 6, 3, TILE.ROOF_RED, 'S.S. ANNE', 'landmark');

    // --- 8. LAVENDER TOWN (x: 130..144, y: 50..62) ---
    this.fillRect(130, 50, 144, 62, TILE.PAVED);
    this.fillRect(130, 55, 142, 57, TILE.ROAD);
    this.fillRect(135, 50, 138, 62, TILE.ROAD);
    this.placeBuilding(138, 50, 5, 5, TILE.ROOF_PURPLE, 'POKÉMON TOWER', 'landmark');
    this.placeBuilding(131, 51, 4, 3, TILE.ROOF_RED, 'POKÉMON CENTER', 'pokecenter');
    this.placeBuilding(131, 58, 4, 3, TILE.ROOF_PURPLE, 'FUJI HOUSE', 'house');

    // --- 9. FUCHSIA CITY & SAFARI ZONE (x: 84..104, y: 84..108) ---
    // Kanto Safari Zone (North of Fuchsia: x: 86..102, y: 84..94)
    this.fillRect(86, 84, 102, 94, TILE.GRASS);
    this.fillRect(88, 86, 92, 90, TILE.TALL_GRASS);
    this.fillRect(96, 86, 100, 90, TILE.TALL_GRASS);
    this.fillRect(92, 87, 95, 89, TILE.WATER);
    this.fillRect(93, 90, 95, 95, TILE.ROAD);
    this.placeBuilding(92, 83, 4, 3, TILE.ROOF_GREEN, 'SAFARI HOUSE', 'landmark');
    // Fuchsia City proper
    this.fillRect(84, 94, 104, 108, TILE.PAVED);
    this.fillRect(84, 101, 104, 103, TILE.ROAD);
    this.fillRect(92, 94, 95, 108, TILE.ROAD);
    this.placeBuilding(87, 100, 5, 4, TILE.ROOF_GOLD, 'FUCHSIA GYM', 'gym');
    this.placeBuilding(96, 96, 4, 3, TILE.ROOF_RED, 'POKÉMON CENTER', 'pokecenter');
    this.placeBuilding(96, 103, 4, 3, TILE.ROOF_BLUE, 'WARDEN HOUSE', 'house');

    // --- 10. CINNABAR ISLAND (x: 34..50, y: 118..128) ---
    this.fillRect(33, 117, 51, 129, TILE.SAND);
    this.fillRect(35, 118, 49, 127, TILE.PAVED);
    this.fillRect(36, 122, 48, 124, TILE.ROAD);
    this.fillRect(41, 118, 43, 127, TILE.ROAD);
    this.placeBuilding(36, 118, 5, 4, TILE.ROOF_PURPLE, 'MANSION', 'landmark');
    this.placeBuilding(44, 119, 5, 4, TILE.ROOF_GOLD, 'CINNABAR GYM', 'gym');
    this.placeBuilding(36, 124, 4, 3, TILE.ROOF_RED, 'POKÉMON CENTER', 'pokecenter');
    this.placeBuilding(44, 124, 4, 3, TILE.ROOF_SLATE, 'CINNABAR LAB', 'lab');

    // --- 11. INDIGO PLATEAU (x: 16..28, y: 12..25) ---
    this.fillRect(16, 12, 28, 25, TILE.PLAZA);
    this.fillRect(21, 16, 23, 25, TILE.ROAD);
    this.placeBuilding(18, 12, 8, 5, TILE.ROOF_GOLD, 'INDIGO PLATEAU', 'landmark');
    this.placeBuilding(25, 19, 3, 3, TILE.ROOF_RED, 'HEAL', 'pokecenter');

    // =========================================================================
    // 6. PLACE SIGNS & CLEAR NPC / SPAWN FOOTPRINTS
    // =========================================================================
    for (const sign of SIGNS) {
      this.setTile(sign.x, sign.y, TILE.SIGN);
      if (this.isSolid(sign.x, sign.y + 1)) {
        this.setTile(sign.x, sign.y + 1, TILE.ROAD);
      }
    }

    for (const city of CITIES) {
      this.setTile(city.spawn.x, city.spawn.y, TILE.ROAD);
    }
    for (const lm of LANDMARKS) {
      this.setTile(lm.spawn.x, lm.spawn.y, TILE.ROAD);
    }
    for (const evt of CRYSTAL_EVENTS) {
      if (this.isSolid(evt.x, evt.y)) {
        this.setTile(evt.x, evt.y, TILE.ROAD);
      }
    }
    for (const npc of NPCS) {
      if (this.isSolid(npc.x, npc.y)) {
        this.setTile(npc.x, npc.y, TILE.PAVED);
      }
      if (this.isSolid(npc.x, npc.y + 1)) {
        this.setTile(npc.x, npc.y + 1, TILE.PAVED);
      }
    }
  }

  isSolid(tx, ty) {
    if (!this.inBounds(tx, ty)) return true;
    const t = this.getTile(tx, ty);
    return SOLID_TILES.has(t);
  }

  isWater(tx, ty) {
    return this.getTile(tx, ty) === TILE.WATER;
  }

  isTallGrass(tx, ty) {
    return this.getTile(tx, ty) === TILE.TALL_GRASS;
  }

  isLedge(tx, ty) {
    return this.getTile(tx, ty) === TILE.CLIFF_LEDGE;
  }

  getRegionAt(tx, ty) {
    for (const lm of LANDMARKS) {
      const b = lm.bounds;
      if (tx >= b.x1 && tx <= b.x2 && ty >= b.y1 && ty <= b.y2) {
        return {
          id: lm.id,
          name: lm.name,
          subtitle: lm.slogan,
          description: lm.description,
          color: lm.color,
          type: 'Landmark',
        };
      }
    }
    for (const city of CITIES) {
      const b = city.bounds;
      if (tx >= b.x1 && tx <= b.x2 && ty >= b.y1 && ty <= b.y2) {
        return {
          id: city.id,
          name: city.name,
          subtitle: city.slogan,
          description: city.description,
          color: city.color,
          type: city.category === 'town' ? 'Town' : 'City',
          gymBadgeId: city.gymBadgeId,
        };
      }
    }
    for (const route of ROUTES) {
      const b = route.bounds;
      if (tx >= b.x1 && tx <= b.x2 && ty >= b.y1 && ty <= b.y2) {
        return {
          id: route.id,
          name: route.name,
          subtitle: route.subtitle,
          description: `Wild Pokémon spotted here: ${route.pokemon.join(', ')}`,
          color: '#34d399',
          type: 'Route',
          pokemon: route.pokemon,
        };
      }
    }
    return {
      id: 'kanto-wilds',
      name: 'Kanto Region Outskirts',
      subtitle: 'Uncharted Kanto Wilderness',
      description: 'Follow the roads or open the Kanto Town Map to navigate between cities.',
      color: '#60a5fa',
      type: 'Wilderness',
    };
  }
}
