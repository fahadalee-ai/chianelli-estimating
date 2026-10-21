import { Calculator, CalendarDays, FolderKanban, Home, UserRound } from "lucide-react";
import { useNav } from "../navigation/nav";

const items = [
  { id: "home", label: "Home", icon: Home },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "estimate", label: "Estimate", icon: Calculator, center: true },
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "profile", label: "Profile", icon: UserRound },
] as const;

export function BottomNav() {
  const { screen, tab } = useNav();
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {items.map((item) => {
        const Icon = item.icon;
        const active = screen.name === item.id;
        if ("center" in item && item.center) {
          return (
            <button key={item.id} className="nav-btn" data-active={active} onClick={() => tab(item.id)} aria-current={active ? "page" : undefined}>
              <span className="nav-center press" aria-hidden="true">
                <Icon size={26} />
              </span>
              {item.label}
            </button>
          );
        }
        return (
          <button key={item.id} className="nav-btn press" data-active={active} onClick={() => tab(item.id)} aria-current={active ? "page" : undefined}>
            <Icon size={22} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
