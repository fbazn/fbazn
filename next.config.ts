import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  // Sentry org + project (set up at sentry.io)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print upload logs in CI
  silent: !process.env.CI,

  // Upload larger set of source maps for accuracy
  widenClientFileUpload: true,

  // Annotate React components for better error tracing
  reactComponentAnnotation: { enabled: true },

  // Hide source maps from the client bundle
  hideSourceMaps: true,

  // Remove Sentry debug logs from production bundle
  disableLogger: true,
});
