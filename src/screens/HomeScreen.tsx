import { useMemo, useState } from "react";
import { Bell, Calculator, CalendarPlus, ClipboardList, FolderKanban, Mail, MapPin, MessageCircle, Phone, Search } from "lucide-react";
import { useApp } from "../context/AppState";
import { useNav } from "../navigation/nav";
import { ProjectCard, SectionHeader, Stars, StatCard } from "../components/kit";
import { services } from "../data/services";
import { projects } from "../data/projects";
import { testimonials } from "../data/testimonials";
import { companyStats, howItWorks } from "../data/content";
import { photo } from "../img/manifest";
import { getEstimator } from "../data/estimators";
import { money, todayISO } from "../utils/format";
import { calculateEstimate, withProjectType } from "../utils/estimateCalculator";
import { PROJECT_TYPES } from "../data/rates";

export function HomeScreen() {
  const { user, bookings, notifications, draft, replaceDraft } = useApp();
  const { push, tab } = useNav();
  const [query, setQuery] = useState("");
  const first = user?.fullName.split(" ")[0] || "there";
  const unread = notifications.filter((item) => item.unread).length;
  const upcoming = bookings
    .filter((item) => !["completed", "cancelled"].includes(item.status) && item.date >= todayISO())
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const actions = [
    { label: "New Estimate", icon: Calculator, onClick: () => push({ name: "calculator", startStep: 0 }) },
    { label: "Book Appointment", icon: CalendarPlus, onClick: () => push({ name: "book" }) },
    { label: "My Estimates", icon: ClipboardList, onClick: () => push({ name: "estimates" }) },
    { label: "Previous Projects", icon: FolderKanban, onClick: () => tab("projects") },
  ];

  return (
    <div className="screen">
      <div className="scroll no-scrollbar">
        <header className="under-status flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Hello,</p>
            <h1 className="font-display text-[28px] font-bold">{first}</h1>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-card px-3 py-1 text-xs font-medium shadow-sm">
              <MapPin size={13} className="text-primary" />
              {user?.city || "Austin"}, {user?.state || "TX"}
            </span>
          </div>
          <button aria-label="Notifications" className="press relative grid h-12 w-12 place-items-center rounded-full bg-card shadow-sm" onClick={() => push({ name: "notifications" })}>
            <Bell size={20} />
            {unread ? <span className="absolute right-2 top-2 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">{unread}</span> : null}
          </button>
        </header>

        <form
          className="mt-4"
          onSubmit={(event) => {
            event.preventDefault();
            push({ name: "search", query });
          }}
        >
          <label className="flex h-12 items-center gap-2 rounded-xl bg-card px-3 shadow-sm">
            <Search size={18} className="text-muted-foreground" />
            <input className="h-full flex-1 bg-transparent text-sm outline-none" placeholder="Search services, projects, estimates" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
        </form>

        <button className="lift mt-5 flex w-full overflow-hidden rounded-2xl bg-ink text-left text-white" onClick={() => push({ name: "calculator", startStep: 0 })}>
          <span className="flex flex-1 flex-col p-4">
            <span className="mb-2 h-1 w-10 rounded-full bg-primary" />
            <span className="font-display text-lg font-semibold">Get Your Free Quick Estimate</span>
            <span className="mt-1 text-xs text-white/70">Labour, materials, and time in a few steps.</span>
            <span className="press mt-4 inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold">Start Estimate</span>
          </span>
          <img src={photo("hero-estimate")} alt="" className="h-40 w-32 object-cover" />
        </button>

        <div className="mt-5 grid grid-cols-4 gap-2">
          {actions.map((action) => (
            <button key={action.label} className="lift card flex min-h-[92px] flex-col items-center justify-center gap-2 px-1 py-3 text-center" onClick={action.onClick}>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                <action.icon size={18} />
              </span>
              <span className="text-[11px] font-medium leading-tight">{action.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-7">
          <SectionHeader title="Our Services" action="View All" onAction={() => push({ name: "services" })} />
          <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5">
            {services.map((service) => (
              <button key={service.id} className="lift w-44 shrink-0 overflow-hidden rounded-2xl bg-card text-left shadow-sm" onClick={() => push({ name: "service", serviceId: service.id })}>
                <img src={photo(service.image)} alt="" className="h-24 w-full object-cover" />
                <span className="block p-3">
                  <span className="block text-sm font-semibold">{service.name}</span>
                  <span className="mt-1 block text-xs font-semibold text-primary">{service.priceLabel}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7">
          <SectionHeader title="Popular Calculators" action="Quick tools" onAction={() => push({ name: "quick" })} />
          <div className="grid grid-cols-2 gap-3">
            {PROJECT_TYPES.slice(0, 4).map((type) => (
              <button
                key={type.id}
                className="lift card p-3 text-left"
                onClick={() => {
                  replaceDraft(withProjectType(draft, type.id));
                  push({ name: "calculator", presetType: type.id, startStep: 1 });
                }}
              >
                <img src={photo(type.image)} alt="" className="h-16 w-full rounded-xl object-cover" />
                <span className="mt-2 block text-sm font-semibold">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7">
          <SectionHeader title="Featured Projects" action="View All" onAction={() => tab("projects")} />
          <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5">
            {projects.slice(0, 5).map((project) => (
              <ProjectCard
                key={project.id}
                compact
                image={photo(project.images[0])}
                title={project.title}
                location={project.location}
                cost={money(project.cost)}
                onClick={() => push({ name: "project", projectId: project.id })}
              />
            ))}
          </div>
        </div>

        <div className="mt-7">
          <SectionHeader title="How It Works" />
          <div className="grid grid-cols-2 gap-3">
            {howItWorks.map((item) => (
              <div key={item.step} className="card p-3">
                <div className="font-display text-lg font-bold text-primary">{item.step}</div>
                <div className="mt-1 text-sm font-semibold">{item.title}</div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-7 grid grid-cols-3 gap-2 rounded-2xl bg-ink px-3 py-5">
          {companyStats.map((stat) => (
            <StatCard key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>

        <div className="mt-7">
          <SectionHeader title="Testimonials" />
          <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5">
            {testimonials.map((item) => (
              <article key={item.id} className="card w-64 shrink-0 p-4">
                <Stars value={item.rating} />
                <p className="mt-2 text-sm leading-relaxed">“{item.quote}”</p>
                <p className="mt-3 text-xs font-semibold">{item.name}</p>
                <p className="text-[11px] text-muted-foreground">{item.role}</p>
              </article>
            ))}
          </div>
        </div>

        {upcoming ? <Upcoming bookingId={upcoming.id} /> : null}

        <div className="card mt-7 p-4">
          <h2 className="font-display text-lg font-semibold">Talk with the team</h2>
          <p className="mt-1 text-sm text-muted-foreground">Austin studio · weekdays 8:00 AM–6:00 PM CT</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <a className="press flex h-12 items-center justify-center gap-1 rounded-full bg-primary text-sm font-semibold text-white" href="tel:15125550142">
              <Phone size={16} /> Call
            </a>
            <a className="press flex h-12 items-center justify-center gap-1 rounded-full border border-ink text-sm font-semibold" href="mailto:hello@chianelliestimating.com">
              <Mail size={16} /> Email
            </a>
            <a className="press flex h-12 items-center justify-center gap-1 rounded-full border border-ink text-sm font-semibold" href="https://wa.me/15125550142" target="_blank" rel="noreferrer">
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Upcoming({ bookingId }: { bookingId: string }) {
  const { bookings } = useApp();
  const { push } = useNav();
  const booking = bookings.find((item) => item.id === bookingId);
  const estimator = getEstimator(booking?.estimatorId || "");
  if (!booking) return null;
  return (
    <div className="mt-7">
      <SectionHeader title="Upcoming appointment" />
      <div className="card flex items-center gap-3 p-4">
        <div>
          <p className="font-display text-sm font-semibold">{booking.serviceName}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {booking.date} · {booking.time}
          </p>
          <p className="text-xs text-muted-foreground">{estimator?.name || "Estimator assigned"}</p>
        </div>
        <button className="press ml-auto h-10 rounded-full bg-primary px-4 text-sm font-semibold text-white" onClick={() => push({ name: "booking", bookingId: booking.id })}>
          View
        </button>
      </div>
    </div>
  );
}

export function SearchScreen() {
  const { screen, back, push, tab } = useNav();
  const { estimates } = useApp();
  const initial = screen.name === "search" ? screen.query || "" : "";
  const [query, setQuery] = useState(initial);
  const q = query.trim().toLowerCase();
  const serviceHits = useMemo(() => services.filter((item) => `${item.name} ${item.summary}`.toLowerCase().includes(q)), [q]);
  const projectHits = useMemo(() => projects.filter((item) => `${item.title} ${item.location} ${item.category}`.toLowerCase().includes(q)), [q]);
  const estimateHits = useMemo(
    () => estimates.filter((item) => `${item.inputs.projectName} ${item.inputs.projectType}`.toLowerCase().includes(q)),
    [estimates, q],
  );

  return (
    <div className="screen">
      <div className="under-status flex items-center gap-2 px-4 pb-2">
        <button className="text-sm font-semibold text-primary" onClick={() => back()}>
          Cancel
        </button>
        <input autoFocus className="field" placeholder="Search services, projects, estimates" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <div className="scroll">
        {!q ? <p className="text-sm text-muted-foreground">Try “deck”, “Dallas”, or a project name.</p> : null}
        {q && !serviceHits.length && !projectHits.length && !estimateHits.length ? (
          <p className="text-sm text-muted-foreground">No matches for “{query}”.</p>
        ) : null}
        {serviceHits.length ? (
          <div className="mb-4">
            <SectionHeader title="Services" />
            {serviceHits.map((service) => (
              <button key={service.id} className="mb-2 block w-full text-left text-sm font-semibold" onClick={() => push({ name: "service", serviceId: service.id })}>
                {service.name}
              </button>
            ))}
          </div>
        ) : null}
        {projectHits.length ? (
          <div className="mb-4">
            <SectionHeader title="Projects" />
            {projectHits.map((project) => (
              <button key={project.id} className="mb-2 block w-full text-left text-sm font-semibold" onClick={() => push({ name: "project", projectId: project.id })}>
                {project.title}
                <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{project.location}</span>
              </button>
            ))}
          </div>
        ) : null}
        {estimateHits.length ? (
          <div>
            <SectionHeader title="Estimates" action="See all" onAction={() => tab("estimate")} />
            {estimateHits.map((estimate) => (
              <button
                key={estimate.id}
                className="mb-2 block w-full text-left text-sm font-semibold"
                onClick={() => push({ name: "result", estimateId: estimate.id })}
              >
                {estimate.inputs.projectName || "Untitled estimate"}
                <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{money(calculateEstimate(estimate.inputs).total)}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
