import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://ed0f69cf52f115586ab38fbb5a488f26@o4506978302820352.ingest.us.sentry.io/4507104364986368",
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
}); 