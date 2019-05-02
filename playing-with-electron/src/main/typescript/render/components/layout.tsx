import * as React from "react";
import {Component} from "react";
import {Main} from "./main";
import {Menu} from "./menu";

export class Layout extends Component<{}, {}> {

    constructor(props?: {}, context?: any) {
        super(props, context);
    }

    public render() {
        return (
            <div>
                <Menu windowType="mainWindow" />
                <Main />
            </div>
        );
    }
}
