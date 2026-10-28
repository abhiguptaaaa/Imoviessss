import { Cinema, Movie, Reservation, Showtime, User } from '../types';
import { generatePassQrSvgDataUri } from '../utils/bookingEngine';

export function createMoviePosterSvg(
  title: string,
  subtitle: string,
  accentHex: string,
  bgStartHex: string,
  bgEndHex: string,
  motif: 'dune' | 'noir' | 'odyssey' | 'symphony' | 'cosmos' | 'heist' | 'myth' | 'chronicle' = 'dune'
): string {
  const safeTitle = title.toUpperCase();
  const safeSub = subtitle.toUpperCase();

  let motifArt = '';
  if (motif === 'dune') {
    motifArt = `
      <circle cx="300" cy="210" r="85" fill="${accentHex}" opacity="0.22"/>
      <circle cx="345" cy="175" r="24" fill="#fef08a" opacity="0.55"/>
      <path d="M0 440 Q180 350 340 410 T600 370 L600 800 L0 800 Z" fill="${accentHex}" opacity="0.26"/>
      <path d="M0 510 Q260 420 450 480 T600 450 L600 800 L0 800 Z" fill="#09090b" opacity="0.88"/>
    `;
  } else if (motif === 'noir') {
    motifArt = `
      <rect x="80" y="100" width="440" height="420" rx="8" fill="none" stroke="${accentHex}" stroke-width="2" opacity="0.35"/>
      <line x1="80" y1="260" x2="520" y2="180" stroke="${accentHex}" stroke-width="3" opacity="0.4"/>
      <line x1="80" y1="340" x2="520" y2="260" stroke="#38bdf8" stroke-width="1.5" opacity="0.35"/>
      <polygon points="300,190 365,480 235,480" fill="${accentHex}" opacity="0.22"/>
    `;
  } else if (motif === 'odyssey') {
    motifArt = `
      <circle cx="300" cy="240" r="110" fill="none" stroke="${accentHex}" stroke-width="3" opacity="0.45"/>
      <circle cx="300" cy="240" r="72" fill="${accentHex}" opacity="0.18"/>
      <path d="M60 470 C180 410, 420 530, 540 460 L600 800 L0 800 Z" fill="${accentHex}" opacity="0.25"/>
    `;
  } else if (motif === 'symphony') {
    motifArt = `
      <ellipse cx="300" cy="260" rx="95" ry="145" fill="none" stroke="${accentHex}" stroke-width="2.5" opacity="0.45"/>
      <line x1="288" y1="90" x2="288" y2="480" stroke="${accentHex}" stroke-width="2" opacity="0.5"/>
      <line x1="300" y1="90" x2="300" y2="480" stroke="#ffffff" stroke-width="1.5" opacity="0.4"/>
      <line x1="312" y1="90" x2="312" y2="480" stroke="${accentHex}" stroke-width="2" opacity="0.5"/>
    `;
  } else if (motif === 'cosmos') {
    motifArt = `
      <ellipse cx="300" cy="240" rx="170" ry="48" transform="rotate(-22 300 240)" fill="none" stroke="${accentHex}" stroke-width="3" opacity="0.5"/>
      <circle cx="300" cy="240" r="56" fill="${accentHex}" opacity="0.3"/>
      <circle cx="160" cy="140" r="3" fill="#ffffff" opacity="0.8"/>
      <circle cx="460" cy="180" r="2.5" fill="#ffffff" opacity="0.7"/>
      <circle cx="420" cy="110" r="4" fill="${accentHex}" opacity="0.9"/>
    `;
  } else {
    motifArt = `
      <polygon points="300,110 450,370 150,370" fill="none" stroke="${accentHex}" stroke-width="3" opacity="0.45"/>
      <circle cx="300" cy="275" r="58" fill="${accentHex}" opacity="0.24"/>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bgStartHex}"/>
        <stop offset="60%" stop-color="${bgEndHex}"/>
        <stop offset="100%" stop-color="#09090b"/>
      </linearGradient>
      <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#09090b" stop-opacity="0.15"/>
        <stop offset="55%" stop-color="#09090b" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="#09090b" stop-opacity="0.96"/>
      </linearGradient>
    </defs>
    <rect width="600" height="800" fill="url(#bg)"/>
    ${motifArt}
    <rect width="600" height="800" fill="url(#scrim)"/>
    <rect x="28" y="28" width="544" height="744" rx="12" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="1.5"/>
    <text x="56" y="74" fill="${accentHex}" font-family="Outfit, sans-serif" font-size="15" font-weight="700" letter-spacing="4">I MOVIES ORIGINAL PRESENTATION</text>
    <text x="56" y="575" fill="#ffffff" font-family="Outfit, sans-serif" font-size="40" font-weight="700" letter-spacing="1">${safeTitle}</text>
    <text x="56" y="615" fill="#d4d4d8" font-family="Plus Jakarta Sans, sans-serif" font-size="16" font-weight="600" letter-spacing="3">${safeSub}</text>
    <line x1="56" y1="638" x2="170" y2="638" stroke="${accentHex}" stroke-width="3"/>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function createCinemaPhotoSvg(
  name: string,
  city: string,
  accentHex: string
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
    <defs>
      <linearGradient id="cbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#18181b"/>
        <stop offset="100%" stop-color="#09090b"/>
      </linearGradient>
    </defs>
    <rect width="800" height="500" fill="url(#cbg)"/>
    <path d="M130 90 Q400 140 670 90 L640 250 Q400 285 160 250 Z" fill="${accentHex}" opacity="0.22" stroke="${accentHex}" stroke-width="2"/>
    <g opacity="0.45" fill="${accentHex}">
      <rect x="180" y="310" width="60" height="28" rx="6"/>
      <rect x="260" y="310" width="60" height="28" rx="6"/>
      <rect x="340" y="310" width="60" height="28" rx="6"/>
      <rect x="420" y="310" width="60" height="28" rx="6"/>
      <rect x="500" y="310" width="60" height="28" rx="6"/>
      <rect x="140" y="360" width="65" height="30" rx="6"/>
      <rect x="225" y="360" width="65" height="30" rx="6"/>
      <rect x="310" y="360" width="65" height="30" rx="6"/>
      <rect x="395" y="360" width="65" height="30" rx="6"/>
      <rect x="480" y="360" width="65" height="30" rx="6"/>
      <rect x="565" y="360" width="65" height="30" rx="6"/>
    </g>
    <text x="48" y="435" fill="#ffffff" font-family="Outfit, sans-serif" font-size="30" font-weight="700">${name.toUpperCase()}</text>
    <text x="48" y="468" fill="#a1a1aa" font-family="Plus Jakarta Sans, sans-serif" font-size="16" font-weight="600" letter-spacing="2">${city.toUpperCase()} · DOLBY ATMOS &amp; LASER PROJECTION</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_MOVIES: Movie[] = [
  {
    _id: 'mov-dune-horizon',
    title: 'dune: eclipse of arrakis',
    image: createMoviePosterSvg(
      'Dune: Eclipse',
      'Science Fiction · 166 Min',
      '#f59e0b',
      '#451a03',
      '#1c1917',
      'dune'
    ),
    language: 'english',
    genre: 'science fiction, adventure, action',
    director: 'denis villeneuve',
    cast: 'timothee chalamet, zendaya, rebecca ferguson',
    description:
      'Across the sunlit dunes of Arrakis, Paul Atreides unites the desert tribes for a decisive stand against the imperial houses controlling the spice routes of the known universe.',
    duration: 166,
    releaseDate: '2026-01-15',
    endDate: '2026-12-30',
    rating: 4.9,
  },
  {
    _id: 'mov-neon-rain',
    title: 'midnight in neo-tokyo',
    image: createMoviePosterSvg(
      'Neo-Tokyo',
      'Thriller · Mystery · 132 Min',
      '#38bdf8',
      '#0c4a6e',
      '#09090b',
      'noir'
    ),
    language: 'english',
    genre: 'thriller, mystery, science fiction',
    director: 'park chan-wook',
    cast: 'ken watanabe, sonoya mizuno, hiroyuki sanada',
    description:
      'A forensic memory archivist in rain-drenched Shinjuku uncovers a syndicate rewriting witness recollections before high-profile corporate trials.',
    duration: 132,
    releaseDate: '2026-02-10',
    endDate: '2026-12-20',
    rating: 4.7,
  },
  {
    _id: 'mov-aegean-odyssey',
    title: 'the last trireme of delos',
    image: createMoviePosterSvg(
      'Last Trireme',
      'Historical · Adventure · 148 Min',
      '#10b981',
      '#064e3b',
      '#09090b',
      'odyssey'
    ),
    language: 'greek',
    genre: 'historical, adventure, drama',
    director: 'yorgos lanthimos',
    cast: 'andreas konstantinou, ariane labed, willem dafoe',
    description:
      'Tasked with carrying the sacred treasury across tempestuous Aegean waters, a veteran captain and his crew confront mutiny and an approaching naval blockade.',
    duration: 148,
    releaseDate: '2026-03-01',
    endDate: '2026-12-15',
    rating: 4.8,
  },
  {
    _id: 'mov-velvet-symphony',
    title: 'nocturne in winterminor',
    image: createMoviePosterSvg(
      'Nocturne',
      'Drama · Romance · 124 Min',
      '#f43f5e',
      '#4c0519',
      '#09090b',
      'symphony'
    ),
    language: 'french',
    genre: 'drama, romance',
    director: 'celine sciamma',
    cast: 'noemie merlant, adele haenel, louis garrel',
    description:
      'Two rival conservatory cellists in Lyon are paired for a winter solstice premiere, discovering an unspoken bond through four intense weeks of rehearsal.',
    duration: 124,
    releaseDate: '2026-02-20',
    endDate: '2026-11-30',
    rating: 4.6,
  },
  {
    _id: 'mov-orbital-zero',
    title: 'helios station nine',
    image: createMoviePosterSvg(
      'Helios Nine',
      'Science Fiction · Thriller · 141 Min',
      '#a855f7',
      '#3b0764',
      '#09090b',
      'cosmos'
    ),
    language: 'english',
    genre: 'science fiction, thriller, action',
    director: 'alex garland',
    cast: 'cillian murphy, jessie buckley, oscar isaac',
    description:
      'Stationed in low solar orbit to maintain the planetary mirror array, a crew of six engineers detects a structured signal originating from inside the corona.',
    duration: 141,
    releaseDate: '2026-04-01',
    endDate: '2026-12-28',
    rating: 4.8,
  },
  {
    _id: 'mov-berlin-cipher',
    title: 'the potsdam protocol',
    image: createMoviePosterSvg(
      'Potsdam Protocol',
      'Political · Thriller · 129 Min',
      '#eab308',
      '#422006',
      '#09090b',
      'heist'
    ),
    language: 'german',
    genre: 'political, thriller, mystery',
    director: 'edward berger',
    cast: 'sandra huller, daniel bruhl, august diehl',
    description:
      'During a 48-hour diplomatic summit outside Berlin, a translator realizes the encrypted annexes of an energy treaty conceal a covert intelligence swap.',
    duration: 129,
    releaseDate: '2026-03-10',
    endDate: '2026-12-18',
    rating: 4.5,
  },
  {
    _id: 'mov-valkyrie-chronicle',
    title: 'chronicles of the glass spire',
    image: createMoviePosterSvg(
      'Glass Spire',
      'Fantasy · Adventure · 154 Min',
      '#06b6d4',
      '#083344',
      '#09090b',
      'myth'
    ),
    language: 'english',
    genre: 'fantasy, adventure',
    director: 'guillermo del toro',
    cast: 'dev patel, saoirse ronan, ralph fiennes',
    description:
      'Beyond the northern glacier lies an ancient astronomical citadel whose clockwork mechanisms govern the seasonal tides of an entire continent.',
    duration: 154,
    releaseDate: '2026-11-20',
    endDate: '2027-03-15',
    rating: 4.9,
  },
  {
    _id: 'mov-grand-hotel-heist',
    title: 'alibi at the grand palais',
    image: createMoviePosterSvg(
      'Grand Palais',
      'Comedy · Mystery · 112 Min',
      '#fb923c',
      '#431407',
      '#09090b',
      'chronicle'
    ),
    language: 'french',
    genre: 'comedy, mystery, adventure',
    director: 'wes anderson',
    cast: 'lea seydoux, mathieu amalric, adrien brody',
    description:
      'When a priceless Renaissance astrolabe vanishes during a snowbound gala in the French Alps, the hotel concierge assembles an eccentric roster of suspects.',
    duration: 112,
    releaseDate: '2026-12-05',
    endDate: '2027-04-01',
    rating: 4.7,
  },
];

function createEmptySeatGrid(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

export const INITIAL_CINEMAS: Cinema[] = [
  {
    _id: 'cin-grand-imax',
    name: 'i movies Grand IMAX',
    ticketPrice: 14.5,
    city: 'athens',
    seats: createEmptySeatGrid(7, 10),
    seatsAvailable: 70,
    image: createCinemaPhotoSvg('i movies Grand IMAX', 'Athens', '#f59e0b'),
  },
  {
    _id: 'cin-velvet-lounge',
    name: 'i movies Velvet VIP Lounge',
    ticketPrice: 18.0,
    city: 'paris',
    seats: createEmptySeatGrid(6, 8),
    seatsAvailable: 48,
    image: createCinemaPhotoSvg('i movies Velvet VIP Lounge', 'Paris', '#f43f5e'),
  },
  {
    _id: 'cin-metroplex-laser',
    name: 'i movies Metroplex Laser 8',
    ticketPrice: 12.0,
    city: 'berlin',
    seats: createEmptySeatGrid(8, 10),
    seatsAvailable: 80,
    image: createCinemaPhotoSvg('i movies Metroplex Laser 8', 'Berlin', '#38bdf8'),
  },
  {
    _id: 'cin-riviera-openair',
    name: 'i movies Riviera Starlight',
    ticketPrice: 13.5,
    city: 'thessaloniki',
    seats: createEmptySeatGrid(6, 9),
    seatsAvailable: 54,
    image: createCinemaPhotoSvg('i movies Riviera Starlight', 'Thessaloniki', '#10b981'),
  },
];

export const INITIAL_SHOWTIMES: Showtime[] = [
  {
    _id: 'shw-1',
    startAt: '17:30',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    movieId: 'mov-dune-horizon',
    cinemaId: 'cin-grand-imax',
  },
  {
    _id: 'shw-2',
    startAt: '20:30',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    movieId: 'mov-dune-horizon',
    cinemaId: 'cin-grand-imax',
  },
  {
    _id: 'shw-3',
    startAt: '21:15',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    movieId: 'mov-dune-horizon',
    cinemaId: 'cin-velvet-lounge',
  },
  {
    _id: 'shw-4',
    startAt: '19:00',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    movieId: 'mov-neon-rain',
    cinemaId: 'cin-metroplex-laser',
  },
  {
    _id: 'shw-5',
    startAt: '22:00',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    movieId: 'mov-neon-rain',
    cinemaId: 'cin-grand-imax',
  },
  {
    _id: 'shw-6',
    startAt: '18:30',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    movieId: 'mov-aegean-odyssey',
    cinemaId: 'cin-riviera-openair',
  },
  {
    _id: 'shw-7',
    startAt: '21:00',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    movieId: 'mov-aegean-odyssey',
    cinemaId: 'cin-grand-imax',
  },
  {
    _id: 'shw-8',
    startAt: '20:00',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    movieId: 'mov-velvet-symphony',
    cinemaId: 'cin-velvet-lounge',
  },
  {
    _id: 'shw-9',
    startAt: '19:30',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    movieId: 'mov-orbital-zero',
    cinemaId: 'cin-grand-imax',
  },
  {
    _id: 'shw-10',
    startAt: '20:45',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    movieId: 'mov-berlin-cipher',
    cinemaId: 'cin-metroplex-laser',
  },
];

export const INITIAL_USERS: User[] = [
  {
    _id: 'usr-1',
    name: 'Alexandros Nikolaou',
    username: 'alex_guest',
    email: 'alex@imovies.cinema',
    phone: '+30 694 551 2090',
    role: 'guest',
  },
  {
    _id: 'usr-2',
    name: 'George Simos',
    username: 'admin',
    email: 'admin@imovies.cinema',
    phone: '+30 697 889 1024',
    role: 'superadmin',
  },
  {
    _id: 'usr-3',
    name: 'Elena Laurent',
    username: 'elena_vip',
    email: 'elena@imovies.cinema',
    phone: '+33 6 12 94 50 11',
    role: 'admin',
  },
];

const todayIso = new Date().toISOString().slice(0, 10);

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    _id: 'res-1001',
    date: todayIso,
    startAt: '20:30',
    seats: [
      [3, 4],
      [3, 5],
    ],
    ticketPrice: 14.5,
    total: 29.0,
    movieId: 'mov-dune-horizon',
    cinemaId: 'cin-grand-imax',
    username: 'alex_guest',
    phone: '+30 694 551 2090',
    checkin: false,
    qrCodeSvg: generatePassQrSvgDataUri('imovies-checkin-res-1001'),
  },
  {
    _id: 'res-1002',
    date: todayIso,
    startAt: '20:30',
    seats: [
      [2, 2],
      [2, 3],
      [2, 4],
    ],
    ticketPrice: 14.5,
    total: 43.5,
    movieId: 'mov-dune-horizon',
    cinemaId: 'cin-grand-imax',
    username: 'elena_vip',
    phone: '+33 6 12 94 50 11',
    checkin: true,
    qrCodeSvg: generatePassQrSvgDataUri('imovies-checkin-res-1002'),
  },
  {
    _id: 'res-1003',
    date: todayIso,
    startAt: '19:00',
    seats: [
      [3, 3],
      [3, 4],
    ],
    ticketPrice: 12.0,
    total: 24.0,
    movieId: 'mov-neon-rain',
    cinemaId: 'cin-metroplex-laser',
    username: 'alex_guest',
    phone: '+30 694 551 2090',
    checkin: true,
    qrCodeSvg: generatePassQrSvgDataUri('imovies-checkin-res-1003'),
  },
  {
    _id: 'res-1004',
    date: todayIso,
    startAt: '18:30',
    seats: [
      [2, 4],
      [2, 5],
    ],
    ticketPrice: 13.5,
    total: 27.0,
    movieId: 'mov-aegean-odyssey',
    cinemaId: 'cin-riviera-openair',
    username: 'admin',
    phone: '+30 697 889 1024',
    checkin: false,
    qrCodeSvg: generatePassQrSvgDataUri('imovies-checkin-res-1004'),
  },
];
