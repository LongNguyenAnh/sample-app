import 'isomorphic-fetch';

const request = async (endpoint, options) => {
  const response = await (global || window).fetch(endpoint, options);
  if (response.status >= 400) {
    throw new Error(`Response error: ${endpoint}`);
  }

  if (
    response.headers.has('content-length') &&
    Number(response.headers.get('content-length')) <= 0
  ) {
    return null;
  }

  const contentType = response.headers.get('content-type');

  return contentType.indexOf('application/json') > -1  ? response.json() : response.text();
};

const post = async (endpoint, paramDict) => {
  const response = await (global || window).fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  })
  if (response.status >= 400) {
    throw new Error(`Response error: ${endpoint}`);
  }

  if (
    response.headers.has('content-length') &&
    Number(response.headers.get('content-length')) <= 0
  ) {
    return null;
  }

  const contentType = response.headers.get('content-type');

  return contentType.indexOf('application/json') > -1  ? response.json() : response.text();
}

export {request, post};
