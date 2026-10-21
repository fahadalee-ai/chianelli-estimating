import { createContext, useContext, useState, type ReactNode } from "react";

export type AppScreen =
  | { name: "splash" }
  | { name: "onboarding" }
  | { name: "login" }
  | { name: "forgot" }
  | { name: "register" }
  | { name: "home" }
  | { name: "search"; query?: string }
  | { name: "services" }
  | { name: "service"; serviceId: string }
  | { name: "estimate" }
  | { name: "calculator"; presetType?: string; startStep?: number; returnToResult?: boolean; estimateId?: string; keepDraft?: boolean }
  | { name: "result"; estimateId?: string }
  | { name: "quick" }
  | { name: "quickCalc"; calcId: string }
  | { name: "estimates" }
  | { name: "projects" }
  | { name: "project"; projectId: string }
  | { name: "book"; serviceId?: string; estimateId?: string }
  | { name: "bookSuccess"; bookingId: string }
  | { name: "bookings" }
  | { name: "booking"; bookingId: string }
  | { name: "reschedule"; bookingId: string }
  | { name: "notifications" }
  | { name: "profile" }
  | { name: "editProfile" }
  | { name: "payments" }
  | { name: "notifSettings" }
  | { name: "language" }
  | { name: "privacy" }
  | { name: "terms" }
  | { name: "help" }
  | { name: "about" }
  | { name: "saved" };

const TABS = new Set(["home", "estimate", "projects", "bookings", "profile"]);

type Dir = "forward" | "back" | "fade";

type NavValue = {
  screen: AppScreen;
  dir: Dir;
  animKey: number;
  showNav: boolean;
  push: (screen: AppScreen) => void;
  replace: (screen: AppScreen) => void;
  back: () => void;
  reset: (screen: AppScreen) => void;
  tab: (name: "home" | "estimate" | "projects" | "bookings" | "profile") => void;
};

const Ctx = createContext<NavValue | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<AppScreen[]>([{ name: "splash" }]);
  const [dir, setDir] = useState<Dir>("fade");
  const [animKey, setAnimKey] = useState(0);
  const screen = stack[stack.length - 1];

  const go = (next: AppScreen[], direction: Dir) => {
    setDir(direction);
    setStack(next);
    setAnimKey((value) => value + 1);
  };

  const value: NavValue = {
    screen,
    dir,
    animKey,
    showNav: stack.length === 1 && TABS.has(screen.name),
    push: (next) => go([...stack, next], "forward"),
    replace: (next) => go([...stack.slice(0, -1), next], "forward"),
    back: () => {
      if (stack.length === 1) return;
      go(stack.slice(0, -1), "back");
    },
    reset: (next) => go([next], "fade"),
    tab: (name) => go([{ name }], "fade"),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNav() {
  const value = useContext(Ctx);
  if (!value) throw new Error("useNav must be used inside NavProvider");
  return value;
}
