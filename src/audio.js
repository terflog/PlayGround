// Authentic Game Boy (pret/pokeyellow) Audio1 & APU Hardware Cry + Music Synthesizer
// Compiled directly from pret/pokeyellow data/pokemon/cries.asm & audio/sfx/cry00_1.asm..cry25_1.asm

const GEN1_CRY_DATA = {"RHYDON":[17,0,128],"KANGASKHAN":[3,0,128],"NIDORAN_M":[0,0,128],"CLEFAIRY":[25,204,1],"SPEAROW":[16,0,128],"VOLTORB":[6,237,128],"NIDOKING":[9,0,128],"SLOWBRO":[31,0,128],"IVYSAUR":[15,32,128],"EXEGGUTOR":[13,0,128],"LICKITUNG":[12,0,128],"EXEGGCUTE":[11,0,128],"GRIMER":[5,0,128],"GENGAR":[7,0,255],"NIDORAN_F":[1,0,128],"NIDOQUEEN":[10,0,128],"CUBONE":[25,0,128],"RHYHORN":[4,0,128],"LAPRAS":[27,0,128],"ARCANINE":[21,0,128],"MEW":[30,238,255],"GYARADOS":[23,0,128],"SHELLDER":[24,0,128],"TENTACOOL":[26,0,128],"GASTLY":[28,0,128],"SCYTHER":[22,0,128],"STARYU":[30,2,32],"BLASTOISE":[19,0,128],"PINSIR":[20,0,128],"TANGELA":[18,0,128],"GROWLITHE":[31,32,64],"ONIX":[23,255,192],"FEAROW":[24,64,160],"PIDGEY":[14,223,4],"SLOWPOKE":[2,0,128],"KADABRA":[28,168,192],"GRAVELER":[36,0,128],"CHANSEY":[20,10,192],"MACHOKE":[31,72,96],"MR_MIME":[32,8,64],"HITMONLEE":[18,128,192],"HITMONCHAN":[12,238,192],"ARBOK":[23,224,16],"PARASECT":[30,66,255],"PSYDUCK":[33,32,96],"DROWZEE":[13,136,32],"GOLEM":[18,224,64],"MAGMAR":[4,255,48],"ELECTABUZZ":[6,143,255],"MAGNETON":[28,32,192],"KOFFING":[18,230,221],"MANKEY":[10,221,96],"SEEL":[12,136,192],"DIGLETT":[11,170,1],"TAUROS":[29,17,64],"FARFETCH_D":[16,221,1],"VENONAT":[26,68,64],"DRAGONITE":[15,60,192],"DODUO":[11,187,1],"POLIWAG":[14,255,255],"JYNX":[13,255,255],"MOLTRES":[9,248,64],"ARTICUNO":[9,128,64],"ZAPDOS":[24,255,128],"DITTO":[14,255,255],"MEOWTH":[25,119,16],"KRABBY":[32,32,224],"VULPIX":[36,79,16],"NINETALES":[36,136,96],"PIKACHU":[15,238,1],"RAICHU":[9,238,8],"DRATINI":[15,96,64],"DRAGONAIR":[15,64,128],"KABUTO":[22,187,64],"KABUTOPS":[24,238,1],"HORSEA":[25,153,16],"SEADRA":[25,60,1],"SANDSHREW":[0,32,64],"SANDSLASH":[0,255,255],"OMANYTE":[31,240,1],"OMASTAR":[31,255,64],"JIGGLYPUFF":[14,255,53],"WIGGLYTUFF":[14,104,96],"EEVEE":[26,136,96],"FLAREON":[26,16,32],"JOLTEON":[26,61,128],"VAPOREON":[26,170,255],"MACHOP":[31,238,1],"ZUBAT":[29,224,128],"EKANS":[23,18,64],"PARAS":[30,32,224],"POLIWHIRL":[14,119,96],"POLIWRATH":[14,0,255],"WEEDLE":[21,238,1],"KAKUNA":[19,255,1],"BEEDRILL":[19,96,128],"DODRIO":[11,153,32],"PRIMEAPE":[10,175,64],"DUGTRIO":[11,42,16],"VENOMOTH":[26,41,128],"DEWGONG":[12,35,255],"CATERPIE":[22,128,32],"METAPOD":[28,204,1],"BUTTERFREE":[22,119,64],"MACHAMP":[31,8,192],"GOLDUCK":[33,255,64],"HYPNO":[13,238,64],"GOLBAT":[29,250,128],"MEWTWO":[30,153,255],"SNORLAX":[5,85,1],"MAGIKARP":[23,128,0],"MUK":[7,239,255],"KINGLER":[32,238,224],"CLOYSTER":[24,111,224],"ELECTRODE":[6,168,144],"CLEFABLE":[25,170,32],"WEEZING":[18,255,255],"PERSIAN":[25,153,255],"MAROWAK":[8,79,96],"HAUNTER":[28,48,64],"ABRA":[28,192,1],"ALAKAZAM":[28,152,255],"PIDGEOTTO":[20,40,192],"PIDGEOT":[20,17,255],"STARMIE":[30,0,128],"BULBASAUR":[15,128,1],"VENUSAUR":[15,0,192],"TENTACRUEL":[26,238,255],"GOLDEEN":[22,128,64],"SEAKING":[22,16,255],"PONYTA":[37,0,128],"RAPIDASH":[37,32,192],"RATTATA":[34,0,128],"RATICATE":[34,32,255],"NIDORINO":[0,44,192],"NIDORINA":[1,44,224],"GEODUDE":[36,240,16],"PORYGON":[37,170,255],"AERODACTYL":[35,32,240],"MAGNEMITE":[28,128,96],"CHARMANDER":[4,96,64],"SQUIRTLE":[29,96,64],"CHARMELEON":[4,32,64],"WARTORTLE":[29,32,64],"CHARIZARD":[4,0,128],"ODDISH":[8,221,1],"GLOOM":[8,170,64],"VILEPLUME":[35,34,255],"BELLSPROUT":[33,85,1],"WEEPINBELL":[37,68,32],"VICTREEBEL":[37,102,204]};

