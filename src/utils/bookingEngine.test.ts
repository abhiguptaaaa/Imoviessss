import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSeatMatrix,
  calculateCheckoutTotal,
  cinemaUserModeling,
  convertRowToAlphabet,
  formatSeatLabel,
  getBestMoviesAnalytics,
  moviesUserModeling,
  reservationSeatsUserModeling,
} from './bookingEngine';
import { Cinema, Movie, Reservation } from '../types';

const sampleCinema: Cinema = {
  _id: 'cin-1',
  name: 'i movies Grand IMAX',
  city: 'athens',
  ticketPrice: 12.5,
  seatsAvailable: 24,
  image: '',
  seats: [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
};

const sampleMovies: Movie[] = [
  {
    _id: 'mov-1',
    title: 'dune horizon',
    image: '',
    language: 'english',
    genre: 'science fiction, adventure',
    director: 'denis villeneuve',
    cast: 'timothee chalamet, zendaya',
    description: 'Epic desert adventure',
    duration: 155,
    releaseDate: '2026-01-01',
    endDate: '2026-12-31',
  },
  {
    _id: 'mov-2',
    title: 'arrival protocol',
    image: '',
    language: 'english',
    genre: 'science fiction, mystery',
    director: 'denis villeneuve',
    cast: 'amy adams, jeremy renner',
    description: 'First contact mystery',
    duration: 116,
    releaseDate: '2026-02-01',
    endDate: '2026-12-31',
  },
  {
    _id: 'mov-3',
    title: 'parisian comedy',
    image: '',
    language: 'french',
    genre: 'comedy, romance',
    director: 'jean luc',
    cast: 'camille cottin',
    description: 'Lighthearted comedy',
    duration: 98,
    releaseDate: '2026-03-01',
    endDate: '2026-12-31',
  },
];

const sampleReservations: Reservation[] = [
  {
    _id: 'res-1',
    date: '2026-10-28',
    startAt: '20:30',
    seats: [
      [1, 1],
      [1, 2],
    ],
    ticketPrice: 12.5,
    total: 25,
    movieId: 'mov-1',
    cinemaId: 'cin-1',
    username: 'alex_guest',
    phone: '+15550192831',
    checkin: false,
  },
];

test('convertRowToAlphabet and formatSeatLabel format theater coordinates cleanly', () => {
  assert.equal(convertRowToAlphabet(0), 'A');
  assert.equal(convertRowToAlphabet(2), 'C');
  assert.equal(formatSeatLabel([0, 3]), 'Row A · Seat 4');
});

test('calculateCheckoutTotal computes ticket price accurately', () => {
  assert.equal(calculateCheckoutTotal(3, 12.5), 37.5);
  assert.equal(calculateCheckoutTotal(0, 12.5), 0);
});

test('moviesUserModeling prioritizes unwatched movies sharing genre/director', () => {
  const recommended = moviesUserModeling(
    sampleMovies,
    sampleReservations,
    'alex_guest'
  );
  assert.equal(recommended.length >= 1, true);
  assert.equal(recommended[0]._id, 'mov-2');
});

test('reservationSeatsUserModeling infers average ticket count and center zone preference', () => {
  const model = reservationSeatsUserModeling(
    [sampleCinema],
    sampleReservations,
    'alex_guest'
  );
  assert.equal(model.numberOfTickets, 2);
  assert.equal(model.positions.center, 1);
});

test('buildSeatMatrix marks reserved (1), selected (2), and recommended (3) seats accurately', () => {
  const suggestion = {
    numberOfTickets: 2,
    positions: { front: 1, center: 0, back: 0 },
  };
  const matrixWithRecs = buildSeatMatrix(
    sampleCinema,
    sampleReservations,
    '2026-10-28',
    '20:30',
    [],
    suggestion
  );
  // Row 1 seats 1 and 2 are reserved (1)
  assert.equal(matrixWithRecs[1][1], 1);
  assert.equal(matrixWithRecs[1][2], 1);
  // Row 0 has 2 recommended seats (3)
  const recCount = matrixWithRecs[0].filter((s) => s === 3).length;
  assert.equal(recCount, 2);

  // When user selects [2, 0], selected seats become 2
  const matrixSelected = buildSeatMatrix(
    sampleCinema,
    sampleReservations,
    '2026-10-28',
    '20:30',
    [[2, 0]],
    suggestion
  );
  assert.equal(matrixSelected[2][0], 2);
});

test('cinemaUserModeling and getBestMoviesAnalytics rank items by reservation volume', () => {
  const cinema2: Cinema = { ...sampleCinema, _id: 'cin-2', name: 'Other Cinema' };
  const sortedCinemas = cinemaUserModeling(
    [cinema2, sampleCinema],
    sampleReservations,
    'alex_guest'
  );
  assert.equal(sortedCinemas[0]._id, 'cin-1');

  const best = getBestMoviesAnalytics(sampleReservations, sampleMovies, 2);
  assert.equal(best[0].movie._id, 'mov-1');
  assert.equal(best[0].count, 1);
});
