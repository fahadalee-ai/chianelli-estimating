/**
 * Editable US construction rate tables.
 * The calculator in src/utils/estimateCalculator.js reads these values.
 * Costs are 2026 mid-market dollars before regional, quality, and site multipliers.
 */

export const QUALITY_LEVELS = [
  { id: "economy", label: "Economy", multiplier: 0.8 },
  { id: "standard", label: "Standard", multiplier: 1 },
  { id: "premium", label: "Premium", multiplier: 1.3 },
  { id: "luxury", label: "Luxury", multiplier: 1.7 },
];

export const SITE_CONDITIONS = [
  { id: "easy", label: "Easy", multiplier: 0.95, hint: "Open access, level lot" },
  { id: "average", label: "Average", multiplier: 1, hint: "Typical suburban site" },
  { id: "difficult", label: "Difficult", multiplier: 1.15, hint: "Tight access, slope, or occupied home" },
];

export const CREW_SIZES = [
  { id: "small", label: "Small", factor: 1.4, hint: "2–3 person crew" },
  { id: "medium", label: "Medium", factor: 1, hint: "4–6 person crew" },
  { id: "large", label: "Large", factor: 0.72, hint: "7+ person crew" },
];

export const PACE_OPTIONS = [
  { id: "standard", label: "Standard", factor: 1, labourPremium: 0 },
  { id: "fast", label: "Fast-track", factor: 0.8, labourPremium: 0.15 },
];

/** Direct cost per square foot for a standard package before multipliers. */
export const BASE_PER_SQFT = {
  "new-home": 168,
  addition: 128,
  deck: 36,
  attic: 72,
  basement: 34,
  "kitchen-bath": 118,
  commercial: 98,
};

/** Square feet a medium crew finishes per working day. */
export const PRODUCTIVITY = {
  "new-home": 13,
  addition: 5.5,
  deck: 42,
  attic: 16,
  basement: 20,
  "kitchen-bath": 12,
  commercial: 42,
};

export const REGION_MULTIPLIERS = {
  AL: 0.86, AK: 1.25, AZ: 0.98, AR: 0.84, CA: 1.35,
  CO: 1.08, CT: 1.22, DE: 1.05, FL: 1.0, GA: 0.96,
  HI: 1.45, ID: 0.95, IL: 1.15, IN: 0.92, IA: 0.9,
  KS: 0.9, KY: 0.88, LA: 0.9, ME: 1.05, MD: 1.12,
  MA: 1.32, MI: 0.98, MN: 1.06, MS: 0.84, MO: 0.94,
  MT: 0.98, NE: 0.92, NV: 1.08, NH: 1.1, NJ: 1.28,
  NM: 0.95, NY: 1.4, NC: 0.94, ND: 0.96, OH: 0.92,
  OK: 0.88, OR: 1.12, PA: 1.05, RI: 1.18, SC: 0.9,
  SD: 0.9, TN: 0.9, TX: 0.95, UT: 0.98, VT: 1.06,
  VA: 1.02, WA: 1.22, WV: 0.88, WI: 1.02, WY: 0.96,
  DC: 1.3,
};

/** [zip3Start, zip3End, state] */
export const ZIP_RANGES = [
  [5, 5, "NY"], [10, 27, "MA"], [28, 29, "RI"], [30, 38, "NH"], [39, 49, "ME"],
  [50, 59, "VT"], [60, 69, "CT"], [70, 89, "NJ"], [100, 149, "NY"], [150, 196, "PA"],
  [197, 199, "DE"], [200, 205, "DC"], [206, 219, "MD"], [220, 246, "VA"], [247, 268, "WV"],
  [270, 289, "NC"], [290, 299, "SC"], [300, 319, "GA"], [320, 349, "FL"], [350, 369, "AL"],
  [370, 385, "TN"], [386, 397, "MS"], [398, 399, "GA"], [400, 427, "KY"], [430, 459, "OH"],
  [460, 479, "IN"], [480, 499, "MI"], [500, 528, "IA"], [530, 549, "WI"], [550, 567, "MN"],
  [570, 577, "SD"], [580, 588, "ND"], [590, 599, "MT"], [600, 629, "IL"], [630, 658, "MO"],
  [660, 679, "KS"], [680, 693, "NE"], [700, 714, "LA"], [716, 729, "AR"], [730, 749, "OK"],
  [750, 799, "TX"], [800, 816, "CO"], [820, 831, "WY"], [832, 838, "ID"], [840, 847, "UT"],
  [850, 865, "AZ"], [870, 884, "NM"], [889, 898, "NV"], [900, 961, "CA"], [967, 968, "HI"],
  [970, 979, "OR"], [980, 994, "WA"], [995, 999, "AK"],
];

