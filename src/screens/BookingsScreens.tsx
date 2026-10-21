import { useState } from "react";
import { Mail, MapPin, Phone, Video } from "lucide-react";
import { useApp } from "../context/AppState";
import { useNav } from "../navigation/nav";
import { BottomSheet, Chip, EmptyState, PrimaryButton, SecondaryButton, StatusBadge, TopBar, useWarmLoad, SkeletonList } from "../components/kit";
import { getEstimator } from "../data/estimators";
import { appointmentTypes, cancelReasons } from "../data/bookings";
import { DateTime } from "./BookingScreens";
import { formatLongDate } from "../utils/format";
import { photo } from "../img/manifest";

const tabs = ["Upcoming", "Completed", "Cancelled"] as const;

function group(status: string) {
  if (status === "cancelled") return "Cancelled";
  if (status === "completed") return "Completed";
  return "Upcoming";
}

export function BookingsScreen() {
  const { bookings } = useApp();
  const { push } = useNav();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Upcoming");
  const loading = useWarmLoad(360);
  const list = bookings.filter((booking) => group(booking.status) === tab);

  return (
    <div className="screen">
      <div className="scroll">
        <div className="under-status">
          <h1 className="font-display text-[28px] font-bold">Bookings</h1>
        </div>
        <div className="mt-4 flex gap-2">
          {tabs.map((item) => (
            <Chip key={item} active={tab === item} onClick={() => setTab(item)}>
              {item}
            </Chip>
          ))}
        </div>
        {loading ? (
          <div className="mt-4">
            <SkeletonList />
          </div>
        ) : list.length ? (
          <div className="mt-4 space-y-3">
            {list.map((booking) => {
              const estimator = getEstimator(booking.estimatorId || "");
              const kind = appointmentTypes.find((item) => item.id === booking.type);
              return (
                <button key={booking.id} className="card w-full p-4 text-left" onClick={() => push({ name: "booking", bookingId: booking.id })}>
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-display font-semibold">{booking.serviceName}</span>
                    <StatusBadge status={booking.status} />
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {formatLongDate(booking.date)} · {booking.time}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {estimator?.name || "No preference"} · {kind?.title}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState title={`No ${tab.toLowerCase()} bookings`} body="When you book an estimator, the visit will land in the right tab." action="Book Appointment" onAction={() => push({ name: "book" })} />
          </div>
        )}
      </div>
    </div>
  );
}

const timeline = [
  ["requested", "Requested"],
  ["confirmed", "Confirmed"],
  ["assigned", "Estimator Assigned"],
  ["completed", "Completed"],
] as const;

function doneThrough(status: string) {
  if (status === "completed") return 4;
  if (status === "assigned") return 3;
  if (status === "confirmed") return 2;
  if (status === "cancelled") return 1;
  return 1;
}

export function BookingDetailScreen() {
  const { screen, back, push } = useNav();
  const { bookings, updateBooking, toast } = useApp();
  const booking = bookings.find((item) => item.id === (screen.name === "booking" ? screen.bookingId : ""));
  const [cancel, setCancel] = useState(false);
  const [reason, setReason] = useState(cancelReasons[0]);
  if (!booking) return null;
  const estimator = getEstimator(booking.estimatorId || "");
  const kind = appointmentTypes.find((item) => item.id === booking.type);
  const progress = doneThrough(booking.status);

  return (
    <div className="screen">
      <TopBar title={booking.id} onBack={back} />
      <div className="scroll space-y-4 pb-8">
        <div className="card p-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-xl font-bold">{booking.serviceName}</h1>
              <p className="text-sm text-muted-foreground">{kind?.title} · {kind?.duration}</p>
            </div>
            <StatusBadge status={booking.status} />
          </div>
          <p className="mt-3 text-sm font-medium">{formatLongDate(booking.date)} · {booking.time}</p>
          <p className="text-xs text-muted-foreground">{booking.timezone}</p>
        </div>
        <div className="card p-4">
          <h2 className="mb-3 text-sm font-semibold">Status</h2>
          <ol className="space-y-3">
            {timeline.map(([id, label], index) => (
              <li key={id} className="flex items-center gap-3 text-sm">
                <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold ${index < progress ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>{index + 1}</span>
                <span className={index < progress ? "font-medium" : "text-muted-foreground"}>{label}</span>
              </li>
            ))}
          </ol>
          {booking.status === "cancelled" && booking.cancelReason ? <p className="mt-3 text-xs text-primary">Cancelled: {booking.cancelReason}</p> : null}
        </div>
        {estimator ? (
          <div className="card flex items-center gap-3 p-3">
            <img src={photo(estimator.photo)} alt="" className="h-14 w-14 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{estimator.name}</p>
              <p className="text-xs text-muted-foreground">{estimator.specialty}</p>
            </div>
            <a aria-label="Call estimator" className="grid h-12 w-12 place-items-center rounded-full bg-muted" href={`tel:${estimator.phone.replace(/\D/g, "")}`}><Phone size={18} /></a>
            <a aria-label="Email estimator" className="grid h-12 w-12 place-items-center rounded-full bg-muted" href={`mailto:${estimator.email}`}><Mail size={18} /></a>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No estimator preference. We will assign one before the visit.</p>
        )}
        <div className="card p-4 text-sm">
          <p className="font-semibold">Project</p>
          <p className="mt-1">{booking.address}</p>
          <p className="mt-2 text-muted-foreground">{booking.description}</p>
          <p className="mt-2 text-xs">Budget {booking.budget || "not set"} · Start {booking.startDate || "flexible"} · Prefer {booking.contactPref}</p>
        </div>
        {booking.photos?.length ? (
          <div className="flex gap-2 overflow-x-auto">
            {booking.photos.map((src, index) => (
              <img key={index} src={src} alt="" className="h-20 w-20 rounded-xl object-cover" />
            ))}
          </div>
        ) : null}
        {group(booking.status) === "Upcoming" ? (
          <div className="grid grid-cols-2 gap-2">
            <SecondaryButton onClick={() => push({ name: "reschedule", bookingId: booking.id })}>Reschedule</SecondaryButton>
            <SecondaryButton onClick={() => setCancel(true)}>Cancel</SecondaryButton>
            {booking.type === "virtual" ? (
              <PrimaryButton
                className="col-span-2"
                onClick={() => {
                  window.open("https://meet.google.com/lookup/chianelli-estimate", "_blank");
                  toast("Opening the meeting link");
                }}
              >
                <Video size={16} /> Join Meeting
              </PrimaryButton>
            ) : null}
            {booking.type === "onsite" ? (
              <PrimaryButton className="col-span-2" onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(booking.address)}`, "_blank")}>
                <MapPin size={16} /> Get Directions
              </PrimaryButton>
            ) : null}
            {booking.type === "phone" && estimator ? (
              <PrimaryButton className="col-span-2" onClick={() => { window.location.href = `tel:${estimator.phone.replace(/\D/g, "")}`; }}>
                <Phone size={16} /> Call Estimator
              </PrimaryButton>
            ) : null}
          </div>
        ) : null}
      </div>
      <BottomSheet open={cancel} title="Cancel appointment" onClose={() => setCancel(false)}>
        <div className="flex flex-wrap gap-2">
          {cancelReasons.map((item) => (
            <Chip key={item} active={reason === item} onClick={() => setReason(item)}>
              {item}
            </Chip>
          ))}
        </div>
        <div className="mt-4">
          <PrimaryButton
            onClick={() => {
              updateBooking(booking.id, { status: "cancelled", cancelReason: reason });
              toast("Appointment cancelled");
              setCancel(false);
              back();
            }}
          >
            Confirm Cancel
          </PrimaryButton>
        </div>
      </BottomSheet>
    </div>
  );
}

export function RescheduleScreen() {
  const { screen, back } = useNav();
  const { bookings, updateBooking, toast } = useApp();
  const booking = bookings.find((item) => item.id === (screen.name === "reschedule" ? screen.bookingId : ""));
  const [value, setValue] = useState({ date: booking?.date || "", time: "", timezone: booking?.timezone || "Central (CT)" });
  if (!booking) return null;
  return (
    <div className="screen">
      <TopBar title="Reschedule" onBack={back} />
      <div className="scroll pb-28">
        <DateTime value={value} onChange={(patch) => setValue((current) => ({ ...current, ...patch }))} />
      </div>
      <div className="sticky-bar">
        <PrimaryButton
          disabled={!value.date || !value.time}
          onClick={() => {
            updateBooking(booking.id, { date: value.date, time: value.time, timezone: value.timezone, status: "confirmed" });
            toast("Appointment rescheduled");
            back();
          }}
        >
          Save new time
        </PrimaryButton>
      </div>
    </div>
  );
}
