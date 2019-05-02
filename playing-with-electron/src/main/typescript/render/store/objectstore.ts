import S3Object = require("../model/s3object");
import {Store} from "./store";

const objectStore = new Store<S3Object[]>("objectStore");

export = objectStore;