export const PROJECT_TYPES = [
  { id: "new-home", label: "New Home Build", description: "Custom home from foundation through finish", image: "service-home", icon: "Home" },
  { id: "addition", label: "Addition", description: "New living space tied to an existing house", image: "service-addition", icon: "SquarePlus" },
  { id: "deck", label: "Deck", description: "Ground-level, raised, or multi-level outdoor decks", image: "service-deck", icon: "PanelsTopLeft" },
  { id: "attic", label: "Attic Remodel", description: "Conditioned living space under the roof", image: "service-attic", icon: "Triangle" },
  { id: "basement", label: "Basement Remodel", description: "Finish or rework below-grade space", image: "service-basement", icon: "Layers" },
  { id: "kitchen-bath", label: "Kitchen/Bath Remodel", description: "Kitchens, baths, or a combined remodel", image: "service-kitchen", icon: "CookingPot" },
  { id: "commercial", label: "Commercial Fit-Out", description: "Office, retail, restaurant, or clinic interiors", image: "service-commercial", icon: "Building2" },
];

export const ADDON_DEFS = [
  { id: "demolition", label: "Demolition", hint: "Selective demo and haul-away", perSqft: { default: 4.8, deck: 2.2, "new-home": 1.4 }, flat: 0 },
  { id: "permits", label: "Permits & Fees", hint: "Permit, plan review, and inspections", perSqft: { default: 1.8, deck: 0.9, "new-home": 2.6, commercial: 2.4 }, flat: 450 },
  { id: "electrical", label: "Electrical", hint: "Devices, lighting, and panel work", perSqft: { default: 4.2, deck: 1.4, commercial: 7.5, "kitchen-bath": 6 }, flat: 0 },
  { id: "plumbing", label: "Plumbing", hint: "Supply, waste, and fixtures", perSqft: { default: 3.6, deck: 0, attic: 2.2, commercial: 4.5 }, flat: 0 },
  { id: "hvac", label: "HVAC", hint: "Equipment and duct modifications", perSqft: { default: 3.4, deck: 0, basement: 2.8, commercial: 5.5 }, flat: 0 },
  { id: "insulation", label: "Insulation", hint: "Wall, floor, and attic insulation", perSqft: { default: 2.1, deck: 0, basement: 2.4 }, flat: 0 },
  { id: "drywall", label: "Drywall & Paint", hint: "Hang, finish, and paint", perSqft: { default: 3.8, deck: 0, commercial: 4.2 }, flat: 0 },
  { id: "flooring", label: "Flooring", hint: "Underlayment and finish floor", perSqft: { default: 4.6, deck: 0 }, flat: 0 },
  { id: "windows", label: "Windows & Doors", hint: "New units and exterior doors", perSqft: { default: 3.2, deck: 0, basement: 1.6 }, flat: 0 },
  { id: "cabinets", label: "Cabinets & Countertops", hint: "Cabinetry and solid-surface tops", perSqft: { default: 6.5, deck: 0, "new-home": 8, "kitchen-bath": 18 }, flat: 0 },
  { id: "landscaping", label: "Landscaping", hint: "Finish grade and basic planting", perSqft: { default: 1.6, deck: 2.4, commercial: 0.8 }, flat: 600 },
  { id: "design", label: "Interior Design", hint: "Selections, elevations, and a finish schedule", perSqft: { default: 1.8 }, flat: 750 },
];

