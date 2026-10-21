import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { logo } from "../img/manifest";
import { useApp } from "../context/AppState";
import { useNav } from "../navigation/nav";
import { Chip, InputField, PrimaryButton, SecondaryButton, SelectField, StepIndicator, SuccessMark, TopBar } from "../components/kit";
import { demoUser, INTERESTS, ROLES, US_STATES } from "../data/content";
import { isEmail, maskPhone } from "../utils/format";

export function LoginScreen() {
  const { login, toast } = useApp();
  const { push, reset } = useNav();
  const [email, setEmail] = useState("marcus@halebuilds.com");
  const [password, setPassword] = useState("estimate1");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState<"form" | "google" | "apple" | null>(null);

  const submit = (provider?: "google" | "apple") => {
    setLoading(provider ?? "form");
    window.setTimeout(() => {
      if (provider) {
        login(demoUser, true);
        toast(`Signed in with ${provider === "google" ? "Google" : "Apple"}`);
        reset({ name: "home" });
        return;
      }
      const known = email.toLowerCase() === demoUser.email;
      const name = email.split("@")[0].replace(/[.\-_]/g, " ");
      login(
        known
          ? demoUser
          : {
              ...demoUser,
              email,
              fullName: name.replace(/\b\w/g, (letter) => letter.toUpperCase()) || "New User",
              company: "",
            },
        remember,
      );
      toast("Welcome back");
      reset({ name: "home" });
    }, provider ? 800 : 700);
  };

  return (
    <div className="screen bg-ink">
      <div className="under-status px-6 pb-6 pt-4 text-white">
        <img src={logo} alt="Chianelli Estimating" className="h-16 w-auto rounded-xl bg-white px-3 py-2" />
        <h1 className="font-display mt-5 text-[32px] font-bold">Welcome Back</h1>
        <p className="mt-1 text-sm text-white/70">Sign in to estimates, projects, and bookings.</p>
      </div>
      <div className="scroll rounded-t-3xl bg-card pt-6">
        <div className="space-y-3">
          <InputField label="Email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <div className="relative">
            <InputField
              label="Password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button type="button" aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-9 text-muted-foreground" onClick={() => setShow((value) => !value)}>
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
              Remember me
            </label>
            <button className="font-semibold text-primary" onClick={() => push({ name: "forgot" })}>
              Forgot Password?
            </button>
          </div>
          <PrimaryButton loading={loading === "form"} onClick={() => submit()}>
            Login
          </PrimaryButton>
          <div className="flex items-center gap-3 py-1 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-line" />
            or continue with
            <span className="h-px flex-1 bg-line" />
          </div>
          <SecondaryButton loading={loading === "google"} onClick={() => submit("google")}>
            Google
          </SecondaryButton>
          <SecondaryButton loading={loading === "apple"} onClick={() => submit("apple")}>
            Apple
          </SecondaryButton>
          <p className="pb-4 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button className="font-semibold text-primary" onClick={() => push({ name: "register" })}>
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export function ForgotScreen() {
  const { back } = useNav();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="screen">
      <TopBar title="Reset Password" onBack={back} />
      <div className="scroll">
        {sent ? (
          <div className="card px-5 py-10 text-center">
            <SuccessMark />
            <h2 className="font-display mt-4 text-xl font-semibold">Check your inbox</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              If an account exists for {email}, a reset link is on its way. It expires in 30 minutes.
            </p>
            <div className="mt-6">
              <PrimaryButton onClick={() => back()}>Back to Login</PrimaryButton>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">Enter the email on your Chianelli account and we will send a reset link.</p>
            <InputField label="Email" type="email" value={email} error={error} onChange={(event) => setEmail(event.target.value)} />
            <PrimaryButton
              loading={loading}
              onClick={() => {
                if (!isEmail(email)) {
                  setError("Enter a valid email address.");
                  return;
                }
                setError("");
                setLoading(true);
                window.setTimeout(() => {
                  setLoading(false);
                  setSent(true);
                }, 700);
              }}
            >
              Send Reset Link
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}

const emptyProfile = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirm: "",
  role: "",
  company: "",
  city: "",
  state: "TX",
  zip: "",
  interests: [] as string[],
  agree: false,
};

export function RegisterScreen() {
  const { login, toast } = useApp();
  const { back, reset } = useNav();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyProfile);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (patch: Partial<typeof form>) => setForm((current) => ({ ...current, ...patch }));

  const next = () => setStep(1);

  const create = () => {
    setLoading(true);
    window.setTimeout(() => {
      login(
        {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone,
          role: form.role,
          company: form.company.trim(),
          city: form.city.trim(),
          state: form.state,
          zip: form.zip,
          interests: form.interests,
        },
        true,
      );
      toast("Account created");
      setLoading(false);
      setStep(2);
    }, 800);
  };

  if (step === 2) {
    return (
      <div className="screen">
        <div className="scroll flex flex-col items-center justify-center text-center">
          <SuccessMark />
          <h1 className="font-display mt-5 text-2xl font-bold">You're in</h1>
          <p className="mt-2 max-w-[260px] text-sm text-muted-foreground">Your Chianelli account is ready. Start an estimate or book time with an estimator.</p>
          <div className="mt-6 w-full">
            <PrimaryButton onClick={() => reset({ name: "home" })}>Go to Home</PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <TopBar title="Create Account" onBack={step === 0 ? back : () => setStep(0)} />
      <div className="scroll">
        <div className="mb-2 flex items-center gap-3">
          <img src={logo} alt="" className="h-10 rounded-lg bg-white" />
        </div>
        <StepIndicator steps={["Account", "Profile"]} current={step} />
        {step === 0 ? (
          <div className="space-y-3">
            <InputField label="Full Name" value={form.fullName} onChange={(event) => set({ fullName: event.target.value })} />
            <InputField label="Email" type="email" value={form.email} onChange={(event) => set({ email: event.target.value })} />
            <InputField label="Phone" inputMode="tel" value={form.phone} onChange={(event) => set({ phone: maskPhone(event.target.value) })} />
            <div className="relative">
              <InputField label="Password" type={show ? "text" : "password"} value={form.password} onChange={(event) => set({ password: event.target.value })} />
              <button type="button" aria-label="Toggle password visibility" className="absolute right-3 top-9 text-muted-foreground" onClick={() => setShow((value) => !value)}>
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <InputField label="Confirm Password" type={show ? "text" : "password"} value={form.confirm} onChange={(event) => set({ confirm: event.target.value })} />
            <PrimaryButton onClick={next}>Continue</PrimaryButton>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium">I am a</p>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((role) => (
                <Chip key={role} active={form.role === role} onClick={() => set({ role })}>
                  {role}
                </Chip>
              ))}
            </div>
            <InputField label="Company Name (optional)" value={form.company} onChange={(event) => set({ company: event.target.value })} />
            <InputField label="City" value={form.city} onChange={(event) => set({ city: event.target.value })} />
            <SelectField label="State" value={form.state} onChange={(state) => set({ state })} options={US_STATES.map(([value, label]) => ({ value, label }))} />
            <InputField label="ZIP" inputMode="numeric" value={form.zip} onChange={(event) => set({ zip: event.target.value.replace(/\D/g, "").slice(0, 5) })} />
            <p className="text-sm font-medium">Interested in</p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((item) => (
                <Chip
                  key={item}
                  active={form.interests.includes(item)}
                  onClick={() =>
                    set({
                      interests: form.interests.includes(item) ? form.interests.filter((value) => value !== item) : [...form.interests, item],
                    })
                  }
                >
                  {item}
                </Chip>
              ))}
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1" checked={form.agree} onChange={(event) => set({ agree: event.target.checked })} />
              <span>I agree to the Terms & Privacy Policy.</span>
            </label>
            <PrimaryButton loading={loading} onClick={create}>
              Create Account
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}
