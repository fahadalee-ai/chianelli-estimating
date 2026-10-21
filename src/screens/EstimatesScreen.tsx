import { useMemo, useRef, useState } from "react";
import { Copy, Search, Trash2 } from "lucide-react";
import { useApp } from "../context/AppState";
import { useNav } from "../navigation/nav";
import { Chip, EmptyState, EstimateSummaryCard, SkeletonList, TopBar, useWarmLoad } from "../components/kit";
import { PROJECT_TYPES } from "../data/rates";
import { calculateEstimate, createInput } from "../utils/estimateCalculator";
import { formatDate, money } from "../utils/format";

export function EstimatesScreen() {
  const { estimates, removeEstimate, duplicateEstimate, toast, replaceDraft } = useApp();
  const { push, back } = useNav();
  const loading = useWarmLoad(420);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const startX = useRef(0);

  const list = useMemo(
    () =>
      estimates.filter((estimate) => {
        const typeOk = filter === "all" || estimate.inputs.projectType === filter;
        const text = `${estimate.inputs.projectName} ${estimate.inputs.projectType}`.toLowerCase();
        return typeOk && text.includes(query.trim().toLowerCase());
      }),
    [estimates, filter, query],
  );

  return (
    <div className="screen">
      <TopBar title="My Estimates" onBack={back} />
      <div className="scroll">
        <label className="mb-3 flex h-12 items-center gap-2 rounded-xl bg-card px-3 shadow-sm">
          <Search size={18} className="text-muted-foreground" />
          <input className="h-full flex-1 bg-transparent text-sm outline-none" placeholder="Search estimates" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
          <Chip active={filter === "all"} onClick={() => setFilter("all")}>All</Chip>
          {PROJECT_TYPES.map((type) => (
            <Chip key={type.id} active={filter === type.id} onClick={() => setFilter(type.id)}>
              {type.label}
            </Chip>
          ))}
        </div>
        {loading ? (
          <SkeletonList />
        ) : list.length ? (
          <div className="space-y-3">
            {list.map((estimate) => {
              const result = calculateEstimate(estimate.inputs);
              const label = PROJECT_TYPES.find((type) => type.id === estimate.inputs.projectType)?.label || "Project";
              return (
                <div
                  key={estimate.id}
                  onPointerDown={(event) => {
                    startX.current = event.clientX;
                  }}
                  onPointerUp={(event) => {
                    if (startX.current - event.clientX > 48) setOpenId(estimate.id);
                    else if (event.clientX - startX.current > 48) setOpenId(null);
                  }}
                >
                  <EstimateSummaryCard
                    name={estimate.inputs.projectName || "Untitled estimate"}
                    type={label}
                    date={formatDate(estimate.createdAt)}
                    total={money(result.total)}
                    status={estimate.status}
                    onClick={() => {
                      replaceDraft(createInput(estimate.inputs));
                      push({ name: "result", estimateId: estimate.id });
                    }}
                  />
                  {openId === estimate.id ? (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        className="press flex h-12 items-center justify-center gap-2 rounded-full bg-card text-sm font-semibold"
                        onClick={() => {
                          duplicateEstimate(estimate.id);
                          toast("Estimate duplicated");
                          setOpenId(null);
                        }}
                      >
                        <Copy size={16} /> Duplicate
                      </button>
                      <button
                        className="press flex h-12 items-center justify-center gap-2 rounded-full bg-primary/10 text-sm font-semibold text-primary"
                        onClick={() => {
                          removeEstimate(estimate.id);
                          toast("Estimate deleted");
                          setOpenId(null);
                        }}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState title="Create Your First Estimate" body="Saved drafts, sent proposals, and approved numbers will show up here." action="New Estimate" onAction={() => push({ name: "calculator", startStep: 0 })} />
        )}
      </div>
    </div>
  );
}
