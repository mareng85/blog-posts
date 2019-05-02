interface AwsProfile {
    name: string;
    region: string;
    accessKeyId: string;
    secretAccessKeyId: string;
    outputFormat: string;
}

export = AwsProfile;
