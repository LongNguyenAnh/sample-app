import 'core-js/es7/array';
import { MEMCACHED_CONFIGURATION_URL } from './bff/constants';
import healthcheck from 'express-healthcheck';
import cookiesMiddleware from 'universal-cookie-express';
import compression from 'compression';
import typeDefs from './bff/typeDefs';
import resolvers from './bff/resolvers';
import AppComponent from '../app/app';
import {
  applyGraphQLServer,
  botMiddleware,
  HtmlLoader,
  renderReactMiddleware,
  sessionMiddleware,
  staticFilesMiddleware,
  locationMiddleware,
  createLambdaApolloClient,
} from '/express/server';
import * as mockQueries from './bff/mockQueries';
import express from 'express';

export default async (app) => {
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

  app.use(compression());

  app.use(`/${boundedContextName}/healthcheck`, healthcheck({
    test: () => {
      logger.setTransactionName('Healthcheck')
    }
  }));

  app.use(staticFilesMiddleware({
    boundedContextName,
    suffix,
    staticDir,
    coverageDir,
    sharedResourcesDir
  }));

  htmlLoader.applyHotReload({app});

  app.use(cookiesMiddleware());
  app.use(sessionMiddleware());
  app.use(flipperMiddleware());
  app.use(express.json())
  app.use(logger.loggingMiddleware('Server'));
  app.use(locationMiddleware());
  app.use(botMiddleware());

  app.use(`/${boundedContextName}/bff`, await InitAvailableCacheRoutesAsync({
    configurationUrl: MEMCACHED_CONFIGURATION_URL,
    initializeCache: () => {
      useMemcachedDistributedCache({
        configurationEndpoint: MEMCACHED_CONFIGURATION_URL
      });
    },
    isMemcached: true
  }));

  await applyGraphQLServer({
    app,
    boundedContextName,
    typeDefs,
    resolvers,
    mockQueries
  });

  app.use(renderReactMiddleware({
    AppComponent,
    useWorkers,
    htmlLoader,
    typeDefs,
    resolvers,
    mockQueries,
    createApolloClientFunction: createLambdaApolloClient
  }));

  return app;
} 