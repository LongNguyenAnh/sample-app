import { GraphQLError } from 'graphql';
import { APOLLO_ERROR_TYPES } from '../../../../app/constants/apolloErrorTypes'
import newrelic from 'newrelic';

export default function({ error, ctx, reqUrl, params = {}, errorType }) {
  const referer = ctx && ctx.req && ctx.req.headers && ctx.req.headers.referer;
  const config = {
    variables: Object.assign({}, (params || {})),
    referer,
    errorType
  };
  const configNewrelic = { ...config, dataSource: reqUrl }

  const errorLog = new GraphQLError(error, { extensions: config }); // avoid exposing AWS url in error message
  const errorLogNewrelic = new GraphQLError(error, { extensions: configNewrelic }); // newrelic still needs full url

  if (newrelic && typeof newrelic.noticeError === 'function' && errorType !== APOLLO_ERROR_TYPES.nonBreaking) {
    newrelic.noticeError(errorLogNewrelic, configNewrelic)
  }

  if (errorType === APOLLO_ERROR_TYPES.nonBreaking) {
    return null;
  }

  if (errorType === APOLLO_ERROR_TYPES.redirecting) {
    return undefined;
  }
  
  return errorLog;
}