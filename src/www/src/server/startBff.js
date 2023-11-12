import './env';
import './logger';
import 'core-js/es7/array';
import '../app/constants/config';
import { MEMCACHED_CONFIGURATION_URL } from './bff/constants';
import healthcheck from 'express-healthcheck';
import cookiesMiddleware from 'universal-cookie-express';
import typeDefs from './bff/typeDefs';
import resolvers from './bff/resolvers';
import * as mockQueries from './bff/mockQueries';

import express from 'express';

const PORT = 4000;

(async () => {
  const boundedContextName = process.env.BOUNDED_CONTEXT_APP_NAME;

  const app = express();

  app.use(`/${boundedContextName}/bff/healthcheck`, healthcheck());
  app.use(express.json()); // NOTE: We need this due to how the logging is setup for legacy BFF  
  app.use(cookiesMiddleware());
  app.use(logger.loggingMiddleware('BFF'));

  app.use(`/${boundedContextName}/bff`, cacheMiddleware({
    initializeCache: MEMCACHED_CONFIGURATION_URL && (() => {
      useMemcachedDistributedCache({
        configurationEndpoint: MEMCACHED_CONFIGURATION_URL
      });
    }),
  }))

  await applyGraphQLServer({
    app,
    boundedContextName,
    typeDefs,
    resolvers,
    mockQueries,
  });

  const server = app.listen(PORT, console.log(`> 🚀 App listening on http://localhost:${PORT}`));

  // https://shuheikagawa.com/blog/2019/04/25/keep-alive-timeout/
  //load balancer idle timeout is set to 60 seconds
  //nginx keepalive_timeout is set to 65 seconds
  server.keepAliveTimeout = 67000;
  server.headersTimeout = 68000;
})();