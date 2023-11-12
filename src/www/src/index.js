import 'core-js/es6/set';
import 'core-js/es6/map';
import 'core-js/es6/weak-map';
import 'core-js/es6/symbol';
import 'core-js/es6/array';
import 'core-js/es6/string';
import 'core-js/es6/function';
import 'core-js/es6/object';
import 'core-js/es7/array';
import 'core-js/fn/reflect';
import 'core-js/modules/es7.promise.finally';
import 'promise-polyfill/src/polyfill';


import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { loadableReady } from '@loadable/component'
import App from './app/app';
import { initializeDebugger, onRecoverableError } from './debugHelper';
import createApolloClient from '/apollo/createApolloClient';

const client = createApolloClient({});

// Setup the context if we finish loading before head script
setupGlobalManagers();

window.logger = new domainClientLogger({
  ads: domain.Blueprint.AdManager
});

if(typeof window !== 'undefined' && window.newrelic) {
  window.newrelic.setErrorHandler(error => {
    if (error && error.sourceURL && error.sourceURL.indexOf('domain.com') === -1) {
      return true;
    }
    return false;
  });
}

const Application = <App context={window.domain.Blueprint.context} client={client} />;

(async () => {
  const root = document.querySelector('#root');

  if (root.hasChildNodes()) {
    initializeDebugger(client);
    
    await loadableReady();
    hydrateRoot(root, Application, { onRecoverableError });
  } else {
    createRoot(root).render(Application);
  }
})();

if (module.hot) {
  module.hot.accept();
}


