import S3Bucket = require("../model/s3bucket");
import {Store} from "./store";

const bucketStore = new Store<S3Bucket[]>("bucketStore");

export = bucketStore;
