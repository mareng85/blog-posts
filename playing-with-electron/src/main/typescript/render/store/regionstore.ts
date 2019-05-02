import Region = require("../model/region");
import {Store} from "./store";

const regionStore = new Store<Region>("regionStore");

export = regionStore;
