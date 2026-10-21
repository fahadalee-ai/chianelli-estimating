import { useEffect, useState } from "react";
import { logo, photo } from "../img/manifest";
import { useApp } from "../context/AppState";
import { useNav } from "../navigation/nav";
import { PrimaryButton } from "../components/kit";

const slides = [
  {
    image: "onboarding-1",
    title: "Accurate Estimates, Every Time",
    body: "Get detailed labour, material and time breakdowns for your residential and commercial projects in minutes.",
  },
  {
    image: "onboarding-2",
    title: "Every Project Type Covered",
    body: "From decks and additions to basement and attic remodels and commercial fit-outs, estimate any job with confidence.",
  },
  {
    image: "onboarding-3",
    title: "Book an Expert Estimator",
    body: "Schedule an on-site or virtual appointment and get a professional, ready-to-use estimate for your next build.",
  },
];

export function SplashScreen() {
  const { user, onboarded } = useApp();
  const { reset } = useNav();

  useEffect(() => {
    const key = "ce-splash-at";
    const now = Date.now();
    const prev = Number(sessionStorage.getItem(key) || 0);
    if (!prev) sessionStorage.setItem(key, String(now));
    const wait = Math.max(300, 3000 - (Date.now() - (prev || now)));
    const id = window.setTimeout(() => {
      sessionStorage.removeItem(key);
      if (user) reset({ name: "home" });
      else if (!onboarded) reset({ name: "onboarding" });
      else reset({ name: "login" });
    }, wait);
    return () => window.clearTimeout(id);
  }, [onboarded, reset, user]);

  return (
    <div className="screen relative items-center justify-center bg-ink text-white">
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--primary) 50%, transparent), transparent 58%)" }} />
      <div className="logo-pop relative px-10">
        <div className="relative overflow-hidden rounded-3xl bg-white px-6 py-5">
          <img src={logo} alt="Chianelli Estimating" className="mx-auto w-full max-w-[240px]" />
          <span className="sweep" />
        </div>
      </div>
      <p className="tag-in mt-8 max-w-[280px] text-center text-sm text-white/80">Build with Confidence. Estimate with Precision.</p>
      <div className="boot-bar absolute inset-x-0 bottom-0 h-1 bg-white/10">
        <span />
      </div>
    </div>
  );
}

export function OnboardingScreen() {
  const { markOnboarded } = useApp();
  const { reset } = useNav();
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const last = index === slides.length - 1;

  const finish = () => {
    markOnboarded();
    reset({ name: "login" });
  };

  return (
    <div className="screen relative bg-ink text-white">
      <img src={photo(slide.image)} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/25" />
      <button className="absolute right-5 top-14 z-10 text-sm font-semibold" onClick={finish}>
        Skip
      </button>
      <div className="relative z-10 mt-auto px-6 pb-8">
        <h1 className="font-display text-[30px] font-bold leading-tight text-white">{slide.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/85">{slide.body}</p>
        <div className="mt-6 flex items-center gap-2">
          {slides.map((item, dot) => (
            <span key={item.title} className={dot === index ? "h-2 w-6 rounded-full bg-primary" : "h-2 w-2 rounded-full bg-white/50"} />
          ))}
        </div>
        <div className="mt-5">
          <PrimaryButton
            onClick={() => {
              if (last) finish();
              else setIndex((value) => value + 1);
            }}
          >
            {last ? "Get Started" : "Next"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
