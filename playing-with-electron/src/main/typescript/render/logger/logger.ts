module Logger {

    let enabled: boolean = false;

    export function enableLogging() {
        enabled = true;
    }

    export function log(msg: string, ...optionalParams: any[]) {
        if (enabled) {
            console.log(msg, optionalParams);
        }
    }

    export function info(msg: string, ...optionalParams: any[]) {
        if (enabled) {
            console.info("INFO --- " + msg, optionalParams);
        }
    }

    export function warn(msg: string, ...optionalParams: any[]) {
        if (enabled) {
            console.warn("WARN --- " + msg, optionalParams);
        }
    }

    export function error(msg: string, ...optionalParams: any[]) {
        if (enabled) {
            console.error("ERROR --- " + msg, optionalParams);
        }
    }

    export function debug(msg: string, ...optionalParams: any[]) {
        if (enabled) {
            console.debug("DEBUG --- " + msg, optionalParams);
        }
    }
}

export = Logger;
