import React, { useState } from 'react';
import {
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Film,
  Plus,
  Search,
  Trash2,
  Users,
  Ticket,
  Edit3,
} from 'lucide-react';
import { Cinema, Movie, Reservation, Showtime, User } from '../types';
import {
  formatSeatLabel,
  getBestMoviesAnalytics,
  GENRE_DATA,
  LANGUAGE_DATA,
} from '../utils/bookingEngine';
import {
  createCinemaPhotoSvg,
  createMoviePosterSvg,
} from '../data/seedData';

interface AdminConsoleProps {
  movies: Movie[];
  cinemas: Cinema[];
  showtimes: Showtime[];
  reservations: Reservation[];
  users: User[];
  onAddMovie: (movie: Movie) => void;
  onUpdateMovie: (movie: Movie) => void;
  onDeleteMovie: (movieId: string) => void;
  onAddCinema: (cinema: Cinema) => void;
  onDeleteCinema: (cinemaId: string) => void;
  onAddShowtime: (showtime: Showtime) => void;
  onDeleteShowtime: (showtimeId: string) => void;
  onToggleReservationCheckin: (reservationId: string) => void;
  onDeleteReservation: (reservationId: string) => void;
  onAddUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

type AdminSection =
  | 'dashboard'
  | 'movies'
  | 'cinemas'
  | 'showtimes'
  | 'reservations'
  | 'users';

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  movies,
  cinemas,
  showtimes,
  reservations,
  users,
  onAddMovie,
  onUpdateMovie,
  onDeleteMovie,
  onAddCinema,
  onDeleteCinema,
  onAddShowtime,
  onDeleteShowtime,
  onToggleReservationCheckin,
  onDeleteReservation,
  onAddUser,
  onDeleteUser,
}) => {
  const [section, setSection] = useState<AdminSection>('dashboard');
  const [reservationViewMode, setReservationViewMode] = useState<
    'list' | 'calendar'
  >('list');
  const [searchQuery, setSearchQuery] = useState('');

  // Movie Form State
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [movieTitle, setMovieTitle] = useState('');
  const [movieGenre, setMovieGenre] = useState('science fiction, action');
  const [movieLanguage, setMovieLanguage] = useState('english');
  const [movieDirector, setMovieDirector] = useState('');
  const [movieCast, setMovieCast] = useState('');
  const [movieDuration, setMovieDuration] = useState('135');
  const [movieReleaseDate, setMovieReleaseDate] = useState('2026-03-01');
  const [movieEndDate, setMovieEndDate] = useState('2026-12-31');
  const [movieDescription, setMovieDescription] = useState('');

  // Cinema Form State
  const [cinemaName, setCinemaName] = useState('');
  const [cinemaCity, setCinemaCity] = useState('');
  const [cinemaPrice, setCinemaPrice] = useState('14.0');
  const [cinemaRows, setCinemaRows] = useState('6');
  const [cinemaCols, setCinemaCols] = useState('9');

  // Showtime Form State
  const [showtimeMovieId, setShowtimeMovieId] = useState(
    movies[0]?._id || ''
  );
  const [showtimeCinemaId, setShowtimeCinemaId] = useState(
    cinemas[0]?._id || ''
  );
  const [showtimeStartAt, setShowtimeStartAt] = useState('20:00');
  const [showtimeStartDate, setShowtimeStartDate] = useState('2026-01-01');
  const [showtimeEndDate, setShowtimeEndDate] = useState('2026-12-31');

  // User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<'guest' | 'admin' | 'superadmin'>('guest');

  const bestMovies = getBestMoviesAnalytics(reservations, movies, 5);
  const totalRevenue = reservations.reduce((acc, r) => acc + r.total, 0);

  const handleSaveMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieTitle.trim() || !movieDirector.trim()) return;

    const durationNum = Math.max(45, Number(movieDuration) || 120);
    if (editingMovie) {
      onUpdateMovie({
        ...editingMovie,
        title: movieTitle.trim().toLowerCase(),
        genre: movieGenre.trim().toLowerCase(),
        language: movieLanguage.trim().toLowerCase(),
        director: movieDirector.trim().toLowerCase(),
        cast: movieCast.trim().toLowerCase() || 'ensemble cast',
        duration: durationNum,
        releaseDate: movieReleaseDate,
        endDate: movieEndDate,
        description:
          movieDescription.trim() ||
          'An i movies theatrical presentation.',
      });
      setEditingMovie(null);
    } else {
      const id = `mov-${Date.now().toString().slice(-5)}`;
      const newMovie: Movie = {
        _id: id,
        title: movieTitle.trim().toLowerCase(),
        genre: movieGenre.trim().toLowerCase(),
        language: movieLanguage.trim().toLowerCase(),
        director: movieDirector.trim().toLowerCase(),
        cast: movieCast.trim().toLowerCase() || 'ensemble cast',
        duration: durationNum,
        releaseDate: movieReleaseDate,
        endDate: movieEndDate,
        description:
          movieDescription.trim() ||
          'An i movies theatrical presentation.',
        image: createMoviePosterSvg(
          movieTitle.trim(),
          `${movieGenre.split(',')[0]} · ${durationNum} Min`,
          '#f59e0b',
          '#312e81',
          '#09090b',
          'cosmos'
        ),
        rating: 4.8,
      };
      onAddMovie(newMovie);
    }

    setMovieTitle('');
    setMovieDirector('');
    setMovieCast('');
    setMovieDescription('');
  };

  const handleStartEditMovie = (movie: Movie) => {
    setEditingMovie(movie);
    setMovieTitle(movie.title);
    setMovieGenre(movie.genre);
    setMovieLanguage(movie.language);
    setMovieDirector(movie.director);
    setMovieCast(movie.cast);
    setMovieDuration(String(movie.duration));
    setMovieReleaseDate(movie.releaseDate.slice(0, 10));
    setMovieEndDate(movie.endDate.slice(0, 10));
    setMovieDescription(movie.description);
  };

  const handleCreateCinema = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cinemaName.trim() || !cinemaCity.trim()) return;
    const rows = Math.min(12, Math.max(3, Number(cinemaRows) || 6));
    const cols = Math.min(14, Math.max(4, Number(cinemaCols) || 8));
    const seats = Array.from({ length: rows }, () => Array(cols).fill(0));
    const id = `cin-${Date.now().toString().slice(-5)}`;
    onAddCinema({
      _id: id,
      name: cinemaName.trim(),
      city: cinemaCity.trim().toLowerCase(),
      ticketPrice: Math.max(5, Number(cinemaPrice) || 12),
      seats,
      seatsAvailable: rows * cols,
      image: createCinemaPhotoSvg(
        cinemaName.trim(),
        cinemaCity.trim(),
        '#10b981'
      ),
    });
    setCinemaName('');
    setCinemaCity('');
  };

  const handleCreateShowtime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showtimeMovieId || !showtimeCinemaId || !showtimeStartAt) return;
    onAddShowtime({
      _id: `shw-${Date.now().toString().slice(-5)}`,
      movieId: showtimeMovieId,
      cinemaId: showtimeCinemaId,
      startAt: showtimeStartAt,
      startDate: showtimeStartDate,
      endDate: showtimeEndDate,
    });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUsername.trim() || !newUserEmail.trim())
      return;
    onAddUser({
      _id: `usr-${Date.now().toString().slice(-5)}`,
      name: newUserName.trim(),
      username: newUsername.trim().toLowerCase(),
      email: newUserEmail.trim().toLowerCase(),
      phone: newUserPhone.trim() || '+30 690 000 0000',
      role: newUserRole,
    });
    setNewUserName('');
    setNewUsername('');
    setNewUserEmail('');
    setNewUserPhone('');
  };

  const filteredReservations = reservations.filter(
    (r) =>
      r.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r._id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 space-y-8">
      {/* Admin Sub-Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-zinc-800">
        <div>
          <p className="text-xs font-medium text-amber-400">
            i movies Theater Management System
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            Admin Console &amp; Operations
          </h1>
        </div>

        <div
          role="tablist"
          aria-label="Admin Console Sections"
          className="flex flex-wrap items-center gap-1.5 p-1.5 bg-zinc-900 border border-zinc-800 rounded-xl"
        >
          {(
            [
              { id: 'dashboard', label: 'Analytics', icon: BarChart3 },
              { id: 'movies', label: `Movies (${movies.length})`, icon: Film },
              {
                id: 'cinemas',
                label: `Cinemas (${cinemas.length})`,
                icon: Building2,
              },
              {
                id: 'showtimes',
                label: `Showtimes (${showtimes.length})`,
                icon: Clock,
              },
              {
                id: 'reservations',
                label: `Reservations (${reservations.length})`,
                icon: Ticket,
              },
              { id: 'users', label: `Users (${users.length})`, icon: Users },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = section === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSection(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-amber-500 text-zinc-950'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: ANALYTICS DASHBOARD */}
      {section === 'dashboard' && (
        <div className="space-y-8">
          {/* 4 KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
              <p className="text-xs font-medium text-zinc-400">TOTAL USERS</p>
              <p className="text-3xl font-bold text-white mt-2 font-mono-tabular">
                {users.length}
              </p>
              <p className="text-xs text-emerald-400 mt-2">
                +16% vs last month
              </p>
            </div>
            <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
              <p className="text-xs font-medium text-zinc-400">TOTAL CINEMAS</p>
              <p className="text-3xl font-bold text-white mt-2 font-mono-tabular">
                {cinemas.length}
              </p>
              <p className="text-xs text-zinc-400 mt-2 font-mono-tabular">
                {cinemas.reduce((sum, c) => sum + c.seatsAvailable, 0)} total
                auditorium seats
              </p>
            </div>
            <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
              <p className="text-xs font-medium text-zinc-400">TOTAL MOVIES</p>
              <p className="text-3xl font-bold text-white mt-2 font-mono-tabular">
                {movies.length}
              </p>
              <p className="text-xs text-zinc-400 mt-2">
                Active Now Showing &amp; Coming Soon
              </p>
            </div>
            <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
              <p className="text-xs font-medium text-zinc-400">
                RESERVATIONS &amp; BOX OFFICE
              </p>
              <p className="text-3xl font-bold text-amber-400 mt-2 font-mono-tabular">
                {reservations.length} · ${totalRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-emerald-400 mt-2">
                {reservations.filter((r) => r.checkin).length} checked in via QR
              </p>
            </div>
          </div>

          {/* Best Movies Chart & Users By Device */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 bg-zinc-900/90 border border-zinc-800 rounded-2xl space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white font-display">
                  Top 5 Best Movies by Reservations
                </h2>
                <span className="text-xs text-zinc-400">
                  Live Box Office Ranking
                </span>
              </div>

              <div className="space-y-4">
                {bestMovies.map((item, idx) => {
                  const maxCount = Math.max(1, bestMovies[0]?.count || 1);
                  const widthPct = Math.max(
                    12,
                    Math.round((item.count / maxCount) * 100)
                  );
                  return (
                    <div key={item.movie._id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white capitalize">
                          0{idx + 1}. {item.movie.title}
                        </span>
                        <span className="text-zinc-400 font-mono-tabular">
                          {item.count} bookings · ${item.revenue.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-2xl space-y-5">
              <h2 className="text-lg font-bold text-white font-display">
                Users by Device
              </h2>
              <p className="text-xs text-zinc-400">
                Ticket checkout traffic across client platforms
              </p>

              <div className="space-y-4 pt-2">
                {[
                  { label: 'Desktop Browser', pct: 63, color: 'bg-amber-500' },
                  { label: 'Mobile Web Pass', pct: 22, color: 'bg-sky-400' },
                  { label: 'Tablet Kiosk', pct: 15, color: 'bg-emerald-400' },
                ].map((d) => (
                  <div key={d.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-medium">
                        {d.label}
                      </span>
                      <span className="text-white font-bold font-mono-tabular">
                        {d.pct}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${d.color} rounded-full`}
                        style={{ width: `${d.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: MOVIES CRUD */}
      {section === 'movies' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form
            onSubmit={handleSaveMovie}
            className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-2xl space-y-4 h-fit"
          >
            <h2 className="text-lg font-bold text-white font-display">
              {editingMovie ? `Edit Movie: ${editingMovie.title}` : 'Add New Movie'}
            </h2>

            <div>
              <label
                htmlFor="admin-movie-title"
                className="block text-xs font-medium text-zinc-400 mb-1"
              >
                Movie Title
              </label>
              <input
                id="admin-movie-title"
                type="text"
                required
                placeholder="e.g. Interstellar Odyssey"
                value={movieTitle}
                onChange={(e) => setMovieTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="admin-movie-genre"
                  className="block text-xs font-medium text-zinc-400 mb-1"
                >
                  Genre
                </label>
                <select
                  id="admin-movie-genre"
                  value={movieGenre}
                  onChange={(e) => setMovieGenre(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                >
                  {GENRE_DATA.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="admin-movie-lang"
                  className="block text-xs font-medium text-zinc-400 mb-1"
                >
                  Language
                </label>
                <select
                  id="admin-movie-lang"
                  value={movieLanguage}
                  onChange={(e) => setMovieLanguage(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                >
                  {LANGUAGE_DATA.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="admin-movie-director"
                  className="block text-xs font-medium text-zinc-400 mb-1"
                >
                  Director
                </label>
                <input
                  id="admin-movie-director"
                  type="text"
                  required
                  placeholder="Christopher Nolan"
                  value={movieDirector}
                  onChange={(e) => setMovieDirector(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="admin-movie-duration"
                  className="block text-xs font-medium text-zinc-400 mb-1"
                >
                  Duration (min)
                </label>
                <input
                  id="admin-movie-duration"
                  type="number"
                  required
                  value={movieDuration}
                  onChange={(e) => setMovieDuration(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white font-mono-tabular"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-movie-cast"
                className="block text-xs font-medium text-zinc-400 mb-1"
              >
                Cast
              </label>
              <input
                id="admin-movie-cast"
                type="text"
                placeholder="Matthew McConaughey, Anne Hathaway"
                value={movieCast}
                onChange={(e) => setMovieCast(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="admin-movie-release"
                  className="block text-xs font-medium text-zinc-400 mb-1"
                >
                  Release Date
                </label>
                <input
                  id="admin-movie-release"
                  type="date"
                  value={movieReleaseDate}
                  onChange={(e) => setMovieReleaseDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="admin-movie-end"
                  className="block text-xs font-medium text-zinc-400 mb-1"
                >
                  End Date
                </label>
                <input
                  id="admin-movie-end"
                  type="date"
                  value={movieEndDate}
                  onChange={(e) => setMovieEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-movie-desc"
                className="block text-xs font-medium text-zinc-400 mb-1"
              >
                Synopsis
              </label>
              <textarea
                id="admin-movie-desc"
                rows={3}
                placeholder="Movie synopsis..."
                value={movieDescription}
                onChange={(e) => setMovieDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 text-xs font-semibold bg-amber-500 text-zinc-950 rounded-lg hover:bg-amber-400 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {editingMovie ? 'Update Movie' : 'Save Movie'}
              </button>
              {editingMovie && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingMovie(null);
                    setMovieTitle('');
                    setMovieDirector('');
                  }}
                  className="px-3 py-2.5 text-xs font-medium bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {movies.map((m) => (
              <div
                key={m._id}
                className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl flex gap-4 items-start"
              >
                <img
                  src={m.image}
                  alt={m.title}
                  referrerPolicy="no-referrer"
                  className="w-20 h-28 object-cover rounded-lg shrink-0 bg-zinc-950"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-base font-bold text-white capitalize truncate font-display">
                    {m.title}
                  </h3>
                  <p className="text-xs text-zinc-400 capitalize">
                    {m.genre} · {m.duration} min · {m.language}
                  </p>
                  <p className="text-xs text-zinc-500 capitalize">
                    Director: {m.director}
                  </p>
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartEditMovie(m)}
                      className="px-2.5 py-1 text-xs font-medium bg-zinc-800 text-zinc-200 rounded hover:bg-zinc-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteMovie(m._id)}
                      aria-label={`Delete movie ${m.title}`}
                      className="px-2.5 py-1 text-xs font-medium bg-rose-950/60 text-rose-300 rounded hover:bg-rose-900/70 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: CINEMAS CRUD */}
      {section === 'cinemas' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form
            onSubmit={handleCreateCinema}
            className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-2xl space-y-4 h-fit"
          >
            <h2 className="text-lg font-bold text-white font-display">
              Add New Cinema Auditorium
            </h2>
            <div>
              <label
                htmlFor="admin-cinema-name"
                className="block text-xs font-medium text-zinc-400 mb-1"
              >
                Cinema Name
              </label>
              <input
                id="admin-cinema-name"
                type="text"
                required
                placeholder="i movies Acropolis Dolby"
                value={cinemaName}
                onChange={(e) => setCinemaName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="admin-cinema-city"
                  className="block text-xs font-medium text-zinc-400 mb-1"
                >
                  City
                </label>
                <input
                  id="admin-cinema-city"
                  type="text"
                  required
                  placeholder="Athens"
                  value={cinemaCity}
                  onChange={(e) => setCinemaCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="admin-cinema-price"
                  className="block text-xs font-medium text-zinc-400 mb-1"
                >
                  Ticket Price ($)
                </label>
                <input
                  id="admin-cinema-price"
                  type="number"
                  step="0.5"
                  required
                  value={cinemaPrice}
                  onChange={(e) => setCinemaPrice(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white font-mono-tabular"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="admin-cinema-rows"
                  className="block text-xs font-medium text-zinc-400 mb-1"
                >
                  Seat Rows
                </label>
                <input
                  id="admin-cinema-rows"
                  type="number"
                  min={3}
                  max={12}
                  value={cinemaRows}
                  onChange={(e) => setCinemaRows(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white font-mono-tabular"
                />
              </div>
              <div>
                <label
                  htmlFor="admin-cinema-cols"
                  className="block text-xs font-medium text-zinc-400 mb-1"
                >
                  Seats per Row
                </label>
                <input
                  id="admin-cinema-cols"
                  type="number"
                  min={4}
                  max={14}
                  value={cinemaCols}
                  onChange={(e) => setCinemaCols(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white font-mono-tabular"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2.5 text-xs font-semibold bg-amber-500 text-zinc-950 rounded-lg hover:bg-amber-400 transition-colors cursor-pointer"
            >
              Create Cinema
            </button>
          </form>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cinemas.map((c) => (
              <div
                key={c._id}
                className="p-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <img
                    src={c.image}
                    alt={c.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-32 object-cover rounded-xl bg-zinc-950"
                  />
                  <h3 className="text-lg font-bold text-white font-display pt-1">
                    {c.name}
                  </h3>
                  <p className="text-xs text-zinc-400 capitalize font-mono-tabular">
                    {c.city} · ${c.ticketPrice.toFixed(2)} / ticket ·{' '}
                    {c.seatsAvailable} seats ({c.seats.length}x
                    {c.seats[0]?.length || 0})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteCinema(c._id)}
                  aria-label={`Delete cinema ${c.name}`}
                  className="self-start px-3 py-1.5 text-xs font-medium bg-rose-950/60 text-rose-300 rounded-lg hover:bg-rose-900/70 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove Cinema
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: SHOWTIMES CRUD */}
      {section === 'showtimes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form
            onSubmit={handleCreateShowtime}
            className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-2xl space-y-4 h-fit"
          >
            <h2 className="text-lg font-bold text-white font-display">
              Add Showtime Schedule
            </h2>
            <div>
              <label
                htmlFor="admin-showtime-movie"
                className="block text-xs font-medium text-zinc-400 mb-1"
              >
                Movie
              </label>
              <select
                id="admin-showtime-movie"
                value={showtimeMovieId}
                onChange={(e) => setShowtimeMovieId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white capitalize"
              >
                {movies.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="admin-showtime-cinema"
                className="block text-xs font-medium text-zinc-400 mb-1"
              >
                Cinema
              </label>
              <select
                id="admin-showtime-cinema"
                value={showtimeCinemaId}
                onChange={(e) => setShowtimeCinemaId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white"
              >
                {cinemas.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.city.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="admin-showtime-time"
                className="block text-xs font-medium text-zinc-400 mb-1"
              >
                Screening Time (24h)
              </label>
              <input
                id="admin-showtime-time"
                type="text"
                required
                placeholder="21:30"
                value={showtimeStartAt}
                onChange={(e) => setShowtimeStartAt(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white font-mono-tabular"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="admin-showtime-start"
                  className="block text-xs font-medium text-zinc-400 mb-1"
                >
                  Start Date
                </label>
                <input
                  id="admin-showtime-start"
                  type="date"
                  value={showtimeStartDate}
                  onChange={(e) => setShowtimeStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="admin-showtime-end"
                  className="block text-xs font-medium text-zinc-400 mb-1"
                >
                  End Date
                </label>
                <input
                  id="admin-showtime-end"
                  type="date"
                  value={showtimeEndDate}
                  onChange={(e) => setShowtimeEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2.5 text-xs font-semibold bg-amber-500 text-zinc-950 rounded-lg hover:bg-amber-400 transition-colors cursor-pointer"
            >
              Publish Showtime
            </button>
          </form>

          <div className="lg:col-span-2 space-y-3">
            {showtimes.map((s) => {
              const mov = movies.find((m) => m._id === s.movieId);
              const cin = cinemas.find((c) => c._id === s.cinemaId);
              return (
                <div
                  key={s._id}
                  className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="text-sm font-bold text-white capitalize font-display">
                      {mov?.title || 'Movie'} —{' '}
                      <span className="text-amber-400 font-mono-tabular">
                        {s.startAt}
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono-tabular">
                      {cin?.name || 'Cinema'} · {s.startDate.slice(0, 10)} to{' '}
                      {s.endDate.slice(0, 10)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteShowtime(s._id)}
                    aria-label={`Delete showtime ${s._id}`}
                    className="px-3 py-1.5 text-xs font-medium bg-rose-950/60 text-rose-300 rounded-lg hover:bg-rose-900/70 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 5: RESERVATIONS (LIST TABLE + CALENDAR VIEW) */}
      {section === 'reservations' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by phone, username, or pass ID..."
                aria-label="Filter reservations by phone or username"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
              <button
                type="button"
                onClick={() => setReservationViewMode('list')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  reservationViewMode === 'list'
                    ? 'bg-amber-500 text-zinc-950'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Table List View
              </button>
              <button
                type="button"
                onClick={() => setReservationViewMode('calendar')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  reservationViewMode === 'calendar'
                    ? 'bg-amber-500 text-zinc-950'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Calendar Schedule View
              </button>
            </div>
          </div>

          {reservationViewMode === 'list' ? (
            <div className="overflow-x-auto bg-zinc-900/90 border border-zinc-800 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase">
                    <th className="py-3.5 px-4">Pass ID</th>
                    <th className="py-3.5 px-4">Guest &amp; Phone</th>
                    <th className="py-3.5 px-4">Movie &amp; Cinema</th>
                    <th className="py-3.5 px-4">Date &amp; Time</th>
                    <th className="py-3.5 px-4">Seats</th>
                    <th className="py-3.5 px-4">Total</th>
                    <th className="py-3.5 px-4">Check-In Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {filteredReservations.map((r) => {
                    const mov = movies.find((m) => m._id === r.movieId);
                    const cin = cinemas.find((c) => c._id === r.cinemaId);
                    return (
                      <tr key={r._id} className="hover:bg-zinc-800/40">
                        <td className="py-3.5 px-4 font-mono-tabular text-amber-400 font-semibold">
                          {r._id.toUpperCase()}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">
                            @{r.username}
                          </div>
                          <div className="text-zinc-400 font-mono-tabular">
                            {r.phone}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white capitalize">
                            {mov?.title || r.movieId}
                          </div>
                          <div className="text-zinc-400">
                            {cin?.name || r.cinemaId}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono-tabular text-zinc-300">
                          {r.date.slice(0, 10)} · {r.startAt}
                        </td>
                        <td className="py-3.5 px-4 font-mono-tabular text-zinc-300">
                          {r.seats.map((s) => formatSeatLabel(s)).join(', ')}
                        </td>
                        <td className="py-3.5 px-4 font-mono-tabular font-bold text-white">
                          ${r.total.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => onToggleReservationCheckin(r._id)}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1 cursor-pointer ${
                              r.checkin
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {r.checkin ? 'Checked In' : 'Mark Checked In'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => onDeleteReservation(r._id)}
                            aria-label={`Delete reservation ${r._id}`}
                            className="p-1.5 text-rose-400 hover:bg-rose-950/60 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Calendar Schedule View */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {filteredReservations.map((r) => {
                const mov = movies.find((m) => m._id === r.movieId);
                const cin = cinemas.find((c) => c._id === r.cinemaId);
                return (
                  <div
                    key={r._id}
                    className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-mono-tabular text-amber-400">
                      <span>
                        {r.date.slice(0, 10)} · {r.startAt}
                      </span>
                      <span>#{r._id.toUpperCase()}</span>
                    </div>
                    <h3 className="text-base font-bold text-white capitalize font-display">
                      {mov?.title || 'Screening'}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {cin?.name} · Guest: @{r.username} ({r.phone})
                    </p>
                    <p className="text-xs text-zinc-300 font-mono-tabular">
                      {r.seats.length} Seats · ${r.total.toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 6: USERS CRUD */}
      {section === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form
            onSubmit={handleCreateUser}
            className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-2xl space-y-4 h-fit"
          >
            <h2 className="text-lg font-bold text-white font-display">
              Add User Account
            </h2>
            <div>
              <label
                htmlFor="admin-user-name"
                className="block text-xs font-medium text-zinc-400 mb-1"
              >
                Full Name
              </label>
              <input
                id="admin-user-name"
                type="text"
                required
                placeholder="Maria Papadopoulou"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label
                htmlFor="admin-user-username"
                className="block text-xs font-medium text-zinc-400 mb-1"
              >
                Username
              </label>
              <input
                id="admin-user-username"
                type="text"
                required
                placeholder="maria_p"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label
                htmlFor="admin-user-email"
                className="block text-xs font-medium text-zinc-400 mb-1"
              >
                Email
              </label>
              <input
                id="admin-user-email"
                type="email"
                required
                placeholder="maria@imovies.cinema"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="admin-user-phone"
                  className="block text-xs font-medium text-zinc-400 mb-1"
                >
                  Phone
                </label>
                <input
                  id="admin-user-phone"
                  type="text"
                  placeholder="+30 694 111 2233"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="admin-user-role"
                  className="block text-xs font-medium text-zinc-400 mb-1"
                >
                  Role
                </label>
                <select
                  id="admin-user-role"
                  value={newUserRole}
                  onChange={(e) =>
                    setNewUserRole(
                      e.target.value as 'guest' | 'admin' | 'superadmin'
                    )
                  }
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white"
                >
                  <option value="guest">guest</option>
                  <option value="admin">admin</option>
                  <option value="superadmin">superadmin</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2.5 text-xs font-semibold bg-amber-500 text-zinc-950 rounded-lg hover:bg-amber-400 transition-colors cursor-pointer"
            >
              Create User
            </button>
          </form>

          <div className="lg:col-span-2 space-y-3">
            {users.map((u) => (
              <div
                key={u._id}
                className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between gap-4"
              >
                <div>
                  <h3 className="text-sm font-bold text-white font-display">
                    {u.name}{' '}
                    <span className="text-xs font-normal text-zinc-400">
                      (@{u.username} · {u.role})
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono-tabular">
                    {u.email} · {u.phone}
                  </p>
                </div>
                {u.role !== 'superadmin' && (
                  <button
                    type="button"
                    onClick={() => onDeleteUser(u._id)}
                    aria-label={`Delete user ${u.username}`}
                    className="px-3 py-1.5 text-xs font-medium bg-rose-950/60 text-rose-300 rounded-lg hover:bg-rose-900/70 cursor-pointer"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
