const path = require('path');
const ejs = require('ejs');
const express = require('express');
const morgan = require('morgan');
const socketServer = require('./socketServer');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackConfig = require('../webpack.config');

const app = express();
app.use(morgan('tiny'));

const compiler = webpack(webpackConfig);
const webpackMiddleware = webpackDevMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath,
  contentBase: 'client',
  stats: {
    colors: true,
    hash: false,
    timings: true,
    chunks: false,
    chunkModules: false,
    modules: false,
  },
});

app.use(webpackMiddleware);
app.use(webpackHotMiddleware(compiler));

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  const template = webpackMiddleware.fileSystem
    .readFileSync(path.resolve(path.join(__dirname, 'public/views/home.ejs')))
    .toString();
  const compiled = ejs.render(template, res.locals);
  res.write(compiled);
  res.end();
});

const server = app.listen(4000, () => {
  console.log('Listening on port 4000');
});

socketServer.run(server);
