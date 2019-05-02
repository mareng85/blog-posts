import * as React from "react";
import {Component, MouseEvent} from "react";
import * as Log from "../logger/logger";
import Page = require("../model/page");
import pageStore = require("../store/pagestore");
import selectedBucketStore = require("../store/selectedbucketstore");
import {BucketBrowser} from "./bucketbrowser";
import {Login} from "./login";
import {ObjectBrowser} from "./objectbrowser";

export class Main extends Component<{}, {page: Page}> {

    constructor(props?: {}, context?: any) {
        super(props, context);
        this.onPageChange = this.onPageChange.bind(this);
    }

    public componentWillMount() {
        this.setState({page: {name: "startPage"}});
        pageStore.onChange(this.onPageChange);
    }

    public render() {
        switch (this.state.page.name) {
            case "startPage":
                return (
                    <div className="start-page">
                        <button type="button" className="btn btn-primary" id="create-profile" onClick={this.onCreateProfile}>Create new profile</button>
                        <Login />
                    </div>
                );
            case "browseBucketsPage":
                return (
                    <BucketBrowser />
                );
            case "browseObjectsPage":
                const bucket = selectedBucketStore.get();
                return (
                    <ObjectBrowser bucket={bucket} />
                );
            default:
                throw new Error("Page with name " + this.state.page + " not found");
        }
    }

    private onCreateProfile(e: MouseEvent<HTMLButtonElement>) {
        alert("Not implemented yet!");
    }

    private onPageChange(page: Page): void {
        Log.debug("onPageChange");
        this.setState({page});
    }
}
