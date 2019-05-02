import Page = require("../model/page");
import {Store} from "./store";

const pageStore = new Store<Page>("pageStore");

export = pageStore;
