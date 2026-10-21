import { useMemo, useState } from "react";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from "date-fns";
import { Check, MapPin } from "lucide-react";
import { services } from "../data/services";
import { estimators } from "../data/estimators";
import { appointmentTypes, budgetRanges, isSlotBooked, timeSlots, timezones } from "../data/bookings";
import { photo } from "../img/manifest";
import { useApp } from "../context/AppState";
import { useNav } from "../navigation/nav";
import { Chip, InputField, PrimaryButton, SecondaryButton, SelectField, StepIndicator, SuccessMark, TextAreaField, TopBar } from "../components/kit";
import { downloadIcs, shareOrCopy } from "../utils/files";
import { formatLongDate, todayISO } from "../utils/format";

type Draft = {
  serviceId: string;
  estimateId: string;
  type: string;
  estimatorId: string;
  date: string;
  time: string;
  timezone: string;
  address: string;
  description: string;
  budget: string;
  startDate: string;
  photos: string[];
  contactPref: string;
  agree: boolean;
};

function blank(serviceId = "", estimateId = ""): Draft {
  return {
    serviceId,
    estimateId,
    type: "",
    estimatorId: "",
    date: "",
    time: "",
    timezone: "Central (CT)",
    address: "",
    description: "",
    budget: "",
    startDate: "",
    photos: [],
    contactPref: "Call",
    agree: false,
  };
}

