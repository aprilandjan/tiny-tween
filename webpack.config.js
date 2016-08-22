var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    //  入口文件
    entry: './src/app.js',
    //  输入目录
    output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '/',
        filename: 'bundle.js'
    },
    //  resolves
    resolve: {
        extensions: ['', '.js'],
        fallback: [path.join(__dirname, './node_modules')],
        alias: {
            'src': path.resolve(__dirname, './src'),
            'components': path.resolve(__dirname, './src/components'),
            'static': path.resolve(__dirname, './static')
        }
    },
    resolveLoader: {
        fallback: [path.join(__dirname, './node_modules')]
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules|libs/,
                loader: 'babel'
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                //  file-loader will not convert images to base64
                //  url-loader with limit=0 will convert all images to base64
                loader: 'file',
                query: {
                    // limit: 0,
                    name: 'static/[name].[ext]' //  导出目录
                }
            },
            {
                test: /\.json$/,
                loader: 'json'
            }
        ]
    },

    //  babel编译需要
    babel: {
        presets: ['es2015'],
        plugins: ['transform-runtime']
    },

    //  devServer需要
    devServer: {
        historyApiFallback: true,
        hot: false,     //  不需要实时更新，禁用
        // contentBase: '/dist/',  //   内容的基本路径
        host: '0.0.0.0',  //  添加之后可以外部访问
        noInfo:true,    //  去掉编译过程中的输出信息
        // lazy: true     //   no watching, compile on request
    }
};

//Todo: clear js map
console.log("================= " +  process.env.NODE_ENV + " ==================");
switch(process.env.NODE_ENV){
    case 'dev':
        module.exports.devtool = '#source-map';
        module.exports.module.loaders = (module.exports.module.loaders || []).concat([
            {
                test: /\.scss$/,
                loader: 'style!css!sass'
            }
        ]);
        module.exports.plugins = (module.exports.plugins || []).concat([
            new webpack.optimize.OccurenceOrderPlugin(),
            // new ExtractTextPlugin("style.css", {allChunks: false})
            new HtmlWebpackPlugin({
                filename: 'index.html',
                template: 'index.html',
                inject: true
            }),
        ]);
        break;
    case 'build':
        module.exports.output.publicPath = './';
        module.exports.module.loaders = (module.exports.module.loaders || []).concat([
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('style', 'css', 'sass')
            }
        ]);
        module.exports.plugins = (module.exports.plugins || []).concat([
            //  定义环境变量
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: '"production"'
                }
            }),
            //  压缩JS
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            }),
            //  注入HTML
            new webpack.optimize.OccurenceOrderPlugin(),
            new ExtractTextPlugin("style.[hash:7].css", {allChunks: true}),
            new HtmlWebpackPlugin({
                filename: 'index.html',
                template: 'index.html',
                inject: true,
                // minify: {
                //     removeComments: true,
                //     collapseWhitespace: true,
                //     removeAttributeQuotes: true
                //     // more options:
                //     // https://github.com/kangax/html-minifier#options-quick-reference
                // }
            })
        ]);
        break;
}