const SFX_CRIES_DATA = [{"ch5":[[0,245],[2,4,243,1816],[2,15,229,1944],[2,8,145,1880]],"ch6":[[0,160],[2,5,179,1800],[2,15,197,1928],[2,8,113,1864]],"ch8":[[3,3,161,28],[3,14,148,44],[3,8,129,28]]},{"ch5":[[0,160],[2,4,243,1536],[2,8,213,1888],[2,3,226,1824],[2,8,209,1808]],"ch6":[[0,90],[2,5,179,1777],[2,7,197,1874],[2,3,162,1809],[2,8,177,1537]],"ch8":[[3,3,162,60],[3,12,148,44],[3,3,130,28],[3,8,113,44]]},{"ch5":[[1,0],[2,8,245,1152],[2,2,225,1504],[2,8,209,1500]],"ch6":[[0,165],[2,7,149,1089],[2,2,129,1313],[2,8,97,1306]],"ch8":[]},{"ch5":[[0,240],[2,4,247,1544],[2,6,230,1536],[2,6,215,1520],[2,6,196,1504],[2,5,211,1472],[2,4,211,1440],[2,8,225,1408]],"ch6":[[0,10],[2,4,199,1284],[2,6,166,1282],[2,6,151,1265],[2,4,180,1249],[2,5,163,1218],[2,4,179,1187],[2,8,193,1154]],"ch8":[[3,12,228,76],[3,10,199,92],[3,12,182,76],[3,15,162,92]]},{"ch5":[[0,240],[2,4,247,1696],[2,8,230,1700],[2,4,214,1696],[2,12,211,1568],[2,8,195,1572],[2,4,194,1568],[2,8,177,1552]],"ch6":[[0,90],[2,4,231,1537],[2,8,214,1539],[2,4,198,1537],[2,12,195,1409],[2,8,179,1411],[2,4,178,1410],[2,8,161,1393]],"ch8":[[3,7,214,92],[3,8,230,76],[3,4,212,92],[3,4,212,76],[3,7,195,76],[3,8,161,92]]},{"ch5":[[0,10],[2,6,226,1280],[2,6,227,1408],[2,6,211,1392],[2,8,161,1376]],"ch6":[[0,245],[2,6,226,1154],[2,6,211,1281],[2,6,178,1250],[2,8,129,1217]],"ch8":[]},{"ch5":[[0,250],[2,6,131,583],[2,15,98,550],[2,4,82,581],[2,9,99,518],[2,15,130,549],[2,15,66,519]],"ch6":[],"ch8":[[3,8,212,140],[3,4,226,156],[3,15,198,140],[3,8,228,172],[3,15,215,156],[3,15,242,172]]},{"ch5":[[0,240],[2,4,243,1760],[2,15,228,1600],[2,8,193,1568]],"ch6":[[0,10],[2,3,195,1667],[2,14,180,1538],[2,8,161,1537]],"ch8":[[3,4,211,92],[3,15,230,76],[3,8,177,92]]},{"ch5":[[0,240],[2,15,246,1381],[2,10,228,1404],[2,3,194,1372],[2,15,178,1340]],"ch6":[[0,90],[2,14,214,1283],[2,9,180,1307],[2,4,146,1274],[2,15,162,1243]],"ch8":[[3,12,230,76],[3,11,215,92],[3,15,194,76]]},{"ch5":[[0,240],[2,15,247,1952],[2,6,230,1955],[2,10,244,1952],[0,165],[2,10,246,2008],[2,4,227,2007],[2,15,242,2008]],"ch6":[[0,5],[2,2,0,0],[2,15,167,1697],[2,6,134,1698],[2,10,116,1697],[0,95],[2,10,118,1750],[2,4,131,1753],[2,15,162,1751]],"ch8":[[3,2,242,60],[3,8,228,62],[3,15,215,60],[3,6,197,59],[3,6,228,61],[3,8,182,60],[3,6,212,61],[3,8,193,59]]},{"ch5":[[0,240],[2,8,247,1760],[2,6,230,1765],[2,3,244,1760],[2,3,246,1744],[2,3,227,1728],[2,4,242,1712],[2,15,162,1736]],"ch6":[[0,5],[2,3,0,0],[2,8,167,1697],[2,6,134,1699],[2,3,116,1697],[2,3,118,1681],[2,3,131,1666],[2,4,162,1649],[2,15,114,1673]],"ch8":[[3,2,242,60],[3,8,228,62],[3,8,215,60],[3,5,197,59],[3,3,212,44],[3,2,182,60],[3,3,164,44],[3,8,145,60]]},{"ch5":[[0,204],[2,4,241,1792],[2,4,225,1920],[2,4,209,1856],[2,4,225,1856],[2,4,241,1920],[2,4,209,1792],[2,4,241,1793],[2,4,209,1922],[2,4,193,1858],[2,8,177,1857]],"ch6":[[0,68],[2,12,0,0],[2,4,241,1793],[2,4,225,1922],[2,4,209,1857],[2,4,225,1857],[2,4,241,1922],[2,8,209,1793]],"ch8":[[3,15,0,0],[3,4,0,0],[3,4,209,76],[3,4,177,44],[3,4,209,60],[3,4,177,60],[3,4,193,44],[3,8,161,76]]},{"ch5":[[0,204],[2,8,245,1536],[2,2,210,1592],[2,2,194,1584],[2,2,194,1576],[2,2,178,1568],[2,2,178,1552],[2,2,162,1560],[2,2,178,1552],[2,8,193,1568]],"ch6":[[0,68],[2,12,195,1472],[2,3,177,1529],[2,2,161,1521],[2,2,161,1513],[2,2,145,1505],[2,2,145,1497],[2,2,129,1489],[2,2,145,1497],[2,8,145,1505]],"ch8":[]},{"ch5":[[0,136],[2,5,242,1616],[2,9,209,1632],[2,5,226,1554],[2,9,193,1570],[2,5,242,1552],[2,6,209,1568]],"ch6":[[0,64],[2,4,0,0],[2,5,242,1617],[2,9,209,1633],[2,5,226,1556],[2,8,193,1572],[2,5,242,1553],[2,12,209,1569],[2,5,226,1556],[2,8,193,1572],[2,5,242,1553],[2,4,209,1569]],"ch8":[[3,6,210,28],[3,9,177,44],[3,8,194,44],[3,9,177,60],[3,6,194,44],[3,9,162,60],[3,7,194,44],[3,5,161,60],[3,9,194,44],[3,4,161,60]]},{"ch5":[[0,165],[2,4,225,1792],[2,4,242,1920],[2,2,146,1856],[2,8,225,1536]],"ch6":[[0,10],[2,4,177,1761],[2,3,194,1761],[2,3,98,1665],[2,8,177,1505]],"ch8":[[3,2,97,50],[3,2,97,33],[3,8,97,17]]},{"ch5":[[0,241],[2,4,247,1984],[2,12,230,1986],[2,6,181,1664],[2,4,196,1648],[2,4,181,1632],[2,8,193,1600]],"ch6":[[0,204],[2,3,199,1921],[2,12,182,1920],[2,6,165,1601],[2,4,196,1586],[2,6,181,1569],[2,8,161,1538]],"ch8":[[3,3,228,60],[3,12,214,44],[3,4,228,60],[3,8,183,92],[3,15,194,93]]},{"ch5":[[0,201],[2,8,247,1664],[2,2,247,1632],[2,1,231,1600],[2,1,231,1568],[2,15,209,1536],[2,4,199,1856],[2,4,167,1840],[2,15,145,1824]],"ch6":[[0,121],[2,10,231,1666],[2,2,231,1634],[2,1,215,1602],[2,1,215,1570],[2,15,193,1538],[2,4,183,1858],[2,2,151,1842],[2,15,129,1826]],"ch8":[[3,4,116,33],[3,4,116,16],[3,4,113,32]]},{"ch5":[[0,240],[2,6,247,1952],[2,8,230,1956],[2,4,214,1952],[2,15,211,1824],[2,8,195,1827],[2,2,194,1832],[2,8,177,1840]],"ch6":[[0,10],[2,4,0,0],[2,6,167,1857],[2,8,134,1859],[2,4,118,1857],[2,13,131,1730],[2,7,115,1729],[2,3,130,1740],[2,8,113,1752]],"ch8":[[3,2,242,76],[3,6,230,58],[3,4,215,58],[3,6,214,44],[3,8,229,60],[3,12,210,61],[3,8,209,44]]},{"ch5":[[0,165],[2,12,242,1088],[2,15,227,1184],[2,4,210,1168],[2,8,209,1152]],"ch6":[[0,238],[2,11,210,1080],[2,14,198,1176],[2,3,178,1160],[2,8,177,1144]],"ch8":[[3,10,230,108],[3,15,210,92],[3,3,194,108],[3,8,209,92]]},{"ch5":[[0,51],[2,15,246,1472],[2,8,227,1468],[2,6,210,1488],[2,6,178,1504],[2,6,194,1520],[2,8,177,1536]],"ch6":[[0,153],[2,14,198,1201],[2,7,195,1197],[2,5,178,1217],[2,8,146,1233],[2,6,162,1249],[2,8,145,1265]],"ch8":[[3,10,230,92],[3,10,214,108],[3,4,194,76],[3,6,211,92],[3,8,179,76],[3,8,161,92]]},{"ch5":[[0,240],[2,8,228,1936],[2,15,245,1984],[2,8,209,2008]],"ch6":[[0,165],[2,10,196,1905],[2,15,182,1954],[2,8,161,1975]],"ch8":[[3,8,228,76],[3,14,196,60],[3,8,209,44]]},{"ch5":[[0,240],[2,4,243,1920],[2,15,231,1792],[2,8,211,1808],[2,4,194,1792],[2,4,210,1776],[2,8,193,1760]],"ch6":[[0,90],[2,6,195,1793],[2,14,183,1665],[2,7,179,1682],[2,3,162,1665],[2,4,178,1650],[2,8,161,1633]],"ch8":[[3,6,227,92],[3,14,214,76],[3,6,198,60],[3,3,179,76],[3,3,162,92],[3,8,177,108]]},{"ch5":[[0,240],[2,15,215,1920],[2,4,230,1952],[2,15,210,1856]],"ch6":[[0,90],[2,15,199,1875],[2,5,182,1906],[2,15,194,1809]],"ch8":[[3,13,246,76],[3,4,230,60],[3,15,242,76]]},{"ch5":[[0,15],[2,15,247,1280],[2,15,231,1288],[2,8,180,1152],[2,15,162,1120]],"ch6":[[0,68],[2,14,215,1153],[2,14,199,1161],[2,10,180,1025],[2,15,194,993]],"ch8":[[3,14,247,124],[3,12,246,108],[3,9,228,124],[3,15,226,108]]},{"ch5":[[0,80],[2,10,245,1664],[2,3,226,1696],[2,3,242,1728],[2,3,226,1760],[2,3,210,1792],[2,3,194,1760],[2,3,210,1728],[2,8,193,1696]],"ch6":[[0,15],[2,9,213,1585],[2,3,210,1618],[2,3,226,1649],[2,3,178,1681],[2,3,194,1714],[2,3,178,1681],[2,3,194,1649],[2,8,177,1617]],"ch8":[[3,6,227,76],[3,4,195,60],[3,5,212,60],[3,4,196,44],[3,6,180,60],[3,8,193,44]]},{"ch5":[[0,27],[2,7,210,1856],[2,15,229,1888],[2,15,193,1840]],"ch6":[[0,129],[2,2,194,1793],[2,4,194,1800],[2,15,215,1857],[2,15,162,1793]],"ch8":[]},{"ch5":[[0,240],[2,6,247,1856],[2,12,230,1860],[2,6,213,1872],[2,4,195,1888],[2,3,195,1920],[2,8,209,1952]],"ch6":[[0,10],[2,6,199,1793],[2,11,182,1794],[2,6,165,1809],[2,4,147,1825],[2,3,163,1857],[2,8,145,1890]],"ch8":[[3,3,226,60],[3,8,214,76],[3,5,212,60],[3,12,199,76],[3,2,226,60],[3,8,209,44]]},{"ch5":[[0,240],[2,6,247,1728],[2,15,231,1792],[2,4,244,1776],[2,4,228,1760],[2,8,209,1744]],"ch6":[[0,10],[2,7,230,1665],[2,14,213,1729],[2,4,196,1713],[2,4,212,1697],[2,8,193,1681]],"ch8":[[3,10,166,60],[3,14,148,44],[3,5,163,60],[3,8,145,44]]},{"ch5":[[0,245],[2,7,214,2017],[2,6,198,2018],[2,9,214,2017],[2,7,198,2016],[2,5,182,2018],[2,7,198,2017],[2,6,182,2016],[2,8,161,2015]],"ch6":[[0,68],[2,6,195,1993],[2,6,179,1991],[2,10,196,1987],[2,8,180,1991],[2,6,195,1993],[2,15,162,1989]],"ch8":[[3,13,25,124],[3,13,247,140],[3,12,214,124],[3,8,196,108],[3,15,179,92]]},{"ch5":[[0,244],[2,15,240,1797],[2,10,224,1792],[2,6,180,1808],[2,4,211,1792],[2,6,178,1568],[2,8,161,1572]],"ch6":[[0,34],[2,15,176,1731],[2,10,160,1729],[2,6,132,1746],[2,4,147,1729],[2,6,130,1505],[2,8,97,1512]],"ch8":[[3,6,230,76],[3,15,214,60],[3,10,197,74],[3,1,178,91],[3,15,194,76]]},{"ch5":[[0,240],[2,6,242,1536],[2,6,226,1600],[2,6,210,1664],[2,6,226,1728],[2,6,210,1792],[2,6,194,1856],[2,6,178,1920],[2,8,161,1984]],"ch6":[[0,17],[2,3,0,1],[2,6,194,1473],[2,6,178,1538],[2,6,162,1601],[2,6,178,1666],[2,6,162,1730],[2,6,146,1793],[2,6,162,1858],[2,8,129,1921]],"ch8":[[3,6,0,1],[3,5,226,92],[3,5,194,76],[3,5,210,60],[3,5,178,44],[3,5,194,28],[3,5,162,27],[3,5,146,26],[3,8,129,24]]},{"ch5":[[0,165],[2,3,244,1601],[2,13,214,1825],[2,8,244,1817],[2,8,193,1818]],"ch6":[[0,204],[2,4,244,1408],[2,14,230,1760],[2,8,213,1752],[2,8,209,1756]],"ch8":[[3,5,196,70],[3,13,165,68],[3,8,196,69],[3,8,177,68]]},{"ch5":[[0,240],[2,13,241,1297],[2,13,225,1301],[2,13,225,1297],[2,8,209,1297]],"ch6":[[0,21],[2,12,225,1292],[2,12,209,1296],[2,14,193,1292],[2,8,193,1290]],"ch8":[[3,14,242,101],[3,13,226,85],[3,14,210,86],[3,8,209,102]]},{"ch5":[[0,27],[2,3,243,1380],[2,2,226,1348],[2,5,209,1314],[2,2,178,1156],[2,8,209,1186],[2,3,243,1316],[2,4,228,1252],[2,8,209,1282]],"ch6":[[0,204],[2,3,211,1376],[2,2,194,1344],[2,5,193,1312],[2,2,146,1152],[2,8,193,1184],[2,3,211,1312],[2,3,196,1248],[2,8,193,1280]],"ch8":[]},{"ch5":[[0,17],[2,2,61,897],[2,7,245,1537],[2,1,194,1153],[2,8,145,897]],"ch6":[[0,238],[2,2,62,1456],[2,7,213,1885],[2,1,178,1712],[2,8,97,1456]],"ch8":[[3,2,146,73],[3,7,181,41],[3,1,162,57],[3,8,145,73]]},{"ch5":[[0,240],[2,15,247,1984],[2,6,228,1985],[2,10,246,1984],[2,4,211,1986],[2,8,193,1984]],"ch6":[[0,95],[2,15,151,1921],[2,6,132,1920],[2,10,150,1921],[2,15,131,1921]],"ch8":[[3,3,242,60],[3,13,230,44],[3,15,215,60],[3,8,193,44]]},{"ch5":[[0,240],[2,15,247,1664],[2,10,230,1668],[2,15,215,1680],[2,8,213,1680],[2,6,196,1672],[2,5,211,1648],[2,4,211,1632],[2,8,193,1600]],"ch6":[[0,5],[2,15,183,1601],[2,10,150,1602],[2,15,167,1617],[2,8,165,1617],[2,6,148,1607],[2,5,163,1585],[2,4,147,1570],[2,8,113,1537]],"ch8":[[3,15,228,60],[3,10,199,76],[3,10,199,60],[3,12,183,76],[3,15,162,92]]},{"ch5":[[0,165],[2,6,244,1856],[2,15,227,1840],[2,4,244,1856],[2,5,179,1864],[2,8,209,1872]],"ch6":[[0,119],[2,6,195,1810],[2,15,179,1796],[2,3,195,1810],[2,4,195,1825],[2,8,177,1842]],"ch8":[[3,8,214,44],[3,12,198,60],[3,10,182,44],[3,8,145,28]]}];

