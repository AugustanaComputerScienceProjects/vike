export interface FirebaseUser {
  email: string;
  uid: string;
  displayName: string | null;
  photoURL: string | null;
}

export interface Calendar {
  key?: string;
  name: string;
  description: string;
  profileId: string;
  profileUrl?: string;
  eventsCalendar?: Record<string, Event>;
  admins?: Record<string, boolean>;
  subscribers?: Record<string, boolean>;
}

export interface Event {
  id?: string;
  key?: string;
  name: string;
  description: string;
  startDate: string;  // Format: "YYYY-MM-DD HH:mm"
  endDate: string;    // Format: "YYYY-MM-DD HH:mm"
  duration: number;
  location: string;
  organization: string;
  imgid: string;
  image?: string;     // Full URL
  imageUrl?: string;  // Full URL
  webLink: string;
  tags: string;       // Comma-separated string
  email: string;
  guests?: Record<string, {
    status: EventStatus;
    ticketId: string; // Format: "{userId}--{eventId}-{timestamp}"
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventGuest {
  status: EventStatus;
  ticketId?: string;
}

export enum EventStatus {
  GOING = "GOING",
  CHECKED_IN = "CHECKED_IN",
  INVITED = "INVITED",
  NOT_GOING = "NOT_GOING",
  WAITLISTED = "WAITLISTED"
}

export interface UserRole {
  email: string;
  role: "Admin" | "Leader" | "Student";
  group?: string;
  ref?: string;
}

export interface Demographics {
  ID: string;
  LastName: string;
  Pref_FirstName: string;
  PersonType: string;
  Class: string;
  Transfer: string;
  ResidenceHall: string;
  Gender: string;
  Race: string;
  Race_Desc: string;
  International: string;
}

export interface DatabaseStructure {
  calendars: Record<string, Calendar>;
  "current-events": Record<string, Event>;
  admin: Record<string, boolean>;
  leaders: Record<string, {
    groups: Record<string, boolean>;
  }>;
  "groups-to-leaders": Record<string, {
    leaders: Record<string, boolean>;
  }>;
  demographics: Record<string, Demographics>;
  "id-to-email": Record<string, string>;
  tags: string[];
  groups: string[];
  pepsico: Record<string, {
    users: Record<string, Record<string, boolean>>;
  }>;
} 