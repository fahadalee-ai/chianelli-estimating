import { useMemo, useState } from "react";
import { Check, Heart, Search } from "lucide-react";
import { services } from "../data/services";
import { projects } from "../data/projects";
import { photo } from "../img/manifest";
import { useApp } from "../context/AppState";
import { useNav } from "../navigation/nav";
import { Chip, EmptyState, PrimaryButton, SecondaryButton, ServiceCard, SkeletonList, Stars, TopBar, useWarmLoad } from "../components/kit";
import { DonutChart } from "../components/Charts";
import { withProjectType } from "../utils/estimateCalculator";

export function ServicesScreen() {
  const { push, back } = useNav();
  const loading = useWarmLoad();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const list = useMemo(
    () =>
      services.filter((service) => {
        const matchesFilter = filter === "all" || service.category === filter;
        const matchesQuery = `${service.name} ${service.summary}`.toLowerCase().includes(query.trim().toLowerCase());
        return matchesFilter && matchesQuery;
      }),
    [filter, query],
  );

  return (
    <div className="screen">
      <TopBar title="Services" onBack={back} />
      <div className="scroll">
        <label className="mb-3 flex h-12 items-center gap-2 rounded-xl bg-card px-3 shadow-sm">
          <Search size={18} className="text-muted-foreground" />
          <input className="h-full flex-1 bg-transparent text-sm outline-none" placeholder="Search services" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <div className="mb-4 flex gap-2">
          {[
            ["all", "All"],
            ["residential", "Residential"],
            ["commercial", "Commercial"],
          ].map(([id, label]) => (
            <Chip key={id} active={filter === id} onClick={() => setFilter(id)}>
              {label}
            </Chip>
          ))}
        </div>
        {loading ? (
          <SkeletonList />
        ) : list.length ? (
          <div className="space-y-3">
            {list.map((service) => (
              <ServiceCard
                key={service.id}
                image={photo(service.image)}
                title={service.name}
                description={service.summary}
                price={service.priceLabel}
                onClick={() => push({ name: "service", serviceId: service.id })}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No services match" body="Try another filter or a broader search." />
        )}
      </div>
    </div>
  );
}

export function ServiceDetailScreen() {
  const { screen, back, push } = useNav();
  const { favoriteServices, toggleFavoriteService, draft, replaceDraft } = useApp();
  const serviceId = screen.name === "service" ? screen.serviceId : "";
  const service = services.find((item) => item.id === serviceId);
  const [tab, setTab] = useState("Overview");
  const [viewer, setViewer] = useState<number | null>(null);
  if (!service) return null;
  const saved = favoriteServices.includes(service.id);
  const related = projects.filter((project) => service.projectCategory === "all-residential" || project.category === service.projectCategory).slice(0, 4);

  const openCalculator = () => {
    if (service.calculatorType) replaceDraft(withProjectType(draft, service.calculatorType));
    push({ name: "calculator", presetType: service.calculatorType || undefined, startStep: service.calculatorType ? 1 : 0 });
  };

  return (
    <div className="screen">
      <div className="scroll pb-28">
        <div className="relative -mx-5 -mt-2 h-64">
          <img src={photo(service.image)} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/30" />
          <button aria-label="Back" className="press absolute left-4 top-14 grid h-12 w-12 place-items-center rounded-full bg-white/90" onClick={() => back()}>
            ←
          </button>
          <button aria-label={saved ? "Remove favorite" : "Save service"} className="press absolute right-4 top-14 grid h-12 w-12 place-items-center rounded-full bg-white/90" onClick={() => toggleFavoriteService(service.id)}>
            <Heart size={18} className={saved ? "fill-primary text-primary" : ""} />
          </button>
        </div>
        <h1 className="font-display mt-4 text-[26px] font-bold">{service.name}</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{service.summary}</p>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <Stars value={service.rating} />
          <span className="font-semibold">{service.rating.toFixed(1)}</span>
          <span className="text-muted-foreground">({service.reviews})</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-card px-3 py-2 text-xs font-medium shadow-sm">Typical timeline · {service.timeline}</span>
          <span className="rounded-full bg-card px-3 py-2 text-xs font-medium shadow-sm">Typical cost · {service.range}</span>
        </div>
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
          {["Overview", "What's Included", "Cost Factors", "Gallery"].map((item) => (
            <Chip key={item} active={tab === item} onClick={() => setTab(item)}>
              {item}
            </Chip>
          ))}
        </div>
        <div className="mt-4">
          {tab === "Overview" ? (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed">{service.overview}</p>
              <ul className="space-y-2">
                {service.benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-2 text-sm">
                    <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                    {benefit}
                  </li>
                ))}
              </ul>
              {service.packages ? (
                <div className="space-y-2">
                  {service.packages.map((item) => (
                    <div key={item.name} className="card p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{item.name}</span>
                        <span className="font-semibold text-primary">${item.price.toLocaleString("en-US")}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
          {tab === "What's Included" ? (
            <ul className="space-y-2">
              {service.included.map((item) => (
                <li key={item} className="card flex items-center gap-2 px-3 py-3 text-sm font-medium">
                  <Check size={16} className="text-success" /> {item}
                </li>
              ))}
            </ul>
          ) : null}
          {tab === "Cost Factors" ? (
            <ul className="space-y-2">
              {service.factors.map((item) => (
                <li key={item} className="card px-3 py-3 text-sm">{item}</li>
              ))}
            </ul>
          ) : null}
          {tab === "Gallery" ? (
            <div className="grid grid-cols-2 gap-2">
              {service.gallery.map((key, index) => (
                <button key={key + index} onClick={() => setViewer(index)}>
                  <img src={photo(key)} alt="" className="h-32 w-full rounded-xl object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="card mt-5 p-4">
          <h2 className="font-display text-base font-semibold">Sample Cost Breakdown</h2>
          <div className="mt-3">
            <DonutChart slices={service.sampleSplit.map((slice) => ({ ...slice, value: slice.pct }))} />
          </div>
        </div>
        {related.length ? (
          <div className="mt-5">
            <h2 className="font-display mb-3 text-base font-semibold">Related Projects</h2>
            <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5">
              {related.map((project) => (
                <button key={project.id} className="w-40 shrink-0 text-left" onClick={() => push({ name: "project", projectId: project.id })}>
                  <img src={photo(project.images[0])} alt="" className="h-24 w-full rounded-xl object-cover" />
                  <span className="mt-1 block text-sm font-semibold">{project.title}</span>
                  <span className="text-xs text-muted-foreground">{project.location}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div className="sticky-bar">
        <PrimaryButton className="w-auto flex-1" onClick={openCalculator}>Calculate Estimate</PrimaryButton>
        <SecondaryButton className="w-auto flex-1" onClick={() => push({ name: "book", serviceId: service.id })}>Book Appointment</SecondaryButton>
      </div>
      {viewer !== null ? (
        <div className="absolute inset-0 z-40 flex flex-col bg-ink text-white">
          <button className="under-status px-5 text-left text-sm font-semibold" onClick={() => setViewer(null)}>
            Close
          </button>
          <img src={photo(service.gallery[viewer])} alt="" className="m-auto max-h-[70%] w-full object-contain" />
          <div className="flex justify-between px-5 pb-6">
            <button className="h-12 px-4" onClick={() => setViewer((value) => (value! + service.gallery.length - 1) % service.gallery.length)}>
              Previous
            </button>
            <button className="h-12 px-4" onClick={() => setViewer((value) => (value! + 1) % service.gallery.length)}>
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
