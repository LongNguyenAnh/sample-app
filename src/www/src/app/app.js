/** @jsx jsx */
// The basics
import './constants/config';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { jsx } from "@emotion/react";
import Routes from './routes';
import appQuery from '../tags/queries/app';
import routes from './routes/routes.json';
import usePassHeaderStates from '../utils/usePassHeaderStates';
import useScrollToTop from '../utils/useScrollToTop';
import { useConsoleToggler } from '../utils/logger/toggler';
import { useHistory } from 'react-router';
import queryString from 'query-string';
import loadable from '@loadable/component'
import { APP_ENVIRONMENT } from '../constants';
import { getAuthModalBaseUrl } from './constants/authModalBaseUrl';

const ErrorPage = loadable(() => retryImport(() => import('./routes/Error')));

const BaseApp = ({
  res,
  req,
  dynamicRender,
}) => {

  const {
    navigations = {},
  } = useAppData();
  const flippers = useFlippers();
  const {
    deviceData,
    isDesktop
  } = useDevice();

  const history = useHistory();

  const { testMode, initialLoadAd } = usePassHeaderStates();
  useScrollToTop();
  useConsoleToggler();
  
  const {
    lazyload,
    cognito,
    suppress,
    authModalPrNumber,
    usewebcomponent = true, // enables/disables mydomain web component
    userwcbranch, // allows loading of mydomain web component dev branch
  } = queryString.parse(history && history.location && history.location.search);

  if(suppress){
    suppressZipCode = true;
  }

  const envUrl = `https://static.domain.com/fonts/${APP_ENVIRONMENT}`;
  
  return (
    <Theme>
      <div id="app">
        <Helmet encodeSpecialCharacters={false}>
          <link rel="preload" as="font" href={`${envUrl}/Montserrat-Med.woff2`} crossorigin />
          <link rel="preload" as="font" href={`${envUrl}/Montserrat-Semi.woff2`} crossorigin />
          <link rel="preload" as="font" href={`${envUrl}/Montserrat-Extra.woff2`} crossorigin />
          <link rel="preload" as="font" href={`${envUrl}/OpenSans-Reg.woff2`} crossorigin />

          {typeof window !== "undefined" && window.Cypress ?
              <script>
              {`Object.defineProperty(window.document, 'referrer', { get () { return ''; } })`}
            </script>:''
          }  
          <link rel="modulepreload" href={AUTH_UTILITY_URL} />
          <script src={getAuthModalBaseUrl({authModalPrNumber, disableCache: false})} type="module" />
          {usewebcomponent &&
            <>
              {/* This needs to live in the app since global-sdk should not have a reference to helmet */}
              <script type="module" src={getWebComponentUrl({ userwcbranch })} />
              <script nomodule src={getWebComponentUrl({ userwcbranch })} /> 
            </>
          }
          {logger && logger.getHeadScripts(flippers)} 

          {<script id="testNewRelic">
            {newrelic && newrelic.getBrowserTimingHeader && newrelic.getBrowserTimingHeader().replace(/(^<script[^>]*>)|(<\/script>$)/g, '')}
          </script>
          }

          {flippers && renderOptimizely(flippers)}
        </Helmet>
        
        {process.env.REACT_APP_LOAD_BUNDLES_WITH_WORKERS === 'true' ? <BundleWorkerInitScript /> : null}
        <DownloadSelfHostedFonts env={APP_ENVIRONMENT}/>

        <Header 
          navigation={navigations}
          suppressZipCode={suppressZipCode}
        />

        <Routes
          deviceData={deviceData}
          isDesktop={isDesktop}
          navigations={navigations}
          testMode={testMode}
          newrelic={newrelic}
          initialLoadAd={initialLoadAd}
          dynamicRender={dynamicRender}
          res={res}
          req={req} 
        />

        <Footer navigation={navigations} enableOneTrust={enableOneTrust}/>
      </div>
    </Theme>
  );
}

export default withBlueprint({
  routes,
  appQuery,
  ErrorPage,
})(BaseApp);
