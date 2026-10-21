/**
 * Chianelli Estimating cost engine.
 *
 * Edit the rate tables in src/data/rates.js. This file turns those tables
 * into a full estimate:
 *
 *   core = (area × base $/sq ft × type adjustment + flat allowances)
 *          × quality × regional multiplier × site condition
 *   direct = core + selected add-ons
 *   split direct into Materials 45%, Labour 35%, Permits 3%, Equipment 5%
 *   fast-track adds the labour premium from the rate table
 *   overhead and contingency come from the sliders and sit on top of that subtotal
 *   the reported range is ±10%
 *
 *   working days = area / productivity × crew factor × pace × site time factor
 */

import {
  ADDON_DEFS,
  AREA_DEFAULTS,
  BASE_PER_SQFT,
  CREW_SIZES,
  DEFAULT_ADDONS,
  LABOUR_RATES,
  LABOUR_WEIGHTS,
  MATERIAL_CATALOGS,
  PACE_OPTIONS,
  PHASES,
  PRODUCTIVITY,
  PROJECT_TYPES,
  QUALITY_LEVELS,
  QUICK_CALCS,
  REGION_MULTIPLIERS,
  SITE_CONDITIONS,
  ZIP_RANGES,
} from "../data/rates.js";

export {
  ADDON_DEFS,
  PROJECT_TYPES,
  QUALITY_LEVELS,
  SITE_CONDITIONS,
  CREW_SIZES,
  PACE_OPTIONS,
  QUICK_CALCS,
  REGION_MULTIPLIERS,
};

const qualityMap = Object.fromEntries(QUALITY_LEVELS.map((item) => [item.id, item.multiplier]));
const siteMap = Object.fromEntries(SITE_CONDITIONS.map((item) => [item.id, item.multiplier]));
const crewMap = Object.fromEntries(CREW_SIZES.map((item) => [item.id, item.factor]));
const paceMap = Object.fromEntries(PACE_OPTIONS.map((item) => [item.id, item]));

export function stateFromZip(zip) {
  const prefix = parseInt(String(zip || "").slice(0, 3), 10);
  if (Number.isNaN(prefix)) return null;
  const match = ZIP_RANGES.find(([start, end]) => prefix >= start && prefix <= end);
  return match ? String(match[2]) : null;
}

export function createInput(partial = {}) {
  const projectType = partial.projectType || "deck";
  const addons = { ...(DEFAULT_ADDONS[projectType] || DEFAULT_ADDONS.deck), ...(partial.addons || {}) };
  return {
    projectType,
    projectName: "",
    zip: "78704",
    state: "TX",
    area: AREA_DEFAULTS[projectType] || 400,
    floors: 1,
    ceilingHeight: projectType === "commercial" ? 10 : 9,
    quality: "standard",
    site: "average",
    contingency: 0.1,
    overhead: 0.12,
    pace: "standard",
    crew: "medium",
    startDate: "",
    bedrooms: 4,
    bathrooms: 2.5,
    garage: "2",
    foundation: "slab",
    roof: "gable",
    exterior: "fiber-cement",
    hvac: "central",
    additionType: "family",
    connected: true,
    foundationExtension: true,
    deckMaterial: "composite",
    railing: "cable",
    stairs: 1,
    pergola: false,
    deckHeight: "mid",
    insulation: "upgrade",
    dormer: false,
    atticBath: false,
    atticStairs: true,
    atticFloor: "hardwood",
    finishedPct: 100,
    egress: 1,
    basementBath: false,
    wetBar: false,
    waterproofing: true,
    basementFloor: "lvp",
    spaceType: "office",
    partitions: 140,
    ceiling: "act",
    commercialFloor: "carpet",
    electricalLevel: "standard",
    hvacMod: "minor",
    restrooms: 2,
    kitchenScope: "kitchen",
    ...partial,
    addons,
  };
}

export function withProjectType(input, projectType) {
  const next = createInput({ projectType });
  next.projectName = input.projectName || "";
  next.zip = input.zip || next.zip;
  next.state = input.state || next.state;
  next.quality = input.quality || next.quality;
  next.site = input.site || next.site;
  next.contingency = input.contingency ?? next.contingency;
  next.overhead = input.overhead ?? next.overhead;
  next.pace = input.pace || next.pace;
  next.crew = input.crew || next.crew;
  next.startDate = input.startDate || "";
  return next;
}

