export type SeatStatus = 0 | 1 | 2 | 3;
// 0 = Available, 1 = Reserved, 2 = Selected, 3 = Recommended (User Modeled)

export interface Movie {
  _id: string;
  title: string;
  image: string;
  bannerImage?: string;
  language: string;
  genre: string;
  director: string;
  cast: string;
  description: string;
  duration: number;
  releaseDate: string;
  endDate: string;
  rating?: number;
}

export interface Cinema {
  _id: string;
  name: string;
  ticketPrice: number;
  city: string;
  seats: number[][];
  seatsAvailable: number;
  image: string;
}

export interface Showtime {
  _id: string;
  startAt: string;
  startDate: string;
  endDate: string;
  movieId: string;
  cinemaId: string;
}

export interface Reservation {
  _id: string;
  date: string;
  startAt: string;
  seats: [number, number][];
  ticketPrice: number;
  total: number;
  movieId: string;
  cinemaId: string;
  username: string;
  phone: string;
  checkin: boolean;
  qrCodeSvg?: string;
}

export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: 'guest' | 'admin' | 'superadmin';
  imageurl?: string;
}

export interface SeatSuggestionModel {
  numberOfTickets: number;
  positions: {
    front: number;
    center: number;
    back: number;
  };
}

export interface InvitationPayload {
  to: string;
  host: string;
  movie: string;
  date: string;
  time: string;
  cinema: string;
  seat: string;
}
