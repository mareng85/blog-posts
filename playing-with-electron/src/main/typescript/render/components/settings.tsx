import * as React from "react";
import {Component} from "react";
import S3Client = require("../aws/s3client");
import {Menu} from "./menu";

export class Settings extends Component<{}, {}> {

    private s3client: S3Client;

    constructor(props?: {}, context?: any) {
        super(props, context);
    }

    public componentWillMount() { }

    public render() {
        return (
            <div>
                <Menu windowType="settingsWindow"/>
                <p>Settings...</p>
            </div>
        );
    }
}