function clamp(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function typeAdjust(input, area) {
  const type = input.projectType;
  if (type === "new-home") {
    const garage = { 0: 0, 1: 18000, 2: 32000, 3: 48000 }[String(input.garage)] ?? 32000;
    const beds = Math.max(0, (Number(input.bedrooms) || 0) - 3) * 4800;
    const baths = (Number(input.bathrooms) || 0) * 7600;
    const foundation = { slab: 1, crawl: 1.06, basement: 1.18 }[input.foundation] ?? 1;
    const roof = { gable: 1, hip: 1.06, flat: 0.96 }[input.roof] ?? 1;
    const exterior = { vinyl: 0.94, "fiber-cement": 1, brick: 1.12, stone: 1.22 }[input.exterior] ?? 1;
    const hvac = { central: 1, "heat-pump": 1.04, "mini-split": 1.08 }[input.hvac] ?? 1;
    return { mult: foundation * roof * exterior * hvac, flat: garage + beds + baths };
  }
  if (type === "addition") {
    const kind = { bedroom: 1, bathroom: 1.16, family: 0.96, "second-story": 1.3 }[input.additionType] ?? 1;
    const connected = input.connected ? 0.97 : 1.06;
    const flat = input.foundationExtension ? 18 * area : 0;
    return { mult: kind * connected, flat };
  }
  if (type === "deck") {
    const material = { "pressure-treated": 0.72, cedar: 0.96, composite: 1.18, pvc: 1.42 }[input.deckMaterial] ?? 1;
    const railRate = { wood: 0, metal: 28, cable: 42, glass: 68 }[input.railing] ?? 0;
    const height = { low: 0.92, mid: 1, high: 1.16 }[input.deckHeight] ?? 1;
    const perimeter = Math.max(28, Math.round(Math.sqrt(area) * 4));
    const pergola = input.pergola ? 22 * area : 0;
    const stairs = (Number(input.stairs) || 0) * 950;
    return { mult: material * height, flat: railRate * perimeter + pergola + stairs };
  }
  if (type === "attic") {
    const insulation = { existing: 0, upgrade: 4 * area, full: 8 * area }[input.insulation] ?? 0;
    const floor = { carpet: 0, lvp: 3.4 * area, hardwood: 8 * area }[input.atticFloor] ?? 0;
    return {
      mult: 1,
      flat: insulation + floor + (input.dormer ? 13500 : 0) + (input.atticBath ? 15200 : 0) + (input.atticStairs ? 7200 : 0),
    };
  }
  if (type === "basement") {
    const pct = clamp(input.finishedPct, 0, 100, 100) / 100;
    const floor = { carpet: 1, lvp: 1.08, tile: 1.16 }[input.basementFloor] ?? 1;
    return {
      mult: (0.42 + 0.58 * pct) * floor,
      flat:
        (Number(input.egress) || 0) * 2900 +
        (input.basementBath ? 12500 : 0) +
        (input.wetBar ? 6800 : 0) +
        (input.waterproofing ? 8 * area : 0),
    };
  }
  if (type === "commercial") {
    const space = { office: 1, retail: 1.08, restaurant: 1.36, clinic: 1.26 }[input.spaceType] ?? 1;
    const ceiling = { open: 0.94, act: 1, drywall: 1.08 }[input.ceiling] ?? 1;
    const floor = { carpet: 1, lvp: 1.06, polished: 1.12 }[input.commercialFloor] ?? 1;
    const electrical = { basic: 0.9, standard: 1, premium: 1.18 }[input.electricalLevel] ?? 1;
    const hvac = { none: 0.88, minor: 1, full: 1.2 }[input.hvacMod] ?? 1;
    return {
      mult: space * ceiling * floor * electrical * hvac,
      flat: (Number(input.partitions) || 0) * 92 + (Number(input.restrooms) || 0) * 18000,
    };
  }
  const scope = { kitchen: 1, bath: 0.7, both: 1.38 }[input.kitchenScope] ?? 1;
  return { mult: scope, flat: 0 };
}

function addonCost(input, area, region, quality) {
  let sum = 0;
  for (const def of ADDON_DEFS) {
    if (!input.addons?.[def.id]) continue;
    const per = def.perSqft[input.projectType] ?? def.perSqft.default ?? 0;
    sum += per * area + (def.flat || 0);
  }
  return sum * region * (0.75 + 0.25 * quality);
}

function allocate(rows, bucket) {
  const rounded = rows.map((row) => ({ ...row, total: Math.round(bucket * row.weight) }));
  const drift = Math.round(bucket) - rounded.reduce((sum, row) => sum + row.total, 0);
  if (rounded.length) rounded[rounded.length - 1].total += drift;
  return rounded.map((row) => ({
    ...row,
    unitPrice: row.qty ? row.total / row.qty : 0,
  }));
}

function durationLabel(days) {
  const weeks = days / 5;
  if (days < 12) return `${Math.max(1, Math.round(days))} working days`;
  const shown = weeks >= 10 ? Math.round(weeks) : Math.round(weeks * 10) / 10;
  return `${shown} weeks · ${Math.round(days)} working days`;
}

export function calculateEstimate(raw) {
  const input = createInput(raw || {});
  const area = Math.max(1, Number(input.area) || 1);
  const type = input.projectType;
  const quality = qualityMap[input.quality] ?? 1;
  const region = REGION_MULTIPLIERS[input.state] ?? 1;
  const site = siteMap[input.site] ?? 1;
  const { mult, flat } = typeAdjust(input, area);
  let heightMult = 1;
  const ceiling = Number(input.ceilingHeight) || 8;
  if (ceiling > 9 && type !== "deck") heightMult += (ceiling - 9) * 0.035;
  let floorMult = 1;
  const floors = Number(input.floors) || 1;
  if (floors > 1 && (type === "new-home" || type === "addition" || type === "commercial")) {
    floorMult += (floors - 1) * 0.08;
  }
  const core = (area * (BASE_PER_SQFT[type] || 100) * mult * heightMult * floorMult + flat) * quality * region * site;
  const direct = Math.max(0, core + addonCost(input, area, region, quality));

  let materials = Math.round(direct * 0.45);
  let labour = Math.round(direct * 0.35);
  let permits = Math.round(direct * 0.03);
  let equipment = Math.round(direct * 0.05);
  const targetSub = Math.round(Math.round(direct) * 0.88);
  materials += targetSub - (materials + labour + permits + equipment);

  const pace = paceMap[input.pace] || paceMap.standard;
  if (pace.labourPremium) labour += Math.round(labour * pace.labourPremium);

  const sub = materials + labour + permits + equipment;
  const overheadRate = clamp(input.overhead, 0.08, 0.2, 0.12);
  const contingencyRate = clamp(input.contingency, 0.05, 0.2, 0.1);
  const overhead = Math.round(sub * overheadRate);
  const contingency = Math.round((sub + overhead) * contingencyRate);
  const total = sub + overhead + contingency;
  const low = Math.round(total * 0.9);
  const high = Math.round(total * 1.1);

  const catalog = MATERIAL_CATALOGS[type] || MATERIAL_CATALOGS.addition;
  const materialLines = allocate(
    catalog.map(([name, unit, qty, weight]) => ({
      name,
      unit,
      qty: Math.max(1, Math.round(qty(area, input) * 10) / 10),
      weight,
    })),
    materials,
  );

  const labourLines = allocate(
    (LABOUR_WEIGHTS[type] || LABOUR_WEIGHTS.addition).map(([trade, weight]) => {
      const rate = LABOUR_RATES[trade] || 65;
      return { trade, rate, weight, qty: 1 };
    }),
    labour,
  ).map((row) => {
    const hours = Math.round((row.total / row.rate) * 2) / 2;
    return { trade: row.trade, hours, rate: row.rate, total: row.total };
  });

  const crew = crewMap[input.crew] ?? 1;
  const siteTime = input.site === "easy" ? 0.95 : input.site === "difficult" ? 1.15 : 1;
  const durationDays = Math.max(4, Math.round((area / (PRODUCTIVITY[type] || 20)) * crew * pace.factor * siteTime));
  const phases = (PHASES[type] || PHASES.addition).map(([name, share]) => {
    const days = Math.max(1, Math.round(durationDays * share));
    return { name, days, label: days < 10 ? `${days}d` : `${Math.round((days / 5) * 10) / 10} wk` };
  });

  const slices = [
    { key: "materials", label: "Materials", value: materials },
    { key: "labour", label: "Labour", value: labour },
    { key: "permits", label: "Permits & Fees", value: permits },
    { key: "equipment", label: "Equipment", value: equipment },
    { key: "overhead", label: "Overhead & Profit", value: overhead },
    { key: "contingency", label: "Contingency", value: contingency },
  ].map((slice) => ({
    ...slice,
    pct: total ? slice.value / total : 0,
  }));

  return {
    input,
    total,
    low,
    high,
    perSqft: area ? total / area : 0,
    materials,
    labour,
    permits,
    equipment,
    overhead,
    contingency,
    overheadRate,
    contingencyRate,
    materialLines,
    labourLines,
    phases,
    durationDays,
    durationLabel: durationLabel(durationDays),
    regionMultiplier: region,
    qualityMultiplier: quality,
    siteMultiplier: site,
    slices,
    typeLabel: PROJECT_TYPES.find((item) => item.id === type)?.label || "Project",
  };
}

export function compareQualities(input) {
  return ["economy", "standard", "premium"].map((quality) => {
    const result = calculateEstimate({ ...input, quality });
    return { quality, total: result.total, low: result.low, high: result.high, perSqft: result.perSqft };
  });
}

const DECK_RATES = { "pressure-treated": 28, cedar: 38, composite: 52, pvc: 64 };
const RAIL_RATES = { wood: 18, metal: 32, cable: 46, glass: 72 };
const FLOOR_RATES = { carpet: 6.5, lvp: 9.5, hardwood: 14, tile: 16 };

export function runQuickCalc(id, values) {
  const v = values || {};
  if (id === "deck") {
    const area = Math.max(1, Number(v.area) || 1);
    const board = (DECK_RATES[v.material] || 52) * area;
    const perimeter = Math.max(24, Math.round(Math.sqrt(area) * 4));
    const rail = (RAIL_RATES[v.railing] || 46) * perimeter;
    const stairs = (Number(v.stairs) || 0) * 1100;
    const total = Math.round((board + rail + stairs) * 1.18);
    return pack(total, area, "Includes framing, boards, railings, and a 18% install allowance.");
  }
  if (id === "basement") {
    const area = Math.max(1, Number(v.area) || 1);
    const pct = clamp(v.finished, 0, 100, 100) / 100;
    let total = area * (18 + 34 * pct);
    if (v.bath === "yes") total += 12500;
    if (v.waterproof === "yes") total += area * 8;
    return pack(total, area, "Framing, electrical allowance, drywall, and flooring at the finish level you set.");
  }
  if (id === "attic") {
    const area = Math.max(1, Number(v.area) || 1);
    let total = area * 78;
    if (v.dormer === "yes") total += 13500;
    if (v.bath === "yes") total += 15200;
    const floor = { carpet: 0, lvp: 3.4, hardwood: 8 }[v.floor] || 0;
    total += floor * area;
    return pack(total, area, "Structure, insulation, finishes, and the options selected above.");
  }
  if (id === "addition") {
    const area = Math.max(1, Number(v.area) || 1);
    const kind = { bedroom: 165, bathroom: 210, family: 150, "second-story": 230 }[v.kind] || 165;
    const stories = Math.max(1, Number(v.stories) || 1);
    const total = area * kind * (1 + (stories - 1) * 0.08);
    return pack(total, area, "Foundation tie-in, shell, and a standard finish package.");
  }
  if (id === "concrete") {
    const yards = ((Number(v.length) || 0) * (Number(v.width) || 0) * ((Number(v.thickness) || 0) / 12)) / 27;
    const withWaste = yards * 1.1;
    const total = withWaste * (Number(v.price) || 0);
    return {
      total: Math.round(total),
      low: Math.round(total * 0.9),
      high: Math.round(total * 1.1),
      perSqft: 0,
      detail: `${withWaste.toFixed(1)} cubic yards including 10% waste.`,
      lines: [
        ["Slab area", `${Math.round((Number(v.length) || 0) * (Number(v.width) || 0))} sq ft`],
        ["Cubic yards", withWaste.toFixed(1)],
        ["Placement", moneyish(total)],
      ],
    };
  }
  if (id === "framing") {
    const length = Math.max(1, Number(v.length) || 1);
    const height = Math.max(1, Number(v.height) || 8);
    const spacing = Number(v.spacing) || 16;
    const studs = Math.ceil((length * 12) / spacing) + 1;
    const plates = Math.ceil((length * 3) / 8);
    const price = Number(v.price) || 0;
    const total = (studs + plates) * price;
    return {
      total: Math.round(total),
      low: Math.round(total * 0.9),
      high: Math.round(total * 1.1),
      perSqft: 0,
      detail: "Studs plus three plates. Headers and sheathing are in the full estimate.",
      lines: [
        ["Studs", String(studs)],
        ["Plate boards", String(plates)],
        ["Lumber total", moneyish(total)],
      ],
    };
  }
  if (id === "paint") {
    const walls = Math.max(1, Number(v.area) || 1);
    const area = walls * (v.ceiling === "yes" ? 1.35 : 1);
    const rate = { economy: 3.4, standard: 4.6, premium: 6.8 }[v.finish] || 4.6;
    const total = area * rate;
    return pack(total, walls, `${Math.ceil(area / 32)} drywall sheets and paint at the selected finish.`);
  }
  const area = Math.max(1, Number(v.area) || 1);
  const waste = 1 + clamp(v.waste, 0, 25, 10) / 100;
  const rate = FLOOR_RATES[v.material] || 9.5;
  const total = area * waste * rate;
  return pack(total, area, `${Math.round(area * waste)} sq ft ordered, material and install.`);
}

function pack(total, area, detail) {
  const rounded = Math.round(total);
  return {
    total: rounded,
    low: Math.round(rounded * 0.9),
    high: Math.round(rounded * 1.1),
    perSqft: area ? rounded / area : 0,
    detail,
    lines: [
      ["Low", moneyish(rounded * 0.9)],
      ["Most likely", moneyish(rounded)],
      ["High", moneyish(rounded * 1.1)],
    ],
  };
}

function moneyish(value) {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export function quickToInput(id, values) {
  const v = values || {};
  if (id === "deck") {
    return createInput({
      projectType: "deck",
      area: Number(v.area) || 320,
      deckMaterial: v.material,
      railing: v.railing,
      stairs: Number(v.stairs) || 0,
    });
  }
  if (id === "basement") {
    return createInput({
      projectType: "basement",
      area: Number(v.area) || 800,
      finishedPct: Number(v.finished) || 100,
      basementBath: v.bath === "yes",
      waterproofing: v.waterproof === "yes",
    });
  }
  if (id === "attic") {
    return createInput({
      projectType: "attic",
      area: Number(v.area) || 450,
      dormer: v.dormer === "yes",
      atticBath: v.bath === "yes",
      atticFloor: v.floor,
    });
  }
  if (id === "addition") {
    return createInput({
      projectType: "addition",
      area: Number(v.area) || 400,
      additionType: v.kind,
      floors: Number(v.stories) || 1,
    });
  }
  if (id === "concrete") {
    return createInput({ projectType: "addition", area: Math.round((Number(v.length) || 0) * (Number(v.width) || 0)) || 400 });
  }
  if (id === "framing") {
    return createInput({ projectType: "new-home", area: Math.round((Number(v.length) || 40) * (Number(v.height) || 8) * 4) });
  }
  if (id === "paint") return createInput({ projectType: "kitchen-bath", area: Number(v.area) || 200 });
  return createInput({ projectType: "basement", area: Number(v.area) || 500, basementFloor: v.material === "tile" ? "tile" : "lvp" });
}
