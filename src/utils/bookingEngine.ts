import {
  Cinema,
  Movie,
  Reservation,
  SeatStatus,
  SeatSuggestionModel,
  Showtime,
} from '../types';

export const GENRE_DATA = [
  'action',
  'adventure',
  'comedy',
  'drama',
  'fantasy',
  'historical',
  'horror',
  'mystery',
  'romance',
  'science fiction',
  'thriller',
  'political',
  'western',
];

export const LANGUAGE_DATA = ['english', 'greek', 'german', 'french'];

/**
 * Converts a 0-based row index to a theater row letter (0 -> 'A', 1 -> 'B', etc.)
 */
export function convertRowToAlphabet(rowIndex: number): string {
  return (rowIndex + 10).toString(36).toUpperCase();
}

/**
 * Formats a seat tuple [row, col] into human-readable label e.g. "Row B · Seat 4"
 */
export function formatSeatLabel(seat: [number, number]): string {
  return `Row ${convertRowToAlphabet(seat[0])} · Seat ${seat[1] + 1}`;
}

/**
 * Calculates checkout total for selected seats and cinema ticket price
 */
export function calculateCheckoutTotal(
  selectedSeatCount: number,
  ticketPrice: number
): number {
  if (selectedSeatCount <= 0 || ticketPrice <= 0) return 0;
  return Number((selectedSeatCount * ticketPrice).toFixed(2));
}

/**
 * Categorizes movies into Now Showing and Coming Soon relative to a reference date
 */
export function categorizeMovies(
  movies: Movie[],
  referenceDate: Date = new Date()
): { nowShowing: Movie[]; comingSoon: Movie[] } {
  const nowShowing: Movie[] = [];
  const comingSoon: Movie[] = [];
  const refTime = referenceDate.getTime();

  for (const movie of movies) {
    const releaseTime = new Date(movie.releaseDate).getTime();
    const endTime = new Date(movie.endDate).getTime();
    if (releaseTime > refTime) {
      comingSoon.push(movie);
    } else if (refTime >= releaseTime && refTime <= endTime) {
      nowShowing.push(movie);
    } else {
      // Keep active catalog movies visible in nowShowing if endDate passed in demo
      nowShowing.push(movie);
    }
  }

  return { nowShowing, comingSoon };
}

/**
 * Cinema User Modeling (sorts cinemas by user's past booking frequency)
 */
export function cinemaUserModeling(
  cinemas: Cinema[],
  reservations: Reservation[],
  username?: string
): Cinema[] {
  if (!username) return cinemas;
  const userReservations = reservations.filter(
    (r) => r.username.toLowerCase() === username.toLowerCase()
  );
  if (!userReservations.length) return cinemas;

  const counts: Record<string, number> = {};
  for (const r of userReservations) {
    counts[r.cinemaId] = (counts[r.cinemaId] || 0) + 1;
  }

  return [...cinemas].sort((a, b) => (counts[b._id] || 0) - (counts[a._id] || 0));
}

/**
 * Movies User Modeling (recommends unwatched movies matching user's genre, director, and cast preferences)
 */
