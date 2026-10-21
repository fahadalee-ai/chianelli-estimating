import { useMemo, useState } from "react";
import { Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { projects } from "../data/projects";
import { photo } from "../img/manifest";
import { useApp } from "../context/AppState";
import { useNav } from "../navigation/nav";
import { Chip, EmptyState, PrimaryButton, ProjectCard, SecondaryButton, SkeletonList, Stars, TopBar, useWarmLoad } from "../components/kit";
import { DonutChart } from "../components/Charts";
import { createInput } from "../utils/estimateCalculator";
import { money } from "../utils/format";

const filters = [
  ["all", "All"],
  ["decks", "Decks"],
  ["additions", "Additions"],
  ["attic", "Attic"],
  ["basement", "Basement"],
  ["home", "Home Building"],
  ["commercial", "Commercial"],
];

export function ProjectsScreen() {
  const { push } = useNav();
  const loading = useWarmLoad();
  const [filter, setFilter] = useState("all");
  const list = useMemo(() => projects.filter((project) => filter === "all" || project.category === filter), [filter]);

  return (
    <div className="screen">
      <div className="scroll">
        <div className="under-status">
          <h1 className="font-display text-[28px] font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground">Finished work with real contract values.</p>
        </div>
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
          {filters.map(([id, label]) => (
            <Chip key={id} active={filter === id} onClick={() => setFilter(id)}>
              {label}
            </Chip>
          ))}
        </div>
        {loading ? (
          <div className="mt-4">
            <SkeletonList />
          </div>
        ) : list.length ? (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {list.map((project) => (
              <ProjectCard key={project.id} image={photo(project.images[0])} title={project.title} location={project.location} cost={money(project.cost)} onClick={() => push({ name: "project", projectId: project.id })} />
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState title="Nothing in this category" body="Try another filter to see finished decks, additions, and fit-outs." />
          </div>
        )}
      </div>
    </div>
  );
}

export function ProjectDetailScreen() {
  const { screen, back, push } = useNav();
  const { favoriteProjects, toggleFavoriteProject, replaceDraft } = useApp();
  const project = projects.find((item) => item.id === (screen.name === "project" ? screen.projectId : ""));
  const [index, setIndex] = useState(0);
  const [before, setBefore] = useState(false);
  if (!project) return null;
  const saved = favoriteProjects.includes(project.id);
  const images = project.images;
  const slices = [
    { key: "materials", label: "Materials", value: project.breakdown.materials, pct: project.breakdown.materials },
    { key: "labour", label: "Labour", value: project.breakdown.labour, pct: project.breakdown.labour },
    { key: "equipment", label: "Other", value: project.breakdown.other, pct: project.breakdown.other },
  ];

  return (
    <div className="screen">
      <TopBar
        title="Project"
        onBack={back}
        right={
          <button aria-label={saved ? "Unsave project" : "Save project"} onClick={() => toggleFavoriteProject(project.id)}>
            <Bookmark size={20} className={saved ? "fill-primary text-primary" : ""} />
          </button>
        }
      />
      <div className="scroll space-y-4 pb-28">
        <div className="relative">
          <img src={photo(images[index])} alt="" className="h-52 w-full rounded-2xl object-cover" />
          {images.length > 1 ? (
            <>
              <button aria-label="Previous photo" className="press absolute left-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90" onClick={() => setIndex((value) => (value + images.length - 1) % images.length)}>
                <ChevronLeft size={18} />
              </button>
              <button aria-label="Next photo" className="press absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90" onClick={() => setIndex((value) => (value + 1) % images.length)}>
                <ChevronRight size={18} />
              </button>
            </>
          ) : null}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">{project.title}</h1>
          <p className="text-sm text-muted-foreground">{project.location}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            ["Completed", project.completed],
            ["Size", `${project.size.toLocaleString("en-US")} sq ft`],
            ["Duration", project.duration],
            ["Final cost", money(project.cost)],
            ["Quality", project.quality],
          ].map(([label, value]) => (
            <div key={label} className="card p-3">
              <p className="text-[11px] text-muted-foreground">{label}</p>
              <p className="font-semibold">{value}</p>
            </div>
          ))}
        </div>
        <div>
          <h2 className="font-display mb-2 text-base font-semibold">Scope of work</h2>
          <ul className="space-y-2">
            {project.scope.map((item) => (
              <li key={item} className="card px-3 py-3 text-sm">{item}</li>
            ))}
          </ul>
        </div>
        <div className="card p-4">
          <h2 className="font-display mb-2 text-base font-semibold">Cost breakdown</h2>
          <DonutChart slices={slices} />
        </div>
        {project.before && project.after ? (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold">Before / after</h2>
              <button className="text-sm font-semibold text-primary" onClick={() => setBefore((value) => !value)}>
                {before ? "Show after" : "Show before"}
              </button>
            </div>
            <img src={photo(before ? project.before : project.after)} alt={before ? "Before the remodel" : "After the remodel"} className="h-48 w-full rounded-2xl object-cover" />
          </div>
        ) : null}
        <article className="card p-4">
          <Stars value={5} />
          <p className="mt-2 text-sm leading-relaxed">“{project.testimonial.quote}”</p>
          <p className="mt-2 text-xs font-semibold">{project.testimonial.name}</p>
          <p className="text-[11px] text-muted-foreground">{project.testimonial.role}</p>
        </article>
      </div>
      <div className="sticky-bar">
        <PrimaryButton
          className="w-auto flex-1"
          onClick={() => {
            replaceDraft(createInput(project.prefill));
            push({ name: "calculator", startStep: 1, keepDraft: true });
          }}
        >
          Get a Similar Estimate
        </PrimaryButton>
        <SecondaryButton className="w-auto flex-1" onClick={() => push({ name: "book", serviceId: project.category === "commercial" ? "commercial" : project.category === "home" ? "home" : project.category === "decks" ? "deck" : project.category === "additions" ? "addition" : project.category })}>
          Book Appointment
        </SecondaryButton>
      </div>
    </div>
  );
}
