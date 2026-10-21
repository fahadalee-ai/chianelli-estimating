import { useState } from "react";
import { Bell, ChevronRight, FileText, HelpCircle, Info, LogOut, Star } from "lucide-react";
import { useApp } from "../context/AppState";
import { useNav } from "../navigation/nav";
import { BottomSheet, Chip, ConfirmDialog, EmptyState, InputField, PrimaryButton, SelectField, SuccessMark, TextAreaField, ToggleRow, TopBar } from "../components/kit";
import { aboutCopy, faqs, INTERESTS, invoices, privacySections, ROLES, termsSections, US_STATES } from "../data/content";
import { projects } from "../data/projects";
import { services } from "../data/services";
import { photo, logo } from "../img/manifest";
import { downloadPdf } from "../utils/files";
import { initials, isEmail, maskPhone, money } from "../utils/format";
import { ProjectCard } from "../components/kit";

export function NotificationsScreen() {
  const { notifications, markNotification, markAllNotifications } = useApp();
  const { back, push } = useNav();
  const groups = [
    ["today", "Today"],
    ["earlier", "Earlier"],
  ] as const;
  return (
    <div className="screen">
      <TopBar title="Notifications" onBack={back} right={<button className="text-xs font-semibold text-primary" onClick={markAllNotifications}>Read</button>} />
      <div className="scroll">
        {notifications.length ? (
          groups.map(([id, label]) => {
            const items = notifications.filter((item) => item.group === id);
            if (!items.length) return null;
            return (
              <section key={id} className="mb-4">
                <h2 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{label}</h2>
                <div className="space-y-2">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      className="card flex w-full items-start gap-3 p-3 text-left"
                      onClick={() => {
                        markNotification(item.id);
                        const target = item.target as { name: string; bookingId?: string; estimateId?: string; calcId?: string };
                        if (target.name === "booking" && target.bookingId) push({ name: "booking", bookingId: target.bookingId });
                        else if (target.name === "result" && target.estimateId) push({ name: "result", estimateId: target.estimateId });
                        else if (target.name === "book") push({ name: "book" });
                        else if (target.name === "quick" && target.calcId) push({ name: "quickCalc", calcId: target.calcId });
                      }}
                    >
                      <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.unread ? "bg-primary" : "bg-transparent"}`} />
                      <span>
                        <span className="block text-sm font-semibold">{item.title}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{item.body}</span>
                        <span className="mt-1 block text-[11px] text-muted-foreground">{item.time}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          <EmptyState title="You're caught up" body="Appointment reminders and estimate updates will show here." />
        )}
      </div>
    </div>
  );
}

export function ProfileScreen() {
  const { user, logout } = useApp();
  const { push, reset } = useNav();
  const [confirm, setConfirm] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const { toast } = useApp();
  const items = [
    ["My Estimates", () => push({ name: "estimates" })],
    ["My Bookings", () => push({ name: "bookings" })],
    ["Saved Projects", () => push({ name: "saved" })],
    ["Payment & Invoices", () => push({ name: "payments" })],
    ["Notification Settings", () => push({ name: "notifSettings" })],
    ["Language", () => push({ name: "language" })],
    ["Privacy Policy", () => push({ name: "privacy" })],
    ["Terms of Service", () => push({ name: "terms" })],
    ["Help & Support", () => push({ name: "help" })],
    ["About Chianelli Estimating", () => push({ name: "about" })],
  ] as const;

  return (
    <div className="screen">
      <div className="scroll">
        <div className="under-status card flex items-center gap-3 p-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-ink font-display text-lg font-bold text-white">{initials(user?.fullName || "Guest")}</div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display truncate text-xl font-bold">{user?.fullName}</h1>
            <p className="text-sm text-muted-foreground">{user?.role}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.company || user?.city}</p>
          </div>
        </div>
        <button className="press mt-3 h-12 w-full rounded-full bg-primary text-sm font-semibold text-white" onClick={() => push({ name: "editProfile" })}>
          Edit Profile
        </button>
        <div className="card mt-4 divide-y divide-line">
          {items.map(([label, action]) => (
            <button key={label} className="flex h-14 w-full items-center justify-between px-4 text-left text-sm font-medium" onClick={action}>
              {label}
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
          <button className="flex h-14 w-full items-center justify-between px-4 text-left text-sm font-medium" onClick={() => setRateOpen(true)}>
            <span className="inline-flex items-center gap-2"><Star size={16} /> Rate the App</span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
          <button className="flex h-14 w-full items-center gap-2 px-4 text-left text-sm font-semibold text-primary" onClick={() => setConfirm(true)}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={confirm}
        title="Log out?"
        body="You will need to sign in again to book an estimator. Saved estimates stay on this phone."
        confirmLabel="Logout"
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          logout();
          reset({ name: "login" });
        }}
      />
      <BottomSheet open={rateOpen} title="Rate Chianelli Estimating" onClose={() => setRateOpen(false)}>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} aria-label={`${value} stars`} className="grid h-12 w-12 place-items-center" onClick={() => setStars(value)}>
              <Star className={value <= stars ? "fill-warning text-warning" : "text-muted-foreground"} />
            </button>
          ))}
        </div>
        <div className="mt-4">
          <PrimaryButton
            disabled={!stars}
            onClick={() => {
              toast("Thanks for rating Chianelli Estimating");
              setRateOpen(false);
            }}
          >
            Submit
          </PrimaryButton>
        </div>
      </BottomSheet>
    </div>
  );
}

export function EditProfileScreen() {
  const { user, updateUser, toast } = useApp();
  const { back } = useNav();
  const [form, setForm] = useState(() => ({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role || ROLES[0],
    company: user?.company || "",
    city: user?.city || "",
    state: user?.state || "TX",
    zip: user?.zip || "",
    interests: user?.interests || [],
  }));
  const [error, setError] = useState("");
  const set = (patch: Partial<typeof form>) => setForm((current) => ({ ...current, ...patch }));
  return (
    <div className="screen">
      <TopBar title="Edit Profile" onBack={back} />
      <div className="scroll space-y-3 pb-8">
        <InputField label="Full Name" value={form.fullName} onChange={(event) => set({ fullName: event.target.value })} />
        <InputField label="Email" value={form.email} onChange={(event) => set({ email: event.target.value })} />
        <InputField label="Phone" value={form.phone} onChange={(event) => set({ phone: maskPhone(event.target.value) })} />
        <SelectField label="I am a" value={form.role} onChange={(role) => set({ role })} options={ROLES.map((role) => ({ value: role, label: role }))} />
        <InputField label="Company Name" value={form.company} onChange={(event) => set({ company: event.target.value })} />
        <InputField label="City" value={form.city} onChange={(event) => set({ city: event.target.value })} />
        <SelectField label="State" value={form.state} onChange={(state) => set({ state })} options={US_STATES.map(([value, label]) => ({ value, label }))} />
        <InputField label="ZIP" value={form.zip} onChange={(event) => set({ zip: event.target.value.replace(/\D/g, "").slice(0, 5) })} />
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((item) => (
            <Chip
              key={item}
              active={form.interests.includes(item)}
              onClick={() => set({ interests: form.interests.includes(item) ? form.interests.filter((value) => value !== item) : [...form.interests, item] })}
            >
              {item}
            </Chip>
          ))}
        </div>
        {error ? <p className="text-xs text-primary">{error}</p> : null}
        <PrimaryButton
          onClick={() => {
            if (!isEmail(form.email) || form.fullName.trim().length < 2 || !/^\d{5}$/.test(form.zip)) {
              setError("Check your name, email, and ZIP code.");
              return;
            }
            updateUser(form);
            toast("Profile updated");
            back();
          }}
        >
          Save Profile
        </PrimaryButton>
      </div>
    </div>
  );
}

export function PaymentsScreen() {
  const { back } = useNav();
  const { toast } = useApp();
  return (
    <div className="screen">
      <TopBar title="Payment & Invoices" onBack={back} />
      <div className="scroll space-y-3">
        <p className="text-sm text-muted-foreground">Estimate packages only. Construction draws are billed by your contractor.</p>
        {invoices.map((invoice) => (
          <div key={invoice.id} className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{invoice.id}</p>
                <p className="font-semibold">{invoice.title}</p>
                <p className="text-xs text-muted-foreground">{invoice.project} · {invoice.date}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${invoice.status === "Paid" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>{invoice.status}</span>
            </div>
            <p className="mt-2 font-display text-xl font-bold">{money(invoice.amount)}</p>
            <button
              className="mt-2 text-sm font-semibold text-primary"
              onClick={() => {
                downloadPdf(`${invoice.id}.pdf`, ["CHIANELLI ESTIMATING", "Receipt", invoice.id, invoice.title, invoice.project, invoice.date, money(invoice.amount), invoice.status]);
                toast("Receipt downloaded");
              }}
            >
              Download receipt
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NotificationSettingsScreen() {
  const { prefs, setPrefs } = useApp();
  const { back } = useNav();
  return (
    <div className="screen">
      <TopBar title="Notifications" onBack={back} />
      <div className="scroll">
        <ToggleRow label="Appointment reminders" checked={prefs.appointments} onChange={(appointments) => setPrefs({ appointments })} />
        <ToggleRow label="Estimate updates" checked={prefs.estimates} onChange={(estimates) => setPrefs({ estimates })} />
        <ToggleRow label="Promotions and tips" checked={prefs.promos} onChange={(promos) => setPrefs({ promos })} />
        <ToggleRow label="Email notifications" checked={prefs.email} onChange={(email) => setPrefs({ email })} />
      </div>
    </div>
  );
}

export function LanguageScreen() {
  const { prefs, setPrefs, toast } = useApp();
  const { back } = useNav();
  return (
    <div className="screen">
      <TopBar title="Language" onBack={back} />
      <div className="scroll space-y-2">
        {["English", "Spanish"].map((language) => (
          <button
            key={language}
            className={`card flex h-14 w-full items-center justify-between px-4 text-sm font-semibold ${prefs.language === language ? "ring-2 ring-primary" : ""}`}
            onClick={() => {
              setPrefs({ language });
              toast(`${language} saved`);
            }}
          >
            {language}
            {prefs.language === language ? <span className="text-primary">Selected</span> : null}
          </button>
        ))}
        <p className="pt-2 text-xs leading-relaxed text-muted-foreground">Your language preference is saved on this phone. Estimate reports stay in English so the numbers and trade names stay consistent for US bids.</p>
      </div>
    </div>
  );
}

export function LegalScreen({ kind }: { kind: "privacy" | "terms" }) {
  const { back } = useNav();
  const sections = kind === "privacy" ? privacySections : termsSections;
  return (
    <div className="screen">
      <TopBar title={kind === "privacy" ? "Privacy Policy" : "Terms of Service"} onBack={back} />
      <div className="scroll space-y-4">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-base font-semibold">{section.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

export function HelpScreen() {
  const { back } = useNav();
  const { toast } = useApp();
  const [open, setOpen] = useState<string | null>(faqs[0].q);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="screen">
      <TopBar title="Help & Support" onBack={back} />
      <div className="scroll space-y-3">
        {faqs.map((item) => (
          <div key={item.q} className="card px-4">
            <button className="flex h-14 w-full items-center justify-between text-left text-sm font-semibold" onClick={() => setOpen(open === item.q ? null : item.q)}>
              {item.q}
              <HelpCircle size={16} />
            </button>
            {open === item.q ? <p className="pb-4 text-sm leading-relaxed text-muted-foreground">{item.a}</p> : null}
          </div>
        ))}
        {sent ? (
          <div className="card px-4 py-8 text-center">
            <SuccessMark />
            <p className="mt-3 font-semibold">Message sent</p>
            <p className="text-sm text-muted-foreground">We reply on business days from the Austin studio.</p>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <h2 className="font-display text-base font-semibold">Contact the studio</h2>
            <InputField label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <InputField label="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            <TextAreaField label="How can we help?" value={form.message} onChange={(message) => setForm({ ...form, message })} />
            {error ? <p className="text-xs text-primary">{error}</p> : null}
            <PrimaryButton
              onClick={() => {
                if (form.name.trim().length < 2 || !isEmail(form.email) || form.message.trim().length < 8) {
                  setError("Add your name, a valid email, and a short message.");
                  return;
                }
                setError("");
                setSent(true);
                toast("Support request sent");
              }}
            >
              Send message
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}

export function AboutScreen() {
  const { back } = useNav();
  return (
    <div className="screen">
      <TopBar title="About" onBack={back} />
      <div className="scroll">
        <img src={logo} alt="Chianelli Estimating" className="mx-auto h-20" />
        <p className="mt-4 text-sm leading-relaxed">{aboutCopy.lead}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{aboutCopy.body}</p>
        <div className="card mt-4 space-y-2 p-4 text-sm">
          <p className="inline-flex items-center gap-2"><Info size={16} /> {aboutCopy.address}</p>
          <p className="inline-flex items-center gap-2"><Bell size={16} /> {aboutCopy.phone}</p>
          <p className="inline-flex items-center gap-2"><FileText size={16} /> {aboutCopy.email}</p>
        </div>
        <img src={photo("service-residential")} alt="Estimator on a residential site" className="mt-4 h-40 w-full rounded-2xl object-cover" />
      </div>
    </div>
  );
}

export function SavedScreen() {
  const { favoriteProjects, favoriteServices } = useApp();
  const { back, push } = useNav();
  const savedProjects = projects.filter((project) => favoriteProjects.includes(project.id));
  const savedServices = services.filter((service) => favoriteServices.includes(service.id));
  return (
    <div className="screen">
      <TopBar title="Saved" onBack={back} />
      <div className="scroll space-y-4">
        <h2 className="font-display text-base font-semibold">Services</h2>
        {savedServices.length ? savedServices.map((service) => (
          <button key={service.id} className="card flex w-full items-center gap-3 p-2 text-left" onClick={() => push({ name: "service", serviceId: service.id })}>
            <img src={photo(service.image)} alt="" className="h-14 w-14 rounded-xl object-cover" />
            <span className="font-semibold">{service.name}</span>
          </button>
        )) : <p className="text-sm text-muted-foreground">Heart a service to keep it here.</p>}
        <h2 className="font-display text-base font-semibold">Projects</h2>
        {savedProjects.length ? (
          <div className="grid grid-cols-2 gap-3">
            {savedProjects.map((project) => (
              <ProjectCard key={project.id} image={photo(project.images[0])} title={project.title} location={project.location} cost={money(project.cost)} onClick={() => push({ name: "project", projectId: project.id })} />
            ))}
          </div>
        ) : (
          <EmptyState title="No saved projects" body="Bookmark a finished project to price something similar later." />
        )}
      </div>
    </div>
  );
}
