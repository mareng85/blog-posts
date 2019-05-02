var webpack = require('webpack');

module.exports = {
    mode: "development",
    entry: ["./src/main/typescript/render/entry.tsx"],
    output: {
        path: __dirname,
        filename: "src/main/app/js/bundle.js",
    },
    devtool: "source-map",

    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    node: {
        __dirname: false,
        __filename: false
    },
    target: "electron-main",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader"
            }
        ]
    },
    plugins: [
    ]
};