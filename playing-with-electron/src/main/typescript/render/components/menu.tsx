import {ipcRenderer} from "electron";
import * as React from "react";
import {Component} from "react";
import * as Log from "../logger/logger";
import Region = require("../model/region");
import regionStore = require("../store/regionstore");

interface Properties {
    windowType: string;
}

export class Menu extends Component<Properties, {region: Region}> {

    constructor(props?: Properties, context?: any) {
        super(props, context);
        this.onRegionChange = this.onRegionChange.bind(this);
    }

    public onClose(e: any) {
        switch (this.props.windowType) {
            case "mainWindow":
                ipcRenderer.send("close-main-window");
                break;
            case "settingsWindow":
                ipcRenderer.send("close-settings-window");
                break;
            case "aboutWindow":
                ipcRenderer.send("close-about-window");
                break;
        }
    }

    public onOpenSettings(e: any) {
        ipcRenderer.send("open-settings-window");
    }

    public componentWillMount() {
        this.setState({region: null});
        regionStore.onChange(this.onRegionChange);
    }

    public render() {
        let region: JSX.Element = null;
        if (this.state.region != null) {
            region = <div key="region-text" className="region-text">{this.state.region.name}</div>;
        }
        return (
            <div>
                <div className="top-list">
                    {this.getButtonsForWindow()}
                    <div className="alert alert-info">
                        { region }
                    </div>
                </div>
        </div>
        );
    }

    private onRegionChange(region: Region): void {
        Log.debug("onRegionChange " + region.name);
        this.setState({region});
    }

    private getButtonsForWindow(): JSX.Element[] {
        const elements: JSX.Element[] = [];
        switch (this.props.windowType) {
            case "mainWindow":
                elements.push(<div key="settings-button" className="settings" onClick={(e) => this.onOpenSettings(e)}>Settings</div>);
                elements.push(<div key="close-button" className="close" onClick={(e) => this.onClose(e)}>Close</div>);
                break;
            case "settingsWindow":
                elements.push(<div key="close-button" className="close" onClick={(e) => this.onClose(e)}>Close</div>);
                break;
            case "aboutWindow":
                elements.push(<div key="close-button" className="close" onClick={(e) => this.onClose(e)}>Close</div>);
                break;
        }
        return elements;
    }
}
