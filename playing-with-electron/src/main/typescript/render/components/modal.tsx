import {Component, MouseEvent} from "react";
import * as React from "react";

interface Properties {
    content?: JSX.Element;
    onClose?: (e: MouseEvent<HTMLSpanElement>) => void;
}

export class Modal extends Component<Properties, {}> {

    private innerContent: JSX.Element;

    constructor(props?: {}, context?: any) {
        super(props, context);
    }

    public componentWillMount() {
        if (this.props.content) {
            this.innerContent = (
                <div className="modal-content">
                    <span className="close-modal" onClick={(e) => this.props.onClose(e)}>&times;</span>
                    {this.props.content}
                </div>
            );
        } else {
            return (
                <div className="modal-content">
                    <span className="close-modal" onClick={(e) => this.props.onClose(e)}>&times;</span>
                </div>
            );
        }
    }

    public render() {
        return (
            <div className="modal">
                {this.innerContent}
            </div>
        );
    }
}
