import type { Model } from "./types";

const m = (
  brand: string,
  slug: string,
  name: string,
  category: Model["category"],
  engineCc: number,
  hp: number,
  yearStart: number,
  yearEnd: number | null = null
): Model => ({
  brand,
  slug,
  name,
  category,
  engineCc,
  hp,
  yearStart,
  yearEnd,
  image: `/images/bikes/${brand}/${slug}.webp`
});

export const MODELS: Model[] = [
  // ROYAL ENFIELD
  m("royal-enfield", "hunter-350", "Hunter 350", "Naked", 349, 20, 2022),
  m("royal-enfield", "classic-350", "Classic 350", "Modern Classic", 349, 20, 2021),
  m("royal-enfield", "meteor-350", "Meteor 350", "Cruiser", 349, 20, 2020),
  m("royal-enfield", "bullet-350", "Bullet 350", "Modern Classic", 349, 20, 2023),
  m("royal-enfield", "himalayan-450", "Himalayan 450", "ADV", 452, 40, 2023),
  m("royal-enfield", "scram-411", "Scram 411", "Scrambler", 411, 24, 2022),
  m("royal-enfield", "continental-gt-650", "Continental GT 650", "Cafe Racer", 648, 47, 2018),
  m("royal-enfield", "interceptor-650", "Interceptor 650", "Modern Classic", 648, 47, 2018),
  m("royal-enfield", "super-meteor-650", "Super Meteor 650", "Cruiser", 648, 47, 2023),
  m("royal-enfield", "shotgun-650", "Shotgun 650", "Modern Classic", 648, 47, 2024),

  // BAJAJ
  m("bajaj", "pulsar-ns125", "Pulsar NS125", "Naked", 125, 12, 2021),
  m("bajaj", "pulsar-ns160", "Pulsar NS160", "Naked", 160, 17, 2017),
  m("bajaj", "pulsar-ns200", "Pulsar NS200", "Naked", 200, 24, 2012),
  m("bajaj", "pulsar-n250", "Pulsar N250", "Naked", 249, 24, 2021),
  m("bajaj", "pulsar-rs200", "Pulsar RS200", "Supersport", 200, 24, 2015),
  m("bajaj", "pulsar-f250", "Pulsar F250", "Naked", 249, 24, 2021),
  m("bajaj", "avenger-160", "Avenger Street 160", "Cruiser", 160, 15, 2018),
  m("bajaj", "avenger-220", "Avenger Cruise 220", "Cruiser", 220, 19, 2010),
  m("bajaj", "dominar-250", "Dominar 250", "Naked", 248, 27, 2020),
  m("bajaj", "dominar-400", "Dominar 400", "Naked", 373, 40, 2017),
  m("bajaj", "platina-110", "Platina 110", "Commuter", 115, 8.6, 2019),
  m("bajaj", "ct-100", "CT 100", "Commuter", 102, 8, 2017),

  // TVS
  m("tvs", "apache-rtr-160-4v", "Apache RTR 160 4V", "Naked", 159, 17.4, 2018),
  m("tvs", "apache-rtr-180", "Apache RTR 180", "Naked", 177, 16.8, 2009),
  m("tvs", "apache-rtr-200-4v", "Apache RTR 200 4V", "Naked", 197, 20, 2016),
  m("tvs", "apache-rr-310", "Apache RR 310", "Supersport", 312, 34, 2017),
  m("tvs", "ronin", "Ronin", "Modern Classic", 225, 20, 2022),
  m("tvs", "raider", "Raider 125", "Naked", 125, 11.4, 2021),
  m("tvs", "ntorq-125", "Ntorq 125", "Commuter", 125, 9.4, 2018),

  // HERO
  m("hero", "xtreme-160r", "Xtreme 160R", "Naked", 163, 15, 2020),
  m("hero", "xtreme-200r", "Xtreme 200R", "Naked", 199, 18.4, 2018),
  m("hero", "karizma-xmr", "Karizma XMR", "Supersport", 210, 25, 2023),
  m("hero", "splendor-plus", "Splendor Plus", "Commuter", 97, 8, 2014),
  m("hero", "passion-plus", "Passion Plus", "Commuter", 97, 8, 2014),
  m("hero", "glamour", "Glamour", "Commuter", 124, 11, 2017),
  m("hero", "xpulse-200", "Xpulse 200", "ADV", 199, 18, 2019),
  m("hero", "xpulse-200-4v", "Xpulse 200 4V", "ADV", 199, 19, 2021),

  // JAWA
  m("jawa", "jawa-42", "Jawa 42", "Modern Classic", 295, 27, 2018),
  m("jawa", "jawa-350", "Jawa 350", "Modern Classic", 295, 27, 2018),
  m("jawa", "perak", "Perak", "Cruiser", 334, 30, 2020),

  // YEZDI
  m("yezdi", "roadster", "Yezdi Roadster", "Modern Classic", 334, 29, 2022),
  m("yezdi", "scrambler", "Yezdi Scrambler", "Scrambler", 334, 29, 2022),
  m("yezdi", "adventure", "Yezdi Adventure", "ADV", 334, 29, 2022),

  // HONDA
  m("honda", "cb350", "CB350 H'ness", "Modern Classic", 348, 21, 2020),
  m("honda", "cb350-rs", "CB350 RS", "Scrambler", 348, 21, 2021),
  m("honda", "cb300r", "CB300R", "Naked", 286, 31, 2018),
  m("honda", "cb300f", "CB300F", "Naked", 293, 24, 2022),
  m("honda", "cbr150r", "CBR150R", "Supersport", 149, 17.5, 2014),
  m("honda", "cbr250r", "CBR250R", "Supersport", 249, 26, 2011),
  m("honda", "cbr650r", "CBR650R", "Supersport", 649, 95, 2019),
  m("honda", "cbr1000rr-r", "CBR1000RR-R Fireblade", "Supersport", 999, 215, 2020),
  m("honda", "hornet-2-0", "Hornet 2.0", "Naked", 184, 17, 2020),
  m("honda", "africa-twin", "Africa Twin", "ADV", 1084, 101, 2016),
  m("honda", "gold-wing", "Gold Wing", "Touring", 1833, 124, 2018),
  m("honda", "rebel-500", "Rebel 500", "Cruiser", 471, 46, 2017),
  m("honda", "rebel-1100", "Rebel 1100", "Cruiser", 1084, 87, 2021),
  m("honda", "transalp-750", "Transalp 750", "ADV", 755, 91, 2023),
  m("honda", "nx500", "NX500", "ADV", 471, 47, 2024),
  m("honda", "x-adv", "X-ADV", "ADV", 745, 58, 2017),

  // YAMAHA
  m("yamaha", "mt-03", "MT-03", "Naked", 321, 42, 2016),
  m("yamaha", "mt-07", "MT-07", "Naked", 689, 73, 2014),
  m("yamaha", "mt-09", "MT-09", "Naked", 890, 119, 2014),
  m("yamaha", "mt-10", "MT-10", "Naked", 998, 165, 2016),
  m("yamaha", "r3", "YZF-R3", "Supersport", 321, 42, 2015),
  m("yamaha", "r7", "YZF-R7", "Supersport", 689, 73, 2021),
  m("yamaha", "r15-v4", "YZF-R15 V4", "Supersport", 155, 18.4, 2021),
  m("yamaha", "r1", "YZF-R1", "Supersport", 998, 200, 2015),
  m("yamaha", "r1m", "YZF-R1M", "Supersport", 998, 200, 2015),
  m("yamaha", "fz-fi", "FZ-FI", "Naked", 149, 12.4, 2019),
  m("yamaha", "fzs-fi", "FZS-FI", "Naked", 149, 12.4, 2019),
  m("yamaha", "xsr700", "XSR700", "Modern Classic", 689, 73, 2016),
  m("yamaha", "xsr900", "XSR900", "Modern Classic", 890, 119, 2016),
  m("yamaha", "tenere-700", "Ténéré 700", "ADV", 689, 73, 2019),
  m("yamaha", "vmax", "V-Max", "Cruiser", 1679, 197, 2009, 2020),
  m("yamaha", "bolt", "Bolt", "Cruiser", 942, 65, 2014),

  // SUZUKI
  m("suzuki", "gsx-r150", "GSX-R150", "Supersport", 147, 19, 2017),
  m("suzuki", "gsx-r250", "GSX-R250", "Supersport", 248, 38, 2017),
  m("suzuki", "gsx-r600", "GSX-R600", "Supersport", 599, 124, 2011),
  m("suzuki", "gsx-r750", "GSX-R750", "Supersport", 750, 148, 2011),
  m("suzuki", "gsx-r1000r", "GSX-R1000R", "Supersport", 999, 199, 2017),
  m("suzuki", "gsx-s150", "GSX-S150", "Naked", 147, 19, 2017),
  m("suzuki", "gsx-s750", "GSX-S750", "Naked", 749, 113, 2017),
  m("suzuki", "gsx-s1000", "GSX-S1000", "Naked", 999, 152, 2015),
  m("suzuki", "v-strom-250", "V-Strom 250", "ADV", 248, 26, 2017),
  m("suzuki", "v-strom-650", "V-Strom 650", "ADV", 645, 70, 2012),
  m("suzuki", "v-strom-800de", "V-Strom 800DE", "ADV", 776, 84, 2023),
  m("suzuki", "v-strom-1050", "V-Strom 1050", "ADV", 1037, 107, 2020),
  m("suzuki", "hayabusa", "Hayabusa", "Supersport", 1340, 188, 2008),
  m("suzuki", "katana", "Katana", "Naked", 999, 152, 2019),
  m("suzuki", "gixxer-250-sf", "Gixxer SF 250", "Supersport", 249, 26, 2019),
  m("suzuki", "intruder-250", "Intruder 250", "Cruiser", 249, 26, 2019),

  // KAWASAKI
  m("kawasaki", "ninja-300", "Ninja 300", "Supersport", 296, 39, 2013),
  m("kawasaki", "ninja-400", "Ninja 400", "Supersport", 399, 49, 2018),
  m("kawasaki", "ninja-650", "Ninja 650", "Supersport", 649, 67, 2017),
  m("kawasaki", "ninja-zx-4r", "Ninja ZX-4R", "Supersport", 399, 80, 2023),
  m("kawasaki", "ninja-zx-6r", "Ninja ZX-6R", "Supersport", 636, 130, 2009),
  m("kawasaki", "ninja-zx-10r", "Ninja ZX-10R", "Supersport", 998, 200, 2011),
  m("kawasaki", "ninja-h2", "Ninja H2", "Supersport", 998, 231, 2015),
  m("kawasaki", "ninja-h2r", "Ninja H2R", "Supersport", 998, 310, 2015),
  m("kawasaki", "z400", "Z400", "Naked", 399, 49, 2019),
  m("kawasaki", "z650", "Z650", "Naked", 649, 67, 2017),
  m("kawasaki", "z900", "Z900", "Naked", 948, 124, 2017),
  m("kawasaki", "z-h2", "Z H2", "Naked", 998, 197, 2020),
  m("kawasaki", "versys-650", "Versys 650", "ADV", 649, 67, 2015),
  m("kawasaki", "versys-1000", "Versys 1000", "ADV", 1043, 118, 2015),
  m("kawasaki", "klx-450", "KLX450R", "ADV", 449, 50, 2018),
  m("kawasaki", "vulcan-s", "Vulcan S", "Cruiser", 649, 61, 2015),
  m("kawasaki", "w800", "W800", "Modern Classic", 773, 52, 2019),
  m("kawasaki", "eliminator", "Eliminator 500", "Cruiser", 451, 45, 2023),

  // KTM
  m("ktm", "duke-125", "125 Duke", "Naked", 124, 14.5, 2017),
  m("ktm", "duke-200", "200 Duke", "Naked", 199, 25, 2012),
  m("ktm", "duke-250", "250 Duke", "Naked", 249, 30, 2017),
  m("ktm", "duke-390", "390 Duke", "Naked", 399, 45, 2017),
  m("ktm", "duke-690", "690 Duke", "Naked", 690, 73, 2016),
  m("ktm", "duke-790", "790 Duke", "Naked", 799, 105, 2018),
  m("ktm", "duke-890", "890 Duke", "Naked", 889, 121, 2020),
  m("ktm", "duke-990", "990 Duke", "Naked", 947, 123, 2024),
  m("ktm", "1290-super-duke-r", "1290 Super Duke R", "Naked", 1301, 180, 2014),
  m("ktm", "rc-125", "RC 125", "Supersport", 124, 14.5, 2014),
  m("ktm", "rc-200", "RC 200", "Supersport", 199, 25, 2014),
  m("ktm", "rc-390", "RC 390", "Supersport", 399, 43, 2014),
  m("ktm", "390-adventure", "390 Adventure", "ADV", 373, 43, 2020),
  m("ktm", "890-adventure", "890 Adventure", "ADV", 889, 105, 2021),
  m("ktm", "990-adventure", "990 Adventure", "ADV", 947, 123, 2024),
  m("ktm", "1290-super-adventure", "1290 Super Adventure S", "ADV", 1301, 160, 2017),

  // BMW MOTORRAD
  m("bmw-motorrad", "g310r", "G 310 R", "Naked", 313, 34, 2016),
  m("bmw-motorrad", "g310gs", "G 310 GS", "ADV", 313, 34, 2017),
  m("bmw-motorrad", "f750gs", "F 750 GS", "ADV", 853, 77, 2018, 2023),
  m("bmw-motorrad", "f850gs", "F 850 GS", "ADV", 853, 90, 2018, 2023),
  m("bmw-motorrad", "f900gs", "F 900 GS", "ADV", 895, 105, 2024),
  m("bmw-motorrad", "f900r", "F 900 R", "Naked", 895, 105, 2020),
  m("bmw-motorrad", "f900xr", "F 900 XR", "ADV", 895, 105, 2020),
  m("bmw-motorrad", "r1250gs", "R 1250 GS", "ADV", 1254, 136, 2019),
  m("bmw-motorrad", "r1250rt", "R 1250 RT", "Touring", 1254, 136, 2019),
  m("bmw-motorrad", "r1250r", "R 1250 R", "Naked", 1254, 136, 2019),
  m("bmw-motorrad", "r1250rs", "R 1250 RS", "Touring", 1254, 136, 2019),
  m("bmw-motorrad", "s1000rr", "S 1000 RR", "Supersport", 999, 210, 2009),
  m("bmw-motorrad", "s1000r", "S 1000 R", "Naked", 999, 165, 2014),
  m("bmw-motorrad", "s1000xr", "S 1000 XR", "ADV", 999, 165, 2015),
  m("bmw-motorrad", "m1000rr", "M 1000 RR", "Supersport", 999, 212, 2021),
  m("bmw-motorrad", "k1600gt", "K 1600 GT", "Touring", 1649, 160, 2017),
  m("bmw-motorrad", "k1600gtl", "K 1600 GTL", "Touring", 1649, 160, 2017),
  m("bmw-motorrad", "r-ninet", "R nineT", "Modern Classic", 1170, 109, 2014),
  m("bmw-motorrad", "r-ninet-scrambler", "R nineT Scrambler", "Scrambler", 1170, 109, 2016),

  // DUCATI
  m("ducati", "monster-937", "Monster 937", "Naked", 937, 111, 2021),
  m("ducati", "monster-797", "Monster 797", "Naked", 803, 73, 2017, 2020),
  m("ducati", "panigale-v2", "Panigale V2", "Supersport", 955, 155, 2020),
  m("ducati", "panigale-v4", "Panigale V4", "Supersport", 1103, 215, 2018),
  m("ducati", "panigale-v4s", "Panigale V4 S", "Supersport", 1103, 215, 2018),
  m("ducati", "panigale-v4r", "Panigale V4 R", "Supersport", 998, 240, 2019),
  m("ducati", "streetfighter-v2", "Streetfighter V2", "Naked", 955, 153, 2022),
  m("ducati", "streetfighter-v4", "Streetfighter V4", "Naked", 1103, 208, 2020),
  m("ducati", "multistrada-v2", "Multistrada V2", "ADV", 937, 113, 2022),
  m("ducati", "multistrada-v4", "Multistrada V4", "ADV", 1158, 170, 2021),
  m("ducati", "diavel-v4", "Diavel V4", "Naked", 1158, 168, 2023),
  m("ducati", "scrambler-icon", "Scrambler Icon", "Scrambler", 803, 73, 2015),
  m("ducati", "scrambler-1100", "Scrambler 1100", "Scrambler", 1079, 86, 2018),
  m("ducati", "hypermotard-950", "Hypermotard 950", "Naked", 937, 114, 2019),
  m("ducati", "desert-x", "DesertX", "ADV", 937, 110, 2022),

  // APRILIA
  m("aprilia", "rs-660", "RS 660", "Supersport", 659, 100, 2020),
  m("aprilia", "tuono-660", "Tuono 660", "Naked", 659, 100, 2021),
  m("aprilia", "rsv4", "RSV4", "Supersport", 1099, 217, 2009),
  m("aprilia", "tuono-v4", "Tuono V4", "Naked", 1077, 175, 2011),
  m("aprilia", "rs-457", "RS 457", "Supersport", 457, 47, 2024),
  m("aprilia", "tuareg-660", "Tuareg 660", "ADV", 659, 80, 2022),
  m("aprilia", "shiver-900", "Shiver 900", "Naked", 896, 95, 2017, 2022),
  m("aprilia", "caponord-1200", "Caponord 1200", "ADV", 1197, 125, 2013, 2018),

  // TRIUMPH
  m("triumph", "speed-400", "Speed 400", "Modern Classic", 398, 39.5, 2023),
  m("triumph", "scrambler-400x", "Scrambler 400 X", "Scrambler", 398, 39.5, 2023),
  m("triumph", "trident-660", "Trident 660", "Naked", 660, 80, 2021),
  m("triumph", "tiger-sport-660", "Tiger Sport 660", "Touring", 660, 80, 2022),
  m("triumph", "tiger-900", "Tiger 900", "ADV", 888, 107, 2020),
  m("triumph", "tiger-1200", "Tiger 1200", "ADV", 1160, 148, 2022),
  m("triumph", "daytona-660", "Daytona 660", "Supersport", 660, 95, 2024),
  m("triumph", "speed-triple-1200", "Speed Triple 1200 RS", "Naked", 1160, 180, 2021),
  m("triumph", "street-triple-765", "Street Triple 765", "Naked", 765, 130, 2017),
  m("triumph", "bonneville-t100", "Bonneville T100", "Modern Classic", 900, 65, 2017),
  m("triumph", "bonneville-t120", "Bonneville T120", "Modern Classic", 1200, 80, 2016),
  m("triumph", "bobber", "Bonneville Bobber", "Cruiser", 1200, 77, 2017),
  m("triumph", "speedmaster", "Bonneville Speedmaster", "Cruiser", 1200, 77, 2018),
  m("triumph", "rocket-3", "Rocket 3", "Cruiser", 2458, 165, 2019),

  // HUSQVARNA
  m("husqvarna", "svartpilen-125", "Svartpilen 125", "Naked", 124, 14.5, 2021),
  m("husqvarna", "svartpilen-250", "Svartpilen 250", "Naked", 249, 30, 2020),
  m("husqvarna", "svartpilen-401", "Svartpilen 401", "Naked", 399, 45, 2018),
  m("husqvarna", "vitpilen-250", "Vitpilen 250", "Cafe Racer", 249, 30, 2020, 2023),
  m("husqvarna", "vitpilen-401", "Vitpilen 401", "Cafe Racer", 399, 45, 2018, 2023),
  m("husqvarna", "norden-901", "Norden 901", "ADV", 889, 105, 2022),

  // MV AGUSTA
  m("mv-agusta", "brutale-800", "Brutale 800", "Naked", 798, 140, 2016),
  m("mv-agusta", "brutale-1000rr", "Brutale 1000 RR", "Naked", 998, 208, 2020),
  m("mv-agusta", "f3-800", "F3 800", "Supersport", 798, 147, 2014),
  m("mv-agusta", "dragster-800", "Dragster 800", "Naked", 798, 140, 2014),
  m("mv-agusta", "superveloce-800", "Superveloce 800", "Supersport", 798, 147, 2020),
  m("mv-agusta", "turismo-veloce", "Turismo Veloce 800", "Touring", 798, 110, 2015),

  // HARLEY-DAVIDSON
  m("harley-davidson", "street-bob", "Street Bob 114", "Cruiser", 1868, 94, 2018),
  m("harley-davidson", "fat-bob", "Fat Bob 114", "Cruiser", 1868, 94, 2018),
  m("harley-davidson", "low-rider-s", "Low Rider S", "Cruiser", 1923, 103, 2020),
  m("harley-davidson", "low-rider-st", "Low Rider ST", "Cruiser", 1923, 103, 2022),
  m("harley-davidson", "sportster-s", "Sportster S", "Cruiser", 1252, 121, 2021),
  m("harley-davidson", "nightster", "Nightster", "Cruiser", 975, 90, 2022),
  m("harley-davidson", "pan-america-1250", "Pan America 1250", "ADV", 1252, 150, 2021),
  m("harley-davidson", "road-king", "Road King", "Touring", 1746, 87, 2017),
  m("harley-davidson", "street-glide", "Street Glide", "Touring", 1923, 105, 2024),
  m("harley-davidson", "road-glide", "Road Glide", "Touring", 1923, 105, 2024),
  m("harley-davidson", "heritage-classic", "Heritage Classic", "Cruiser", 1868, 94, 2018),
  m("harley-davidson", "fat-boy", "Fat Boy 114", "Cruiser", 1868, 94, 2018),
  m("harley-davidson", "x440", "X440", "Naked", 440, 27, 2023),

  // INDIAN
  m("indian", "scout-bobber", "Scout Bobber", "Cruiser", 1133, 100, 2018),
  m("indian", "sport-scout", "Sport Scout", "Cruiser", 1250, 110, 2024),
  m("indian", "ftr-1200", "FTR 1200", "Naked", 1203, 120, 2019),
  m("indian", "chief-dark-horse", "Chief Dark Horse", "Cruiser", 1890, 92, 2022),
  m("indian", "chieftain", "Chieftain", "Touring", 1890, 92, 2014),
  m("indian", "roadmaster", "Roadmaster", "Touring", 1890, 92, 2015),
  m("indian", "pursuit", "Pursuit", "Touring", 1768, 122, 2022),
  m("indian", "challenger", "Challenger", "Touring", 1768, 122, 2020),

  // BENELLI
  m("benelli", "tnt-300", "TNT 300", "Naked", 300, 38, 2014),
  m("benelli", "302r", "302R", "Supersport", 300, 38, 2017),
  m("benelli", "leoncino-250", "Leoncino 250", "Scrambler", 249, 25, 2020),
  m("benelli", "leoncino-500", "Leoncino 500", "Scrambler", 500, 47, 2018),
  m("benelli", "leoncino-800", "Leoncino 800", "Scrambler", 754, 81, 2022),
  m("benelli", "trk-251", "TRK 251", "ADV", 249, 25, 2021),
  m("benelli", "trk-502", "TRK 502", "ADV", 500, 47, 2018),
  m("benelli", "trk-702", "TRK 702", "ADV", 698, 70, 2023),
  m("benelli", "trk-702x", "TRK 702X", "ADV", 698, 70, 2023),
  m("benelli", "imperiale-400", "Imperiale 400", "Modern Classic", 374, 21, 2019),
  m("benelli", "752s", "752S", "Naked", 754, 76, 2020),

  // MOTO GUZZI
  m("moto-guzzi", "v7-stone", "V7 Stone", "Modern Classic", 853, 65, 2021),
  m("moto-guzzi", "v7-special", "V7 Special", "Modern Classic", 853, 65, 2021),
  m("moto-guzzi", "v9-bobber", "V9 Bobber", "Cruiser", 853, 65, 2016),
  m("moto-guzzi", "v85-tt", "V85 TT", "ADV", 853, 80, 2019),
  m("moto-guzzi", "v100-mandello", "V100 Mandello", "Touring", 1042, 115, 2022),

  // CF MOTO
  m("cf-moto", "300nk", "300NK", "Naked", 292, 29, 2019),
  m("cf-moto", "300sr", "300SR", "Supersport", 292, 29, 2020),
  m("cf-moto", "450nk", "450NK", "Naked", 449, 50, 2023),
  m("cf-moto", "650nk", "650NK", "Naked", 649, 70, 2014),
  m("cf-moto", "650mt", "650MT", "ADV", 649, 70, 2017),
  m("cf-moto", "800mt", "800MT", "ADV", 799, 95, 2022),
  m("cf-moto", "700cl-x", "700CL-X", "Modern Classic", 693, 73, 2022),
  m("cf-moto", "450mt", "450MT", "ADV", 449, 44, 2024),

  // KEEWAY
  m("keeway", "sr-250", "SR 250", "Cruiser", 223, 14, 2022),
  m("keeway", "v302c", "V302C", "Cruiser", 298, 28, 2022),
  m("keeway", "k-light-250v", "K-Light 250V", "Cruiser", 223, 14, 2022),
  m("keeway", "vieste-300", "Vieste 300", "Commuter", 278, 19, 2022)
];

export const MODELS_BY_BRAND: Record<string, Model[]> = MODELS.reduce(
  (acc, model) => {
    (acc[model.brand] ||= []).push(model);
    return acc;
  },
  {} as Record<string, Model[]>
);

export function getModelsByBrand(brand: string): Model[] {
  return MODELS_BY_BRAND[brand] ?? [];
}

export function getModel(brand: string, slug: string): Model | undefined {
  return MODELS.find((mo) => mo.brand === brand && mo.slug === slug);
}

export function getYearsForModel(brand: string, modelSlug: string): number[] {
  const mo = getModel(brand, modelSlug);
  if (!mo) return [];
  const end = mo.yearEnd ?? new Date().getFullYear();
  const years: number[] = [];
  for (let y = end; y >= mo.yearStart; y--) years.push(y);
  return years;
}