const DUTY_THRESHOLDS = [0.125, 0.25, 0.5, 0.75];

function buildSquareFrames(cmds, pitchByte, lengthByte, faint) {
  const frames = [];
  const tempo = ((lengthByte & 0xff) + 0x80) * (faint ? 1.32 : 1.0);
  let dutyPattern = 0xaa;
  let duty = 2;
  let rotateDuty = false;
  let frac = 0;

  for (const cmd of cmds || []) {
    if (cmd[0] === 0) {
      dutyPattern = cmd[1] & 0xff;
      duty = (dutyPattern >> 6) & 3;
      rotateDuty = true;
    } else if (cmd[0] === 1) {
      duty = (cmd[1] >> 6) & 3;
      rotateDuty = false;
    } else if (cmd[0] === 2) {
      const len = (cmd[1] & 0x0f) + 1;
      const env = cmd[2] & 0xff;
      const gbFreq = cmd[3] & 0x7ff;

      const scaled = Math.round(len * tempo) + frac;
      frac = scaled & 0xff;
      const delayFrames = Math.max(1, scaled >> 8);

      // Audio1_ApplyWavePatternAndFrequency + Audio1_ApplyFrequencyModifier (audio/engine_1.asm:713-771)
      const lo = (gbFreq & 0xff) + (pitchByte & 0xff);
      const hi = ((gbFreq >> 8) & 0x07) + (lo > 0xff ? 1 : 0);
      const reg11 = ((hi & 0x07) << 8) | (lo & 0xff);
      const freqHz = (131072 / (2048 - reg11)) * (faint ? 0.78 : 1.0);

      const initVol = (env >> 4) & 0x0f;
      const envDir = (env & 0x08) ? 1 : -1;
      const envPeriod = env & 0x07;

      for (let f = 0; f < delayFrames; f++) {
        if (f > 0 && rotateDuty) {
          dutyPattern = ((dutyPattern << 2) | (dutyPattern >> 6)) & 0xff;
          duty = (dutyPattern >> 6) & 3;
        }
        const curVol =
          envPeriod > 0
            ? Math.max(0, Math.min(15, initVol + envDir * Math.floor(f / envPeriod)))
            : initVol;
        frames.push({ freqHz, vol: curVol / 15, duty });
      }
    }
  }
  return frames;
}

