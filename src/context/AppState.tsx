import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { seedBookings } from "../data/bookings";
import { seedEstimates } from "../data/estimates";
import { seedNotifications } from "../data/content";
import { createInput } from "../utils/estimateCalculator";

const KEY = "chianelli-estimating-v1";

export type UserProfile = {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  company: string;
  state: string;
  city: string;
  zip: string;
  interests: string[];
};

export type SavedEstimate = {
  id: string;
  status: "Draft" | "Sent" | "Approved";
  createdAt: string;
  inputs: ReturnType<typeof createInput>;
};

export type Booking = {
  id: string;
  serviceId: string;
  serviceName: string;
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
  estimateId: string | null;
  status: string;
  createdAt: string;
  cancelReason?: string;
};

type Prefs = {
  appointments: boolean;
  estimates: boolean;
  promos: boolean;
  email: boolean;
  language: string;
};

type Toast = { id: number; title: string; body?: string };

type AppNote = {
  id: string;
  group: string;
  type: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  target?: { name: string; bookingId?: string; estimateId?: string; calcId?: string };
};

type Store = {
  ready: boolean;
  onboarded: boolean;
  user: UserProfile | null;
  estimates: SavedEstimate[];
  bookings: Booking[];
  favoriteServices: string[];
  favoriteProjects: string[];
  notifications: AppNote[];
  prefs: Prefs;
  toasts: Toast[];
  online: boolean;
  draft: ReturnType<typeof createInput>;
  setDraft: (patch: Partial<ReturnType<typeof createInput>>) => void;
  replaceDraft: (next: ReturnType<typeof createInput>) => void;
  markOnboarded: () => void;
  login: (user: UserProfile, remember: boolean) => void;
  logout: () => void;
  updateUser: (patch: Partial<UserProfile>) => void;
  saveEstimate: (inputs: ReturnType<typeof createInput>, status?: SavedEstimate["status"]) => SavedEstimate;
  updateEstimate: (id: string, patch: Partial<SavedEstimate>) => void;
  removeEstimate: (id: string) => void;
  duplicateEstimate: (id: string) => void;
  toggleFavoriteService: (id: string) => void;
  toggleFavoriteProject: (id: string) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, patch: Partial<Booking>) => void;
  markNotification: (id: string) => void;
  markAllNotifications: () => void;
  setPrefs: (patch: Partial<Prefs>) => void;
  toast: (title: string, body?: string) => void;
  dismissToast: (id: number) => void;
  unreadCount: number;
};

const Ctx = createContext<Store | null>(null);

const defaultPrefs: Prefs = {
  appointments: true,
  estimates: true,
  promos: false,
  email: true,
  language: "English",
};

function load() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readSaved() {
  const saved = load();
  if (!saved) return null;
  const sessionAlive = typeof sessionStorage !== "undefined" && sessionStorage.getItem("ce-session") === "1";
  if (saved.remember === false && !sessionAlive) return { ...saved, user: null };
  return saved;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const saved = readSaved();
  const [onboarded, setOnboarded] = useState(Boolean(saved?.onboarded));
  const [user, setUser] = useState<UserProfile | null>(saved?.user || null);
  const [remember, setRemember] = useState(saved?.remember !== false);
  const [estimates, setEstimates] = useState<SavedEstimate[]>(saved?.estimates || seedEstimates);
  const [bookings, setBookings] = useState<Booking[]>(saved?.bookings || (seedBookings as Booking[]));
  const [favoriteServices, setFavoriteServices] = useState<string[]>(saved?.favoriteServices || ["deck"]);
  const [favoriteProjects, setFavoriteProjects] = useState<string[]>(saved?.favoriteProjects || ["lakeway-deck"]);
  const [notifications, setNotifications] = useState<AppNote[]>(saved?.notifications || (seedNotifications as AppNote[]));
  const [prefs, setPrefsState] = useState<Prefs>(saved?.prefs || defaultPrefs);
  const [draft, setDraftState] = useState(createInput({ projectType: "deck" }));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [online, setOnline] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(
      KEY,
      JSON.stringify({
        onboarded,
        user,
        remember,
        estimates,
        bookings,
        favoriteServices,
        favoriteProjects,
        notifications,
        prefs,
      }),
    );
  }, [ready, onboarded, user, remember, estimates, bookings, favoriteServices, favoriteProjects, notifications, prefs]);

  const api = useMemo<Store>(() => {
    const toast = (title: string, body?: string) => {
      const id = Date.now() + Math.random();
      setToasts((list) => [...list, { id, title, body }]);
      setTimeout(() => setToasts((list) => list.filter((item) => item.id !== id)), 3200);
    };
    return {
      ready,
      onboarded,
      user,
      estimates,
      bookings,
      favoriteServices,
      favoriteProjects,
      notifications,
      prefs,
      toasts,
      online,
      draft,
      unreadCount: notifications.filter((item) => item.unread).length,
      setDraft: (patch) => setDraftState((current) => createInput({ ...current, ...patch, addons: { ...current.addons, ...(patch.addons || {}) } })),
      replaceDraft: (next) => setDraftState(createInput(next)),
      markOnboarded: () => setOnboarded(true),
      login: (next, rememberMe = true) => {
        setUser(next);
        setRemember(rememberMe);
        if (rememberMe) sessionStorage.removeItem("ce-session");
        else sessionStorage.setItem("ce-session", "1");
      },
      logout: () => setUser(null),
      updateUser: (patch) => setUser((current) => (current ? { ...current, ...patch } : current)),
      saveEstimate: (inputs, status = "Draft") => {
        const record: SavedEstimate = {
          id: `est-${Date.now()}`,
          status,
          createdAt: new Date().toISOString().slice(0, 10),
          inputs: createInput(inputs),
        };
        setEstimates((list) => [record, ...list]);
        return record;
      },
      updateEstimate: (id, patch) => setEstimates((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item))),
      removeEstimate: (id) => setEstimates((list) => list.filter((item) => item.id !== id)),
      duplicateEstimate: (id) => {
        const source = estimates.find((item) => item.id === id);
        if (!source) return;
        const copy: SavedEstimate = {
          ...source,
          id: `est-${Date.now()}`,
          status: "Draft",
          createdAt: new Date().toISOString().slice(0, 10),
          inputs: createInput({ ...source.inputs, projectName: `${source.inputs.projectName || "Estimate"} copy` }),
        };
        setEstimates((list) => [copy, ...list]);
      },
      toggleFavoriteService: (id) =>
        setFavoriteServices((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id])),
      toggleFavoriteProject: (id) =>
        setFavoriteProjects((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id])),
      addBooking: (booking) => setBookings((list) => [booking, ...list]),
      updateBooking: (id, patch) => setBookings((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item))),
      markNotification: (id) => setNotifications((list) => list.map((item) => (item.id === id ? { ...item, unread: false } : item))),
      markAllNotifications: () => setNotifications((list) => list.map((item) => ({ ...item, unread: false }))),
      setPrefs: (patch) => setPrefsState((current) => ({ ...current, ...patch })),
      toast,
      dismissToast: (id) => setToasts((list) => list.filter((item) => item.id !== id)),
    };
  }, [ready, onboarded, user, estimates, bookings, favoriteServices, favoriteProjects, notifications, prefs, toasts, online, draft, remember]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useApp() {
  const value = useContext(Ctx);
  if (!value) throw new Error("useApp must be used inside AppStateProvider");
  return value;
}
