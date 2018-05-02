const webpack = require('webpack');
const _ = require('lodash');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');

const useProductionBuild = _.includes(
  ['production', 'development'],
  process.env.NODE_ENV
);

const cssLoaders = [
  {
    loader: 'style-loader',
    options: { sourceMap: true },
  },
  {
    loader: 'css-loader',
    options: {
      modules: true,
      sourceMap: true,
      localIdentName: '[name]--[local]--[hash:base64:5]',
      autoprefixer: false,
    },
  },
  {
    loader: 'postcss-loader',
    options: {
      plugins: [
        autoprefixer({
          browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'safari >= 4'],
        }),
      ],
    },
  },
  {
    loader: 'sass-loader',
  },
];

console.log(path.join(process.cwd(), 'server/public/views/home.ejs'));

const webpackConfig = {
  devtool: 'cheap-eval-source-map',
  entry: {
    vendor: ['react', 'react-dom', 'mobx', 'mobx-react', 'mobx-state-tree'],
    app: [path.join(process.cwd(), 'client/app.js')],
  },
  output: {
    path: path.join(process.cwd(), 'server/public/js/'),
    filename: '[name].[hash:8].js',
    publicPath: '/js/',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(process.cwd(), 'client/index.template.html'),
      chunks: ['vendor', 'app'],
      inject: true,
      hash: true,
      filename: path.join(process.cwd(), 'server/public/views/home.ejs'),
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.ProvidePlugin({
      Promise: 'bluebird',
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      chunks: ['vendor'],
    }),
    new webpack.NamedModulesPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: [
                'react-hot-loader/babel',
                'transform-decorators-legacy',
                'transform-class-properties',
              ],
              presets: ['react', ['env'], 'stage-0'],
              cacheDirectory: true,
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        exclude: /\.useable\.scss$/,
        loader: useProductionBuild
          ? ExtractTextPlugin.extract({
              fallbackLoader: 'style-loader',
              loader: cssLoaders,
            })
          : cssLoaders,
      },
      {
        test: /\.css$/,
        use: useProductionBuild
          ? ExtractTextPlugin.extract({
              fallbackLoader: 'style-loader',
              loader: 'css-loader',
            })
          : ['style-loader', 'css-loader'],
      },
      {
        test: /\.(svg|png)$/,
        loader: 'file-loader',
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
      {
        test: /\.(ttf|eot|svg|woff2?)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.scss'],
    modules: [path.resolve(`${process.cwd()}/client/app`), 'node_modules'],
  },
};

if (useProductionBuild) {
  webpackConfig.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      comments: false,
      compress: {
        warnings: false,
        drop_console: false,
      },
    })
  );
  webpackConfig.plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    })
  );
  webpackConfig.devtool = 'source-map';
} else {
  webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
  webpackConfig.entry.app.unshift(
    'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true'
  );
  webpackConfig.entry.vendor.unshift(
    'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true'
  );
}
module.exports = webpackConfig;
