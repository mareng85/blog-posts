import AwsProfile = require("../model/awsprofile");
import {Store} from "./store";

const awsProfileStore = new Store<AwsProfile>("awsProfileStore");

export = awsProfileStore;
