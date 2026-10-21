import logo from "./logo.png";
import onboarding1 from "./onboarding-1.jpg";
import onboarding2 from "./onboarding-2.jpg";
import onboarding3 from "./onboarding-3.jpg";
import serviceDeck from "./service-deck.jpg";
import serviceBasement from "./service-basement.jpg";
import serviceAttic from "./service-attic.jpg";
import serviceAddition from "./service-addition.jpg";
import serviceHome from "./service-home.jpg";
import serviceCommercial from "./service-commercial.jpg";
import serviceKitchen from "./service-kitchen.jpg";
import serviceResidential from "./service-residential.jpg";
import heroEstimate from "./hero-estimate.jpg";
import projectDeckCharleston from "./project-deck-charleston.jpg";
import projectFitoutDallas from "./project-fitout-dallas.jpg";
import projectAdditionFrame from "./project-addition-frame.jpg";
import projectHomeScottsdale from "./project-home-scottsdale.jpg";
import beforeBasement from "./before-basement.jpg";
import estimatorMaya from "./estimator-maya.jpg";
import estimatorJames from "./estimator-james.jpg";
import estimatorSofia from "./estimator-sofia.jpg";
import estimatorAndre from "./estimator-andre.jpg";

export { logo };

export const photos = {
  "onboarding-1": onboarding1,
  "onboarding-2": onboarding2,
  "onboarding-3": onboarding3,
  "service-deck": serviceDeck,
  "service-basement": serviceBasement,
  "service-attic": serviceAttic,
  "service-addition": serviceAddition,
  "service-home": serviceHome,
  "service-commercial": serviceCommercial,
  "service-kitchen": serviceKitchen,
  "service-residential": serviceResidential,
  "hero-estimate": heroEstimate,
  "project-deck-charleston": projectDeckCharleston,
  "project-fitout-dallas": projectFitoutDallas,
  "project-addition-frame": projectAdditionFrame,
  "project-home-scottsdale": projectHomeScottsdale,
  "before-basement": beforeBasement,
  "estimator-maya": estimatorMaya,
  "estimator-james": estimatorJames,
  "estimator-sofia": estimatorSofia,
  "estimator-andre": estimatorAndre,
};

export function photo(key) {
  return photos[key] || serviceResidential;
}
