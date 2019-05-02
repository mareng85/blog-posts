import fs = require("fs");
import os = require("os");
import * as React from "react";
import {Component, MouseEvent} from "react";
import AwsProfile = require("../model/awsprofile");
import awsProfileStore = require("../store/awsprofilestore");
import pageStore = require("../store/pagestore");
import regionStore = require("../store/regionstore");

export class Login extends Component<{}, {awsProfiles: AwsProfile[]}> {

    constructor(props?: {}, context?: any) {
        super(props, context);
        this.state = {awsProfiles: []};
    }

    public onLogin(e: MouseEvent<HTMLButtonElement>) {
        const selectedProfileElement = document.getElementById("selectedprofile") as HTMLSelectElement;

        const selectedProfile = selectedProfileElement.options[selectedProfileElement.selectedIndex].value;

        if (this.state.awsProfiles) {
            this.state.awsProfiles.forEach(profile => {
                if (profile.name === selectedProfile) {
                    pageStore.set({name: "browseBucketsPage"});
                    regionStore.set({name: "eu-west-1"});
                    awsProfileStore.set(profile);
                    return;
                }
            });
        }
    }

    public componentWillMount() {
        this.readAwsConfigFile();
    }

    public readAwsConfigFile() {
        const homeDir = os.homedir();
        fs.readFile(homeDir + "/.aws/credentials", "utf8", (err, data) => {
            if (err) {
                alert("Error reading file");
            }
            if (data) {
                this.parseAwsConfigFile(data);
            }
        });
    }

    public render() {
        return (
            <div style={{marginTop: 30 + "px"}}>
                <h3 className="select-profile-text">Select profile</h3>
                <select id="selectedprofile">
                    {this.createSelectOptions()}
                </select>
                <br />
                <button style={{marginTop: 30 + "px"}} className="btn btn-primary" id="login-button" onClick={(e) => this.onLogin(e)}>Login</button>
            </div>
        );
    }

    private parseAwsConfigFile(data: string) {
        const profiles = data.split("\n\n");

        const awsProfiles: AwsProfile[] = [];

        profiles.forEach(profile => {
            const profileLine = data.split("\n");
            const profileNameMatches = profile.match("[^(\\[)](.*?)(?=\\])");
            const accessKeyIdMatches = profile.match("[^a-z_=\\s][A-Z\\d\\n]{19}");
            const secretAccessKeyIdMatches = profile.match("[a-zA-Z\\d\\n\\^\\/]{40}");
            let name;
            const region = "eu-west-1";
            let accessKeyId;
            let secretAccessKeyId;
            const outputFormat = "json";

            if (profileNameMatches.length >= 1) {
                name = profileNameMatches[0];
            }

            if (accessKeyIdMatches.length >= 1) {
                accessKeyId = accessKeyIdMatches[0];
            }

            if (secretAccessKeyIdMatches.length >= 1) {
                secretAccessKeyId = secretAccessKeyIdMatches[0];
            }

            const config: AwsProfile = {name, region, accessKeyId, secretAccessKeyId, outputFormat};
            awsProfiles.push(config);
        });

        this.setState({awsProfiles});
    }

    private createSelectOptions(): JSX.Element[] {
        const options: JSX.Element[] = [];
        if (this.state.awsProfiles) {
            this.state.awsProfiles.forEach(profile => {
                options.push(<option key={profile.name}>{profile.name}</option>);
            }) ;
        }

        return options;
    }
}
