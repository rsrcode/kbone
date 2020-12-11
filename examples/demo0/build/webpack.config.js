const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode: 'production',
    entry: {
        main: path.resolve(__dirname, '../src/pages/main.js'),
        a: path.resolve(__dirname, '../src/pages/a.js'),
        b: path.resolve(__dirname, '../src/pages/b.js'),
        c: path.resolve(__dirname, '../src/pages/c.js'),
    },
    output: {
        path: path.resolve(__dirname, '../dist/web'),
        publicPath: './',
        filename: '[name].js'
    },
    target: 'web',
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ],
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]?[hash]'
                }
            }
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.vue', '.json']
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css'
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            chunks: ['index'],
            template: path.join(__dirname, '../index.html')
        }),
    ],
}
