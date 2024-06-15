import { red } from "@mui/material/colors";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { createBrowserHistory } from "history";
import React from "react";
import ReactDOM from "react-dom";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import App from "./App";
import "./index.css";
import DemographicsUpload from "./routes/DemographicsUpload";
import Pepsico from "./routes/Pepsico";
import PepsicoCheckInLists from "./routes/PepsicoCheckInLists";
import UploadSuccess from "./routes/UploadSuccess";
import * as serviceWorker from "./serviceWorker";

import * as Sentry from "@sentry/react";

const SentryRoute = Sentry.withSentryRouting(Route);

const history = createBrowserHistory();

// Main application file that manages all the different views
Sentry.init({
  dsn:
    "https://ed0f69cf52f115586ab38fbb5a488f26@o4506978302820352.ingest.us.sentry.io/4507104364986368",

  integrations: [
    // See docs for support of different versions of variation of react router
    // https://docs.sentry.io/platforms/javascript/guides/react/configuration/integrations/react-router/
    Sentry.reactRouterV5BrowserTracingIntegration({ history }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  tracesSampleRate: 1.0,

  // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],

  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

const theme = createTheme({
  palette: {
    primary: {
      main: "#556cd6",
    },
    secondary: {
      main: "#19857b",
    },
    error: {
      main: red.A400,
    },
  },
});

const routing = (
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Router history={history}>
        <Switch>
          <SentryRoute path="/pepsico" component={Pepsico} />
          <SentryRoute path="/upload" component={DemographicsUpload} />
          <SentryRoute path="/success" component={UploadSuccess} />
          <SentryRoute path="/checkins" component={PepsicoCheckInLists} />
          <SentryRoute path="/" component={App} />
        </Switch>
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);

ReactDOM.render(routing, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
