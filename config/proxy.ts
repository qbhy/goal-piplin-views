/**
 * @name 代理的配置
 * @see 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 *
 * @doc https://umijs.org/docs/guides/proxy
 */
const http = require('http');
var keepAliveAgent = new http.Agent({ keepAlive: true });

export default {
    // 如果需要自定义本地开发服务器  请取消注释按需调整
    dev: {
        // 127.0.0.1:8000/api/** -> https://preview.pro.ant.design/api/**
        '/api/': {
            compress: false,
            // 要代理的地址
            target: 'http://127.0.0.1:8008',
            // 配置了这个可以从 http 代理到 https
            // 依赖 origin 的功能可能需要这个，比如 cookie
            // changeOrigin: true,
            // 是否启用 websocket
            ws: true,
            xfwd: true,
            // 自定义代理事件
            onProxyReq: (proxyReq: any, req: any, res: any) => {
                if (req.url.startsWith('/api/notify')) {
                    // 在代理请求上添加头部，以确保支持 SSE
                    proxyReq.setHeader('Connection', 'keep-alive');
                    proxyReq.setHeader('Cache-Control', 'no-cache');
                    proxyReq.setHeader('Content-Type', 'text/event-stream');

                    res.on('close', () => {
                        proxyReq.destroy();
                    });
                }
            },
        },
    },

    /**
     * @name 详细的代理配置
     * @doc https://github.com/chimurai/http-proxy-middleware
     */
    test: {
        // 127.0.0.1:8000/api/** -> https://preview.pro.ant.design/api/**
        '/api/': {
            target: 'https://proapi.azurewebsites.net',
            changeOrigin: true,
            pathRewrite: { '^': '' },
        },
    },
    pre: {
        '/api/': {
            target: 'your pre url',
            changeOrigin: true,
            pathRewrite: { '^': '' },
        },
    },
};
