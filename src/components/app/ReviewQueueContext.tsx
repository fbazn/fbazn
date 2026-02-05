"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
type ReviewQueueContextValue = {
  reviewQueueCount: number;
  setReviewQueueCount: (count: number) => void;
};

const ReviewQueueContext = createContext<ReviewQueueContextValue | undefined>(
  undefined
);

export function ReviewQueueProvider({
  children,
  initialCount,
}: {
  children: ReactNode;
  initialCount: number;
}) {
  const [reviewQueueCount, setReviewQueueCount] = useState(
    initialCount
  );

  const value = useMemo(
    () => ({ reviewQueueCount, setReviewQueueCount }),
    [reviewQueueCount]
  );

  return (
    <ReviewQueueContext.Provider value={value}>
      {children}
    </ReviewQueueContext.Provider>
  );
}

export function useReviewQueue() {
  const context = useContext(ReviewQueueContext);
  if (!context) {
    throw new Error("useReviewQueue must be used within ReviewQueueProvider");
  }
  return context;
}