function buildNoiseFrames(cmds, pitchByte) {
  const frames = [];
  for (const cmd of cmds || []) {
    if (cmd[0] === 3) {
      const delayFrames = (cmd[1] & 0x0f) + 1;
      const env = cmd[2] & 0xff;
      const polyReg = (cmd[3] + (pitchByte & 0xff)) & 0xff;
      const s = (polyReg >> 4) & 0x0f;
      const width7 = ((polyReg >> 3) & 1) === 1;
      const rCode = polyReg & 0x07;
      const divisor = rCode === 0 ? 8 : rCode << 4;
      const clockHz = s >= 14 ? 0 : 4194304 / (divisor * Math.pow(2, s + 1));

      const initVol = (env >> 4) & 0x0f;
      const envDir = (env & 0x08) ? 1 : -1;
      const envPeriod = env & 0x07;

      for (let f = 0; f < delayFrames; f++) {
        const curVol =
          envPeriod > 0
            ? Math.max(0, Math.min(15, initVol + envDir * Math.floor(f / envPeriod)))
            : initVol;
        frames.push({ clockHz, width7, vol: curVol / 15 });
      }
    }
  }
  return frames;
}

export class GameBoyAudio {
  constructor(musicTracks) {
    this.tracks = musicTracks || {};
    this.ctx = null;
    this.enabled = false;
    this.currentTrackName = null;
    this.timers = [];
    this.sfxTimers = [];
    this.activeOscillators = new Set();
    this.activeCrySource = null;
    this.cryBufferCache = new Map();
    this.masterGain = null;

    if (typeof window !== "undefined") {
      const unlock = () => {
        if (this.ctx && this.ctx.state === "suspended") {
          this.ctx.resume().catch(() => {});
        }
      };
      window.addEventListener("pointerdown", unlock, { passive: true });
      window.addEventListener("keydown", unlock, { passive: true });
      window.addEventListener("touchstart", unlock, { passive: true });
    }
  }

