import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Download,
  Mail,
  MapPin,
  Clock,
  Calendar,
  Sparkles,
  Ticket,
  X,
  QrCode,
} from 'lucide-react';
import {
  Cinema,
  Movie,
  Reservation,
  Showtime,
  User,
} from '../types';
import {
  buildSeatMatrix,
  calculateCheckoutTotal,
  convertRowToAlphabet,
  filterAvailableCinemasAndTimes,
  formatSeatLabel,
  generatePassQrSvgDataUri,
  reservationSeatsUserModeling,
} from '../utils/bookingEngine';

interface BookingModalProps {
  movie: Movie;
  cinemas: Cinema[];
  showtimes: Showtime[];
  reservations: Reservation[];
  currentUser: User | null;
  onClose: () => void;
  onConfirmReservation: (newReservation: Reservation) => void;
  onCheckInReservation: (reservationId: string) => void;
  onRequireLogin: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  movie,
  cinemas,
  showtimes,
  reservations,
  currentUser,
  onClose,
  onConfirmReservation,
  onCheckInReservation,
  onRequireLogin,
}) => {
  const todayIso = new Date().toISOString().slice(0, 10);

  const { availableCinemas, availableTimes: initialTimes } = useMemo(
    () => filterAvailableCinemasAndTimes(cinemas, showtimes, movie._id),
    [cinemas, showtimes, movie._id]
  );

  const [selectedCinemaId, setSelectedCinemaId] = useState<string>(
    availableCinemas[0]?._id || cinemas[0]?._id || ''
  );
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);

  const { availableTimes } = useMemo(
    () =>
      filterAvailableCinemasAndTimes(
        cinemas,
        showtimes,
        movie._id,
        selectedCinemaId
      ),
    [cinemas, showtimes, movie._id, selectedCinemaId]
  );

  const [selectedTime, setSelectedTime] = useState<string>(
    initialTimes[0] || '20:30'
  );
  const [selectedSeats, setSelectedSeats] = useState<[number, number][]>([]);
  const [completedReservation, setCompletedReservation] =
    useState<Reservation | null>(null);
  const [invitations, setInvitations] = useState<Record<string, string>>({});
  const [invitationSentMessage, setInvitationSentMessage] = useState<
    string | null
  >(null);

  const selectedCinema = useMemo(
    () =>
      cinemas.find((c) => c._id === selectedCinemaId) ||
      availableCinemas[0] ||
      cinemas[0],
    [cinemas, availableCinemas, selectedCinemaId]
  );

  const seatSuggestion = useMemo(
    () =>
      reservationSeatsUserModeling(
        cinemas,
        reservations,
        currentUser?.username
      ),
    [cinemas, reservations, currentUser]
  );

  const seatMatrix = useMemo(() => {
    if (!selectedCinema) return [];
    return buildSeatMatrix(
      selectedCinema,
      reservations,
      selectedDate,
      selectedTime,
      selectedSeats,
      seatSuggestion
    );
  }, [
    selectedCinema,
    reservations,
    selectedDate,
    selectedTime,
    selectedSeats,
    seatSuggestion,
  ]);

  const handleToggleSeat = (rowIdx: number, colIdx: number) => {
    const status = seatMatrix[rowIdx]?.[colIdx];
    if (status === 1) return; // Reserved seat cannot be clicked

    setSelectedSeats((prev) => {
      const exists = prev.some(([r, c]) => r === rowIdx && c === colIdx);
      if (exists) {
        return prev.filter(([r, c]) => !(r === rowIdx && c === colIdx));
      }
      return [...prev, [rowIdx, colIdx]];
    });
  };

  const handleAcceptRecommendedSeats = () => {
    const recs: [number, number][] = [];
    seatMatrix.forEach((row, rIdx) => {
      row.forEach((cell, cIdx) => {
        if (cell === 3) recs.push([rIdx, cIdx]);
      });
    });
    if (recs.length > 0) {
      setSelectedSeats(recs);
    }
  };

  const totalAmount = calculateCheckoutTotal(
    selectedSeats.length,
    selectedCinema?.ticketPrice || 0
  );

  const handleCheckout = () => {
    if (selectedSeats.length === 0 || !selectedCinema) return;
    if (!currentUser) {
      onRequireLogin();
      return;
    }

    const resId = `res-${Date.now().toString().slice(-5)}`;
    const newReservation: Reservation = {
      _id: resId,
      date: selectedDate,
      startAt: selectedTime,
      seats: selectedSeats,
      ticketPrice: selectedCinema.ticketPrice,
      total: totalAmount,
      movieId: movie._id,
      cinemaId: selectedCinema._id,
      username: currentUser.username,
      phone: currentUser.phone || '+30 694 000 0000',
      checkin: false,
      qrCodeSvg: generatePassQrSvgDataUri(`imovies-checkin-${resId}`),
    };

    onConfirmReservation(newReservation);
    setCompletedReservation(newReservation);
  };

  const handleDownloadPass = () => {
    if (!completedReservation || !selectedCinema) return;
    const seatList = completedReservation.seats
      .map((s) => `${convertRowToAlphabet(s[0])}${s[1] + 1}`)
      .join(', ');

    const passHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>i movies Ticket Pass - ${movie.title.toUpperCase()}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #09090b; color: #f4f4f5; padding: 40px; }
    .ticket { max-width: 520px; margin: 0 auto; background: #18181b; border: 1px solid #3f3f46; border-radius: 16px; padding: 32px; }
    .brand { color: #f59e0b; font-weight: 700; letter-spacing: 2px; font-size: 14px; text-transform: uppercase; }
    h1 { margin: 8px 0 16px; font-size: 28px; text-transform: capitalize; }
    .meta { color: #a1a1aa; font-size: 14px; line-height: 1.8; margin-bottom: 24px; }
    .qr { background: #fff; padding: 16px; border-radius: 12px; width: 180px; height: 180px; margin: 0 auto 20px; display: block; }
    .code { text-align: center; font-family: monospace; color: #f59e0b; font-size: 15px; }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="brand">i movies · Official Admission Pass</div>
    <h1>${movie.title}</h1>
    <div class="meta">
      <div><strong>Cinema:</strong> ${selectedCinema.name} (${selectedCinema.city.toUpperCase()})</div>
      <div><strong>Date &amp; Time:</strong> ${completedReservation.date} at ${completedReservation.startAt}</div>
      <div><strong>Reserved Seats:</strong> ${seatList}</div>
      <div><strong>Guest:</strong> ${completedReservation.username} (${completedReservation.phone})</div>
      <div><strong>Total Paid:</strong> $${completedReservation.total.toFixed(2)}</div>
    </div>
    <img class="qr" src="${completedReservation.qrCodeSvg}" alt="QR Code Pass"/>
    <div class="code">PASS ID: ${completedReservation._id.toUpperCase()}</div>
  </div>
</body>
</html>`;

    const blob = new Blob([passHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `i-movies-pass-${completedReservation._id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendInvitations = (e: React.FormEvent) => {
    e.preventDefault();
    const emails = (Object.values(invitations) as string[]).filter(
      (v) => v.trim().length > 0
    );
    if (emails.length === 0) return;
    setInvitationSentMessage(
      `HTML movie invitations sent to ${emails.join(', ')}!`
    );
  };

  const reservedSeatsCount = seatMatrix.reduce(
    (acc, row) => acc + row.filter((s) => s === 1).length,
    0
  );
  const totalSeatsCount = seatMatrix.reduce((acc, row) => acc + row.length, 0);
  const availableSeatsCount = Math.max(0, totalSeatsCount - reservedSeatsCount);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Book tickets for ${movie.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-950 border-b border-zinc-800">
          <div>
            <p className="text-xs font-medium text-amber-400">
              i movies Box Office · Interactive Seat Reservation
            </p>
            <h2 className="text-xl font-bold text-white capitalize font-display">
              {movie.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking modal"
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {!completedReservation ? (
            <>
              {/* Step 1: Cinema, Date, and Showtime Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-zinc-950/70 border border-zinc-800/90 rounded-xl">
                <div>
                  <label
                    htmlFor="booking-cinema-select"
                    className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    Select Cinema Auditorium
                  </label>
                  <select
                    id="booking-cinema-select"
                    value={selectedCinemaId}
                    onChange={(e) => {
                      setSelectedCinemaId(e.target.value);
                      setSelectedSeats([]);
                    }}
                    className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    {availableCinemas.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.city.toUpperCase()}) — $
                        {c.ticketPrice.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="booking-date-input"
                    className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    Show Date
                  </label>
                  <input
                    id="booking-date-input"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSeats([]);
                    }}
                    className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 mb-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Showtime
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          setSelectedTime(time);
                          setSelectedSeats([]);
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer font-mono-tabular ${
                          selectedTime === time
                            ? 'bg-amber-500 text-zinc-950'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Smart Seat Suggestion Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 bg-sky-950/30 border border-sky-800/50 rounded-xl">
                <div className="flex items-center gap-2.5 text-xs text-sky-200">
                  <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>
                    <strong>User-Modeled Seat Recommendation:</strong> Based on{' '}
                    {currentUser
                      ? `${currentUser.username}'s`
                      : 'guest'}{' '}
                    booking history, we highlighted{' '}
                    <strong>{seatSuggestion.numberOfTickets} seats</strong> in
                    your preferred viewing zone.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAcceptRecommendedSeats}
                  className="px-3 py-1.5 text-xs font-semibold text-sky-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Select Recommended Seats
                </button>
              </div>

              {/* Auditorium Screen & Seat Matrix */}
              <div className="py-4 px-2 sm:px-6 bg-zinc-950/60 border border-zinc-800/80 rounded-xl flex flex-col items-center">
                {/* Curved Projection Screen */}
                <div className="w-full max-w-lg mb-8 text-center">
                  <div className="h-2.5 w-full bg-gradient-to-r from-transparent via-amber-400/80 to-transparent rounded-full shadow-[0_12px_28px_rgba(245,158,11,0.35)]" />
                  <p className="mt-2 text-[11px] tracking-widest uppercase text-zinc-500">
                    {selectedCinema?.name} · Dolby Atmos Laser Screen
                  </p>
                </div>

                {/* Seat Rows */}
                <div
                  className="space-y-2.5 overflow-x-auto max-w-full pb-2"
                  data-testid="seat-grid"
                >
                  {seatMatrix.map((row, rowIndex) => {
                    const rowLetter = convertRowToAlphabet(rowIndex);
                    return (
                      <div
                        key={`row-${rowLetter}`}
                        className="flex items-center justify-center gap-1.5 sm:gap-2"
                      >
                        <span className="w-5 text-xs font-semibold text-zinc-500 text-right mr-1 font-mono-tabular">
                          {rowLetter}
                        </span>
                        {row.map((seatStatus, colIndex) => {
                          const seatLabel = `${rowLetter}${colIndex + 1}`;
                          let btnStyle =
                            'bg-indigo-950/90 border-indigo-700/70 text-indigo-200 hover:bg-emerald-500 hover:text-zinc-950 hover:border-emerald-400';
                          let statusText = 'Available';

                          if (seatStatus === 1) {
                            btnStyle =
                              'bg-zinc-800 border-zinc-700 text-zinc-600 cursor-not-allowed opacity-60';
                            statusText = 'Reserved';
                          } else if (seatStatus === 2) {
                            btnStyle =
                              'bg-emerald-500 border-emerald-400 text-zinc-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.45)]';
                            statusText = 'Selected';
                          } else if (seatStatus === 3) {
                            btnStyle =
                              'bg-sky-500/90 border-sky-300 text-zinc-950 font-bold hover:bg-emerald-500';
                            statusText = 'Recommended';
                          }

                          return (
                            <button
                              key={seatLabel}
                              type="button"
                              disabled={seatStatus === 1}
                              onClick={() => handleToggleSeat(rowIndex, colIndex)}
                              aria-label={`Row ${rowLetter} Seat ${colIndex + 1} (${statusText})`}
                              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-t-lg rounded-b-sm border text-xs transition-transform active:scale-95 flex items-center justify-center font-mono-tabular cursor-pointer ${btnStyle}`}
                            >
                              {colIndex + 1}
                            </button>
                          );
                        })}
                        <span className="w-5 text-xs font-semibold text-zinc-500 text-left ml-1 font-mono-tabular">
                          {rowLetter}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Seat Legend */}
                <div className="mt-5 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-sm bg-indigo-950 border border-indigo-700 inline-block" />
                    <span>Seat Available ({availableSeatsCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-sm bg-zinc-800 border border-zinc-700 inline-block" />
                    <span>Reserved Seat ({reservedSeatsCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-sm bg-emerald-500 border border-emerald-400 inline-block" />
                    <span>Selected Seat ({selectedSeats.length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-sm bg-sky-500 border border-sky-300 inline-block" />
                    <span>Recommended Seat</span>
                  </div>
                </div>
              </div>

              {/* Checkout Summary Bar */}
              <div className="sticky bottom-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-zinc-950/95 backdrop-blur border border-zinc-800 rounded-xl shadow-lg">
                <div className="space-y-1">
                  <div className="text-xs text-zinc-400">
                    Selected Seats:{' '}
                    {selectedSeats.length > 0 ? (
                      <span className="text-white font-semibold">
                        {selectedSeats.map((s) => formatSeatLabel(s)).join(' · ')}
                      </span>
                    ) : (
                      <span className="text-zinc-500">
                        Click on any available or recommended seat above
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-zinc-300 font-mono-tabular">
                    <span>
                      Tickets: <strong>{selectedSeats.length}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Price/Seat:{' '}
                      <strong>
                        ${(selectedCinema?.ticketPrice || 0).toFixed(2)}
                      </strong>
                    </span>
                    <span>·</span>
                    <span className="text-base text-amber-400 font-bold">
                      Total: ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={selectedSeats.length === 0}
                  onClick={handleCheckout}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedSeats.length > 0
                      ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  Checkout &amp; Generate QR Pass
                </button>
              </div>
            </>
          ) : (
            /* Step 2: Post-Booking QR Code Pass & Guest Email Invitations */
            <div className="space-y-6">
              <div className="p-6 bg-zinc-950 border border-emerald-500/40 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Reservation Confirmed! Pass #{completedReservation._id}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white capitalize font-display">
                    {movie.title}
                  </h3>
                  <p className="text-sm text-zinc-300">
                    {selectedCinema?.name} ({selectedCinema?.city.toUpperCase()}) ·{' '}
                    {completedReservation.date} at {completedReservation.startAt}
                  </p>
                  <p className="text-sm text-zinc-400 font-mono-tabular">
                    Seats:{' '}
                    {completedReservation.seats
                      .map((s) => formatSeatLabel(s))
                      .join(' · ')}{' '}
                    · Total Paid: ${completedReservation.total.toFixed(2)}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleDownloadPass}
                      className="px-4 py-2 text-xs font-semibold bg-amber-500 text-zinc-950 rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Download Pass
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onCheckInReservation(completedReservation._id);
                        setCompletedReservation({
                          ...completedReservation,
                          checkin: true,
                        });
                      }}
                      className="px-4 py-2 text-xs font-semibold bg-zinc-800 text-zinc-100 rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      {completedReservation.checkin
                        ? 'Checked In Verified'
                        : 'Simulate QR Check-In'}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                  <img
                    src={completedReservation.qrCodeSvg}
                    alt="Reservation QR Code"
                    referrerPolicy="no-referrer"
                    className="w-36 h-36 rounded-lg bg-white p-2"
                  />
                  <span className="mt-2 text-xs font-mono-tabular text-zinc-400">
                    Scan at Cinema Gate
                  </span>
                </div>
              </div>

              {/* Guest Email Invitations Form (From BookingInvitation.js) */}
              <form
                onSubmit={handleSendInvitations}
                className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4"
              >
                <div>
                  <h4 className="text-lg font-bold text-white font-display">
                    Guest Email Invitations
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    You have booked your seats. Enter your friends&apos; email
                    addresses below to send personalized seat invitations.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {completedReservation.seats.map((seat, idx) => {
                    const seatKey = `${convertRowToAlphabet(seat[0])}-${
                      seat[1] + 1
                    }`;
                    return (
                      <div key={seatKey}>
                        <label
                          htmlFor={`invite-${seatKey}`}
                          className="block text-xs font-medium text-zinc-300 mb-1"
                        >
                          Guest Email for Row {convertRowToAlphabet(seat[0])} ·
                          Seat {seat[1] + 1}
                        </label>
                        <input
                          id={`invite-${seatKey}`}
                          type="email"
                          placeholder={`friend${idx + 1}@example.com`}
                          value={invitations[seatKey] || ''}
                          onChange={(e) =>
                            setInvitations((prev) => ({
                              ...prev,
                              [seatKey]: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    );
                  })}
                </div>

                {invitationSentMessage && (
                  <p className="text-xs font-medium text-emerald-400">
                    {invitationSentMessage}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold bg-amber-500 text-zinc-950 rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    Send Invitations
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    Done &amp; Return to i movies
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
