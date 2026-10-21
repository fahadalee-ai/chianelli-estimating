import { useEffect, useMemo, useState } from "react";
import * as Lucide from "lucide-react";
import { useApp } from "../context/AppState";
import { useNav } from "../navigation/nav";
import { BottomSheet, EmptyState, InputField, PrimaryButton, SecondaryButton, SectionHeader, Segmented, SelectField, StepIndicator, ToggleRow, TopBar, useCountUp } from "../components/kit";
import { DonutChart, Gantt } from "../components/Charts";
import { photo } from "../img/manifest";
import { US_STATES } from "../data/content";
import { ADDON_DEFS, PROJECT_TYPES, QUICK_CALCS } from "../data/rates";
import {
  calculateEstimate,
  compareQualities,
  createInput,
  quickToInput,
  runQuickCalc,
  stateFromZip,
  withProjectType,
} from "../utils/estimateCalculator";
import { downloadPdf, shareOrCopy } from "../utils/files";
import { formatDate, formatQty, money, moneyExact } from "../utils/format";

function Icon({ name }: { name: string }) {
  const Cmp = (Lucide as unknown as Record<string, typeof Lucide.Circle>)[name] || Lucide.Circle;
  return <Cmp size={22} />;
}

export function EstimateHubScreen() {
  const { push } = useNav();
  const { estimates, replaceDraft } = useApp();
  return (
    <div className="screen">
      <div className="scroll">
        <div className="under-status">
          <p className="text-sm text-muted-foreground">Labour, materials, and time.</p>
          <h1 className="font-display text-[28px] font-bold">Estimate</h1>
        </div>
        <button
          className="lift mt-4 w-full rounded-2xl bg-ink p-5 text-left text-white"
          onClick={() => {
            replaceDraft(createInput({ projectName: "" }));
            push({ name: "calculator", startStep: 0 });
          }}
        >
          <span className="mb-3 block h-1 w-10 rounded-full bg-primary" />
          <span className="font-display text-xl font-semibold">Start a full estimate</span>
          <span className="mt-1 block text-sm text-white/70">Project type, scope, labour, materials, and a schedule.</span>
          <span className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-4 text-sm font-semibold">New Estimate</span>
        </button>
        <div className="mt-6">
          <SectionHeader title="Quick Calculators" action="View all" onAction={() => push({ name: "quick" })} />
          <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5">
            {QUICK_CALCS.map((calc) => (
              <button key={calc.id} className="lift card w-40 shrink-0 overflow-hidden text-left" onClick={() => push({ name: "quickCalc", calcId: calc.id })}>
                <img src={photo(calc.image)} alt="" className="h-20 w-full object-cover" />
                <span className="block p-3 text-sm font-semibold">{calc.title}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <SectionHeader title="Recent estimates" action="See all" onAction={() => push({ name: "estimates" })} />
          {estimates.length ? (
            estimates.slice(0, 3).map((estimate) => {
              const result = calculateEstimate(estimate.inputs);
              return (
                <button key={estimate.id} className="card mb-3 w-full p-3 text-left" onClick={() => push({ name: "result", estimateId: estimate.id })}>
                  <span className="block font-semibold">{estimate.inputs.projectName || "Untitled estimate"}</span>
                  <span className="text-sm text-primary">{money(result.total)}</span>
                </button>
              );
            })
          ) : (
            <EmptyState title="No estimates yet" body="Start with a project type and we will price it as you type." action="Create Your First Estimate" onAction={() => push({ name: "calculator", startStep: 0 })} />
          )}
        </div>
      </div>
    </div>
  );
}

export function CalculatorScreen() {
  const { screen, push, back } = useNav();
  const { draft, setDraft, replaceDraft, user, updateEstimate } = useApp();
  const params = screen.name === "calculator" ? screen : null;
  const [step, setStep] = useState(params?.startStep || 0);
  const [chosen, setChosen] = useState(Boolean(params?.presetType || params?.keepDraft));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!params?.presetType || params.keepDraft) return;
    replaceDraft(withProjectType(createInput({ zip: user?.zip || "78704", state: user?.state || "TX", projectName: draft.projectName }), params.presetType));
    setChosen(true);
    // Mount-only preset from the service or calculator card that opened this screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const result = useMemo(() => (chosen ? calculateEstimate(draft) : null), [chosen, draft]);
  const steps = ["Project Type", "Details", "Scope", "Timeline"];

  const choose = (type: string) => {
    replaceDraft(withProjectType(draft, type));
    setChosen(true);
  };

  const continueStep = () => {
    if (step === 0 && !chosen) return;
    if (step === 1) {
      const next: Record<string, string> = {};
      if (!draft.projectName.trim()) next.projectName = "Name this project.";
      if (!/^\d{5}$/.test(draft.zip)) next.zip = "Enter a 5-digit ZIP code.";
      if (!draft.state) next.state = "Choose a state.";
      if (!(Number(draft.area) > 0)) next.area = "Area must be greater than zero.";
      setErrors(next);
      if (Object.keys(next).length) return;
    }
    if (step < 3) setStep((value) => value + 1);
    else if (params?.returnToResult) {
      if (params.estimateId) updateEstimate(params.estimateId, { inputs: draft });
      back();
    } else push({ name: "result" });
  };

  return (
    <div className="screen">
      <TopBar title="Estimate" onBack={step === 0 ? back : () => setStep((value) => value - 1)} />
      <div className="scroll pb-44">
        <StepIndicator steps={steps} current={step} />
        {step === 0 ? (
          <div className="space-y-3">
            {PROJECT_TYPES.map((type) => {
              const active = chosen && draft.projectType === type.id;
              return (
                <button key={type.id} className={`lift card flex w-full items-center gap-3 p-2 text-left ${active ? "ring-2 ring-primary" : ""}`} onClick={() => choose(type.id)}>
                  <img src={photo(type.image)} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 font-display text-sm font-semibold">
                      <Icon name={type.icon} /> {type.label}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">{type.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
        {step === 1 ? <Details draft={draft} errors={errors} setDraft={setDraft} /> : null}
        {step === 2 ? (
          <div>
            {ADDON_DEFS.map((addon) => (
              <ToggleRow
                key={addon.id}
                label={addon.label}
                hint={addon.hint}
                checked={Boolean(draft.addons?.[addon.id])}
                onChange={(checked) => setDraft({ addons: { ...draft.addons, [addon.id]: checked } })}
              />
            ))}
            <Slider label="Contingency" min={5} max={20} value={Math.round(draft.contingency * 100)} onChange={(value) => setDraft({ contingency: value / 100 })} />
            <Slider label="Overhead & Profit" min={8} max={20} value={Math.round(draft.overhead * 100)} onChange={(value) => setDraft({ overhead: value / 100 })} />
          </div>
        ) : null}
        {step === 3 ? (
          <div className="space-y-4">
            <InputField label="Desired start date" type="date" value={draft.startDate} onChange={(event) => setDraft({ startDate: event.target.value })} />
            <div>
              <p className="mb-2 text-sm font-medium">Preferred completion window</p>
              <Segmented
                value={draft.pace}
                options={[
                  { id: "standard", label: "Standard" },
                  { id: "fast", label: "Fast-track" },
                ]}
                onChange={(pace) => setDraft({ pace })}
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Crew size</p>
              <Segmented
                value={draft.crew}
                options={[
                  { id: "small", label: "Small" },
                  { id: "medium", label: "Medium" },
                  { id: "large", label: "Large" },
                ]}
                onChange={(crew) => setDraft({ crew })}
              />
            </div>
          </div>
        ) : null}
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-background">
        <div className="run-bar" aria-live="polite">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-white/60">Running estimate</p>
            <p className="font-display text-lg font-bold text-primary">{result ? money(result.total) : "—"}</p>
          </div>
          <p className="text-right text-xs text-white/70">{result ? `${money(result.low)} – ${money(result.high)}` : "Select a project type"}</p>
        </div>
        <div className="px-5 pb-4">
          <PrimaryButton onClick={continueStep} disabled={step === 0 && !chosen}>
            {step === 3 ? (params?.returnToResult ? "Update Estimate" : "See Estimate") : "Continue"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, min, max, value, onChange }: { label: string; min: number; max: number; value: number; onChange: (value: number) => void }) {
  return (
    <label className="mt-3 block">
      <span className="flex justify-between text-sm font-medium">
        {label}
        <span className="text-primary">{value}%</span>
      </span>
      <input className="mt-2 w-full accent-[var(--primary)]" type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function Details({
  draft,
  errors,
  setDraft,
}: {
  draft: ReturnType<typeof createInput>;
  errors: Record<string, string>;
  setDraft: (patch: Partial<ReturnType<typeof createInput>>) => void;
}) {
  const states = US_STATES.map(([value, label]) => ({ value, label }));
  return (
    <div className="space-y-3">
      <InputField label="Project Name" value={draft.projectName} error={errors.projectName} onChange={(event) => setDraft({ projectName: event.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <InputField
          label="ZIP code"
          inputMode="numeric"
          value={draft.zip}
          error={errors.zip}
          onChange={(event) => {
            const zip = event.target.value.replace(/\D/g, "").slice(0, 5);
            const found = zip.length === 5 ? stateFromZip(zip) : null;
            setDraft(found ? { zip, state: String(found) } : { zip });
          }}
        />
        <SelectField label="State" value={draft.state} error={errors.state} options={states} onChange={(state) => setDraft({ state })} />
      </div>
      <InputField label="Total Area (sq ft)" type="number" value={draft.area} error={errors.area} onChange={(event) => setDraft({ area: Number(event.target.value) })} />
      <div className="grid grid-cols-2 gap-3">
        <InputField label="Floors / Stories" type="number" value={draft.floors} onChange={(event) => setDraft({ floors: Number(event.target.value) })} />
        <InputField label="Ceiling Height (ft)" type="number" value={draft.ceilingHeight} onChange={(event) => setDraft({ ceilingHeight: Number(event.target.value) })} />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">Quality Level</p>
        <Segmented
          value={draft.quality}
          options={[
            { id: "economy", label: "Economy" },
            { id: "standard", label: "Standard" },
            { id: "premium", label: "Premium" },
            { id: "luxury", label: "Luxury" },
          ]}
          onChange={(quality) => setDraft({ quality })}
        />
      </div>
      <SelectField
        label="Site Condition"
        value={draft.site}
        onChange={(site) => setDraft({ site })}
        options={[
          { value: "easy", label: "Easy — open access" },
          { value: "average", label: "Average — typical site" },
          { value: "difficult", label: "Difficult — tight or occupied" },
        ]}
      />
      <TypeFields draft={draft} setDraft={setDraft} />
    </div>
  );
}

function TypeFields({ draft, setDraft }: { draft: ReturnType<typeof createInput>; setDraft: (patch: Partial<ReturnType<typeof createInput>>) => void }) {
  const type = draft.projectType;
  if (type === "new-home") {
    return (
      <>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Bedrooms" type="number" value={draft.bedrooms} onChange={(event) => setDraft({ bedrooms: Number(event.target.value) })} />
          <InputField label="Bathrooms" type="number" step="0.5" value={draft.bathrooms} onChange={(event) => setDraft({ bathrooms: Number(event.target.value) })} />
        </div>
        <SelectField label="Garage" value={String(draft.garage)} onChange={(garage) => setDraft({ garage })} options={["none", "1", "2", "3"].map((value) => ({ value: value === "none" ? "0" : value, label: value === "none" ? "None" : `${value} car` }))} />
        <SelectField label="Foundation" value={draft.foundation} onChange={(foundation) => setDraft({ foundation })} options={[["slab", "Slab"], ["crawl", "Crawl space"], ["basement", "Basement"]].map(([value, label]) => ({ value, label }))} />
        <SelectField label="Roof type" value={draft.roof} onChange={(roof) => setDraft({ roof })} options={[["gable", "Gable"], ["hip", "Hip"], ["flat", "Flat"]].map(([value, label]) => ({ value, label }))} />
        <SelectField label="Exterior finish" value={draft.exterior} onChange={(exterior) => setDraft({ exterior })} options={[["vinyl", "Vinyl"], ["fiber-cement", "Fiber cement"], ["brick", "Brick"], ["stone", "Stone"]].map(([value, label]) => ({ value, label }))} />
        <SelectField label="HVAC" value={draft.hvac} onChange={(hvac) => setDraft({ hvac })} options={[["central", "Central air"], ["heat-pump", "Heat pump"], ["mini-split", "Mini-split"]].map(([value, label]) => ({ value, label }))} />
      </>
    );
  }
  if (type === "addition") {
    return (
      <>
        <SelectField label="Addition type" value={draft.additionType} onChange={(additionType) => setDraft({ additionType })} options={[["bedroom", "Bedroom"], ["bathroom", "Bathroom"], ["family", "Family room"], ["second-story", "Second story"]].map(([value, label]) => ({ value, label }))} />
        <ToggleRow label="Connected to existing home" checked={draft.connected} onChange={(connected) => setDraft({ connected })} />
        <ToggleRow label="Foundation extension" checked={draft.foundationExtension} onChange={(foundationExtension) => setDraft({ foundationExtension })} />
      </>
    );
  }
  if (type === "deck") {
    return (
      <>
        <SelectField label="Deck material" value={draft.deckMaterial} onChange={(deckMaterial) => setDraft({ deckMaterial })} options={[["pressure-treated", "Pressure-treated"], ["cedar", "Cedar"], ["composite", "Composite"], ["pvc", "PVC"]].map(([value, label]) => ({ value, label }))} />
        <SelectField label="Railing" value={draft.railing} onChange={(railing) => setDraft({ railing })} options={[["wood", "Wood"], ["metal", "Metal"], ["cable", "Cable"], ["glass", "Glass"]].map(([value, label]) => ({ value, label }))} />
        <InputField label="Stair runs" type="number" value={draft.stairs} onChange={(event) => setDraft({ stairs: Number(event.target.value) })} />
        <ToggleRow label="Roof or pergola" checked={draft.pergola} onChange={(pergola) => setDraft({ pergola })} />
        <SelectField label="Height above ground" value={draft.deckHeight} onChange={(deckHeight) => setDraft({ deckHeight })} options={[["low", "At grade"], ["mid", "A few feet up"], ["high", "A story or more"]].map(([value, label]) => ({ value, label }))} />
      </>
    );
  }
  if (type === "attic") {
    return (
      <>
        <SelectField label="Insulation" value={draft.insulation} onChange={(insulation) => setDraft({ insulation })} options={[["existing", "Keep existing"], ["upgrade", "Upgrade"], ["full", "Full roof assembly"]].map(([value, label]) => ({ value, label }))} />
        <ToggleRow label="Add a dormer" checked={draft.dormer} onChange={(dormer) => setDraft({ dormer })} />
        <ToggleRow label="Add a bathroom" checked={draft.atticBath} onChange={(atticBath) => setDraft({ atticBath })} />
        <ToggleRow label="Stairs / access upgrade" checked={draft.atticStairs} onChange={(atticStairs) => setDraft({ atticStairs })} />
        <SelectField label="Flooring" value={draft.atticFloor} onChange={(atticFloor) => setDraft({ atticFloor })} options={[["carpet", "Carpet"], ["lvp", "Luxury vinyl"], ["hardwood", "Hardwood"]].map(([value, label]) => ({ value, label }))} />
      </>
    );
  }
  if (type === "basement") {
    return (
      <>
        <InputField label="Finished percentage" type="number" value={draft.finishedPct} onChange={(event) => setDraft({ finishedPct: Number(event.target.value) })} />
        <InputField label="Egress windows" type="number" value={draft.egress} onChange={(event) => setDraft({ egress: Number(event.target.value) })} />
        <ToggleRow label="Bathroom" checked={draft.basementBath} onChange={(basementBath) => setDraft({ basementBath })} />
        <ToggleRow label="Wet bar" checked={draft.wetBar} onChange={(wetBar) => setDraft({ wetBar })} />
        <ToggleRow label="Waterproofing" checked={draft.waterproofing} onChange={(waterproofing) => setDraft({ waterproofing })} />
        <SelectField label="Flooring" value={draft.basementFloor} onChange={(basementFloor) => setDraft({ basementFloor })} options={[["carpet", "Carpet"], ["lvp", "Luxury vinyl"], ["tile", "Tile"]].map(([value, label]) => ({ value, label }))} />
      </>
    );
  }
  if (type === "commercial") {
    return (
      <>
        <SelectField label="Space type" value={draft.spaceType} onChange={(spaceType) => setDraft({ spaceType })} options={[["office", "Office"], ["retail", "Retail"], ["restaurant", "Restaurant"], ["clinic", "Clinic"]].map(([value, label]) => ({ value, label }))} />
        <InputField label="Partition walls (linear ft)" type="number" value={draft.partitions} onChange={(event) => setDraft({ partitions: Number(event.target.value) })} />
        <SelectField label="Ceiling" value={draft.ceiling} onChange={(ceiling) => setDraft({ ceiling })} options={[["open", "Open"], ["act", "Acoustic tile"], ["drywall", "Drywall"]].map(([value, label]) => ({ value, label }))} />
        <SelectField label="Flooring" value={draft.commercialFloor} onChange={(commercialFloor) => setDraft({ commercialFloor })} options={[["carpet", "Carpet tile"], ["lvp", "LVP"], ["polished", "Polished concrete"]].map(([value, label]) => ({ value, label }))} />
        <SelectField label="Electrical / lighting" value={draft.electricalLevel} onChange={(electricalLevel) => setDraft({ electricalLevel })} options={[["basic", "Basic"], ["standard", "Standard"], ["premium", "Premium"]].map(([value, label]) => ({ value, label }))} />
        <SelectField label="HVAC modification" value={draft.hvacMod} onChange={(hvacMod) => setDraft({ hvacMod })} options={[["none", "None"], ["minor", "Minor"], ["full", "Full replacement"]].map(([value, label]) => ({ value, label }))} />
        <InputField label="Restrooms" type="number" value={draft.restrooms} onChange={(event) => setDraft({ restrooms: Number(event.target.value) })} />
      </>
    );
  }
  return (
    <SelectField label="Scope" value={draft.kitchenScope} onChange={(kitchenScope) => setDraft({ kitchenScope })} options={[["kitchen", "Kitchen"], ["bath", "Bath"], ["both", "Kitchen and bath"]].map(([value, label]) => ({ value, label }))} />
  );
}

export function ResultScreen() {
  const { screen, push, back } = useNav();
  const { draft, estimates, saveEstimate, updateEstimate, replaceDraft, toast } = useApp();
  const estimateId = screen.name === "result" ? screen.estimateId : undefined;
  const saved = estimates.find((item) => item.id === estimateId);
  const source = saved?.inputs || draft;
  const result = useMemo(() => calculateEstimate(source), [source]);
  const total = useCountUp(result.total);
  const [openMat, setOpenMat] = useState(true);
  const [openLab, setOpenLab] = useState(false);
  const [compare, setCompare] = useState(false);
  const [localId, setLocalId] = useState(estimateId);
  const active = estimates.find((item) => item.id === localId);

  const reportLines = () => [
    "CHIANELLI ESTIMATING",
    result.input.projectName || "Untitled project",
    `${result.typeLabel} · ${result.input.area} sq ft · ${result.input.quality}`,
    `Total ${money(result.total)} (${money(result.low)} - ${money(result.high)})`,
    `Cost per sq ft ${money(result.perSqft)}`,
    "",
    "SUMMARY",
    `Materials ${money(result.materials)}`,
    `Labour ${money(result.labour)}`,
    `Permits ${money(result.permits)}`,
    `Equipment ${money(result.equipment)}`,
    `Overhead & Profit ${money(result.overhead)}`,
    `Contingency ${money(result.contingency)}`,
    `Grand Total ${money(result.total)}`,
    "",
    "MATERIALS",
    ...result.materialLines.map((line: { name: string; qty: number; unit: string; unitPrice: number; total: number }) => `${line.name}: ${formatQty(line.qty)} ${line.unit} x ${moneyExact(line.unitPrice)} = ${money(line.total)}`),
    "",
    "LABOUR",
    ...result.labourLines.map((line: { trade: string; hours: number; rate: number; total: number }) => `${line.trade}: ${line.hours} hrs x ${money(line.rate)} = ${money(line.total)}`),
    "",
    `Duration ${result.durationLabel}`,
    ...result.phases.map((phase: { name: string; label: string }) => `${phase.name}: ${phase.label}`),
    "",
    "This is a preliminary estimate. Book an appointment for a detailed, on-site estimate.",
  ];

  return (
    <div className="screen">
      <TopBar title="Estimate" onBack={back} />
      <div className="scroll space-y-4 pb-8">
        <div className="rounded-2xl bg-ink p-4 text-white">
          <span className="mb-3 block h-1 w-10 rounded-full bg-primary" />
          <p className="font-display text-lg font-semibold">{result.input.projectName || "Untitled project"}</p>
          <p className="mt-1 text-xs text-white/70">
            {result.typeLabel} · {Number(result.input.area).toLocaleString("en-US")} sq ft · {result.input.quality}
          </p>
          <p className="mt-4 text-[11px] uppercase tracking-wide text-white/50">Total Estimated Cost</p>
          <p className="font-display text-[34px] font-bold leading-none text-primary">{money(total)}</p>
          <p className="mt-2 text-sm text-white/80">
            {money(result.low)} – {money(result.high)}
          </p>
          <span className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs">{money(result.perSqft)} / sq ft</span>
        </div>
        <div className="card p-4">
          <DonutChart slices={result.slices} />
        </div>
        <div className="card px-4">
          <button className="flex h-12 w-full items-center justify-between text-sm font-semibold" onClick={() => setOpenMat((value) => !value)}>
            Material breakdown <Lucide.ChevronDown size={18} className={openMat ? "rotate-180" : ""} />
          </button>
          {openMat ? (
            <div className="pb-3">
              {result.materialLines.map((line: { name: string; qty: number; unit: string; unitPrice: number; total: number }) => (
                <div key={line.name} className="grid grid-cols-[1fr_auto] gap-2 border-t border-line py-2 text-xs">
                  <span>
                    {line.name}
                    <span className="block text-muted-foreground">
                      {formatQty(line.qty)} {line.unit} × {moneyExact(line.unitPrice)}
                    </span>
                  </span>
                  <span className="font-semibold">{money(line.total)}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="card px-4">
          <button className="flex h-12 w-full items-center justify-between text-sm font-semibold" onClick={() => setOpenLab((value) => !value)}>
            Labour breakdown <Lucide.ChevronDown size={18} className={openLab ? "rotate-180" : ""} />
          </button>
          {openLab ? (
            <div className="pb-3">
              {result.labourLines.map((line: { trade: string; hours: number; rate: number; total: number }) => (
                <div key={line.trade} className="grid grid-cols-[1fr_auto] gap-2 border-t border-line py-2 text-xs">
                  <span>
                    {line.trade}
                    <span className="block text-muted-foreground">
                      {line.hours} hrs × {money(line.rate)}/hr
                    </span>
                  </span>
                  <span className="font-semibold">{money(line.total)}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="card p-4">
          <h2 className="font-display mb-1 text-base font-semibold">Time estimate</h2>
          <p className="mb-3 text-sm text-muted-foreground">{result.durationLabel}</p>
          <Gantt phases={result.phases} total={result.durationDays} />
        </div>
        <div className="card p-4 text-sm">
          {[
            ["Materials subtotal", result.materials],
            ["Labour subtotal", result.labour],
            ["Permits", result.permits],
            ["Equipment", result.equipment],
            ["Overhead & Profit", result.overhead],
            ["Contingency", result.contingency],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex justify-between border-b border-line py-2">
              <span className="text-muted-foreground">{label}</span>
              <span>{money(Number(value))}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3 font-display text-base font-bold">
            <span>Grand Total</span>
            <span className="text-primary">{money(result.total)}</span>
          </div>
        </div>
        <p className="rounded-2xl bg-muted px-4 py-3 text-xs leading-relaxed text-muted-foreground">This is a preliminary estimate. Book an appointment for a detailed, on-site estimate.</p>
        <PrimaryButton onClick={() => push({ name: "book", estimateId: active?.id })}>Book Appointment</PrimaryButton>
        <div className="grid grid-cols-2 gap-2">
          <SecondaryButton
            onClick={() => {
              if (active) {
                updateEstimate(active.id, { inputs: result.input });
                toast("Estimate updated");
              } else {
                const record = saveEstimate(result.input, "Draft");
                setLocalId(record.id);
                toast("Estimate saved");
              }
            }}
          >
            {active ? "Saved" : "Save Estimate"}
          </SecondaryButton>
          <SecondaryButton
            onClick={() => {
              downloadPdf(`${(result.input.projectName || "estimate").replace(/\s+/g, "-").toLowerCase()}.pdf`, reportLines());
              toast("PDF downloaded");
            }}
          >
            Download PDF
          </SecondaryButton>
          <SecondaryButton
            onClick={async () => {
              const mode = await shareOrCopy(result.input.projectName || "Estimate", reportLines().slice(0, 6).join("\n"));
              toast(mode === "copied" ? "Summary copied" : mode === "shared" ? "Shared" : "Share closed");
            }}
          >
            Share
          </SecondaryButton>
          <SecondaryButton
            onClick={() => {
              replaceDraft(createInput(result.input));
              push({ name: "calculator", startStep: 1, keepDraft: true, returnToResult: true, estimateId: active?.id });
            }}
          >
            Edit Inputs
          </SecondaryButton>
        </div>
        <SecondaryButton onClick={() => setCompare(true)}>Compare Quality Levels</SecondaryButton>
      </div>
      <BottomSheet open={compare} title="Quality comparison" onClose={() => setCompare(false)}>
        <div className="grid grid-cols-3 gap-2">
          {compareQualities(result.input).map((item) => (
            <button
              key={item.quality}
              className={`rounded-2xl border p-3 text-left ${result.input.quality === item.quality ? "border-primary" : "border-line"}`}
              onClick={() => {
                const next = createInput({ ...result.input, quality: item.quality });
                replaceDraft(next);
                if (active) updateEstimate(active.id, { inputs: next });
                setCompare(false);
              }}
            >
              <span className="text-[11px] uppercase text-muted-foreground">{item.quality}</span>
              <span className="mt-1 block font-display text-sm font-bold text-primary">{money(item.total)}</span>
              <span className="mt-1 block text-[11px] text-muted-foreground">{money(item.perSqft)}/sq ft</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Tap a column to apply that specification. Luxury stays available in the quality control.</p>
      </BottomSheet>
    </div>
  );
}

export function QuickListScreen() {
  const { push, back } = useNav();
  return (
    <div className="screen">
      <TopBar title="Quick Calculators" onBack={back} />
      <div className="scroll space-y-3">
        {QUICK_CALCS.map((calc) => (
          <button key={calc.id} className="lift card flex w-full items-center gap-3 p-2 text-left" onClick={() => push({ name: "quickCalc", calcId: calc.id })}>
            <img src={photo(calc.image)} alt="" className="h-16 w-16 rounded-xl object-cover" />
            <span>
              <span className="block font-semibold">{calc.title}</span>
              <span className="block text-xs text-muted-foreground">{calc.blurb}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function QuickCalcScreen() {
  const { screen, back, push } = useNav();
  const { replaceDraft } = useApp();
  const calc = QUICK_CALCS.find((item) => item.id === (screen.name === "quickCalc" ? screen.calcId : ""));
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries((calc?.fields || []).map((field) => [field.key, String(field.default)])));
  if (!calc) return null;
  const result = runQuickCalc(calc.id, values);
  return (
    <div className="screen">
      <TopBar title={calc.title} onBack={back} />
      <div className="scroll space-y-3">
        <p className="text-sm text-muted-foreground">{calc.blurb}</p>
        {calc.fields.map((field) =>
          field.type === "select" ? (
            <SelectField key={field.key} label={field.label} value={values[field.key]} onChange={(value) => setValues((current) => ({ ...current, [field.key]: value }))} options={(field.options || []).map(([value, label]) => ({ value, label }))} />
          ) : (
            <InputField key={field.key} label={field.label} type="number" value={values[field.key]} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} />
          ),
        )}
        <div className="rounded-2xl bg-ink p-4 text-white">
          <p className="text-xs uppercase tracking-wide text-white/60">Instant result</p>
          <p className="font-display text-3xl font-bold text-primary">{money(result.total)}</p>
          <p className="mt-1 text-sm text-white/70">
            {money(result.low)} – {money(result.high)}
            {result.perSqft ? ` · ${money(result.perSqft)}/sq ft` : ""}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-white/70">{result.detail}</p>
        </div>
        <PrimaryButton
          onClick={() => {
            replaceDraft(quickToInput(calc.id, values));
            push({ name: "calculator", startStep: 1, keepDraft: true });
          }}
        >
          Get Full Estimate
        </PrimaryButton>
      </div>
    </div>
  );
}

export function formatSavedDate(iso: string) {
  return formatDate(iso);
}
