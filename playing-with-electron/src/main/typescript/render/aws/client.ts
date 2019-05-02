import S3Object = require("../model/s3object");

interface Client {
    listFiles(): Promise<S3Object[]>;

}

export = Client;
