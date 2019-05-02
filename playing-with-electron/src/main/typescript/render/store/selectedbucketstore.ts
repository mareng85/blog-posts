import S3Bucket = require("../model/s3bucket");
import {Store} from "./store";

const selectedBucketStore = new Store<S3Bucket>("selectedBucketStore");

export = selectedBucketStore;
