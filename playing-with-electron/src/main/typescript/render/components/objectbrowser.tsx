import * as React from "react";
import {Component, MouseEvent, MouseEventHandler} from "react";
import {DragEvent} from "react";
import Dropzone, {DropFilesEventHandler, ImageFile} from "react-dropzone";
import S3Client = require("../aws/s3client");
import * as FileSystem from "../filesystem/filesystem";
import * as Log from "../logger/logger";
import S3Bucket = require("../model/s3bucket");
import S3Object = require("../model/s3object");
import awsProfileStore = require("../store/awsprofilestore");
import objectStore = require("../store/objectstore");
import pageStore = require("../store/pagestore");
import {ContextMenu} from "./contextmenu";
import {Modal} from "./modal";

interface Properties {
    bucket: S3Bucket;
}

interface State {
    objects: S3Object[];
    currentPath: string;
    level: number;
    contextMenu: ContextMenuProps;
    upload: boolean;
    uploadButtonText: string;
    showModal: boolean;
    folderNameInput?: string;
}

interface ContextMenuProps {
    hidden: boolean;
    left: string;
    top: string;
    selectedS3Object: S3Object;
}

export class ObjectBrowser extends Component<Properties, State> {

    private s3client: S3Client;

    constructor(props?: Properties, context?: any) {
        super(props, context);
        this.onStateChange = this.onStateChange.bind(this);
        this.state = {currentPath: "", level: 0, objects: null, contextMenu: null, upload: false, uploadButtonText: "Upload", showModal: false};
        this.s3client = new S3Client(awsProfileStore.get());
    }

    public componentWillMount() {
        objectStore.onChange( objects => {
            this.setState({objects});
        });

        this.listObjects("", 0);

    }

    public listObjects(path: string, level: number) {
        Log.debug("Prefix: " + path + ", level: " + level);
        this.s3client.listObjects(this.props.bucket, path).
        then(data => {
            const objects: S3Object[] = [];
            const tmp: string[] = [];
            const i = level;

            data.forEach((object: S3Object) => {
                const item = object.name.split("/");

                if (!tmp.includes(item[i]) && item[i].length > 0) {
                    tmp.push(item[i]);
                    objects.push(
                        {
                            name: item[i],
                            key: object.key,
                            lastModified: object.lastModified,
                            eTag: object.eTag,
                            size: object.size,
                            storageClass: object.storageClass,
                            isFolder: this.isFolder(item, level),
                            belongsToBucket: this.props.bucket,
                        });
                }
            });
            objectStore.set(objects);
        });
    }

    public onDownloadFile(e: MouseEvent<HTMLAnchorElement>, s3Object: S3Object) {
        this.s3client.downloadObject(s3Object).then(data => {
            Log.info("Done downloading file! " + JSON.stringify(data));
            this.refresh();
           // FileSystem.writeFileAsync("/tmp/" + s3Object.name, data.Body.data);
        }).catch(error => {
            Log.error("Could not download: " + error);
        });
    }

    public onDeleteFile(e: MouseEvent<HTMLAnchorElement>, s3Object: S3Object) {
        this.s3client.deleteObject(s3Object).then(data => {
            Log.info("Done deletion of file! " + JSON.stringify(data));
            this.refresh();
            // FileSystem.deleteFileAsync("/tmp/" + s3Object.name, data.Body.data);
        }).catch(error => {
            Log.error("Could not delete: " + error);
        });
    }

    public refresh() {
        this.listObjects(this.state.currentPath, this.state.level);
    }

    public render() {
        const objects: JSX.Element[] = [];
        if (this.state.objects && this.state.objects.length >= 0) {
            this.state.objects.forEach(object => {
                objects.push(
                    <tr key={object.name}>
                        <td>
                            {this.buildObjectDiv(object)}
                        </td>
                        <td>
                            <div className="bucket-object" key={object.lastModified}>
                                {String(object.lastModified)}
                            </div>
                        </td>
                        <td>
                            <div className="bucket-object" key={object.size}>
                                {object.size}
                            </div>
                        </td>
                        <td>
                            <div className="bucket-object" key={String(object.storageClass)}>
                                {object.storageClass}
                            </div>
                        </td>
                    </tr>);
            });
        }

        return (
            <div id="buckets-table-div">
                {this.showModal()}
                {this.showDropzone()}
                {this.showContextMenu()}
                {this.showBreadcrumb()}
                {this.showToolBar()}
                <table className="buckets-table">
                    <thead>
                    <tr>
                        <td>Name</td>
                        <td>Last modified</td>
                        <td>Size</td>
                        <td>Storage class</td>
                    </tr>
                    </thead>
                    <tbody>
                    {objects}
                    </tbody>
                </table>
            </div>
        );
    }

