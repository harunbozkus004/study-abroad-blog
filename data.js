// ── ANAMIKA ABROAD — DATA & CONSTANTS (plain JS, loaded before React) ──────

const AUTH_PASSWORD = 'HarunLovesU';

// ── HEART CURSOR (for Turkey) ───────────────────────────────────────────────
const HEART_CURSOR = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'%3E%3Cpath d='M18 30 C18 30 4 21 4 12.5 C4 8.4 7.1 5 11 5 C13.8 5 16.2 6.8 18 9 C19.8 6.8 22.2 5 25 5 C28.9 5 32 8.4 32 12.5 C32 21 18 30 18 30Z' fill='%23e84070'/%3E%3C/svg%3E\") 18 18, auto";

// ── COUNTRY → STAMP IMAGE ────────────────────────────────────────────────────
const COUNTRY_STAMPS = {
  'UK':             'uploads/6173336-vintage-uk-postage-stamp.jpg',
  'France':         'uploads/s-l1200.jpg',
  'Italy':          'uploads/360_F_113107981_VCtm00CYwUx3KvfC8sCLfcA1l9WqEA8Z.jpg',
  'Greece':         'uploads/360_F_55693187_3o0zOJO6bz8vTltk7IXoBlGa3tCCn4Vh.jpg',
  'Spain':          'uploads/stock-vector-spain-toro-stamp-postal-map-silhouette-seal-passport-round-design-vector-icon-design-retro-1487571773.jpg',
  'Portugal':       'uploads/portugal-round-rubber-stamp-with-country-map-vintage-red-passport-stamp-with-circular-text-and-stars-vector-illustration-2PN5144.jpg',
  'Netherlands':    'uploads/Screenshot 2026-04-26 at 6.15.55 PM.png',
  'Czech Republic': 'uploads/360_F_319329321_0Xb1fc4xBpuOyuClGPpsg53kxzIc8Vyy.jpg',
  'Belgium':        'uploads/1000_F_533227100_dI6HFZ4xF3ehPz95E2ZWVt3oP5skc8AO.jpg',
  'Switzerland':    'uploads/download.jpg',
  'Turkey':         'uploads/Turkish_postage_stamp,_Selimiye_Mosque,_Scott_No._J61,_issued_1913.jpg',
  'Morocco':        'uploads/images.jpg',
};

// Country flags for generated stamps
const COUNTRY_FLAGS = {
  'Japan':'🇯🇵','South Korea':'🇰🇷','Thailand':'🇹🇭','Indonesia':'🇮🇩','India':'🇮🇳',
  'Vietnam':'🇻🇳','Singapore':'🇸🇬','China':'🇨🇳','Hong Kong':'🇭🇰','Taiwan':'🇹🇼',
  'USA':'🇺🇸','Canada':'🇨🇦','Mexico':'🇲🇽','Brazil':'🇧🇷','Argentina':'🇦🇷',
  'Peru':'🇵🇪','Colombia':'🇨🇴','Chile':'🇨🇱','Australia':'🇦🇺','New Zealand':'🇳🇿',
  'Egypt':'🇪🇬','Kenya':'🇰🇪','South Africa':'🇿🇦','Tanzania':'🇹🇿','Ethiopia':'🇪🇹',
  'Jordan':'🇯🇴','UAE':'🇦🇪','Israel':'🇮🇱','Lebanon':'🇱🇧','Saudi Arabia':'🇸🇦',
  'Germany':'🇩🇪','Austria':'🇦🇹','Hungary':'🇭🇺','Poland':'🇵🇱','Sweden':'🇸🇪',
  'Norway':'🇳🇴','Denmark':'🇩🇰','Finland':'🇫🇮','Ireland':'🇮🇪','Scotland':'🏴󠁧󠁢󠁳󠁣󠁴󠁿',
};

const STAMP_COLORS = ['#c03060','#2255aa','#336633','#aa6622','#553399','#aa2222','#225588'];
function getStampColor(country) {
  let h = 0;
  for (let i = 0; i < country.length; i++) h = (h * 31 + country.charCodeAt(i)) >>> 0;
  return STAMP_COLORS[h % STAMP_COLORS.length];
}

