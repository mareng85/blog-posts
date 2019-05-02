var webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode: "production",
    entry: ["./src/main/typescript/render/entry.tsx"],
    output: {
        path: __dirname,
        filename: "src/main/app/js/bundle.js",
    },
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
        new UglifyJsPlugin()
    ]
};