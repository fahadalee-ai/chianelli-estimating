export const US_STATES = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"], ["CA", "California"],
  ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"], ["DC", "District of Columbia"], ["FL", "Florida"],
  ["GA", "Georgia"], ["HI", "Hawaii"], ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"],
  ["IA", "Iowa"], ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"],
  ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"], ["MS", "Mississippi"],
  ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"], ["NH", "New Hampshire"],
  ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"],
  ["OH", "Ohio"], ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"],
  ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"],
  ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"], ["WV", "West Virginia"], ["WI", "Wisconsin"],
  ["WY", "Wyoming"],
];

export const ROLES = ["Residential Contractor", "Remodeler", "Renovator", "Commercial Contractor", "Home Builder", "Homeowner"];

export const INTERESTS = ["Additions", "Decks", "Attic Remodel", "Basement Remodel", "Home Building", "Commercial Fit-Out"];

export const demoUser = {
  fullName: "Marcus Hale",
  email: "marcus@halebuilds.com",
  phone: "(512) 555-0148",
  role: "Residential Contractor",
  company: "Hale Builds LLC",
  city: "Austin",
  state: "TX",
  zip: "78704",
  interests: ["Decks", "Additions", "Basement Remodel"],
};

export const howItWorks = [
  { step: "01", title: "Choose Service", body: "Pick the project type that matches the job you need priced." },
  { step: "02", title: "Enter Details", body: "Add area, specification, site, and the trades you want in scope." },
  { step: "03", title: "Get Estimate", body: "Review labour, materials, time, and a low-to-high range." },
  { step: "04", title: "Book Appointment", body: "Sit with an estimator on site, on a call, or over video." },
];

export const companyStats = [
  { value: "1,200+", label: "Estimates Delivered" },
  { value: "98%", label: "Accuracy" },
  { value: "15+", label: "Years Experience" },
];

export const faqs = [
  { q: "How accurate is a quick estimate?", a: "The in-app number is a preliminary range, typically within about 10 percent of a standard scope. An on-site visit confirms hidden conditions, exact measurements, and the specification you want to build." },
  { q: "Which states do you price?", a: "We price work across the United States. The calculator applies a regional labour and material multiplier by state, with higher factors in markets such as California and New York and a lower factor in Texas." },
  { q: "Can I revise an estimate after I save it?", a: "Yes. Open the estimate, choose Edit Inputs, and save again. Duplicating an estimate keeps the original status and starts a new draft." },
  { q: "What happens at an appointment?", a: "On-site visits run 60 to 90 minutes. Virtual meetings run about 45 minutes and work best when you upload plans or photos ahead of time. Phone calls are 30 minutes and are meant to confirm scope." },
  { q: "Do you include permits?", a: "A permits allowance is part of every full estimate. Turning on Permits & Fees adds the local filing allowance we use for that project type. The final fee still comes from the building department." },
  { q: "How do I get a formal proposal?", a: "Book an appointment and attach a saved estimate. After the visit we issue a detailed estimate you can send to a client or a lender. Payment for estimate packages is invoiced separately." },
];

export const seedNotifications = [
  { id: "n1", group: "today", type: "appointment", title: "Appointment confirmed", body: "James Okonkwo will meet you in Lakeway on Oct 28 at 10:00 AM.", time: "8:12 AM", unread: true, target: { name: "booking", bookingId: "CE-18420" } },
  { id: "n2", group: "today", type: "reminder", title: "Bring the deck photos", body: "Add pictures of the existing rail and stairs before the on-site visit.", time: "7:40 AM", unread: true, target: { name: "booking", bookingId: "CE-18420" } },
  { id: "n3", group: "earlier", type: "estimate", title: "Estimate ready to send", body: "South Congress Suite is marked Sent. Open it to download the PDF.", time: "Oct 8", unread: false, target: { name: "result", estimateId: "est-addition" } },
  { id: "n4", group: "earlier", type: "promo", title: "Virtual consults this month", body: "Book a 45-minute video review and we will apply it to a Builder package.", time: "Oct 4", unread: false, target: { name: "book" } },
  { id: "n5", group: "earlier", type: "tip", title: "Winter concrete note", body: "Slab placements after mid-November in the Midwest should carry a cold-weather allowance.", time: "Sep 28", unread: true, target: { name: "quick", calcId: "concrete" } },
];

export const invoices = [
  { id: "INV-1044", title: "Builder estimate package", project: "South Congress Suite", date: "Oct 8, 2026", amount: 750, status: "Paid" },
  { id: "INV-1031", title: "Snapshot package", project: "Hyde Park Basement", date: "Sep 22, 2026", amount: 350, status: "Due" },
  { id: "INV-0988", title: "Investor package", project: "Domain Office Fit-Out", date: "Aug 30, 2026", amount: 1200, status: "Paid" },
];

export const privacySections = [
  { title: "What we collect", body: "We collect the account details you enter, project inputs such as area and ZIP code, photos you upload for an appointment, and basic device data needed to keep you signed in." },
  { title: "How we use it", body: "Project data is used to calculate estimates, schedule estimators, and improve the rate tables. We do not sell your project addresses or drawings." },
  { title: "Photos and plans", body: "Files you attach to an appointment are visible to the assigned estimator and to you. You can remove a booking and we delete the attached previews from this device." },
  { title: "Retention", body: "Saved estimates stay on this device until you delete them. If you log out without Remember me, the session ends, and the estimates remain stored locally for the next sign-in on this phone." },
  { title: "Contact", body: "Privacy questions go to privacy@chianelliestimating.com or Chianelli Estimating, 600 Congress Ave, Suite 1400, Austin, TX 78701." },
];

export const termsSections = [
  { title: "Preliminary numbers", body: "Figures produced in the app are preliminary estimates for planning. They are not a bid, a contract, or a guarantee of cost. A detailed estimate follows an appointment." },
  { title: "Your inputs", body: "You are responsible for the area, specification, and site condition you enter. Hidden conditions discovered on site can change the final number." },
  { title: "Appointments", body: "Please give 24 hours notice to reschedule. Repeated missed visits may require a new booking. Virtual meetings need a stable connection and the files you promised to upload." },
  { title: "Acceptable use", body: "Do not upload plans you do not have the right to share. Do not use the app to misrepresent a Chianelli estimate as a sealed engineering document." },
  { title: "Liability", body: "To the extent the law allows, Chianelli Estimating is not liable for construction decisions made from a preliminary estimate before an estimator has reviewed the site or the drawings." },
];

export const aboutCopy = {
  lead: "Chianelli Estimating prices residential and commercial work for people who have to stand behind the number.",
  body: "We work with residential contractors, remodelers, renovators, young commercial builders, and homeowners planning additions, decks, attics, and basements. Every estimate separates labour, materials, time, and overhead so the conversation with a client stays specific. The company has spent more than 15 years in US construction estimating and has delivered more than 1,200 estimates.",
  address: "600 Congress Ave, Suite 1400, Austin, TX 78701",
  phone: "(512) 555-0142",
  email: "hello@chianelliestimating.com",
};