export function BookScreen() {
  const { screen, back, reset } = useNav();
  const { estimates, addBooking, toast, user } = useApp();
  const presetService = screen.name === "book" ? screen.serviceId || "" : "";
  const presetEstimate = screen.name === "book" ? screen.estimateId || "" : "";
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Draft>(() => blank(presetService, presetEstimate));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (patch: Partial<Draft>) => setForm((current) => ({ ...current, ...patch }));
  const service = services.find((item) => item.id === form.serviceId);

  const next = () => {
    if (step === 0 && !form.serviceId) return setError("Choose a service.");
    if (step === 1 && !form.type) return setError("Choose how you want to meet.");
    if (step === 2 && !form.estimatorId) return setError("Choose an estimator or no preference.");
    if (step === 3 && (!form.date || !form.time)) return setError("Pick a date and an open time.");
    if (step === 4 && form.address.trim().length < 6) return setError("Enter the site address.");
    setError("");
    setStep((value) => value + 1);
  };

  const confirm = () => {
    if (!form.agree) return setError("Agree to the appointment terms to confirm.");
    setLoading(true);
    window.setTimeout(() => {
      const id = `CE-${Math.floor(18000 + Math.random() * 7000)}`;
      addBooking({
        id,
        serviceId: form.serviceId,
        serviceName: service?.name || "Estimate",
        type: form.type,
        estimatorId: form.estimatorId === "any" ? "" : form.estimatorId,
        date: form.date,
        time: form.time,
        timezone: form.timezone,
        address: form.address,
        description: form.description,
        budget: form.budget,
        startDate: form.startDate,
        photos: form.photos,
        contactPref: form.contactPref,
        estimateId: form.estimateId || null,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      });
      toast("Appointment confirmed");
      reset({ name: "bookSuccess", bookingId: id });
    }, 700);
  };

  const steps = ["Service", "Type", "Estimator", "Date", "Project", "Review"];

  return (
    <div className="screen">
      <TopBar title="Book Appointment" onBack={step === 0 ? back : () => setStep((value) => value - 1)} />
      <div className="scroll pb-28">
        <StepIndicator steps={steps} current={step} />
        {error ? <p className="mb-3 rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary">{error}</p> : null}
        {step === 0 ? (
          <div className="space-y-3">
            {services.map((item) => (
              <button key={item.id} className={`card flex w-full items-center gap-3 p-2 text-left ${form.serviceId === item.id ? "ring-2 ring-primary" : ""}`} onClick={() => set({ serviceId: item.id })}>
                <img src={photo(item.image)} alt="" className="h-14 w-14 rounded-xl object-cover" />
                <span className="text-sm font-semibold">{item.name}</span>
              </button>
            ))}
            <SelectField
              label="Attach a saved estimate (optional)"
              value={form.estimateId}
              onChange={(estimateId) => set({ estimateId })}
              options={[{ value: "", label: "None" }, ...estimates.map((item) => ({ value: item.id, label: item.inputs.projectName || "Untitled estimate" }))]}
            />
          </div>
        ) : null}
        {step === 1 ? (
          <div className="space-y-3">
            {appointmentTypes.map((item) => (
              <button key={item.id} className={`card w-full p-4 text-left ${form.type === item.id ? "ring-2 ring-primary" : ""}`} onClick={() => set({ type: item.id })}>
                <span className="font-semibold">{item.title}</span>
                <span className="mt-1 block text-xs text-primary">{item.duration}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{item.description}</span>
              </button>
            ))}
          </div>
        ) : null}
        {step === 2 ? (
          <div className="space-y-3">
            <button className={`card w-full p-4 text-left ${form.estimatorId === "any" ? "ring-2 ring-primary" : ""}`} onClick={() => set({ estimatorId: "any" })}>
              <span className="font-semibold">No preference</span>
              <span className="mt-1 block text-sm text-muted-foreground">We will assign the next estimator who covers this service.</span>
            </button>
            {estimators.map((person) => (
              <button key={person.id} className={`card flex w-full items-center gap-3 p-3 text-left ${form.estimatorId === person.id ? "ring-2 ring-primary" : ""}`} onClick={() => set({ estimatorId: person.id })}>
                <img src={photo(person.photo)} alt="" className="h-14 w-14 rounded-full object-cover" />
                <span>
                  <span className="block font-semibold">{person.name}</span>
                  <span className="block text-xs text-muted-foreground">{person.specialty}</span>
                  <span className="block text-xs">{person.rating.toFixed(1)} · {person.years} years · {person.city}</span>
                </span>
              </button>
            ))}
          </div>
        ) : null}
        {step === 3 ? <DateTime value={form} onChange={set} /> : null}
        {step === 4 ? (
          <div className="space-y-3">
            <InputField label="Site address" value={form.address} onChange={(event) => set({ address: event.target.value })} placeholder={user ? `${user.city}, ${user.state}` : "Street, city, state"} />
            <div className="map-fake">
              <span className="absolute left-1/2 top-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-full place-items-center rounded-full bg-primary text-white">
                <MapPin size={16} />
              </span>
              <span className="absolute inset-x-3 bottom-3 rounded-xl bg-white/90 px-3 py-2 text-xs font-medium">{form.address || "Address preview"}</span>
            </div>
            <TextAreaField label="Project description" value={form.description} onChange={(description) => set({ description })} placeholder="What should the estimator know before they arrive?" />
            <p className="text-sm font-medium">Approximate budget</p>
            <div className="flex flex-wrap gap-2">
              {budgetRanges.map((range) => (
                <Chip key={range} active={form.budget === range} onClick={() => set({ budget: range })}>
                  {range}
                </Chip>
              ))}
            </div>
            <InputField label="Planned start date" type="date" value={form.startDate} onChange={(event) => set({ startDate: event.target.value })} />
            <label className="block text-sm font-medium">
              Upload photos / blueprints
              <input
                className="mt-2 block w-full text-sm"
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => {
                  const files = Array.from(event.target.files || []);
                  files.forEach((file) => {
                    const reader = new FileReader();
                    reader.onload = () => setForm((current) => ({ ...current, photos: [...current.photos, String(reader.result)] }));
                    reader.readAsDataURL(file);
                  });
                }}
              />
            </label>
            {form.photos.length ? (
              <div className="flex gap-2 overflow-x-auto">
                {form.photos.map((src, index) => (
                  <img key={index} src={src} alt="" className="h-16 w-16 rounded-xl object-cover" />
                ))}
              </div>
            ) : null}
            <SelectField label="Contact preference" value={form.contactPref} onChange={(contactPref) => set({ contactPref })} options={["Call", "Text", "Email"].map((value) => ({ value, label: value }))} />
          </div>
        ) : null}
        {step === 5 ? (
          <div className="space-y-3">
            <ReviewRow title="Service" body={service?.name || "—"} onEdit={() => setStep(0)} />
            <ReviewRow title="Appointment" body={appointmentTypes.find((item) => item.id === form.type)?.title || "—"} onEdit={() => setStep(1)} />
            <ReviewRow title="Estimator" body={form.estimatorId === "any" ? "No preference" : estimators.find((item) => item.id === form.estimatorId)?.name || "—"} onEdit={() => setStep(2)} />
            <ReviewRow title="When" body={`${formatLongDate(form.date)} · ${form.time} · ${form.timezone}`} onEdit={() => setStep(3)} />
            <ReviewRow title="Project" body={`${form.address}\n${form.description || "No description"}\nBudget ${form.budget || "not set"}`} onEdit={() => setStep(4)} />
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1" checked={form.agree} onChange={(event) => set({ agree: event.target.checked })} />
              <span>I agree that this books a preliminary consultation and the final estimate may change after the visit.</span>
            </label>
          </div>
        ) : null}
      </div>
      <div className="sticky-bar">
        {step < 5 ? <PrimaryButton onClick={next}>Continue</PrimaryButton> : <PrimaryButton loading={loading} onClick={confirm}>Confirm Appointment</PrimaryButton>}
      </div>
    </div>
  );
}

function ReviewRow({ title, body, onEdit }: { title: string; body: string; onEdit: () => void }) {
  return (
    <div className="card p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase text-muted-foreground">{title}</p>
        <button className="text-sm font-semibold text-primary" onClick={onEdit}>Edit</button>
      </div>
      <p className="mt-1 whitespace-pre-line text-sm">{body}</p>
    </div>
  );
}

