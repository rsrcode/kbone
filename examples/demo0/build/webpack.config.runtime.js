const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode: 'production',
    entry: {
        a: path.resolve(__dirname, '../src/pages/a.js'),
        b: path.resolve(__dirname, '../src/pages/b.js'),
        c: path.resolve(__dirname, '../src/pages/c.js'),
    },
    output: {
        path: path.resolve(__dirname, '../dist/runtime'),
        publicPath: './',
        filename: '[name].js'
    },
    target: 'web',
    optimization: {
        splitChunks: {
            minSize: 1000,
            chunks: 'async',
            name: true,
            cacheGroups: {
                vendors: {
                    chunks: 'all',
                    name: 'vendors',
                    test: /[\\/]node_modules[\\/]/
                }
            }
        },
        runtimeChunk: {
            name: 'runtime',
        }
    },
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
