import * as React from "react";
import {Component} from "react";
import S3Client = require("../aws/s3client");
import {Menu} from "./menu";

export class About extends Component<{}, {}> {

    private s3client: S3Client;

    constructor(props?: {}, context?: any) {
        super(props, context);
    }

    public componentWillMount() { }

    public render() {
        return (
            <div>
                <Menu windowType="aboutWindow"/>
                <div className="about-content">
                    <div className="card text-dark bg-white mb-3">
                        <div className="card-header">Created by Marc@switchcase</div>
                        <div className="card-body text-white bg-dark">
                            <h5 className="card-title">Powered by</h5>
                            <ul>
                                <li>NodeJS</li>
                                <li>Electron</li>
                                <li>React</li>
                                <li>Typescript</li>
                                <li>Webpack</li>
                                <li>Bootstrap</li>
                                <li>Font Awesome</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