export function DateTime({
  value,
  onChange,
}: {
  value: { date: string; time: string; timezone: string };
  onChange: (patch: Partial<{ date: string; time: string; timezone: string }>) => void;
}) {
  const [month, setMonth] = useState(new Date());
  const [mode, setMode] = useState<"days" | "month">("days");
  const upcoming = useMemo(() => {
    const start = new Date();
    return Array.from({ length: 14 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, []);
  const grid = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  });

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <Chip active={mode === "days"} onClick={() => setMode("days")}>Next days</Chip>
        <Chip active={mode === "month"} onClick={() => setMode("month")}>Month</Chip>
      </div>
      {mode === "days" ? (
        <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
          {upcoming.map((date) => {
            const iso = format(date, "yyyy-MM-dd");
            return (
              <button key={iso} className={`press h-16 w-14 shrink-0 rounded-2xl text-xs font-semibold ${value.date === iso ? "bg-primary text-white" : "bg-card"}`} onClick={() => onChange({ date: iso, time: "" })}>
                <span className="block">{format(date, "EEE")}</span>
                <span className="block text-base">{format(date, "d")}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="card mb-4 p-3">
          <div className="mb-2 flex items-center justify-between">
            <button className="h-10 px-2" onClick={() => setMonth((current) => addMonths(current, -1))}>Prev</button>
            <span className="text-sm font-semibold">{format(month, "MMMM yyyy")}</span>
            <button className="h-10 px-2" onClick={() => setMonth((current) => addMonths(current, 1))}>Next</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <span key={day + index} className="text-muted-foreground">{day}</span>
            ))}
            {grid.map((date) => {
              const iso = format(date, "yyyy-MM-dd");
              const disabled = iso < todayISO();
              return (
                <button key={iso} disabled={disabled} className={`h-9 rounded-lg text-xs ${value.date === iso ? "bg-primary text-white" : ""} ${disabled ? "text-muted-foreground/40" : ""}`} onClick={() => onChange({ date: iso, time: "" })}>
                  {format(date, "d")}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <p className="mb-2 text-xs text-muted-foreground">{value.timezone}</p>
      <div className="flex flex-wrap gap-2">
        {timeSlots.map((slot) => {
          const booked = value.date ? isSlotBooked(value.date, slot) : false;
          return (
            <button key={slot} disabled={!value.date || booked} className={`h-10 rounded-full px-3 text-xs font-semibold ${value.time === slot ? "bg-primary text-white" : "bg-card"} disabled:opacity-40`} onClick={() => onChange({ time: slot })}>
              {slot}
            </button>
          );
        })}
      </div>
      <div className="mt-4">
        <SelectField label="Timezone" value={value.timezone} onChange={(timezone) => onChange({ timezone })} options={timezones.map((zone) => ({ value: zone, label: zone }))} />
      </div>
    </div>
  );
}

export function BookSuccessScreen() {
  const { screen, reset, tab } = useNav();
  const { bookings, toast } = useApp();
  const booking = bookings.find((item) => item.id === (screen.name === "bookSuccess" ? screen.bookingId : "")) || bookings[0];
  if (!booking) return null;
  const when = new Date(`${booking.date}T${to24(booking.time)}`);
  return (
    <div className="screen">
      <div className="scroll flex flex-col items-center pt-16 text-center">
        <SuccessMark />
        <h1 className="font-display mt-4 text-2xl font-bold">You're booked</h1>
        <p className="mt-1 text-sm text-muted-foreground">Booking ID {booking.id}</p>
        <div className="card mt-5 w-full p-4 text-left text-sm">
          <p className="font-semibold">{booking.serviceName}</p>
          <p className="mt-1 text-muted-foreground">{formatLongDate(booking.date)} · {booking.time}</p>
          <p className="text-muted-foreground">{booking.address}</p>
          <p className="mt-2 inline-flex items-center gap-1 text-success"><Check size={14} /> Confirmed</p>
        </div>
        <div className="mt-4 w-full space-y-2">
          <PrimaryButton
            onClick={() => {
              if (!Number.isNaN(when.getTime())) downloadIcs({ title: `Chianelli · ${booking.serviceName}`, description: booking.description, start: when, location: booking.address, filename: `${booking.id}.ics` });
              toast("Calendar file downloaded");
            }}
          >
            Add to Calendar
          </PrimaryButton>
          <SecondaryButton
            onClick={async () => {
              const mode = await shareOrCopy(booking.id, `${booking.serviceName} on ${booking.date} at ${booking.time}. Booking ${booking.id}.`);
              toast(mode === "copied" ? "Details copied" : "Shared");
            }}
          >
            Share
          </SecondaryButton>
          <SecondaryButton onClick={() => tab("bookings")}>View My Bookings</SecondaryButton>
          <SecondaryButton onClick={() => reset({ name: "home" })}>Back to Home</SecondaryButton>
        </div>
      </div>
    </div>
  );
}

function to24(label: string) {
  const match = label.match(/(\d+):(\d+)\s*(AM|PM)/);
  if (!match) return "10:00:00";
  let hour = Number(match[1]);
  const minute = match[2];
  const mer = match[3];
  if (mer === "PM" && hour < 12) hour += 12;
  if (mer === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${minute}:00`;
}
