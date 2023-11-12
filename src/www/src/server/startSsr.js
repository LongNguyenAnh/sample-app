import './env';
import './logger';
import 'core-js/es7/array';
import { BFF_ENDPOINT } from './bff/constants';
import healthcheck from 'express-healthcheck';
import cookiesMiddleware from 'universal-cookie-express';
import compression from 'compression';

import AppComponent from '../app/app';
import express from 'express';

const PORT = 8081;

(async () => {
    const suffix = process.env.SUFFIX;
    const boundedContextName = process.env.BOUNDED_CONTEXT_APP_NAME;
    const loadableStatsPath = process.env.LOADABLE_STATS_PATH || './dist/server/loadable-stats.json';
    const htmlPath = process.env.HTML_PATH || './dist/server/index.html';
    const fallbackHtmlPath = process.env.FALLBACK_HTML_PATH || './dist/server/index_fallback.html';
    const staticDir = process.env.STATIC_DIR || './dist/static';
    const coverageDir = process.env.COVERAGE_DIR || './dist/coverage';
    const sharedResourcesDir = process.env.SHARED_RESOURCES_DIR || './dist/server/shared-resources';
    const useWorkers = process.env.REACT_APP_LOAD_BUNDLES_WITH_WORKERS === 'true';
    const htmlLoader = new HtmlLoader({
      loadableStatsPath,
      htmlPath,
      fallbackHtmlPath,
    });

    const app = express();  

    app.use(accountApiProxyMiddleware());

    app.use(compression());

    app.use(`/${boundedContextName}/healthcheck`, healthcheck());

    app.use(staticFilesMiddleware({ boundedContextName, suffix, staticDir, coverageDir, sharedResourcesDir }));

    htmlLoader.applyHotReload({ app });

    app.use(cookiesMiddleware());
    app.use(sessionMiddleware());
    app.use(flipperMiddleware());
    app.use(logger.loggingMiddleware('SSR'));
    app.use(locationMiddleware());
    app.use(botMiddleware());

    app.use(renderReactMiddleware({
      AppComponent,
      useWorkers,
      htmlLoader,
      bffEndPoint: BFF_ENDPOINT,
      createApolloClientFunction: createEc2ApolloClient,
    }));

    const server = app.listen(PORT, console.log(`> 🚀 App listening on http://localhost:${PORT}`));

    // https://shuheikagawa.com/blog/2019/04/25/keep-alive-timeout/
    //load balancer idle timeout is set to 60 seconds
    //nginx keepalive_timeout is set to 65 seconds
    server.keepAliveTimeout = 67000;
    server.headersTimeout = 68000;
})();