function getCountry(location) {
  if (!location) return '';
  const parts = location.split(', ');
  return parts[parts.length - 1];
}

function seedGrad(seed, offset = 0) {
  let h = offset;
  for (let i = 0; i < seed.length; i++) h = ((h * 31) + seed.charCodeAt(i)) >>> 0;
  const hue = 320 + (h % 60);
  const hue2 = (hue + 25 + (h % 25)) % 360;
  return `linear-gradient(135deg, hsl(${hue},58%,87%), hsl(${hue2},50%,92%))`;
}

const LOC_EMOJI_MAP = {
  'London, UK':'🎡','Oxford, UK':'🏛️','Edinburgh, UK':'🏰','Manchester, UK':'⚽','Liverpool, UK':'🎶',
  'Paris, France':'🗼','Nice, France':'🏖️','Lyon, France':'🍷','Marseille, France':'⚓',
  'Rome, Italy':'🏛️','Milan, Italy':'🛍️','Florence, Italy':'🎨','Venice, Italy':'🚤','Naples, Italy':'🍕',
  'Barcelona, Spain':'🏖️','Madrid, Spain':'🏙️','Seville, Spain':'💃','Valencia, Spain':'🌊',
  'Lisbon, Portugal':'⛵','Porto, Portugal':'🍷',
  'Amsterdam, Netherlands':'🚲','Rotterdam, Netherlands':'🏙️',
  'Berlin, Germany':'🧱','Munich, Germany':'🍺','Hamburg, Germany':'⚓','Frankfurt, Germany':'🏦',
  'Vienna, Austria':'🎼','Salzburg, Austria':'🎻',
  'Prague, Czech Republic':'🏰',
  'Budapest, Hungary':'🌉',
  'Warsaw, Poland':'🏙️','Krakow, Poland':'🏰',
  'Athens, Greece':'🏺','Santorini, Greece':'🌅','Mykonos, Greece':'🎉',
  'Zurich, Switzerland':'🏔️','Geneva, Switzerland':'🌍',
  'Brussels, Belgium':'🍫',
  'Copenhagen, Denmark':'🚲',
  'Stockholm, Sweden':'🧊',
  'Oslo, Norway':'🌲',
  'Helsinki, Finland':'❄️',
  'Dublin, Ireland':'🍀',
  'Istanbul, Turkey':'🕌','Ankara, Turkey':'🏛️','Izmir, Turkey':'🌊','Antalya, Turkey':'🏖️','Bodrum, Turkey':'🍸','Cappadocia, Turkey':'🎈',
  'Marrakesh, Morocco':'🕌','Casablanca, Morocco':'🏙️','Fes, Morocco':'🏺','Chefchaouen, Morocco':'💙','Tangier, Morocco':'🌊','Rabat, Morocco':'🏛️',
  'Tokyo, Japan':'⛩️','Kyoto, Japan':'⛩️','Osaka, Japan':'🏯','Hiroshima, Japan':'🕊️','Nara, Japan':'🦌','Sapporo, Japan':'❄️',
  'Seoul, South Korea':'🏯','Busan, South Korea':'🌊','Jeju, South Korea':'🌺',
  'Bangkok, Thailand':'🛕','Chiang Mai, Thailand':'🐘','Phuket, Thailand':'🏝️','Koh Samui, Thailand':'🌴',
  'Bali, Indonesia':'🌺','Jakarta, Indonesia':'🏙️','Yogyakarta, Indonesia':'🏛️',
  'Singapore, Singapore':'🌃',
  'Hanoi, Vietnam':'🌿','Ho Chi Minh City, Vietnam':'🛵','Hoi An, Vietnam':'🏮',
  'Mumbai, India':'🌊','Delhi, India':'🏛️','Jaipur, India':'🏰','Goa, India':'🏖️','Agra, India':'🕌',
  'New York, USA':'🗽','Los Angeles, USA':'🌴','Chicago, USA':'🌬️','Miami, USA':'☀️','San Francisco, USA':'🌉','New Orleans, USA':'🎷','Las Vegas, USA':'🎰','Seattle, USA':'☕',
  'Toronto, Canada':'🍁','Vancouver, Canada':'🏔️','Montreal, Canada':'🥐',
  'Mexico City, Mexico':'🌮','Cancun, Mexico':'🏖️','Oaxaca, Mexico':'🎨',
  'Buenos Aires, Argentina':'💃','Rio de Janeiro, Brazil':'🏖️','São Paulo, Brazil':'🏙️','Cartagena, Colombia':'🌺','Lima, Peru':'🏛️','Machu Picchu, Peru':'🏔️','Santiago, Chile':'🍷',
  'Sydney, Australia':'🦘','Melbourne, Australia':'🎨','Cairns, Australia':'🐊','Auckland, New Zealand':'🥝','Queenstown, New Zealand':'🏔️',
  'Cairo, Egypt':'🐪','Luxor, Egypt':'🏛️','Nairobi, Kenya':'🦁','Cape Town, South Africa':'🌊','Zanzibar, Tanzania':'🏝️',
  'Dubai, UAE':'🏙️','Abu Dhabi, UAE':'🕌','Amman, Jordan':'🏛️','Petra, Jordan':'🏛️','Tel Aviv, Israel':'🏖️','Jerusalem, Israel':'🕌','Beirut, Lebanon':'🌹',
  'Reykjavik, Iceland':'🌋',
  'Havana, Cuba':'🎺',
  'Custom location…':'📍',
};