const off = () => ({
  demolition: false, permits: false, electrical: false, plumbing: false, hvac: false,
  insulation: false, drywall: false, flooring: false, windows: false, cabinets: false,
  landscaping: false, design: false,
});

export const DEFAULT_ADDONS = {
  "new-home": { ...off(), permits: true, electrical: true, plumbing: true, hvac: true, insulation: true, drywall: true, flooring: true, windows: true, cabinets: true },
  addition: { ...off(), demolition: true, permits: true, electrical: true, plumbing: true, hvac: true, insulation: true, drywall: true, flooring: true, windows: true },
  deck: { ...off(), permits: true },
  attic: { ...off(), permits: true, electrical: true, insulation: true, drywall: true, flooring: true },
  basement: { ...off(), demolition: true, permits: true, electrical: true, insulation: true, drywall: true, flooring: true },
  "kitchen-bath": { ...off(), demolition: true, permits: true, electrical: true, plumbing: true, drywall: true, flooring: true, cabinets: true },
  commercial: { ...off(), demolition: true, permits: true, electrical: true, hvac: true, drywall: true, flooring: true },
};

export const AREA_DEFAULTS = {
  "new-home": 2400,
  addition: 420,
  deck: 360,
  attic: 480,
  basement: 820,
  "kitchen-bath": 220,
  commercial: 3200,
};

export const LABOUR_RATES = {
  "General Labour": 48,
  "Carpenters/Framers": 68,
  Electricians: 92,
  Plumbers: 95,
  "HVAC Technicians": 88,
  "Drywall/Painters": 58,
  "Flooring Installers": 56,
  Roofers: 64,
  "Site Supervisor": 98,
};

export const PHASES = {
  "new-home": [
    ["Permits & Planning", 0.12],
    ["Demolition/Site Prep", 0.06],
    ["Foundation/Structure", 0.32],
    ["Rough-ins", 0.2],
    ["Finishes", 0.24],
    ["Final Inspection", 0.06],
  ],
  addition: [
    ["Permits & Planning", 0.14],
    ["Demolition/Site Prep", 0.1],
    ["Foundation/Structure", 0.28],
    ["Rough-ins", 0.18],
    ["Finishes", 0.24],
    ["Final Inspection", 0.06],
  ],
  deck: [
    ["Permits & Planning", 0.14],
    ["Demolition/Site Prep", 0.08],
    ["Foundation/Structure", 0.34],
    ["Decking & Railings", 0.34],
    ["Final Inspection", 0.1],
  ],
  attic: [
    ["Permits & Planning", 0.12],
    ["Demolition/Site Prep", 0.1],
    ["Foundation/Structure", 0.22],
    ["Rough-ins", 0.22],
    ["Finishes", 0.26],
    ["Final Inspection", 0.08],
  ],
  basement: [
    ["Permits & Planning", 0.1],
    ["Demolition/Site Prep", 0.12],
    ["Foundation/Structure", 0.1],
    ["Rough-ins", 0.26],
    ["Finishes", 0.32],
    ["Final Inspection", 0.1],
  ],
  "kitchen-bath": [
    ["Permits & Planning", 0.1],
    ["Demolition/Site Prep", 0.16],
    ["Rough-ins", 0.28],
    ["Finishes", 0.36],
    ["Final Inspection", 0.1],
  ],
  commercial: [
    ["Permits & Planning", 0.14],
    ["Demolition/Site Prep", 0.1],
    ["Foundation/Structure", 0.12],
    ["Rough-ins", 0.28],
    ["Finishes", 0.28],
    ["Final Inspection", 0.08],
  ],
};

