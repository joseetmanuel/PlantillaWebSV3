var path = require('path')
var conf = require('./conf')

module.exports = {
  name: 'backend',
  entry: './src/index.js',
  target: 'node',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'backend.js'
  }
}