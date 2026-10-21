import { createFileRoute } from "@tanstack/react-router";
import { ChianelliApp } from "../navigation/router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chianelli Estimating" },
      {
        name: "description",
        content: "Construction estimates for residential and commercial work. Labour, materials, time, and appointments.",
      },
    ],
  }),
  component: ChianelliApp,
});
