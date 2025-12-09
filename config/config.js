import getVersion from './version';
import defineConfig from './defineConfig';
import theme from './theme';
import routes from './routes';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin'
import path from 'path';

const version = getVersion();
console.log('git last commit: ', version);
/**
 * 关闭浏览器的版本提示，避免出现第三方cdn加载（阿里专有云安全需求）
 */
const disableBrowserUpdate = process.env.DISABLE_BROWSER_UPDATE;

let enableSourceMap = process.env.ENABLE_SOURCEMAP === "true";

console.log(disableBrowserUpdate);

let publicPath = '/odc_query/';

const define = defineConfig();

const config = {
  mock: false,
  publicPath,
  esbuildMinifyIIFE: true,
  runtimePublicPath: {},
  hash: true,
  esbuildMinifyIIFE: true,
  targets: {
    chrome: 80,
  },
  metas: [
    {
      name: 'version',
      content: version,
    },
  ],
  devtool: enableSourceMap ? "cheap-module-source-map" : (process.env.NODE_ENV === 'development' ? 'cheap-module-source-map' : false),

  antd: {
    import: false
  },

  theme: theme,
  proxy: {
    '/external_api': {
      target: 'http://10.186.62.13:11000',
      pathRewrite: { '^/external_api' : '' },
    },
    '/odc_query': {
      target: 'http://10.186.64.13:10000/odc_query',
      pathRewrite: { '^/odc_query' : '' },
    },
    // 本地开发或者对内 Site 应用的开发环境的代理配置
    '/api/v1/webSocket/obclient': {
      target: 'http://10.186.63.146:8989',
      ws: true,
    },
  },

  locale: {
    default: 'en-US',
    antd: true,
  },
  title: false,
  favicons: [publicPath + 'img/logo.png'],
  // ctoken: false,
  clickToComponent: {},
  externals: {
    electron: 'commonjs electron',
  },
  alias: {
    "@@node_modules": path.resolve(process.cwd(), 'node_modules')
  },
  chainWebpack(config) {
    config.plugin('monaco').use(MonacoWebpackPlugin, [
      {
        filename: '[name].worker.js',
        languages: ['yaml', 'json']
      }
    ])
  },

  history: {
    type: 'hash',
  },

  outputPath: './dist/renderer',
  copy: [
    {
      from: path.join(process.cwd(), "node_modules/@oceanbase-odc/monaco-plugin-ob/worker-dist"),
      to: "dist/renderer/workers/"+define.MONACO_VERSION
    }
  ],
  define,
  routes: routes,
};
if (disableBrowserUpdate) {
  delete config.browserUpdate;
}
config.headScripts = [
  `window.currentEnv=window.currentEnv || '${process.env.CURRENT_ENV || ''}'`,
  `window.publicPath=window.publicPath || '${publicPath}'`,
];
config.headScripts.push(`window.ODCApiHost= window.ODCApiHost || '/odc_query'`);
export default config;
