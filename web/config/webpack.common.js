const webpack = require('webpack');
const paths = require('./paths')
const path = require('path');

const DEVELOPMENT=process.env.NODE_ENV==='development'
console.log('DEVELOPMENT=' + DEVELOPMENT)


const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  // Where webpack looks to start building the bundle
  entry: [paths.src + '/index.js'],


    // In my case the problem was that webpack loads a seperate version (and hence instance :/ )  of leaflet because the plugin had a dependency to an older leaflet version.
    // So to prevent webpack from loading different versions of leaflet    
    resolve: {
        alias: {
            'leaflet': path.join(__dirname, '../node_modules/leaflet'),
        }
    },
 





  // Where webpack outputs the assets and bundles
  output: {
    path: paths.build,
    filename: '[name].bundle.js',
    publicPath: '/',
  },

  // Customize the webpack build process
  plugins: [
    // Removes/cleans build folders and unused assets when rebuilding
    new CleanWebpackPlugin(),

    // Copies files from target to destination folder
    new CopyWebpackPlugin({
      patterns: [
        {
          from: paths.public,
          to: 'site/assets',
          globOptions: {
            ignore: ['*.DS_Store'],
          },
        },
      ],
    }),

    // Generates an HTML file from a template
    // Generates deprecation warning: https://github.com/jantimon/html-webpack-plugin/issues/1501
    new HtmlWebpackPlugin({
      title: 'IceSat2 ATL08',
    //  favicon: paths.src + '/images/favicon.png',
      template: paths.src + '/template.html', // template file
      filename: 'index.html', // output file
    }),

   new webpack.ProvidePlugin({ L: 'leaflet', 'window.L': 'leaflet', }) ,
   new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery'
  }),
  ],

  // Determine how modules within the project are treated
  module: {
    rules: [
      // JavaScript: Use Babel to transpile JavaScript files
      {test: /\.js$/, exclude: /node_modules/, use: ['babel-loader']},

      // Styles: Inject CSS into the head with source maps
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {loader: 'css-loader', options: {sourceMap: DEVELOPMENT, importLoaders: 1}},
         
        ],
      },

      // Images: Copy image files to build folder
      {test: /\.(?:ico|gif|png|jpg|jpeg)$/i, type: 'asset/resource'    },

      // Fonts and SVGs: Inline files
      {test: /\.(woff(2)?|eot|ttf|otf|svg|)$/, type: 'asset/inline'},
    ],
  },
}