  init() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return false;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.16;
        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return true;
    } catch {
      return false;
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.init();
      if (this.currentTrackName) {
        this.playTrack(this.currentTrackName, true);
      }
    } else {
      this.stopMusic();
    }
    return this.enabled;
  }

  stopMusic() {
    for (const t of this.timers) clearTimeout(t);
    this.timers = [];
    for (const t of this.sfxTimers) clearTimeout(t);
    this.sfxTimers = [];
    for (const osc of this.activeOscillators) {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    }
    this.activeOscillators.clear();
  }

  midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  playTrack(trackName, forceRestart = false) {
    if (!forceRestart && this.currentTrackName === trackName && this.timers.length > 0) {
      return;
    }
    this.currentTrackName = trackName;
    if (!this.enabled) return;
    if (!this.init()) return;

    this.stopMusic();
    const track = this.tracks[trackName] || this.tracks.MUSIC_PALLET_TOWN;
    if (!track || !track.channels) return;

    const tickMs = Math.max(8, (track.tempo || 150) * 0.11);

    for (const ch of track.channels) {
      this.scheduleChannelLoop(ch, tickMs);
    }
  }

  scheduleChannelLoop(ch, tickMs, noteIdx = 0) {
    if (!this.enabled || !this.ctx) return;
    const notes = ch?.notes;
    if (!Array.isArray(notes) || notes.length === 0) return;
    const idx = noteIdx % notes.length;
    const [midi, ticks] = notes[idx];
    const durMs = Math.max(20, (ticks || 1) * tickMs);
    const waveType = ch.ch === 3 ? "triangle" : "square";
    const chVol = ch.ch === 2 ? 0.35 : ch.ch === 1 ? 0.22 : 0.28;

    if (midi > 0) {
      this.playNote(this.midiToFreq(midi), durMs * 0.9, waveType, chVol);
    }

    const timer = setTimeout(() => {
      const pos = this.timers.indexOf(timer);
      if (pos !== -1) this.timers.splice(pos, 1);
      if (this.enabled && this.ctx) {
        this.scheduleChannelLoop(ch, tickMs, (idx + 1) % notes.length);
      }
    }, durMs);
    this.timers.push(timer);
  }

  playNote(freq, durMs, type = "square", volume = 0.25) {
    if (!this.ctx || !this.masterGain) return;
    if (!Number.isFinite(freq) || freq <= 0) return;
    if (this.activeOscillators.size >= 16) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(20, Math.min(20000, freq)), now);

      const durSec = Math.max(0.015, (Number(durMs) || 40) / 1000);
      const safeVol = Math.max(0.002, Math.min(1, Number(volume) || 0.25));
      gain.gain.setValueAtTime(safeVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durSec);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + durSec + 0.01);
      this.activeOscillators.add(osc);
      osc.onended = () => {
        this.activeOscillators.delete(osc);
        try {
          gain.disconnect();
        } catch {}
      };
    } catch {}
  }

  playSfx(kind) {
    if (!this.enabled) return;
    if (!this.init()) return;
    const schedule = (fn, delay) => {
      const id = setTimeout(() => {
        const idx = this.sfxTimers.indexOf(id);
        if (idx !== -1) this.sfxTimers.splice(idx, 1);
        if (this.enabled) fn();
      }, delay);
      this.sfxTimers.push(id);
    };
    if (kind === "blip") {
      this.playNote(987.77, 45, "square", 0.35);
      schedule(() => this.playNote(1318.51, 55, "square", 0.35), 40);
    } else if (kind === "warp") {
      [523, 659, 784, 1046].forEach((f, i) => {
        schedule(() => this.playNote(f, 55, "square", 0.35), i * 45);
      });
    } else if (kind === "ledge") {
      [440, 587, 784].forEach((f, i) => {
        schedule(() => this.playNote(f, 50, "square", 0.3), i * 38);
      });
    } else if (kind === "bump") {
      this.playNote(130, 80, "square", 0.3);
    } else if (kind === "pika") {
      this.playPokemonCry("PIKACHU");
    } else if (kind === "thunder") {
      [1567, 1318, 1046, 880, 1760, 1396].forEach((f, i) => {
        schedule(() => this.playNote(f, 55, "sawtooth", 0.4), i * 45);
      });
    }
  }

  // Hardware-accurate Game Boy Audio1 + APU Cry Synthesizer (PlayCry in audio/engine_1.asm)
  playPokemonCry(species, options = {}) {
    if (!this.init()) return false;
    const sp = String(species || "PIKACHU")
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, "_");
    const faint = Boolean(options && options.faint);
    const cacheKey = `${sp}:${faint ? 1 : 0}`;

    try {
      if (this.activeCrySource) {
        try {
          this.activeCrySource.stop();
          this.activeCrySource.disconnect();
        } catch {}
        this.activeCrySource = null;
      }

      let audioBuf = this.cryBufferCache.get(cacheKey);
      if (!audioBuf) {
        const [baseCryId, pitchByte, lengthByte] =
          GEN1_CRY_DATA[sp] || [0x0f, 0x80, 0x01];
        const cryDef = SFX_CRIES_DATA[baseCryId] || SFX_CRIES_DATA[0];
        const sr = this.ctx.sampleRate;
        const samplesPerFrame = Math.round(sr / 59.7275);

        const ch5Frames = buildSquareFrames(cryDef.ch5, pitchByte, lengthByte, faint);
        const ch6Frames = buildSquareFrames(cryDef.ch6, pitchByte, lengthByte, faint);
        const ch8Frames = buildNoiseFrames(cryDef.ch8, pitchByte);

        const totalFrames = Math.max(ch5Frames.length, ch6Frames.length, 1);
        const totalSamples = totalFrames * samplesPerFrame;
        audioBuf = this.ctx.createBuffer(1, totalSamples, sr);
        const out = audioBuf.getChannelData(0);

        let phase5 = 0;
        let phase6 = 0;
        let noisePhase = 0;
        let lfsr = 0x7fff;

        for (let f = 0; f < totalFrames; f++) {
          const s5 = ch5Frames[f] || { freqHz: 0, vol: 0, duty: 2 };
          const s6 = ch6Frames[f] || { freqHz: 0, vol: 0, duty: 2 };
          const s8 =
            ch8Frames[f] ||
            ch8Frames[ch8Frames.length - 1] || { clockHz: 0, width7: false, vol: 0 };

          const d5 = DUTY_THRESHOLDS[s5.duty & 3];
          const d6 = DUTY_THRESHOLDS[s6.duty & 3];
          const inc5 = s5.freqHz > 0 ? s5.freqHz / sr : 0;
          const inc6 = s6.freqHz > 0 ? s6.freqHz / sr : 0;
          const inc8 = s8.clockHz > 0 ? s8.clockHz / sr : 0;
          const baseIdx = f * samplesPerFrame;

          for (let i = 0; i < samplesPerFrame; i++) {
            let sample = 0;
            if (s5.vol > 0 && inc5 > 0) {
              phase5 = (phase5 + inc5) % 1.0;
              sample += (phase5 < d5 ? 1 : -1) * s5.vol * 0.42;
            }
            if (s6.vol > 0 && inc6 > 0) {
              phase6 = (phase6 + inc6) % 1.0;
              sample += (phase6 < d6 ? 1 : -1) * s6.vol * 0.38;
            }
            if (s8.vol > 0 && inc8 > 0) {
              noisePhase += inc8;
              while (noisePhase >= 1.0) {
                noisePhase -= 1.0;
                const bit = ((lfsr >> 0) ^ (lfsr >> 1)) & 1;
                lfsr = (lfsr >> 1) | (bit << 14);
                if (s8.width7) {
                  lfsr = (lfsr & ~(1 << 6)) | (bit << 6);
                }
              }
              sample += ((lfsr & 1) ? -1 : 1) * s8.vol * 0.22;
            }
            out[baseIdx + i] = sample;
          }
        }

        if (this.cryBufferCache.size >= 32) {
          const oldest = this.cryBufferCache.keys().next().value;
          if (oldest) this.cryBufferCache.delete(oldest);
        }
        this.cryBufferCache.set(cacheKey, audioBuf);
      }

      const src = this.ctx.createBufferSource();
      src.buffer = audioBuf;
      const cryGain = this.ctx.createGain();
      cryGain.gain.value = 1.35;
      src.connect(cryGain);
      cryGain.connect(this.masterGain);
      this.activeCrySource = src;
      src.onended = () => {
        if (this.activeCrySource === src) {
          this.activeCrySource = null;
        }
        try {
          cryGain.disconnect();
        } catch {}
      };
      src.start();
      return true;
    } catch {
      return false;
    }
  }
}
