import * as React from "react";
import * as ReactDOM from "react-dom";
import {About} from "./components/about";
import {Layout} from "./components/layout";
import {Settings} from "./components/settings";
import * as Log from "./logger/logger";
import bucketStore = require("./store/bucketstore");
import pageStore = require("./store/pagestore");
import regionStore = require("./store/regionstore");

let component: any;
let settingsComponent: any;
let aboutComponent: any;

export function render() {
    // TODO: auto enable on dev, disable on prod
    Log.enableLogging();

    window.onerror = (event: Event | string, source?: string, fileno?: number, columnNumber?: number, error?: Error): void => {
        console.error(event, fileno + ":" + columnNumber, error);
    };

    clearStores();

    const mainElement = document.getElementById("main-content");
    const settingsElement = document.getElementById("settings-content");
    const aboutElement = document.getElementById("about-content");

    if (mainElement) {
        component = ReactDOM.render(<Layout/>, document.getElementById("main-content"));
    }

    if (settingsElement) {
        settingsComponent = ReactDOM.render(<Settings />, document.getElementById("settings-content"));
    }

    if (aboutElement) {
        aboutComponent = ReactDOM.render(<About />, document.getElementById("about-content"));
    }

    window.onchange = () => {
    };
}

function clearStores() {
    [
        regionStore,
        pageStore,
        bucketStore,
    ].forEach(store => store.clear());
}

render();
