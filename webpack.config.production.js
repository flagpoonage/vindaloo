var path = require('path');
let webpack = require('webpack');

let config = {
  entry: {
    app: ['babel-polyfill', './client/app.js']
  },

  output: {
    path: path.resolve(__dirname, 'static/script'),
    sourceMapFilename: '[name].map.js',
    publicPath: '/static/script/',
    filename: '[name].js'
  },

  module: {
    
    rules: [
      { test: /(\.json)$/,
        use: 'json-loader' },

      { test: /(\.jsx|\.js)$/,
        loader: 'babel-loader',
        query: {
          presets: [['env', { modules: false }], 'react']
        } 
      },

      { test: /\.pcss$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          'postcss-loader'
        ] },

      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff' },

      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader' }
    ]
  },

  externals: [],

  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: function(webpack) {
          return [
            require('postcss-import')({
              addDependencyTo: webpack
            }),
            require('postcss-nested'),
            require('postcss-simple-vars'),
            require('autoprefixer')({
              remove: true,
              browsers: ['ie >= 9']
            })
          ];
        }
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMaps: false,
      compress: {
        warnings: false
      }
    })
  ],

  resolve: {
    symlinks: false,
    extensions: ['.js', '.jsx'],
    modules: [
      path.resolve('./client'),
      path.resolve('./node_modules')
    ]
  }
};

module.exports = config;