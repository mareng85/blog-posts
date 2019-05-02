import * as React from "react";
import {Component, MouseEvent} from "react";
import S3Client = require("../aws/s3client");
import * as Log from "../logger/logger";
import S3Bucket = require("../model/s3bucket");
import awsProfileStore = require("../store/awsprofilestore");
import bucketStore = require("../store/bucketstore");
import pageStore = require("../store/pagestore");
import selectedBucketStore = require("../store/selectedbucketstore");
import {ContextMenu} from "./contextmenu";
import {Modal} from "./modal";

interface Properties {
    region?: string;
}

interface State {
    buckets: S3Bucket[];
    selectedBucket: S3Bucket;
    showModal: boolean;
    bucketNameInput?: string;
    contextMenu: ContextMenuState;
}

interface ContextMenuState {
    showContextMenu: boolean;
    top?: string;
    left?: string;
}

export class BucketBrowser extends Component<Properties, State> {

    private s3client: S3Client;

    constructor(props?: Properties, context?: any) {
        super(props, context);
        this.onStateChange = this.onStateChange.bind(this);
        this.state = { buckets: null, selectedBucket: null, showModal: false, contextMenu: {showContextMenu: false}};

        this.s3client = new S3Client(awsProfileStore.get());
    }

    public componentWillMount() {
        bucketStore.onChange(buckets => {
            this.setState({buckets});
        });

        this.listBuckets();
    }

    public componentWillUnmount() {
        this.state = null;
    }

    public listBuckets() {
        this.s3client.listBuckets()
            .then(buckets => {
                bucketStore.set(buckets);
            });
    }

    public render() {
        const buckets: JSX.Element[] = [];
        if (this.state.buckets && this.state.buckets.length >= 0) {
            this.state.buckets.forEach(bucket => {
                buckets.push(
                    <tr key={bucket.name}>
                        <td>
                            {this.buildBucketDiv(bucket.name)}
                        </td>
                    </tr>);
            });
        }
        return (
            <div className="buckets-table-div">
                {this.showContextMenul()}
                {this.showModal()}
                {this.showToolBar()}
                <table className="buckets-table">
                    <thead>
                    <tr>
                    </tr>
                    </thead>
                    <tbody>
                        {buckets}
                    </tbody>
                </table>
            </div>
        );
    }

    public onDeleteBucket(e: MouseEvent<HTMLAnchorElement>, s3Bucket: S3Bucket) {
        this.s3client.deleteBucket(s3Bucket.name).then(data => {
            Log.debug("Bucket deleted! " + JSON.stringify(data));
            this.listBuckets();
        }).catch(error => {
            Log.error("Could not delete: " + error);
        });
    }

    private showToolBar(): JSX.Element {
        return (
            <div>
                <button onClick={(e) => this.onClickCreateBucketButton(e)}>Create Bucket</button>
            </div>
        );
    }

    private onStateChange(buckets: S3Bucket[], selectedBucket: S3Bucket) {
        this.setState({ buckets, selectedBucket });
    }

    private onClick(e: MouseEvent<HTMLDivElement>, bucket: S3Bucket): void {
        this.setState({selectedBucket: bucket});
        Log.debug("Selected bucket: " + bucket.name);
        selectedBucketStore.set(bucket);
        pageStore.set({name: "browseObjectsPage"});
    }

    private buildBucketDiv(bucketName: string): JSX.Element {
        return (
            <div className="bucket-object"
                 onClick={(e) => (this.onClick(e, {name: bucketName}))}
                 onContextMenu={(e) => this.onShowContextMenu(e, {name: bucketName})}
                 key={bucketName}>
                {bucketName}
            </div>
        );
    }

    private buildModalContent(): JSX.Element {
        return (
            <div>
                <input type="text" onChange={(e) => this.onChangeInput(e)}/>
                <span onClick={(e) => this.onCreateBucket(e)}>Create</span>
            </div>
        );
    }

    private onClickCreateBucketButton(e: React.MouseEvent<HTMLButtonElement>) {
        this.setState({showModal: true});
    }

    private showModal(): JSX.Element {
        if (this.state.showModal) {
            return (
                <Modal content={this.buildModalContent()} onClose={(e) => this.onCloseModal(e)}/>
            );
        } else {
            return null;
        }
    }

    private onCloseModal(e: React.MouseEvent<HTMLSpanElement>) {
        this.setState({showModal: false, bucketNameInput: null});
    }

    private onShowContextMenu(e: MouseEvent<HTMLDivElement>, s3Bucket: S3Bucket) {
        e.preventDefault();

        const showContextMenu = true;
        const left = (e.pageX) + "px";
        const top = (e.pageY) + "px";

        this.setState({contextMenu: {showContextMenu, top, left}, selectedBucket: s3Bucket});
    }

    private showContextMenul(): JSX.Element {
        if (this.state.contextMenu && this.state.contextMenu.showContextMenu) {
            const top = this.state.contextMenu.top;
            const left = this.state.contextMenu.left;

            return (
                <ContextMenu content={this.buildContextMenuContent()}
                             onLeave={(e) => this.onLeaveContextMenu(e)}
                             top={top}
                             left={left}
                />
            );
        } else {
            return null;
        }
    }

    private buildContextMenuContent(): JSX.Element {

        if (this.state.selectedBucket) {
            const bucket: S3Bucket = this.state.selectedBucket;
            return (
                <ul>
                    <li><a href="#" onClick={(e) => this.onDeleteBucket(e, bucket)}>Delete</a></li>
                </ul>
            );
        } else {
            return null;
        }
    }

    private onLeaveContextMenu(e: MouseEvent<HTMLDivElement>) {
        e.preventDefault();
        Log.debug("Leaving context menu");
        this.setState({contextMenu: {showContextMenu: false, left: null, top: null}});
    }

    private onCreateBucket(e: React.MouseEvent<HTMLSpanElement>) {
        if (this.state.bucketNameInput) {
            const bucketName = this.state.bucketNameInput;
            this.s3client.createBucket(bucketName)
                .then(value => {
                    Log.debug("Bucket created with name " + bucketName);
                    this.setState({showModal: false, bucketNameInput: null});
                    this.listBuckets();
            });
        } else {
            alert("Please enter a bucket name!");
        }
    }

    private onChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({bucketNameInput: e.target.value});
    }
}
