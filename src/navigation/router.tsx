import { useEffect, useState } from "react";
import { BatteryMedium, Signal, Wifi } from "lucide-react";
import { AppStateProvider, useApp } from "../context/AppState";
import { BottomNav } from "../components/BottomNav";
import { OfflineBanner, ToastHost } from "../components/kit";
import { NavProvider, useNav } from "./nav";
import { ForgotScreen, LoginScreen, RegisterScreen } from "../screens/AuthScreens";
import { BookingsScreen, BookingDetailScreen, RescheduleScreen } from "../screens/BookingsScreens";
import { BookScreen, BookSuccessScreen } from "../screens/BookingScreens";
import { CalculatorScreen, EstimateHubScreen, QuickCalcScreen, QuickListScreen, ResultScreen } from "../screens/CalculatorScreens";
import { EstimatesScreen } from "../screens/EstimatesScreen";
import { HomeScreen, SearchScreen } from "../screens/HomeScreen";
import { AboutScreen, EditProfileScreen, HelpScreen, LanguageScreen, LegalScreen, NotificationSettingsScreen, NotificationsScreen, PaymentsScreen, ProfileScreen, SavedScreen } from "../screens/MoreScreens";
import { ProjectDetailScreen, ProjectsScreen } from "../screens/ProjectsScreens";
import { ServiceDetailScreen, ServicesScreen } from "../screens/ServicesScreens";
import { OnboardingScreen, SplashScreen } from "../screens/SplashScreens";

function StatusBar({ light }: { light: boolean }) {
  const [time, setTime] = useState("9:41");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="statusbar" style={{ color: light ? "white" : "var(--ink)" }}>
      <span>{time}</span>
      <span className="flex items-center gap-1.5">
        <Signal size={14} />
        <Wifi size={14} />
        <BatteryMedium size={16} />
      </span>
    </div>
  );
}

function ScreenSwitch() {
  const { screen } = useNav();
  switch (screen.name) {
    case "splash":
      return <SplashScreen />;
    case "onboarding":
      return <OnboardingScreen />;
    case "login":
      return <LoginScreen />;
    case "forgot":
      return <ForgotScreen />;
    case "register":
      return <RegisterScreen />;
    case "home":
      return <HomeScreen />;
    case "search":
      return <SearchScreen />;
    case "services":
      return <ServicesScreen />;
    case "service":
      return <ServiceDetailScreen />;
    case "estimate":
      return <EstimateHubScreen />;
    case "calculator":
      return <CalculatorScreen />;
    case "result":
      return <ResultScreen />;
    case "quick":
      return <QuickListScreen />;
    case "quickCalc":
      return <QuickCalcScreen />;
    case "estimates":
      return <EstimatesScreen />;
    case "projects":
      return <ProjectsScreen />;
    case "project":
      return <ProjectDetailScreen />;
    case "book":
      return <BookScreen />;
    case "bookSuccess":
      return <BookSuccessScreen />;
    case "bookings":
      return <BookingsScreen />;
    case "booking":
      return <BookingDetailScreen />;
    case "reschedule":
      return <RescheduleScreen />;
    case "notifications":
      return <NotificationsScreen />;
    case "profile":
      return <ProfileScreen />;
    case "editProfile":
      return <EditProfileScreen />;
    case "payments":
      return <PaymentsScreen />;
    case "notifSettings":
      return <NotificationSettingsScreen />;
    case "language":
      return <LanguageScreen />;
    case "privacy":
      return <LegalScreen kind="privacy" />;
    case "terms":
      return <LegalScreen kind="terms" />;
    case "help":
      return <HelpScreen />;
    case "about":
      return <AboutScreen />;
    case "saved":
      return <SavedScreen />;
    default:
      return <HomeScreen />;
  }
}

function PhoneShell() {
  const { screen, dir, animKey, showNav } = useNav();
  const { online } = useApp();
  useEffect(() => {
    const embedded = window.self !== window.top;
    document.documentElement.classList.toggle("embedded", embedded);
  }, []);
  const light = screen.name === "splash" || screen.name === "onboarding" || screen.name === "login" || screen.name === "service";
  const anim = dir === "back" ? "anim-back" : dir === "fade" ? "anim-fade" : "anim-forward";

  return (
    <div className="stage">
      <div className="device">
        <StatusBar light={light} />
        <div className="viewport">
          <div key={animKey} className={anim}>
            <ScreenSwitch />
          </div>
        </div>
        {showNav ? <BottomNav /> : null}
        <ToastHost />
        {!online ? <OfflineBanner onRetry={() => window.location.reload()} /> : null}
      </div>
    </div>
  );
}

/** Screen router for the Chianelli Estimating phone UI. */
export function ChianelliApp() {
  return (
    <AppStateProvider>
      <NavProvider>
        <PhoneShell />
      </NavProvider>
    </AppStateProvider>
  );
}
