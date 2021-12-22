const WebpackReactComponentNamePlugin = require("webpack-react-component-name");

const path = require('path');
const config = {
  entry: './src/components/App.tsx',
  devtool: 'inline-source-map',
  plugins: [
    new WebpackReactComponentNamePlugin()
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader'
        },
        exclude: /node_modules/
      }, {
        test: /\.svg$/,
        use: ['@svgr/webpack']
      },
      {
        test: /\.css$/,
        use: [
          'style-loader', 'css-loader'
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../../../../target/coLAB/dist'),
    publicPath: './dist'
  },
  devServer: {
    host: '0.0.0.0',
    port: 3004,
    proxy: {
      '/favicon_128.png': 'http://localhost:8080',
      '/api': 'http://localhost:8080',
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true
      }
    },
    client: {
      overlay: true,
      webSocketURL: {
        hostname: "0.0.0.0",
        pathname: "/webpackws",
        port: 0,
      },
    },
    devMiddleware: {
      stats: 'errors-warnings',
      publicPath: '/dist',
    },
    webSocketServer: {
      options: {path: '/webpackws'}
    }
  }
};
module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.module.rules[0].use.options = {
      compilerOptions: {
        "noUnusedLocals": false,
        "noUnusedParameters": false
      }
    };
  }

  return config;
};
