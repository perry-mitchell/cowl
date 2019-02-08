const path = require("path");

module.exports = {
    // entry: path.resolve(__dirnamem "./source/index.js");

    mode: "development",

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            }
        ]
    },

    node: {
        fs: "empty",
        net: "empty"
    }

    // output: {
    //     filename: "cowl.js",
    //     path: path.resolve(__dirname, "./dist")
    // }
};