    private isFolder(item: string[], level: number): boolean {
        return item.length > ++level;
    }

    private onStateChange(objects: S3Object[]) {
        this.setState({ objects });
    }

    private showToolBar(): JSX.Element {
        if (this.state.level >= 0) {
            return (
                <div>
                    <button onClick={(e) => this.onClickBackButton(e)}>Back</button>
                    <button onClick={(e) => this.onClickCreateFolderButton(e)}>Create Folder</button>
                    <button onClick={(e) => this.onClickUploadButton(e)}>{this.state.uploadButtonText}</button>
                </div>
            );
        }
        return null;
    }

    private onClickUploadButton(e: MouseEvent<HTMLButtonElement>) {
        if (this.state.upload) {
            this.setState({upload: false, uploadButtonText: "Upload"});
        } else {
            this.setState({upload: true, uploadButtonText: "Cancel"});
        }
    }

    private onClickCreateFolderButton(e: MouseEvent<HTMLButtonElement>) {
        this.setState({showModal: true});
    }

    private onClickBackButton(e: MouseEvent<HTMLButtonElement>) {
        Log.debug("Back pressed");
        if (this.state.level === 0) {
            this.setState({level: 0, currentPath: ""});
            pageStore.set({name: "browseBucketsPage"});
        } else {
            const level = this.state.level - 1;
            const pathArr = this.state.currentPath.split("/");
            pathArr.pop();
            const path = pathArr.join("/");
            this.setState({level, currentPath: path});
            this.listObjects(path, level);
        }
    }

    private onClickObject(e: MouseEvent<HTMLDivElement>, s3Object: {name: string}): void {
        if (s3Object.name === this.state.currentPath) {
            return;
        }

        Log.debug("Clicked s3Object: " + s3Object.name);
        let currentPath;
        if (this.state.level === 0) {
            currentPath = s3Object.name;
        } else {
            currentPath = this.state.currentPath + "/" + s3Object.name;
        }
        const level = this.state.level + 1;
        this.setState({level , currentPath});
        this.listObjects(currentPath, level);
    }

    private onShowContextMenu(e: MouseEvent<HTMLDivElement>, s3Object: S3Object) {
        e.preventDefault();

        const hidden = false;
        const left = (e.pageX) + "px";
        const top = (e.pageY) + "px";

        this.setState({contextMenu: {hidden, left, top, selectedS3Object: s3Object}});
    }

    private showContextMenu(): JSX.Element {
        if (this.state.contextMenu !== null && this.state.contextMenu.selectedS3Object !== null ) {
            const selectedS3Object = this.state.contextMenu.selectedS3Object;
            const display = this.state.contextMenu.hidden ? "none" : "block";
            const left = this.state.contextMenu.left;
            const top = this.state.contextMenu.top;

            return <ContextMenu content={this.buildContextMenuContent(selectedS3Object)}
                         onLeave={(e) => this.onHideContextMenu(e)}
                         top={top}
                         left={left}
            />;
        } else {
            return null;
        }
    }

    private buildContextMenuContent(selectedS3Object: S3Object): JSX.Element {
        return (
            <ul>
                <li><a href="#" onClick={(e) => this.onDownloadFile(e, selectedS3Object)}>Download {selectedS3Object.name}</a></li>
                <li><a href="#" onClick={(e) => this.onDeleteFile(e, selectedS3Object)}>Delete {selectedS3Object.name}</a></li>
            </ul>
        );
    }

    private onHideContextMenu(e: MouseEvent<HTMLDivElement>) {
        e.preventDefault();
        Log.debug("Hiding context menu");
        const hidden = true;
        this.setState({contextMenu: {hidden, left: null, top: null, selectedS3Object: null}});
    }

    private onCreateFolder(e: React.MouseEvent<HTMLSpanElement>) {
        if (this.state.folderNameInput) {
            let folderName = this.state.folderNameInput;
            folderName = folderName.endsWith("/") ? folderName : folderName + "/";
            const key = this.state.currentPath ? this.state.currentPath + "/" + folderName : folderName;
            this.s3client.createFolder(this.props.bucket.name, key)
                .then(value => {
                    Log.info("Folder created with name " + folderName);
                    this.setState({showModal: false, folderNameInput: null});
                    this.refresh();
                });
        } else {
            alert("Please enter a bucket name!");
        }
    }

