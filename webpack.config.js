const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const config = require('./config');

const addHotMiddleware = (entry) => {
  const results = {};

  Object.keys(entry).forEach((name) => {
    results[name] = Array.isArray(entry[name]) ? entry[name].slice(0) : [entry[name]];
    results[name].unshift('webpack/hot/dev-server');
    results[name].unshift(`webpack-dev-server/client?http://localhost:${config.hostPort}`);
  });
  return results;
};

const entriesHmr = addHotMiddleware(config.entries);

module.exports = (env = {}, options) => {
  const isDev = (options.mode === 'development');
  const isServ = (env.web_server !== undefined);
  const isWatch = (options.watch === true);

  return {
    stats: 'errors-warnings',
    resolve: { modules: ['node_modules'] },
    context: config.context,
    devtool: isDev ? config.devtool : false,
    entry: isServ ? entriesHmr : config.entries,
    mode: options.mode,
    output: {
      path: config.outputFolder,
      publicPath: isServ ? `${config.proxUrl}:${config.proxyPort}${config.publicFolder}` : config.publicFolder,
      filename: isDev ? 'assets/[name].js' : 'assets/[name].[hash].js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env'],
              },
            },
            {
              loader: 'eslint-loader',
              options: {
                failOnError: true,
                quiet: true,
                cache: false,
                configFile: '.eslintrc.js',
              },
            },
          ],
        },
        {
          test: /\.(sa|sc|c)ss/i,
          use: [
            ...((isServ || (isDev && !isWatch)) ? [
              { loader: 'style-loader' },
            ] : [
              { loader: MiniCssExtractPlugin.loader },
            ]),
            {
              loader: 'css-loader',
              options: { sourceMap: isDev },
            },
            {
              loader: 'resolve-url-loader',
              options: { sourceMap: isDev },
            },
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                sourceMap: isDev,
                config: { ctx: { isDev } },
              },
            },
            {
              loader: 'sass-loader',
              options: { sourceMap: isDev },
            },
          ],
        },
        ...(isDev ? [] : [
          {
            test: /\.(jpe?g|png|gif|svg)$/,
            loader: 'image-webpack-loader',
            enforce: 'pre',
          },
        ]),
        {
          test: /\.(png|jpe?g|gif)$/i,
          loader: 'url-loader',
          options: {
            name: 'assets/img/[name].[ext]',
            limit: 60 * 1024,
          },
        },
        {
          test: /\.svg$/i,
          loader: 'svg-url-loader',
          options: {
            name: 'assets/img/[name].[ext]',
            limit: 5 * 1024,
            noquote: true,
          },
        },
        {
          test: /\.(ttf|otf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
          use: {
            loader: 'file-loader',
            options: {
              name: 'assets/[folder]/[name].[ext]',
            },
          },
        },
        {
          test: /\.(mp4|ogv|webm)$/,
          use: {
            loader: 'file-loader',
            options: {
              name: 'assets/[folder]/[name].[ext]',
            },
          },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: config.title,
        template: config.htmlTemplate,
        filename: config.htmlFilename,
        favicon: config.favicon,
        inject: true,
        minify: isDev ? false : {
          removeComments: true,
          collapseWhitespace: true,
        },
      }),
      new StyleLintPlugin({
        configFile: '.stylelintrc.js',
        syntax: 'scss',
        failOnError: false,
        quiet: false,
      }),
      new HardSourceWebpackPlugin({
        info: {
          mode: 'test',
          level: 'warn',
        },
      }),
      new webpack.NoEmitOnErrorsPlugin(),
      ...(isDev ? [] : [
        new CleanWebpackPlugin({
          verbose: false,
        })]),
      new MiniCssExtractPlugin({
        filename: isDev ? 'assets/[name].css' : 'assets/[name].[hash].css',
        chunkFilename: isDev ? 'assets/[id].css' : 'assets/[id].[hash].css',
      }),
      new CopyWebpackPlugin([
        {
          from: 'src/static',
          to: 'assets/static',
        },
        {
          from: 'src/php',
          to: 'php',
        },
      ]),
      new FriendlyErrorsPlugin(),
    ],
    optimization: {
      minimizer: [new TerserPlugin()],
      splitChunks: {
        chunks: 'all',
      },
    },
    devServer: {
      port: config.hostPort,
      open: false,
      contentBase: config.contentBase,
      publicPath: config.publicFolder,
      watchContentBase: true,
      quiet: true,
      hot: true,
      inline: true,
      liveReload: true,
      overlay: true,
    },
  };
};