function locEmoji(location) {
  if (!location) return '📍';
  return LOC_EMOJI_MAP[location] || '📍';
}

// ── EXTENSIVE LOCATION LIST ──────────────────────────────────────────────────
const KNOWN_LOCATIONS = [
  // 🇬🇧 UK
  {name:'London, UK',coords:[-0.1276,51.5074],emoji:'🎡'},
  {name:'Oxford, UK',coords:[-1.2577,51.752],emoji:'🏛️'},
  {name:'Edinburgh, UK',coords:[-3.1883,55.9533],emoji:'🏰'},
  {name:'Manchester, UK',coords:[-2.2426,53.4808],emoji:'⚽'},
  {name:'Liverpool, UK',coords:[-2.9916,53.4084],emoji:'🎶'},
  {name:'Cambridge, UK',coords:[0.1218,52.2053],emoji:'🎓'},
  {name:'Bath, UK',coords:[-2.3599,51.3811],emoji:'🛁'},
  {name:'Bristol, UK',coords:[-2.5879,51.4545],emoji:'🎨'},
  // 🇫🇷 France
  {name:'Paris, France',coords:[2.3522,48.8566],emoji:'🗼'},
  {name:'Nice, France',coords:[7.262,43.7102],emoji:'🏖️'},
  {name:'Lyon, France',coords:[4.8357,45.764],emoji:'🍷'},
  {name:'Marseille, France',coords:[5.3698,43.2965],emoji:'⚓'},
  {name:'Bordeaux, France',coords:[-0.5792,44.8378],emoji:'🍷'},
  {name:'Strasbourg, France',coords:[7.7521,48.5734],emoji:'🏰'},
  // 🇮🇹 Italy
  {name:'Rome, Italy',coords:[12.4964,41.9028],emoji:'🏛️'},
  {name:'Milan, Italy',coords:[9.19,45.4642],emoji:'🛍️'},
  {name:'Florence, Italy',coords:[11.2558,43.7696],emoji:'🎨'},
  {name:'Venice, Italy',coords:[12.3155,45.4408],emoji:'🚤'},
  {name:'Naples, Italy',coords:[14.2681,40.8518],emoji:'🍕'},
  {name:'Amalfi Coast, Italy',coords:[14.6027,40.6333],emoji:'🏖️'},
  {name:'Cinque Terre, Italy',coords:[9.7176,44.1272],emoji:'🌈'},
  {name:'Sicily, Italy',coords:[14.0154,37.5994],emoji:'🌋'},
  // 🇪🇸 Spain
  {name:'Barcelona, Spain',coords:[2.1734,41.3851],emoji:'🏖️'},
  {name:'Madrid, Spain',coords:[-3.7038,40.4168],emoji:'🏙️'},
  {name:'Seville, Spain',coords:[-5.9845,37.3891],emoji:'💃'},
  {name:'Valencia, Spain',coords:[-0.3763,39.4699],emoji:'🌊'},
  {name:'Granada, Spain',coords:[-3.5986,37.1773],emoji:'🏰'},
  {name:'Bilbao, Spain',coords:[-2.9253,43.263],emoji:'🏛️'},
  {name:'Ibiza, Spain',coords:[1.4322,38.9067],emoji:'🎉'},
  // 🇵🇹 Portugal
  {name:'Lisbon, Portugal',coords:[-9.1399,38.7223],emoji:'⛵'},
  {name:'Porto, Portugal',coords:[-8.6291,41.1579],emoji:'🍷'},
  {name:'Algarve, Portugal',coords:[-8.2245,37.0179],emoji:'🏖️'},
  {name:'Sintra, Portugal',coords:[-9.3872,38.7977],emoji:'🏰'},
  // 🇳🇱 Netherlands
  {name:'Amsterdam, Netherlands',coords:[4.9041,52.3676],emoji:'🚲'},
  {name:'Rotterdam, Netherlands',coords:[4.4777,51.9244],emoji:'🏙️'},
  {name:'The Hague, Netherlands',coords:[4.3007,52.0705],emoji:'🏛️'},
  // 🇩🇪 Germany
  {name:'Berlin, Germany',coords:[13.405,52.52],emoji:'🧱'},
  {name:'Munich, Germany',coords:[11.582,48.1351],emoji:'🍺'},
  {name:'Hamburg, Germany',coords:[9.9937,53.5511],emoji:'⚓'},
  {name:'Frankfurt, Germany',coords:[8.6821,50.1109],emoji:'🏦'},
  {name:'Cologne, Germany',coords:[6.9603,50.9333],emoji:'⛪'},
  {name:'Heidelberg, Germany',coords:[8.6942,49.3988],emoji:'🏰'},
  // 🇦🇹 Austria
  {name:'Vienna, Austria',coords:[16.3738,48.2082],emoji:'🎼'},
  {name:'Salzburg, Austria',coords:[13.055,47.8095],emoji:'🎻'},
  {name:'Innsbruck, Austria',coords:[11.3923,47.2692],emoji:'🏔️'},
  // 🇨🇿 Czech Republic
  {name:'Prague, Czech Republic',coords:[14.4378,50.0755],emoji:'🏰'},
  {name:'Brno, Czech Republic',coords:[16.6068,49.1951],emoji:'🏰'},
  // 🇭🇺 Hungary
  {name:'Budapest, Hungary',coords:[19.0402,47.4979],emoji:'🌉'},
  // 🇵🇱 Poland
  {name:'Warsaw, Poland',coords:[21.0122,52.2297],emoji:'🏙️'},
  {name:'Krakow, Poland',coords:[19.9445,50.0647],emoji:'🏰'},
  {name:'Gdansk, Poland',coords:[18.6466,54.352],emoji:'⚓'},
  // 🇬🇷 Greece
  {name:'Athens, Greece',coords:[23.7275,37.9838],emoji:'🏺'},
  {name:'Santorini, Greece',coords:[25.4615,36.3932],emoji:'🌅'},
  {name:'Mykonos, Greece',coords:[25.3289,37.4467],emoji:'🎉'},
  {name:'Thessaloniki, Greece',coords:[22.9444,40.6401],emoji:'🏛️'},
  {name:'Crete, Greece',coords:[24.8093,35.2401],emoji:'🌊'},
  {name:'Corfu, Greece',coords:[19.9215,39.6243],emoji:'🏝️'},
  // 🇨🇭 Switzerland
  {name:'Zurich, Switzerland',coords:[8.5417,47.3769],emoji:'🏔️'},
  {name:'Geneva, Switzerland',coords:[6.1432,46.2044],emoji:'🌍'},
  {name:'Bern, Switzerland',coords:[7.4474,46.948],emoji:'🐻'},
  {name:'Interlaken, Switzerland',coords:[7.8632,46.6863],emoji:'🏔️'},
  // 🇧🇪 Belgium
  {name:'Brussels, Belgium',coords:[4.3517,50.8503],emoji:'🍫'},
  {name:'Bruges, Belgium',coords:[3.2247,51.2093],emoji:'🏰'},
  {name:'Ghent, Belgium',coords:[3.7174,51.0543],emoji:'🎨'},
  // 🇩🇰 Denmark
  {name:'Copenhagen, Denmark',coords:[12.5683,55.6761],emoji:'🚲'},
  // 🇸🇪 Sweden
  {name:'Stockholm, Sweden',coords:[18.0686,59.3293],emoji:'🧊'},
  {name:'Gothenburg, Sweden',coords:[11.9746,57.7089],emoji:'⛵'},
  // 🇳🇴 Norway
  {name:'Oslo, Norway',coords:[10.7522,59.9139],emoji:'🌲'},
  {name:'Bergen, Norway',coords:[5.3221,60.3913],emoji:'🏔️'},
  {name:'Fjords, Norway',coords:[6.8806,61.4484],emoji:'🌊'},
  // 🇫🇮 Finland
  {name:'Helsinki, Finland',coords:[24.9384,60.1699],emoji:'❄️'},
  // 🇮🇪 Ireland
  {name:'Dublin, Ireland',coords:[-6.2603,53.3498],emoji:'🍀'},
  {name:'Galway, Ireland',coords:[-9.0568,53.2707],emoji:'🎸'},
  {name:'Cork, Ireland',coords:[-8.4706,51.8985],emoji:'🍺'},
  // 🇮🇸 Iceland
  {name:'Reykjavik, Iceland',coords:[-21.9426,64.1466],emoji:'🌋'},
  {name:'Blue Lagoon, Iceland',coords:[-22.4493,63.8804],emoji:'♨️'},
  // 🇹🇷 Turkey
  {name:'Istanbul, Turkey',coords:[28.9784,41.0082],emoji:'🕌'},
  {name:'Ankara, Turkey',coords:[32.8597,39.9334],emoji:'🏛️'},
  {name:'Izmir, Turkey',coords:[27.1428,38.4237],emoji:'🌊'},
  {name:'Antalya, Turkey',coords:[30.7133,36.8969],emoji:'🏖️'},
  {name:'Bodrum, Turkey',coords:[27.4305,37.0344],emoji:'🍸'},
  {name:'Cappadocia, Turkey',coords:[34.8284,38.6431],emoji:'🎈'},
  {name:'Ephesus, Turkey',coords:[27.3417,37.9395],emoji:'🏛️'},
  // 🇲🇦 Morocco
  {name:'Marrakesh, Morocco',coords:[-7.9811,31.6295],emoji:'🕌'},
  {name:'Casablanca, Morocco',coords:[-7.5898,33.5731],emoji:'🏙️'},
  {name:'Fes, Morocco',coords:[-5.0033,34.0331],emoji:'🏺'},
  {name:'Chefchaouen, Morocco',coords:[-5.2636,35.1688],emoji:'💙'},
  {name:'Tangier, Morocco',coords:[-5.8339,35.7595],emoji:'🌊'},
  {name:'Rabat, Morocco',coords:[-6.8498,34.0209],emoji:'🏛️'},
  // 🇯🇵 Japan
  {name:'Tokyo, Japan',coords:[139.6917,35.6895],emoji:'⛩️'},
  {name:'Kyoto, Japan',coords:[135.7681,35.0116],emoji:'⛩️'},
  {name:'Osaka, Japan',coords:[135.5023,34.6937],emoji:'🏯'},
  {name:'Hiroshima, Japan',coords:[132.4553,34.3853],emoji:'🕊️'},
  {name:'Nara, Japan',coords:[135.8048,34.685],emoji:'🦌'},
  {name:'Sapporo, Japan',coords:[141.3469,43.0618],emoji:'❄️'},
  // 🇰🇷 South Korea
  {name:'Seoul, South Korea',coords:[126.978,37.5665],emoji:'🏯'},
  {name:'Busan, South Korea',coords:[129.0756,35.1796],emoji:'🌊'},
  {name:'Jeju, South Korea',coords:[126.5312,33.489],emoji:'🌺'},
  // 🇹🇭 Thailand
  {name:'Bangkok, Thailand',coords:[100.5018,13.7563],emoji:'🛕'},
  {name:'Chiang Mai, Thailand',coords:[98.9853,18.7883],emoji:'🐘'},
  {name:'Phuket, Thailand',coords:[98.3923,7.8804],emoji:'🏝️'},
  {name:'Koh Samui, Thailand',coords:[100.0529,9.5017],emoji:'🌴'},
  {name:'Pai, Thailand',coords:[98.4309,19.3574],emoji:'🌿'},
  // 🇮🇩 Indonesia
  {name:'Bali, Indonesia',coords:[115.2126,-8.4095],emoji:'🌺'},
  {name:'Jakarta, Indonesia',coords:[106.8456,-6.2088],emoji:'🏙️'},
  {name:'Yogyakarta, Indonesia',coords:[110.3695,-7.7956],emoji:'🏛️'},
  // 🇸🇬 Singapore
  {name:'Singapore, Singapore',coords:[103.8198,1.3521],emoji:'🌃'},
  // 🇻🇳 Vietnam
  {name:'Hanoi, Vietnam',coords:[105.8342,21.0285],emoji:'🌿'},
  {name:'Ho Chi Minh City, Vietnam',coords:[106.6297,10.8231],emoji:'🛵'},
  {name:'Hoi An, Vietnam',coords:[108.3349,15.8801],emoji:'🏮'},
  {name:'Ha Long Bay, Vietnam',coords:[107.0843,20.9101],emoji:'🚢'},
  // 🇮🇳 India
  {name:'Mumbai, India',coords:[72.8777,19.076],emoji:'🌊'},
  {name:'Delhi, India',coords:[77.2090,28.6139],emoji:'🏛️'},
  {name:'Jaipur, India',coords:[75.7873,26.9124],emoji:'🏰'},
  {name:'Goa, India',coords:[74.124,15.2993],emoji:'🏖️'},
  {name:'Agra, India',coords:[78.0081,27.1767],emoji:'🕌'},
  {name:'Varanasi, India',coords:[83.0095,25.3176],emoji:'🕉️'},
  // 🇺🇸 USA
  {name:'New York, USA',coords:[-74.006,40.7128],emoji:'🗽'},
  {name:'Los Angeles, USA',coords:[-118.2437,34.0522],emoji:'🌴'},
  {name:'Chicago, USA',coords:[-87.6298,41.8781],emoji:'🌬️'},
  {name:'Miami, USA',coords:[-80.1918,25.7617],emoji:'☀️'},
  {name:'San Francisco, USA',coords:[-122.4194,37.7749],emoji:'🌉'},
  {name:'New Orleans, USA',coords:[-90.0715,29.9511],emoji:'🎷'},
  {name:'Las Vegas, USA',coords:[-115.1398,36.1699],emoji:'🎰'},
  {name:'Seattle, USA',coords:[-122.3321,47.6062],emoji:'☕'},
  {name:'Boston, USA',coords:[-71.0589,42.3601],emoji:'🦞'},
  {name:'Nashville, USA',coords:[-86.7816,36.1627],emoji:'🎸'},
  // 🇨🇦 Canada
  {name:'Toronto, Canada',coords:[-79.3832,43.6532],emoji:'🍁'},
  {name:'Vancouver, Canada',coords:[-123.1207,49.2827],emoji:'🏔️'},
  {name:'Montreal, Canada',coords:[-73.5673,45.5017],emoji:'🥐'},
  // 🇲🇽 Mexico
  {name:'Mexico City, Mexico',coords:[-99.1332,19.4326],emoji:'🌮'},
  {name:'Cancun, Mexico',coords:[-86.851,21.1619],emoji:'🏖️'},
  {name:'Oaxaca, Mexico',coords:[-96.7266,17.0732],emoji:'🎨'},
  // 🇧🇷 Brazil
  {name:'Rio de Janeiro, Brazil',coords:[-43.1729,-22.9068],emoji:'🏖️'},
  {name:'São Paulo, Brazil',coords:[-46.6333,-23.5505],emoji:'🏙️'},
  // 🇦🇷 Argentina
  {name:'Buenos Aires, Argentina',coords:[-58.3816,-34.6037],emoji:'💃'},
  // 🇵🇪 Peru
  {name:'Lima, Peru',coords:[-77.0428,-12.0464],emoji:'🏛️'},
  {name:'Machu Picchu, Peru',coords:[-72.5450,-13.1631],emoji:'🏔️'},
  // 🇦🇺 Australia
  {name:'Sydney, Australia',coords:[151.2093,-33.8688],emoji:'🦘'},
  {name:'Melbourne, Australia',coords:[144.9631,-37.8136],emoji:'🎨'},
  {name:'Cairns, Australia',coords:[145.7781,-16.9186],emoji:'🐊'},
  // 🇳🇿 New Zealand
  {name:'Auckland, New Zealand',coords:[174.7633,-36.8485],emoji:'🥝'},
  {name:'Queenstown, New Zealand',coords:[168.6626,-45.0312],emoji:'🏔️'},
  // 🇪🇬 Egypt
  {name:'Cairo, Egypt',coords:[31.2357,30.0444],emoji:'🐪'},
  {name:'Luxor, Egypt',coords:[32.6396,25.6872],emoji:'🏛️'},
  // 🇿🇦 South Africa
  {name:'Cape Town, South Africa',coords:[18.4241,-33.9249],emoji:'🌊'},
  {name:'Johannesburg, South Africa',coords:[28.0473,-26.2041],emoji:'🏙️'},
  // 🇰🇪 Kenya
  {name:'Nairobi, Kenya',coords:[36.8219,-1.2921],emoji:'🦁'},
  {name:'Masai Mara, Kenya',coords:[35.1431,-1.5044],emoji:'🦒'},
  // 🇹🇿 Tanzania
  {name:'Zanzibar, Tanzania',coords:[39.2083,-6.165],emoji:'🏝️'},
  // 🇦🇪 UAE
  {name:'Dubai, UAE',coords:[55.2708,25.2048],emoji:'🏙️'},
  {name:'Abu Dhabi, UAE',coords:[54.3773,24.4539],emoji:'🕌'},
  // 🇯🇴 Jordan
  {name:'Amman, Jordan',coords:[35.9106,31.9539],emoji:'🏛️'},
  {name:'Petra, Jordan',coords:[35.4444,30.3285],emoji:'🏛️'},
  // 🇮🇱 Israel
  {name:'Tel Aviv, Israel',coords:[34.7818,32.0853],emoji:'🏖️'},
  {name:'Jerusalem, Israel',coords:[35.2137,31.7683],emoji:'🕌'},
  // 🇨🇺 Cuba
  {name:'Havana, Cuba',coords:[-82.3666,23.1136],emoji:'🎺'},
  {name:'Custom location…',coords:null,emoji:'📍'},
];

// ── EASTER-EGG PHOTOS ───────────────────────────────────────────────────────
const EASTER_EGGS = {
  'harun': {
    src: 'uploads/IMG_2003.jpg',
    caption: '🥰 Harun & Anamika',
    location: 'I love you forever',
  },
  'berke': {
    src: 'uploads/IMG_2280.jpg',
    caption: '🍼 Baby Berke!!!',
    location: '04',
  },
  'thunder': {
    src: 'uploads/Screenshot 2026-04-26 at 6.15.33 PM-1b64e474.png',
    caption: '🐶 Thunder the best boy',
    location: 'Missing you crazy',
  },
};

// ── INITIAL DATA ─────────────────────────────────────────────────────────────
const INIT_POSTS = [];

const INIT_PHOTOS = [];

const INIT_FOOD = [];

const DEFAULT_TAGS = [];
