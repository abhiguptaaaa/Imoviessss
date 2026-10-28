import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  QrCode,
  ShieldCheck,
  User as UserIcon,
  Trash2,
} from 'lucide-react';
import { Cinema, Movie, Reservation, User } from '../types';
import { formatSeatLabel } from '../utils/bookingEngine';

interface MyDashboardProps {
  currentUser: User | null;
  reservations: Reservation[];
  movies: Movie[];
  cinemas: Cinema[];
  onCheckIn: (reservationId: string) => void;
  onCancelReservation: (reservationId: string) => void;
  onUpdateUser: (updatedUser: User) => void;
  onOpenAdminConsole: () => void;
}

export const MyDashboard: React.FC<MyDashboardProps> = ({
  currentUser,
  reservations,
  movies,
  cinemas,
  onCheckIn,
  onCancelReservation,
  onUpdateUser,
  onOpenAdminConsole,
}) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [savedNotice, setSavedNotice] = useState(false);
  const [checkinLookupId, setCheckinLookupId] = useState('');

  if (!currentUser) {
    return (
      <section className="max-w-4xl mx-auto px-6 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white font-display">
          Sign in to view your i movies bookings
        </h2>
        <p className="text-sm text-zinc-400">
          Select an account using the Sign In button in the top navigation bar to
          inspect your QR passes, check in, or manage your profile.
        </p>
      </section>
    );
  }

  const myReservations = reservations.filter(
    (r) => r.username.toLowerCase() === currentUser.username.toLowerCase()
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onUpdateUser({
      ...currentUser,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-12">
      {/* Header & Role Quick-Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <p className="text-xs font-medium text-amber-400">
            i movies Member Portal · @{currentUser.username}
          </p>
          <h1 className="text-3xl font-bold text-white font-display mt-1">
            My Reservations &amp; Account
          </h1>
        </div>
        {currentUser.role !== 'guest' && (
          <button
            type="button"
            onClick={onOpenAdminConsole}
            className="px-4 py-2.5 text-xs font-semibold bg-amber-500 text-zinc-950 rounded-xl hover:bg-amber-400 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            Open Admin Dashboard ({currentUser.role})
          </button>
        )}
      </div>

      {/* My Reservations List */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white font-display">
            My Ticket Reservations ({myReservations.length})
          </h2>

          {/* QR Check-In Verifier Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (checkinLookupId.trim()) {
                onCheckIn(checkinLookupId.trim());
                setCheckinLookupId('');
              }
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Enter Pass ID (e.g. res-1001)"
              aria-label="Enter Pass ID to check in"
              value={checkinLookupId}
              onChange={(e) => setCheckinLookupId(e.target.value)}
              className="px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-500 font-mono-tabular"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold bg-zinc-800 text-zinc-200 hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
            >
              Verify Check-In
            </button>
          </form>
        </div>

        {myReservations.length === 0 ? (
          <div className="p-8 bg-zinc-900/60 border border-zinc-800 rounded-2xl text-center text-sm text-zinc-400">
            You don&apos;t have any reservations yet. Choose any movie on the Home
            or Now Showing tabs to book your seats!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myReservations.map((res) => {
              const movie = movies.find((m) => m._id === res.movieId);
              const cinema = cinemas.find((c) => c._id === res.cinemaId);
              return (
                <article
                  key={res._id}
                  className="p-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono-tabular">
                      <span>PASS #{res._id.toUpperCase()}</span>
                      <span>·</span>
                      {res.checkin ? (
                        <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Checked In
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Ready for Check-In
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white capitalize font-display">
                      {movie?.title || 'Movie Screening'}
                    </h3>

                    <p className="text-xs text-zinc-300">
                      {cinema?.name || 'i movies Cinema'} · {res.date} at{' '}
                      {res.startAt}
                    </p>

                    <p className="text-xs text-zinc-400 font-mono-tabular">
                      {res.seats.map((s) => formatSeatLabel(s)).join(' · ')} ·
                      Total: ${res.total.toFixed(2)}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      {!res.checkin && (
                        <button
                          type="button"
                          onClick={() => onCheckIn(res._id)}
                          className="px-3 py-1.5 text-xs font-semibold bg-emerald-500 text-zinc-950 rounded-lg hover:bg-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          QR Check In Now
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onCancelReservation(res._id)}
                        aria-label={`Cancel reservation ${res._id}`}
                        className="px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/50 border border-rose-800/50 rounded-lg hover:bg-rose-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Cancel Booking
                      </button>
                    </div>
                  </div>

                  {res.qrCodeSvg && (
                    <div className="shrink-0 bg-white p-2 rounded-xl">
                      <img
                        src={res.qrCodeSvg}
                        alt={`QR Pass for ${res._id}`}
                        referrerPolicy="no-referrer"
                        className="w-24 h-24"
                      />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* My Account Editor */}
      <section className="max-w-2xl bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <UserIcon className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-bold text-white font-display">
            My Account Profile
          </h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="profile-name"
                className="block text-xs font-medium text-zinc-400 mb-1"
              >
                Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label
                htmlFor="profile-username"
                className="block text-xs font-medium text-zinc-400 mb-1"
              >
                Username
              </label>
              <input
                id="profile-username"
                type="text"
                disabled
                value={currentUser.username}
                className="w-full px-3 py-2 text-sm bg-zinc-950/50 border border-zinc-800 rounded-lg text-zinc-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label
                htmlFor="profile-email"
                className="block text-xs font-medium text-zinc-400 mb-1"
              >
                Email Address
              </label>
              <input
                id="profile-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label
                htmlFor="profile-phone"
                className="block text-xs font-medium text-zinc-400 mb-1"
              >
                Mobile Phone
              </label>
              <input
                id="profile-phone"
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {savedNotice && (
            <p className="text-xs font-medium text-emerald-400">
              Account details updated!
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold bg-amber-500 text-zinc-950 rounded-lg hover:bg-amber-400 transition-colors cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
