import * as React from "react";
import {Component} from "react";
import {MouseEvent} from "react";

interface Properties {
    content?: JSX.Element;
    onLeave?: (e: MouseEvent<HTMLDivElement>) => void;
    top: string;
    left: string;
}

export class ContextMenu extends Component<Properties, {}> {

    constructor(props?: Properties, context?: any) {
        super(props, context);
    }

    public render() {

        const top = this.props.top;
        const left = this.props.left;

        return (
            <div id="context-menu"
                 className="context-menu"
                 onMouseLeave={(e) => this.props.onLeave(e)}
                 style={{left, top, position: "absolute"}}>
                {this.props.content}
            </div>
        );
    }
}
