import { getReviewQueueRows } from "@/data/sourcingItems";
import { toReviewQueueItem } from "@/data/adapters";
import ReviewQueueClient from "./ReviewQueueClient";

export default async function ReviewQueuePage() {
  const items = (await getReviewQueueRows()).map(toReviewQueueItem);
  const showSeedButton = process.env.NODE_ENV === "development";

  return (
    <ReviewQueueClient
      initialItems={items}
      showSeedButton={showSeedButton}
    />
  );
}
