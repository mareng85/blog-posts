import fs = require("fs");
import {WriteStream} from "fs";

module FileSystem {
    export function writeFileAsync(fileName: string, data: any) {
        fs.writeFile(fileName, data, (err) => {
            if (err) { throw err; }
            console.log("The file has been saved!");
        });
    }

    export function readFileAsync(filePath: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            fs.readFile(filePath, (err, data) => {
                if (err) { reject(err); } else { resolve(data); }
            });
        });
    }

    export function createWriteStream(fileName: string): WriteStream {
        return fs.createWriteStream(fileName);
    }
}

export  = FileSystem;