export const MATERIAL_CATALOGS = {
  "new-home": [
    ["Lumber & Framing", "bd ft", (a) => a * 8, 0.18],
    ["Concrete & Foundation", "cu yd", (a) => Math.max(12, a / 80), 0.14],
    ["Roofing", "sq", (a) => Math.max(8, a / 100), 0.08],
    ["Insulation", "sq ft", (a) => a * 3.2, 0.05],
    ["Drywall", "sheet", (a) => a / 12, 0.07],
    ["Windows & Doors", "unit", (a) => Math.max(8, a / 180), 0.1],
    ["Flooring", "sq ft", (a) => a * 0.92, 0.08],
    ["Electrical Materials", "lot", () => 1, 0.08],
    ["Plumbing Materials", "lot", () => 1, 0.07],
    ["Cabinets & Counters", "lin ft", (a) => Math.max(20, a / 80), 0.09],
    ["Paint & Finishes", "gal", (a) => a / 80, 0.06],
  ],
  addition: [
    ["Lumber & Framing", "bd ft", (a) => a * 7, 0.22],
    ["Concrete & Foundation", "cu yd", (a) => Math.max(4, a / 70), 0.14],
    ["Roofing", "sq", (a) => Math.max(2, a / 120), 0.08],
    ["Insulation", "sq ft", (a) => a * 2.8, 0.06],
    ["Drywall", "sheet", (a) => a / 10, 0.08],
    ["Windows & Doors", "unit", (a) => Math.max(3, a / 90), 0.12],
    ["Flooring", "sq ft", (a) => a, 0.1],
    ["Electrical Materials", "lot", () => 1, 0.08],
    ["Plumbing Materials", "lot", () => 1, 0.06],
    ["Paint & Finishes", "gal", (a) => a / 70, 0.06],
  ],
  deck: [
    ["Decking Boards", "sq ft", (a) => a * 1.12, 0.4],
    ["Lumber & Framing", "bd ft", (a) => a * 3.4, 0.24],
    ["Concrete & Foundation", "cu yd", (a) => Math.max(1.5, a / 90), 0.12],
    ["Railings", "lin ft", (a) => Math.max(24, Math.round(Math.sqrt(a) * 4)), 0.16],
    ["Fasteners & Hardware", "lot", () => 1, 0.08],
  ],
  attic: [
    ["Lumber & Framing", "bd ft", (a) => a * 4, 0.2],
    ["Insulation", "sq ft", (a) => a * 2.4, 0.12],
    ["Drywall", "sheet", (a) => a / 9, 0.12],
    ["Windows & Doors", "unit", (a) => Math.max(2, a / 160), 0.14],
    ["Flooring", "sq ft", (a) => a, 0.16],
    ["Electrical Materials", "lot", () => 1, 0.1],
    ["Stairs & Access", "lot", () => 1, 0.1],
    ["Paint & Finishes", "gal", (a) => a / 60, 0.06],
  ],
  basement: [
    ["Framing & Furring", "bd ft", (a) => a * 2.2, 0.12],
    ["Insulation", "sq ft", (a) => a * 2, 0.1],
    ["Drywall", "sheet", (a) => a / 8, 0.14],
    ["Flooring", "sq ft", (a) => a, 0.16],
    ["Electrical Materials", "lot", () => 1, 0.12],
    ["Plumbing Materials", "lot", () => 1, 0.08],
    ["Waterproofing", "sq ft", (a) => a, 0.14],
    ["Windows & Doors", "unit", (a) => Math.max(1, a / 300), 0.08],
    ["Paint & Finishes", "gal", (a) => a / 70, 0.06],
  ],
  "kitchen-bath": [
    ["Cabinets & Counters", "lin ft", (a) => Math.max(12, a / 8), 0.34],
    ["Fixtures", "unit", (a) => Math.max(4, a / 40), 0.12],
    ["Flooring", "sq ft", (a) => a, 0.1],
    ["Drywall", "sheet", (a) => a / 14, 0.06],
    ["Electrical Materials", "lot", () => 1, 0.1],
    ["Plumbing Materials", "lot", () => 1, 0.12],
    ["Tile & Backsplash", "sq ft", (a) => a * 0.45, 0.1],
    ["Paint & Finishes", "gal", (a) => Math.max(4, a / 40), 0.06],
  ],
  commercial: [
    ["Partition Framing", "lin ft", (a, input) => Number(input.partitions) || a / 12, 0.12],
    ["Ceiling System", "sq ft", (a) => a, 0.1],
    ["Flooring", "sq ft", (a) => a, 0.14],
    ["Drywall", "sheet", (a) => a / 10, 0.1],
    ["Electrical Materials", "lot", () => 1, 0.16],
    ["Lighting", "fixture", (a) => a / 80, 0.1],
    ["HVAC Materials", "lot", () => 1, 0.12],
    ["Plumbing Materials", "lot", () => 1, 0.08],
    ["Doors & Hardware", "unit", (a) => Math.max(4, a / 250), 0.08],
  ],
};

