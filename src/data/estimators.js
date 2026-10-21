export const estimators = [
  {
    id: "maya",
    name: "Maya Chen",
    specialty: "Residential & Additions",
    rating: 4.9,
    years: 12,
    city: "Austin, TX",
    phone: "(512) 555-0174",
    email: "maya.chen@chianelliestimating.com",
    photo: "estimator-maya",
    bio: "Leads occupied-home additions and custom residential takeoffs across Texas.",
  },
  {
    id: "james",
    name: "James Okonkwo",
    specialty: "Decks & Exterior",
    rating: 4.8,
    years: 9,
    city: "Houston, TX",
    phone: "(713) 555-0162",
    email: "james.okonkwo@chianelliestimating.com",
    photo: "estimator-james",
    bio: "Prices decks, porches, and exterior packages with footing and railing detail.",
  },
  {
    id: "sofia",
    name: "Sofia Alvarez",
    specialty: "Basements & Attics",
    rating: 5,
    years: 11,
    city: "Denver, CO",
    phone: "(303) 555-0194",
    email: "sofia.alvarez@chianelliestimating.com",
    photo: "estimator-sofia",
    bio: "Focuses on below-grade moisture, egress, and attic structure.",
  },
  {
    id: "andre",
    name: "Andre Williams",
    specialty: "Commercial Fit-Outs",
    rating: 4.7,
    years: 15,
    city: "Dallas, TX",
    phone: "(214) 555-0138",
    email: "andre.williams@chianelliestimating.com",
    photo: "estimator-andre",
    bio: "Builds landlord-ready fit-out estimates for office, retail, and clinics.",
  },
];

export function getEstimator(id) {
  return estimators.find((person) => person.id === id) || null;
}
