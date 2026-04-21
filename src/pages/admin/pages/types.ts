// src/types.ts

export type HosRisk = "low" | "medium" | "high";
export type DriverStatus = "Available" | "On Trip" | "Off Duty";
export type TripStatus = "completed" | "in_progress";

export interface TripRow {
  id: string;
  driver_id: string;
  origin: string;
  destination: string;
  status: TripStatus;
  completed_at: string | null;
  eta: string | null;
}

export interface DriverLocationRow {
  id: string;
  driver_id: string;
  city: string;
  state: string;
  location_note: string;
  recorded_at: string;
}

export interface DriverRow {
  id: string;
  name: string;
  driver_number: string;
  cdl_class: string;
  experience_years: number;
  status: DriverStatus;
  hos_risk: HosRisk;
  rating: number;
  avatar_initials: string;
  avatar_bg: string;
  created_at?: string;
}

/**
 * View-model types used by UI components/pages
 */
export interface Trip {
  origin: string;
  destination: string;
  status: TripStatus;
  date: string;
}

export interface DriverLocation {
  city: string;
  state: string;
  locationNote: string;
}

export interface Driver {
  id: string;
  name: string;
  driverNumber: string;
  cdlClass: string;
  experienceYears: number;
  status: DriverStatus;
  hosRisk: HosRisk;
  rating: number;
  avatarInitials: string;
  avatarBg: string;
  lastTrip: Trip;
  currentLocation: DriverLocation;
}