export const LABOUR_WEIGHTS = {
  "new-home": [["General Labour", 0.12], ["Carpenters/Framers", 0.24], ["Electricians", 0.12], ["Plumbers", 0.1], ["HVAC Technicians", 0.1], ["Drywall/Painters", 0.1], ["Flooring Installers", 0.06], ["Roofers", 0.08], ["Site Supervisor", 0.08]],
  addition: [["General Labour", 0.12], ["Carpenters/Framers", 0.28], ["Electricians", 0.12], ["Plumbers", 0.08], ["HVAC Technicians", 0.08], ["Drywall/Painters", 0.12], ["Flooring Installers", 0.06], ["Roofers", 0.06], ["Site Supervisor", 0.08]],
  deck: [["General Labour", 0.16], ["Carpenters/Framers", 0.66], ["Site Supervisor", 0.18]],
  attic: [["General Labour", 0.12], ["Carpenters/Framers", 0.3], ["Electricians", 0.14], ["Drywall/Painters", 0.16], ["Flooring Installers", 0.1], ["HVAC Technicians", 0.08], ["Site Supervisor", 0.1]],
  basement: [["General Labour", 0.14], ["Carpenters/Framers", 0.16], ["Electricians", 0.16], ["Plumbers", 0.1], ["Drywall/Painters", 0.18], ["Flooring Installers", 0.14], ["Site Supervisor", 0.12]],
  "kitchen-bath": [["General Labour", 0.1], ["Carpenters/Framers", 0.22], ["Electricians", 0.16], ["Plumbers", 0.18], ["Drywall/Painters", 0.12], ["Flooring Installers", 0.12], ["Site Supervisor", 0.1]],
  commercial: [["General Labour", 0.14], ["Carpenters/Framers", 0.16], ["Electricians", 0.2], ["Plumbers", 0.08], ["HVAC Technicians", 0.14], ["Drywall/Painters", 0.12], ["Flooring Installers", 0.08], ["Site Supervisor", 0.08]],
};

