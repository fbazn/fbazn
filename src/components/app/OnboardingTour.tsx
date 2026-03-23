"use client";

import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const STORAGE_KEY = "fbazn_tour_done";

function buildTour() {
  return driver({
    showProgress: true,
    showButtons: ["next", "previous", "close"],
    nextBtnText: "Next →",
    prevBtnText: "← Back",
    doneBtnText: "Let's go!",
    progressText: "{{current}} of {{total}}",
    popoverClass: "fbazn-tour-popover",
    onDestroyStarted: () => {
      localStorage.setItem(STORAGE_KEY, "1");
      return true;
    },
    steps: [
      {
        popover: {
          title: "Welcome to FBAZN 👋",
          description:
            "This quick tour will show you the key parts of the app. It only takes a minute — let's get you set up.",
          side: "over",
          align: "center",
        },
      },
      {
        element: "#tour-add-lead",
        popover: {
          title: "Add an ASIN",
          description:
            "Click <strong>Add</strong> to manually add an Amazon ASIN to your Review Queue. The Chrome Extension does this automatically while you browse Amazon.",
          side: "bottom",
          align: "end",
        },
      },
      {
        element: "#tour-review-queue",
        popover: {
          title: "Review Queue",
          description:
            "Every ASIN you capture lands here. Open each product, check the economics — buy box price, FBA fees, net profit, ROI — add a supplier cost, then approve or reject.",
          side: "right",
          align: "start",
        },
      },
      {
        element: "#tour-sourcing",
        popover: {
          title: "Sourcing List",
          description:
            "Products you approve from the Review Queue appear here. This is your active pipeline — manage suppliers, add notes, and track what you're going to order.",
          side: "right",
          align: "start",
        },
      },
      {
        element: "#tour-suppliers",
        popover: {
          title: "Suppliers",
          description:
            "Build your supplier directory here. Link suppliers to products so you can track where each product is sourced from and compare costs.",
          side: "right",
          align: "start",
        },
      },
      {
        element: "#tour-settings",
        popover: {
          title: "Settings",
          description:
            "Set your default marketplace, VAT rate, prep fee, inbound shipping cost, and profit thresholds. These values drive all the calculations across the app.",
          side: "right",
          align: "start",
        },
      },
      {
        popover: {
          title: "You're all set!",
          description:
            "That's the core of FBAZN. Install the Chrome Extension to start capturing products from Amazon, then review and build your sourcing pipeline. You can relaunch this tour any time from the <strong>Help</strong> page.",
          side: "over",
          align: "center",
        },
      },
    ],
  });
}

export function OnboardingTour() {
  useEffect(() => {
    // Auto-start on first visit
    if (!localStorage.getItem(STORAGE_KEY)) {
      // Small delay so the app shell finishes rendering
      const timer = setTimeout(() => buildTour().drive(), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Listen for relaunch event from Help page
    function handleRelaunch() {
      buildTour().drive();
    }
    window.addEventListener("fbazn:relaunch-tour", handleRelaunch);
    return () => window.removeEventListener("fbazn:relaunch-tour", handleRelaunch);
  }, []);

  return null;
}
