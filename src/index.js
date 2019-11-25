import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Link, BrowserRouter as Router } from 'react-router-dom'
import './index.css';
import App from './App';
import Pepsico from './Pepsico'
import DemographicsUpload from './DemographicsUpload'
import UploadSuccess from './UploadSuccess'
import PepsicoCheckInLists from './PepsicoCheckInLists'
import * as serviceWorker from './serviceWorker';

const routing = (
    <Router>
        <Route exact path="/" component={App} />
        <Route path="/pepsico" component={Pepsico} />
        <Route path="/upload" component={DemographicsUpload} />
        <Route path="/success" component={UploadSuccess} />
        <Route path="/checkins" component={PepsicoCheckInLists} />
    </Router>
)

ReactDOM.render(routing, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