    private onChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({folderNameInput: e.target.value});
    }

    private buildModalContent(): JSX.Element {
        return (
            <div>
                <input type="text" onChange={(e) => this.onChangeInput(e)}/>
                <span onClick={(e) => this.onCreateFolder(e)}>Create</span>
            </div>
        );
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
        this.setState({showModal: false, folderNameInput: null});
    }

    private getIconForFileType(name: string): string {
        if (name.endsWith(".pdf")) {
            return "fa fa-file-pdf";
        } else if (name.endsWith(".doc") || name.endsWith(".docx")) {
            return "fa fa-file-word";
        } else if (name.endsWith(".css") || name.endsWith(".css3")) {
            return "fa fa-css3";
        } else if (name.endsWith(".txt") || name.endsWith(".xml") || name.endsWith(".json")) {
            return "fa fa-file-alt";
        } else if (name.endsWith(".png")
            || name.endsWith(".jpeg")
            || name.endsWith(".jpg")
            || name.endsWith(".gif")
            || name.endsWith(".ico")
            || name.endsWith(".svg")
        ) {
            return "fa fa-image";
        } else if (name.endsWith(".java")
            || name.endsWith(".js")
            || name.endsWith(".ts")
            || name.endsWith(".php")
            || name.endsWith(".c")
            || name.endsWith(".cpp")
            || name.endsWith(".cs")
        ) {
            return "fa fa-code";
        } else {
            return "fa fa-file";
        }
    }

    private onDrop(accepted: ImageFile[], rejected: ImageFile[], event: DragEvent<HTMLDivElement>) {
        accepted.forEach((value) => {
            FileSystem.readFileAsync(value.path)
                .then(blob => {
                    const data = new Buffer(blob, "binary");
                    const keyName = this.state.currentPath ? this.state.currentPath + "/" + value.name : value.name;
                    this.s3client.uploadObject(this.props.bucket.name, keyName, data, (loaded, total, key) => {
                        console.log("Loaded bytes: " + loaded);
                    })
                        .then(result => {
                            Log.debug("Uploading after file drop done!");
                            this.setState({uploadButtonText: "Upload"});
                            this.refresh();
                        }).catch(error => {
                            throw error;
                        });
                });
        });

        this.setState({upload: false});
    }

    private showDropzone(): JSX.Element {
        const profileNav: HTMLElement = document.querySelector(".profile-nav");
        Log.debug("profileNav: " + profileNav)
        if (this.state.upload) {
            profileNav.style.marginTop = "0px";
            return (<Dropzone onDrop={(accepted, rejected, e) => this.onDrop(accepted, rejected, e)}
                              multiple
                              accept="application/*, audio/*, video/*, image/*, text/*"
                              className="dropzone"
                              activeClassName="dropzone-active"
                              rejectClassName="dropzone-reject">
                <h3>Drag any files to here</h3>
            </Dropzone>);
        } else {
            if (profileNav) {
                profileNav.style.marginTop = "50px";
            }
            return null;
        }
    }

    private showBreadcrumb(): JSX.Element {
        const pathElement: JSX.Element = null;
        const bucket = this.props.bucket.name;
        const path: Array<{level: number, path: string}> = [];

        if (this.state.currentPath) {
            let lvl = 1;
            const tmp = this.state.currentPath.split("/");
            tmp.forEach(item => {
                path.push({path: item, level: lvl++});
            });
        }

        const lis: JSX.Element[] = [];
        path.forEach(li => {
            lis.push(
                <li className="breadcrumb-item" key={li.path + "_" + li.level }>
                    <a href="#" onClick={(e) => this.onClickBreadcrumb(e, li.path, li.level)}>{li.path}</a>
                </li>);
        });

        return (
            <nav aria-label="breadcrumb" className="profile-nav">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <a href="#" onClick={(e) => this.onClickBreadcrumb(e, null, 0)}>{this.props.bucket.name}</a>
                    </li>
                    {lis}
                </ol>
            </nav>
        );
    }

    private onClickBreadcrumb(e: MouseEvent<HTMLAnchorElement>, path: string, level: number): void {
        this.setState({level , currentPath: path});
        this.listObjects(path, level);
    }

    private buildObjectDiv(s3Object: S3Object): JSX.Element {

        const isFolder: boolean = s3Object.isFolder;
        const name = isFolder ? s3Object.name + "/" : s3Object.name;
        const onClick: MouseEventHandler<HTMLDivElement> = isFolder ?
             (e) => this.onClickObject(e, {name: s3Object.name}) : null;

        const clazz: string = isFolder ? "fa fa-folder" : this.getIconForFileType(name);

        return (
            <div className="bucket-object"
                 onContextMenu={(e) => this.onShowContextMenu(e, s3Object)}
                 onClick={onClick}
                 key={s3Object.name}>
                <i className={clazz}></i> {name}
            </div>
        );
    }
}
