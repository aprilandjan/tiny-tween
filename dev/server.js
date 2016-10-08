import Webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import webpackConfig from './webpack.config.js'

const compiler = Webpack(webpackConfig)
const server = new WebpackDevServer(compiler, {
  stats: {
    colors: true
  }
})

const port = 8080

server.listen(port, '0.0.0.0', function() {
  console.log('Starting server on http://localhost:' + port)
})
