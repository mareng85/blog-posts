import S3Bucket = require("./s3bucket");

interface S3Object {
    name: string;
    key: string;
    eTag: string;
    size?: number;
    lastModified?: string;
    storageClass?: string;
    isFolder?: boolean;
    belongsToBucket?: S3Bucket;
}

export = S3Object;
