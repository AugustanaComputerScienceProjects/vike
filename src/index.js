import { red } from "@mui/material/colors";
import { ThemeProvider, createTheme } from "@mui/material/styles";
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
      <Router>
        <Switch>
          <Route path="/pepsico" component={Pepsico} />
          <Route path="/upload" component={DemographicsUpload} />
          <Route path="/success" component={UploadSuccess} />
          <Route path="/checkins" component={PepsicoCheckInLists} />
          <Route path="/" component={App} />
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
