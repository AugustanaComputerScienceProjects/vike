import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Link, BrowserRouter as Router } from 'react-router-dom'
import './index.css';
import App from './App';
import Pepsico from './Pepsico'
import DemographicsUpload from './DemographicsUpload'
import * as serviceWorker from './serviceWorker';

const routing = (
    <Router>
        <Route exact path="/" component={App} />
        <Route path="/pepsico" component={Pepsico} />
        <Route path="/upload" component={DemographicsUpload} />
    </Router>
)

ReactDOM.render(routing, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
