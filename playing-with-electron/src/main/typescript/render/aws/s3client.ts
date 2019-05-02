import * as AWS from "aws-sdk";
import {S3} from "aws-sdk";
import {CreateBucketRequest, DeleteBucketRequest, PutObjectRequest} from "aws-sdk/clients/s3";
import * as FileSystem from "../filesystem/filesystem";
import * as Logger from "../logger/logger";
import AwsProfile = require("../model/awsprofile");
import S3Bucket = require("../model/s3bucket");
import S3Object = require("../model/s3object");

class S3Client {
    private s3: S3 = null;

    constructor(awsProfile: AwsProfile) {
        AWS.config.update({
            accessKeyId: awsProfile.accessKeyId,
            secretAccessKey: awsProfile.secretAccessKeyId,
            region: awsProfile.region,
        });
        Logger.debug("Using AWS Profile = " + awsProfile.name);
        this.s3 = new S3();
    }

    /**
     * List all buckets
     */
    public async listBuckets(): Promise<S3Bucket[]> {
        return new Promise<S3Bucket[]>((resolve, reject) => {
            this.s3.listBuckets((err: any, data: any) => {
                if (err) {
                    Logger.error(err, err.stack);
                    reject(err);
                } else {
                    const buckets: S3Bucket[] = [];
                    data.Buckets.forEach((bucket: any) => {
                        buckets.push({name: bucket.Name});
                    });
                    resolve(buckets);
                }
            });
        });
    }

    /**
     * List all objects in a bucket and for a specific prefix/path (i.e. folder, like /a/b/c/file.txt)
     * @param bucket
     * @param path
     */
    public async listObjects(bucket: S3Bucket, path?: string): Promise<S3Object[]> {
        return new Promise<S3Object[]>((resolve, reject) => {

            this.s3.listObjectsV2({Bucket: bucket.name, Prefix: path}, (err: any, data: any) => {
                if (err) {
                    Logger.error(err, err.stack);
                    reject(err);
                } else {
                    const objects: S3Object[] = [];
                    data.Contents.forEach((object: any) => {
                        objects.push(
                            {
                                name: object.Key,
                                key: object.Key,
                                lastModified: object.LastModified,
                                eTag: object.ETag,
                                size: object.Size,
                                storageClass: object.StorageClass,
                            });
                    });
                    resolve(objects);
                }
            });
        });
    }

    /**
     * Download an object
     * @param bucket
     * @param s3Object
     */
    public async downloadObject(s3Object: S3Object): Promise<any> {
        console.log("Downloading " + s3Object.key + " from bucket " + s3Object.belongsToBucket.name);
        return new Promise<any>((resolve, reject) => {
            this.s3.getObject({Bucket: s3Object.belongsToBucket.name, Key: s3Object.key}, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            }).createReadStream().pipe(FileSystem.createWriteStream("/tmp/" + s3Object.name));
        });
    }

    /**
     * Delete an object
     * @param bucket
     * @param s3Object
     */
    public async deleteObject(s3Object: S3Object): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.s3.deleteObject({Bucket: s3Object.belongsToBucket.name, Key: s3Object.key}, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    /**
     * Create a folder object (an object with zero bytes of data)
     * @param bucket The bucket
     * @param key The key (filename)
     */
    public async createFolder(bucket: string, key: string): Promise<any> {
        return this.uploadObject(bucket, key, null);
    }

    /**
     * Upload an objects
     * @param bucket The bucket
     * @param key The key (filename)
     * @param body The contents
     */
    public async uploadObject(bucket: string, key: string, body: Buffer,
                              progresCallback?: (loaded: number, total: number, key: string) => void): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const params: PutObjectRequest = { Bucket: bucket, Key: key, Body: body};
            const request = this.s3.putObject(params);

            // TODO: Fix progress bars
            if (progresCallback) {
                request.on("httpUploadProgress", (progres, response) => {
                    progresCallback(progres.loaded, progres.total, key);
                });
            }

            request.send((err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    /**
     * Create a bucket
     * @param bucketName
     */
    public async createBucket(bucketName: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const params: CreateBucketRequest = { Bucket: bucketName };
            this.s3.createBucket(params, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    /**
     * Delete a bucket
     * @param bucketName
     */
    public async deleteBucket(bucketName: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const params: DeleteBucketRequest = { Bucket: bucketName };
            this.s3.deleteBucket(params, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }
}

export = S3Client;
