export const appointmentTypes = [
  { id: "onsite", title: "On-Site Visit", duration: "60–90 min", description: "An estimator walks the property, checks measurements, and notes site conditions." },
  { id: "virtual", title: "Virtual Meeting", duration: "45 min", description: "Zoom or Google Meet to review plans, photos, and a preliminary number." },
  { id: "phone", title: "Phone Call", duration: "30 min", description: "A focused call to scope the work and confirm what to send next." },
];

export const timeSlots = ["8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"];

export const timezones = ["Eastern (ET)", "Central (CT)", "Mountain (MT)", "Pacific (PT)", "Alaska (AKT)", "Hawaii (HT)"];

export const budgetRanges = ["Under $25k", "$25k–$75k", "$75k–$150k", "$150k–$400k", "$400k–$1M", "$1M+"];

export const cancelReasons = ["Schedule conflict", "Project on hold", "Booked another estimator", "Scope changed", "Other"];

export function isSlotBooked(isoDate, slot) {
  const day = Number(String(isoDate).slice(-2));
  const index = timeSlots.indexOf(slot);
  return (day + index) % 7 === 0;
}

export const seedBookings = [
  {
    id: "CE-18420",
    serviceId: "deck",
    serviceName: "Deck Building",
    type: "onsite",
    estimatorId: "james",
    date: "2026-10-28",
    time: "10:00 AM",
    timezone: "Central (CT)",
    address: "1408 Lakeway Blvd, Lakeway, TX 78734",
    description: "Replace a 20-year-old deck and price a cable rail upgrade.",
    budget: "$25k–$75k",
    startDate: "2026-11-16",
    photos: [],
    contactPref: "Text",
    estimateId: "est-lakeway",
    status: "confirmed",
    createdAt: "2026-10-18T15:00:00",
  },
  {
    id: "CE-18455",
    serviceId: "addition",
    serviceName: "Additions",
    type: "virtual",
    estimatorId: "maya",
    date: "2026-11-04",
    time: "1:30 PM",
    timezone: "Central (CT)",
    address: "812 W Annie St, Austin, TX 78704",
    description: "Price a 400 sq ft primary suite addition from the architect PDF.",
    budget: "$150k–$400k",
    startDate: "2027-01-12",
    photos: [],
    contactPref: "Email",
    estimateId: "est-addition",
    status: "assigned",
    createdAt: "2026-10-20T18:30:00",
  },
  {
    id: "CE-17902",
    serviceId: "basement",
    serviceName: "Basement Remodel",
    type: "onsite",
    estimatorId: "sofia",
    date: "2026-09-12",
    time: "9:00 AM",
    timezone: "Mountain (MT)",
    address: "2211 Walnut St, Denver, CO 80205",
    description: "Finished basement walkthrough after waterproofing.",
    budget: "$25k–$75k",
    startDate: "2026-10-01",
    photos: [],
    contactPref: "Call",
    estimateId: "est-basement",
    status: "completed",
    createdAt: "2026-09-02T14:00:00",
  },
  {
    id: "CE-17840",
    serviceId: "commercial",
    serviceName: "Commercial Fit-Outs",
    type: "phone",
    estimatorId: "andre",
    date: "2026-08-19",
    time: "3:00 PM",
    timezone: "Central (CT)",
    address: "3100 McKinney Ave, Dallas, TX 75204",
    description: "Clinic fit-out scope call with the landlord set.",
    budget: "$400k–$1M",
    startDate: "2026-09-08",
    photos: [],
    contactPref: "Call",
    estimateId: "est-commercial",
    status: "completed",
    createdAt: "2026-08-11T16:00:00",
  },
  {
    id: "CE-18110",
    serviceId: "attic",
    serviceName: "Attic Remodel",
    type: "virtual",
    estimatorId: "sofia",
    date: "2026-10-09",
    time: "11:00 AM",
    timezone: "Central (CT)",
    address: "88 N Ellsworth St, Naperville, IL 60540",
    description: "Client postponed the dormer until spring.",
    budget: "$75k–$150k",
    startDate: "2027-03-02",
    photos: [],
    contactPref: "Email",
    estimateId: null,
    status: "cancelled",
    cancelReason: "Project on hold",
    createdAt: "2026-10-01T12:00:00",
  },
];