export const QUICK_CALCS = [
  {
    id: "deck",
    title: "Deck Cost",
    blurb: "Boards, framing, railings, and stairs.",
    image: "service-deck",
    fields: [
      { key: "area", label: "Deck area (sq ft)", type: "number", default: 320 },
      { key: "material", label: "Decking", type: "select", default: "composite", options: [["pressure-treated", "Pressure-treated"], ["cedar", "Cedar"], ["composite", "Composite"], ["pvc", "PVC"]] },
      { key: "railing", label: "Railing", type: "select", default: "cable", options: [["wood", "Wood"], ["metal", "Metal"], ["cable", "Cable"], ["glass", "Glass"]] },
      { key: "stairs", label: "Stair runs", type: "number", default: 1 },
    ],
  },
  {
    id: "basement",
    title: "Basement Finishing Cost",
    blurb: "Framing, insulation, and finish level.",
    image: "service-basement",
    fields: [
      { key: "area", label: "Basement area (sq ft)", type: "number", default: 800 },
      { key: "finished", label: "Finished percentage", type: "number", default: 100 },
      { key: "bath", label: "Add a bathroom", type: "select", default: "no", options: [["no", "No"], ["yes", "Yes"]] },
      { key: "waterproof", label: "Waterproofing", type: "select", default: "yes", options: [["no", "No"], ["yes", "Yes"]] },
    ],
  },
  {
    id: "attic",
    title: "Attic Conversion Cost",
    blurb: "Living space, dormer, and access.",
    image: "service-attic",
    fields: [
      { key: "area", label: "Attic area (sq ft)", type: "number", default: 450 },
      { key: "dormer", label: "Dormer", type: "select", default: "no", options: [["no", "No"], ["yes", "Yes"]] },
      { key: "bath", label: "Bathroom", type: "select", default: "no", options: [["no", "No"], ["yes", "Yes"]] },
      { key: "floor", label: "Flooring", type: "select", default: "hardwood", options: [["carpet", "Carpet"], ["lvp", "Luxury vinyl"], ["hardwood", "Hardwood"]] },
    ],
  },
  {
    id: "addition",
    title: "Addition Cost",
    blurb: "Room type and foundation tie-in.",
    image: "service-addition",
    fields: [
      { key: "area", label: "Addition area (sq ft)", type: "number", default: 400 },
      { key: "kind", label: "Addition type", type: "select", default: "family", options: [["bedroom", "Bedroom"], ["bathroom", "Bathroom"], ["family", "Family room"], ["second-story", "Second story"]] },
      { key: "stories", label: "Stories", type: "number", default: 1 },
    ],
  },
  {
    id: "concrete",
    title: "Concrete / Slab Calculator",
    blurb: "Yards, waste, and placed cost.",
    image: "service-home",
    fields: [
      { key: "length", label: "Length (ft)", type: "number", default: 24 },
      { key: "width", label: "Width (ft)", type: "number", default: 20 },
      { key: "thickness", label: "Thickness (inches)", type: "number", default: 4 },
      { key: "price", label: "Price per cubic yard", type: "number", default: 185 },
    ],
  },
  {
    id: "framing",
    title: "Framing Lumber Calculator",
    blurb: "Studs, plates, and board cost.",
    image: "project-addition-frame",
    fields: [
      { key: "length", label: "Wall length (ft)", type: "number", default: 40 },
      { key: "height", label: "Wall height (ft)", type: "number", default: 8 },
      { key: "spacing", label: "Stud spacing (in)", type: "select", default: "16", options: [["16", "16 inches"], ["24", "24 inches"]] },
      { key: "price", label: "Price per stud", type: "number", default: 8.75 },
    ],
  },
  {
    id: "paint",
    title: "Paint & Drywall Calculator",
    blurb: "Boards, finish level, and paint.",
    image: "service-kitchen",
    fields: [
      { key: "area", label: "Wall area (sq ft)", type: "number", default: 1200 },
      { key: "ceiling", label: "Include ceiling", type: "select", default: "yes", options: [["no", "No"], ["yes", "Yes"]] },
      { key: "finish", label: "Finish level", type: "select", default: "standard", options: [["economy", "Level 3 / flat"], ["standard", "Level 4 / eggshell"], ["premium", "Level 5 / smooth"]] },
    ],
  },
  {
    id: "flooring",
    title: "Flooring Calculator",
    blurb: "Material, waste, and install.",
    image: "service-basement",
    fields: [
      { key: "area", label: "Floor area (sq ft)", type: "number", default: 500 },
      { key: "material", label: "Material", type: "select", default: "lvp", options: [["carpet", "Carpet"], ["lvp", "Luxury vinyl"], ["hardwood", "Hardwood"], ["tile", "Tile"]] },
      { key: "waste", label: "Waste (%)", type: "number", default: 10 },
    ],
  },
];