export function moviesUserModeling(
  allMovies: Movie[],
  reservations: Reservation[],
  username?: string
): Movie[] {
  if (!username) return allMovies.slice(0, 4);

  const userReservations = reservations.filter(
    (r) => r.username.toLowerCase() === username.toLowerCase()
  );
  if (!userReservations.length) return allMovies.slice(0, 4);

  const watchedIds = new Set(userReservations.map((r) => r.movieId));
  const watchedMovies = allMovies.filter((m) => watchedIds.has(m._id));

  const pref = {
    genre: {} as Record<string, number>,
    director: {} as Record<string, number>,
    cast: {} as Record<string, number>,
  };

  for (const movie of watchedMovies) {
    movie.genre
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .forEach((g) => {
        pref.genre[g] = (pref.genre[g] || 0) + 1;
      });
    movie.director
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .forEach((d) => {
        pref.director[d] = (pref.director[d] || 0) + 1;
      });
    movie.cast
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .forEach((c) => {
        pref.cast[c] = (pref.cast[c] || 0) + 1;
      });
  }

  const unwatched = allMovies.filter((m) => !watchedIds.has(m._id));
  const scored = unwatched.map((movie) => {
    let score = 0;
    movie.genre
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .forEach((g) => {
        score += (pref.genre[g] || 0) * 3;
      });
    movie.director
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .forEach((d) => {
        score += (pref.director[d] || 0) * 2;
      });
    movie.cast
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .forEach((c) => {
        score += pref.cast[c] || 0;
      });
    return { movie, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const matched = scored.filter((item) => item.score > 0).map((item) => item.movie);
  return matched.length > 0 ? matched : unwatched.slice(0, 4);
}

/**
 * Determines which zone (front, center, back) a booked row falls into
 */
export function getRowPositionZone(
  totalRows: number,
  rowIndex: number
): 'front' | 'center' | 'back' {
  const step = totalRows / 3;
  if (rowIndex < step) return 'front';
  if (rowIndex < step * 2) return 'center';
  return 'back';
}

/**
 * Reservation Seats User Modeling: analyzes user's past reservations to infer preferred ticket count & zone
 */
export function reservationSeatsUserModeling(
  cinemas: Cinema[],
  reservations: Reservation[],
  username?: string
): SeatSuggestionModel {
  const positions = { front: 0, center: 0, back: 0 };
  if (!username) {
    return { numberOfTickets: 2, positions: { front: 0, center: 1, back: 0 } };
  }

  const userReservations = reservations.filter(
    (r) => r.username.toLowerCase() === username.toLowerCase()
  );

  if (!userReservations.length) {
    return { numberOfTickets: 2, positions: { front: 0, center: 1, back: 0 } };
  }

  const ticketCounts: number[] = [];
  for (const res of userReservations) {
    const cinema = cinemas.find((c) => c._id === res.cinemaId);
    if (cinema && res.seats.length > 0) {
      const zone = getRowPositionZone(cinema.seats.length, res.seats[0][0]);
      positions[zone]++;
      ticketCounts.push(res.seats.length);
    }
  }

  const avgTickets = ticketCounts.length
    ? Math.max(
        1,
        Math.round(
          ticketCounts.reduce((sum, count) => sum + count, 0) / ticketCounts.length
        )
      )
    : 2;

  return {
    numberOfTickets: avgTickets,
    positions,
  };
}

/**
 * Builds the 2D seat matrix for a cinema/date/time with:
 * 0 = available, 1 = reserved, 2 = currently selected by user, 3 = recommended by user-modeling
 */
export function buildSeatMatrix(
  cinema: Cinema,
  reservations: Reservation[],
  selectedDate: string,
  selectedTime: string,
  selectedSeats: [number, number][],
  suggestionModel?: SeatSuggestionModel
): SeatStatus[][] {
  const matrix: SeatStatus[][] = cinema.seats.map((row) =>
    row.map(() => 0 as SeatStatus)
  );

  const normalizedTargetDate = selectedDate.slice(0, 10);

  // 1. Mark reserved seats (status = 1)
  const matchingReservations = reservations.filter(
    (r) =>
      r.cinemaId === cinema._id &&
      r.date.slice(0, 10) === normalizedTargetDate &&
      r.startAt === selectedTime
  );

  for (const res of matchingReservations) {
    for (const [rIdx, cIdx] of res.seats) {
      if (matrix[rIdx] && matrix[rIdx][cIdx] !== undefined) {
        matrix[rIdx][cIdx] = 1;
      }
    }
  }

  // 2. Mark recommended seats (status = 3) if user hasn't selected seats yet
  if (suggestionModel && selectedSeats.length === 0) {
    const { numberOfTickets, positions } = suggestionModel;
    const sortedZones = (Object.entries(positions) as [
      'front' | 'center' | 'back',
      number
    ][]).sort((a, b) => b[1] - a[1]);

    const totalRows = matrix.length;
    const step = Math.max(1, Math.round(totalRows / 3));

    for (const [zone] of sortedZones) {
      let startRow = 0;
      let endRow = totalRows;
      if (zone === 'front') {
        startRow = 0;
        endRow = Math.min(totalRows, step);
      } else if (zone === 'center') {
        startRow = Math.min(totalRows - 1, step);
        endRow = Math.min(totalRows, step * 2);
      } else {
        startRow = Math.min(totalRows - 1, step * 2);
        endRow = totalRows;
      }

      let foundBlock: [number, number][] | null = null;
      for (let r = startRow; r < endRow; r++) {
        const row = matrix[r];
        if (!row) continue;
        // Prefer center-ish columns in that row
        const centerCol = Math.floor((row.length - numberOfTickets) / 2);
        const colOrder: number[] = [];
        for (let c = 0; c <= row.length - numberOfTickets; c++) {
          colOrder.push(c);
        }
        colOrder.sort((a, b) => Math.abs(a - centerCol) - Math.abs(b - centerCol));

        for (const startCol of colOrder) {
          let allFree = true;
          const candidate: [number, number][] = [];
          for (let offset = 0; offset < numberOfTickets; offset++) {
            if (row[startCol + offset] !== 0) {
              allFree = false;
              break;
            }
            candidate.push([r, startCol + offset]);
          }
          if (allFree) {
            foundBlock = candidate;
            break;
          }
        }
        if (foundBlock) break;
      }

      if (foundBlock) {
        for (const [r, c] of foundBlock) {
          matrix[r][c] = 3;
        }
        break;
      }
    }
  }

  // 3. Mark currently selected seats (status = 2)
  for (const [rIdx, cIdx] of selectedSeats) {
    if (matrix[rIdx] && matrix[rIdx][cIdx] !== undefined && matrix[rIdx][cIdx] !== 1) {
      matrix[rIdx][cIdx] = 2;
    }
  }

  return matrix;
}

/**
 * Filters available cinemas and showtimes for a given movie
 */
export function filterAvailableCinemasAndTimes(
  cinemas: Cinema[],
  showtimes: Showtime[],
  movieId: string,
  selectedCinemaId?: string
): { availableCinemas: Cinema[]; availableTimes: string[] } {
  const movieShowtimes = showtimes.filter((s) => s.movieId === movieId);
  const showtimesToUse = movieShowtimes.length > 0 ? movieShowtimes : showtimes;

  const cinemaIds = Array.from(new Set(showtimesToUse.map((s) => s.cinemaId)));
  const availableCinemas = cinemas.filter((c) => cinemaIds.includes(c._id));

  const filteredByCinema = selectedCinemaId
    ? showtimesToUse.filter((s) => s.cinemaId === selectedCinemaId)
    : showtimesToUse;

  const availableTimes = Array.from(
    new Set(filteredByCinema.map((s) => s.startAt))
  ).sort();

  return {
    availableCinemas: availableCinemas.length > 0 ? availableCinemas : cinemas,
    availableTimes:
      availableTimes.length > 0
        ? availableTimes
        : ['14:30', '18:00', '20:30', '22:45'],
  };
}

/**
 * Computes Top Movies by Reservation Count for Admin Analytics Dashboard
 */
export function getBestMoviesAnalytics(
  reservations: Reservation[],
  movies: Movie[],
  limit = 5
): { movie: Movie; count: number; revenue: number }[] {
  const counts = new Map<string, { count: number; revenue: number }>();
  for (const r of reservations) {
    const prev = counts.get(r.movieId) || { count: 0, revenue: 0 };
    counts.set(r.movieId, {
      count: prev.count + 1,
      revenue: prev.revenue + r.total,
    });
  }

  return movies
    .map((movie) => ({
      movie,
      count: counts.get(movie._id)?.count || 0,
      revenue: counts.get(movie._id)?.revenue || 0,
    }))
    .sort((a, b) => b.count - a.count || b.revenue - a.revenue)
    .slice(0, limit);
}

/**
 * Generates a deterministic, scannable-style SVG QR Code data URI for a reservation check-in pass
 */
export function generatePassQrSvgDataUri(codeText: string): string {
  const size = 21;
  const cells: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        cells[r0 + r][c0 + c] = isBorder || isInner;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  let hash = 2166136261;
  for (let i = 0; i < codeText.length; i++) {
    hash ^= codeText.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inFinder =
        (r < 8 && c < 8) ||
        (r < 8 && c >= size - 8) ||
        (r >= size - 8 && c < 8);
      if (inFinder) continue;
      hash ^= (r * 31 + c * 17) & 0xff;
      hash = Math.imul(hash, 16777619);
      cells[r][c] = (Math.abs(hash) % 10) < 5;
    }
  }

  let rects = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (cells[r][c]) {
        rects += `<rect x="${c + 2}" y="${r + 2}" width="1" height="1" fill="#09090b"/>`;
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size + 4} ${size + 4}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#ffffff" rx="1.5"/>${rects}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
