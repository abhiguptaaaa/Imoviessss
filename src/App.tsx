/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Clock,
  Film,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
} from 'lucide-react';
import {
  INITIAL_CINEMAS,
  INITIAL_MOVIES,
  INITIAL_RESERVATIONS,
  INITIAL_SHOWTIMES,
  INITIAL_USERS,
} from './data/seedData';
import { Cinema, Movie, Reservation, Showtime, User } from './types';
import {
  categorizeMovies,
  cinemaUserModeling,
  GENRE_DATA,
  LANGUAGE_DATA,
  moviesUserModeling,
} from './utils/bookingEngine';
import { ActiveNavTab, Navbar } from './components/Navbar';
import { BookingModal } from './components/BookingModal';
import { MyDashboard } from './components/MyDashboard';
import { AdminConsole } from './components/AdminConsole';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [movies, setMovies] = useState<Movie[]>(INITIAL_MOVIES);
  const [cinemas, setCinemas] = useState<Cinema[]>(INITIAL_CINEMAS);
  const [showtimes, setShowtimes] = useState<Showtime[]>(INITIAL_SHOWTIMES);
  const [reservations, setReservations] = useState<Reservation[]>(
    INITIAL_RESERVATIONS
  );
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]);

  const [activeTab, setActiveTab] = useState<ActiveNavTab>('home');
  const [featuredMovieId, setFeaturedMovieId] = useState<string>(
    INITIAL_MOVIES[0]._id
  );
  const [bookingMovie, setBookingMovie] = useState<Movie | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Filters for Now Showing / Coming Soon / Home catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  const { nowShowing, comingSoon } = useMemo(
    () => categorizeMovies(movies, new Date('2026-10-28T00:00:00Z')),
    [movies]
  );

  const suggestedMovies = useMemo(
    () => moviesUserModeling(movies, reservations, currentUser?.username),
    [movies, reservations, currentUser]
  );

  const modeledCinemas = useMemo(
    () => cinemaUserModeling(cinemas, reservations, currentUser?.username),
    [cinemas, reservations, currentUser]
  );

  const featuredMovie = useMemo(
    () => movies.find((m) => m._id === featuredMovieId) || movies[0],
    [movies, featuredMovieId]
  );

  const filterMovieList = (list: Movie[]) => {
    return list.filter((m) => {
      const matchesSearch =
        !searchQuery.trim() ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.cast.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre =
        selectedGenre === 'all' ||
        m.genre.toLowerCase().includes(selectedGenre.toLowerCase());
      const matchesLang =
        selectedLanguage === 'all' ||
        m.language.toLowerCase() === selectedLanguage.toLowerCase();
      return matchesSearch && matchesGenre && matchesLang;
    });
  };

  const handleConfirmReservation = (newReservation: Reservation) => {
    setReservations((prev) => [newReservation, ...prev]);
  };

  const handleCheckInReservation = (reservationId: string) => {
    setReservations((prev) =>
      prev.map((r) =>
        r._id.toLowerCase() === reservationId.toLowerCase()
          ? { ...r, checkin: true }
          : r
      )
    );
  };

  const handleToggleReservationCheckin = (reservationId: string) => {
    setReservations((prev) =>
      prev.map((r) =>
        r._id === reservationId ? { ...r, checkin: !r.checkin } : r
      )
    );
  };

  const handleDeleteReservation = (reservationId: string) => {
    setReservations((prev) => prev.filter((r) => r._id !== reservationId));
  };

  const renderMovieCard = (movie: Movie) => (
    <article
      key={movie._id}
      className="group bg-zinc-900/70 border border-zinc-800/90 rounded-2xl overflow-hidden flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5 hover:border-zinc-700"
    >
      <div>
        <div className="relative aspect-[3/4] w-full bg-zinc-950 overflow-hidden">
          <img
            src={movie.image}
            alt={movie.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-zinc-300 font-mono-tabular">
            <span>{movie.duration} min</span>
            <span className="capitalize">{movie.language}</span>
          </div>
        </div>

        <div className="p-5 space-y-2">
          {/* Unboxed clean metadata */}
          <div className="text-xs text-amber-400/90 font-medium capitalize truncate">
            {movie.genre.split(',').join(' · ')}
          </div>

          <h3 className="text-lg font-bold text-white capitalize font-display truncate">
            {movie.title}
          </h3>

          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {movie.description}
          </p>

          <p className="text-xs text-zinc-500 capitalize pt-1 truncate">
            Directed by {movie.director}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5 pt-2 flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setBookingMovie(movie)}
          className="flex-1 py-2.5 px-4 text-xs font-semibold bg-amber-500 text-zinc-950 rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Ticket className="w-3.5 h-3.5" />
          Buy Tickets
        </button>
        <button
          type="button"
          onClick={() => {
            setFeaturedMovieId(movie._id);
            setActiveTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="py-2.5 px-3 text-xs font-medium text-zinc-300 bg-zinc-800/90 hover:bg-zinc-700 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Details
        </button>
      </div>
    </article>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Strict 3-Zone Top Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Workspace Utility Strip below the header */}
      <div className="bg-zinc-900/60 border-b border-zinc-800/70 px-6 lg:px-12 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 text-zinc-400">
          <span>
            Welcome to <strong className="text-white">i movies</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {currentUser
              ? `Signed in as ${currentUser.name} (@${currentUser.username})`
              : 'Browsing as Guest'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setActiveTab(activeTab === 'admin' ? 'home' : 'admin')
            }
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-amber-500 text-zinc-950'
                : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            {activeTab === 'admin' ? 'Exit Admin Console' : 'Admin Console'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div className="space-y-16 pb-16">
            {/* Hero Spotlight Section (2-Column Balanced Split + Full-Width KPI Strip below) */}
            {featuredMovie && (
              <section className="relative border-b border-zinc-900 bg-gradient-to-b from-zinc-900/50 to-zinc-950 pt-8 pb-12 px-6 lg:px-12">
                <div className="max-w-7xl mx-auto space-y-10">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    {/* Left Column: Movie Details & Primary Actions */}
                    <div className="lg:col-span-7 flex flex-col justify-between space-y-6 py-2">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-amber-400 uppercase tracking-wider">
                          <span>i movies Premiere Spotlight</span>
                          <span aria-hidden="true">·</span>
                          <span>Dolby Atmos &amp; IMAX Laser</span>
                        </div>

                        <h1
                          className="text-3xl sm:text-5xl font-bold text-white capitalize font-display tracking-tight leading-tight"
                          style={{ textWrap: 'balance' }}
                        >
                          {featuredMovie.title}
                        </h1>

                        {/* Unboxed Metadata */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-300 capitalize">
                          <span>
                            {featuredMovie.genre.split(',').join(' / ')}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-tabular">
                            {featuredMovie.duration} min
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>Language: {featuredMovie.language}</span>
                          <span aria-hidden="true">·</span>
                          <span>Director: {featuredMovie.director}</span>
                        </div>

                        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
                          {featuredMovie.description}
                        </p>

                        <p className="text-xs text-zinc-400 capitalize">
                          Starring:{' '}
                          <span className="text-zinc-200">
                            {featuredMovie.cast}
                          </span>
                        </p>
                      </div>

                      <div className="pt-4 flex flex-wrap items-center gap-4">
                        <button
                          type="button"
                          onClick={() => setBookingMovie(featuredMovie)}
                          className="px-6 py-3.5 text-sm font-semibold bg-amber-500 text-zinc-950 rounded-xl hover:bg-amber-400 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Ticket className="w-4 h-4" />
                          Book Tickets Now
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('cinemas')}
                          className="px-5 py-3.5 text-sm font-semibold bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-xl hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          Explore Cinemas ({cinemas.length})
                        </button>
                      </div>
                    </div>

                    {/* Right Column: Featured Poster Card */}
                    <div className="lg:col-span-5 flex items-stretch">
                      <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col sm:flex-row lg:flex-col">
                        <img
                          src={featuredMovie.image}
                          alt={featuredMovie.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-72 sm:h-80 lg:h-96 object-cover bg-zinc-950"
                        />
                        <div className="p-4 bg-zinc-950/90 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs text-zinc-400">
                              Next Screening Today
                            </p>
                            <p className="text-sm font-semibold text-white font-mono-tabular">
                              17:30 · 20:30 · 21:15
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setBookingMovie(featuredMovie)}
                            className="px-4 py-2 text-xs font-semibold bg-zinc-800 text-amber-400 hover:bg-zinc-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            Select Seats
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Full-Width 4-Column Quick Booking & Platform Metrics Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-zinc-800/80">
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800/80 rounded-xl">
                      <p className="text-xs text-zinc-400">NOW SHOWING</p>
                      <p className="text-xl font-bold text-white mt-1 font-mono-tabular">
                        {nowShowing.length} Movies
                      </p>
                    </div>
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800/80 rounded-xl">
                      <p className="text-xs text-zinc-400">COMING SOON</p>
                      <p className="text-xl font-bold text-white mt-1 font-mono-tabular">
                        {comingSoon.length} Premieres
                      </p>
                    </div>
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800/80 rounded-xl">
                      <p className="text-xs text-zinc-400">LUXURY AUDITORIUMS</p>
                      <p className="text-xl font-bold text-white mt-1 font-mono-tabular">
                        {cinemas.length} Cinemas
                      </p>
                    </div>
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800/80 rounded-xl">
                      <p className="text-xs text-zinc-400">INSTANT QR PASS</p>
                      <p className="text-xl font-bold text-amber-400 mt-1">
                        Zero Booking Fees
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Section 2: Suggested For You (User Modeled Recommendations) */}
            <section className="max-w-7xl mx-auto px-6 lg:px-12 space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-amber-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Personalized User Modeling</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white font-display mt-1">
                    Suggested For You
                  </h2>
                </div>
                <p className="text-xs text-zinc-400">
                  Matched to your preferred genres, directors, and cast
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {suggestedMovies.slice(0, 4).map((m) => renderMovieCard(m))}
              </div>
            </section>

            {/* Section 3: Now Showing & Coming Soon Catalog */}
            <section className="max-w-7xl mx-auto px-6 lg:px-12 space-y-8">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                <div>
                  <h2 className="text-2xl font-bold text-white font-display">
                    Now Showing at i movies
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Select any movie below to pick your auditorium seats and
                    generate your QR pass
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('nowShowing')}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 cursor-pointer"
                >
                  Filter &amp; Search All Movies →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {nowShowing.map((m) => renderMovieCard(m))}
              </div>
            </section>

            {/* Section 4: Coming Soon */}
            {comingSoon.length > 0 && (
              <section className="max-w-7xl mx-auto px-6 lg:px-12 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <div>
                    <h2 className="text-2xl font-bold text-white font-display">
                      Coming Soon
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Advance seat reservations open now for upcoming releases
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {comingSoon.map((m) => renderMovieCard(m))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* NOW SHOWING / COMING SOON CATEGORY PAGES */}
        {(activeTab === 'nowShowing' || activeTab === 'comingSoon') && (
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-zinc-800">
              <div>
                <p className="text-xs font-medium text-amber-400 uppercase tracking-wider">
                  i movies Official Catalog
                </p>
                <h1 className="text-3xl font-bold text-white font-display mt-1">
                  {activeTab === 'nowShowing'
                    ? 'Now Showing in Cinemas'
                    : 'Coming Soon to i movies'}
                </h1>
              </div>

              {/* Search, Genre, and Language Filter Bar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search title, director, cast..."
                    aria-label="Search movies"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <select
                  aria-label="Filter by genre"
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-white capitalize"
                >
                  <option value="all">All Genres</option>
                  {GENRE_DATA.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Filter by language"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-white capitalize"
                >
                  <option value="all">All Languages</option>
                  {LANGUAGE_DATA.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(() => {
              const sourceList =
                activeTab === 'nowShowing' ? nowShowing : comingSoon;
              const filtered = filterMovieList(sourceList);
              if (filtered.length === 0) {
                return (
                  <div className="p-12 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-center space-y-3">
                    <Film className="w-8 h-8 text-zinc-500 mx-auto" />
                    <p className="text-sm font-semibold text-white">
                      No movies match your current filters
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedGenre('all');
                        setSelectedLanguage('all');
                      }}
                      className="px-4 py-2 text-xs font-semibold bg-amber-500 text-zinc-950 rounded-lg cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((m) => renderMovieCard(m))}
                </div>
              );
            })()}
          </div>
        )}

        {/* CINEMAS DIRECTORY PAGE */}
        {activeTab === 'cinemas' && (
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-8">
            <div className="pb-6 border-b border-zinc-800">
              <p className="text-xs font-medium text-amber-400">
                Ranked by Your Booking Preferences
              </p>
              <h1 className="text-3xl font-bold text-white font-display mt-1">
                Our i movies Cinemas
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {modeledCinemas.map((cinema) => {
                const cinemaShowtimes = showtimes.filter(
                  (s) => s.cinemaId === cinema._id
                );
                return (
                  <article
                    key={cinema._id}
                    className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <img
                        src={cinema.image}
                        alt={cinema.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-52 object-cover bg-zinc-950"
                      />
                      <div className="p-6 space-y-3">
                        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono-tabular">
                          <span className="inline-flex items-center gap-1 capitalize text-amber-400 font-sans font-semibold">
                            <MapPin className="w-3.5 h-3.5" />
                            {cinema.city}
                          </span>
                          <span>
                            Capacity: {cinema.seatsAvailable} Recliner Seats
                          </span>
                        </div>

                        <h2 className="text-xl font-bold text-white font-display">
                          {cinema.name}
                        </h2>

                        <p className="text-sm text-zinc-300 font-mono-tabular">
                          Standard Admission:{' '}
                          <strong className="text-white">
                            ${cinema.ticketPrice.toFixed(2)}
                          </strong>{' '}
                          per seat
                        </p>

                        <div className="pt-2 space-y-1.5">
                          <p className="text-xs font-medium text-zinc-400">
                            Scheduled Screenings:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {cinemaShowtimes.map((st) => {
                              const mov = movies.find(
                                (m) => m._id === st.movieId
                              );
                              if (!mov) return null;
                              return (
                                <button
                                  key={st._id}
                                  type="button"
                                  onClick={() => setBookingMovie(mov)}
                                  className="px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 hover:border-amber-500 rounded-lg text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Clock className="w-3 h-3 text-amber-400" />
                                  <span className="capitalize">
                                    {mov.title}
                                  </span>
                                  <span className="text-amber-400 font-mono-tabular">
                                    {st.startAt}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* MY BOOKINGS & ACCOUNT DASHBOARD */}
        {activeTab === 'myDashboard' && (
          <MyDashboard
            currentUser={currentUser}
            reservations={reservations}
            movies={movies}
            cinemas={cinemas}
            onCheckIn={handleCheckInReservation}
            onCancelReservation={handleDeleteReservation}
            onUpdateUser={(updated) => {
              setCurrentUser(updated);
              setUsers((prev) =>
                prev.map((u) => (u._id === updated._id ? updated : u))
              );
            }}
            onOpenAdminConsole={() => setActiveTab('admin')}
          />
        )}

        {/* ADMIN CONSOLE */}
        {activeTab === 'admin' && (
          <AdminConsole
            movies={movies}
            cinemas={cinemas}
            showtimes={showtimes}
            reservations={reservations}
            users={users}
            onAddMovie={(m) => setMovies((prev) => [m, ...prev])}
            onUpdateMovie={(updated) =>
              setMovies((prev) =>
                prev.map((m) => (m._id === updated._id ? updated : m))
              )
            }
            onDeleteMovie={(id) =>
              setMovies((prev) => prev.filter((m) => m._id !== id))
            }
            onAddCinema={(c) => setCinemas((prev) => [c, ...prev])}
            onDeleteCinema={(id) =>
              setCinemas((prev) => prev.filter((c) => c._id !== id))
            }
            onAddShowtime={(s) => setShowtimes((prev) => [s, ...prev])}
            onDeleteShowtime={(id) =>
              setShowtimes((prev) => prev.filter((s) => s._id !== id))
            }
            onToggleReservationCheckin={handleToggleReservationCheckin}
            onDeleteReservation={handleDeleteReservation}
            onAddUser={(u) => setUsers((prev) => [...prev, u])}
            onDeleteUser={(id) =>
              setUsers((prev) => prev.filter((u) => u._id !== id))
            }
          />
        )}
      </main>

      {/* Clean Quiet Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 px-6 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="font-bold text-zinc-300 font-display text-sm">
              i movies
            </span>
            <span>·</span>
            <span>Online Movie Ticket Booking &amp; Cinema Management</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="hover:text-zinc-300 cursor-pointer"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('nowShowing')}
              className="hover:text-zinc-300 cursor-pointer"
            >
              Now Showing
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cinemas')}
              className="hover:text-zinc-300 cursor-pointer"
            >
              Cinemas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className="hover:text-zinc-300 cursor-pointer"
            >
              Theater Admin
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive Seat Booking Modal */}
      {bookingMovie && (
        <BookingModal
          movie={bookingMovie}
          cinemas={modeledCinemas}
          showtimes={showtimes}
          reservations={reservations}
          currentUser={currentUser}
          onClose={() => setBookingMovie(null)}
          onConfirmReservation={handleConfirmReservation}
          onCheckInReservation={handleCheckInReservation}
          onRequireLogin={() => setIsAuthModalOpen(true)}
        />
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          currentUser={currentUser}
          users={users}
          onSelectUser={(u) => setCurrentUser(u)}
          onRegisterUser={(newUser) => setUsers((prev) => [...prev, newUser])}
          onOpenAdminConsole={() => setActiveTab('admin')}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </div>
  );
}
