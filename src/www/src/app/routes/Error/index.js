import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { Helmet } from 'react-helmet-async';
import newRelicLogger from '../../../utils/logger/newRelicLogger';


const ErrorWrapper = styled('div')`
  .content {
    background: 0 5px url('//file.sample.com/sample/images/logos/sample-61x82.jpg')
      no-repeat;
    background-size: 61px 82px;
    padding-left: 80px;
    margin: 20vh auto 0;
    max-width: 500px;
    min-height: 61px;
    width: calc(80% - 80px);
  }

  @media (-webkit-min-device-pixel-ratio: 1.25),
    (-moz-min-device-pixel-ratio: 1.25),
    (-ms-min-device-pixel-ratio: 1.25),
    (min-device-pixel-ratio: 1.25),
    (min-resolution: 120dpi),
    (min-resolution: 1.25dppx) {
    .content {
      background-image: url('sample-122x165.jpg');
    }
  }

  @media (min-width: 600px) {
    .content {
      background-image: url('//file.sample.com/sample/images/logos/sample-100x135.jpg');
      background-size: 100px 135px;
      padding-left: 120px;
      margin-top: 0;
      min-height: 135px;
      width: calc(80% - 135px);
    }
  }

  @media (min-width: 600px) and (-webkit-min-device-pixel-ratio: 1.25),
    (-moz-min-device-pixel-ratio: 1.25),
    (-ms-min-device-pixel-ratio: 1.25),
    (min-device-pixel-ratio: 1.25),
    (min-resolution: 120dpi),
    (min-resolution: 1.25dppx) {
    .content {
      background-image: url('//file.sample.com/sample/images/logos/sample-200x270.jpg');
    }
  }

  h1 {
    font-size: 26px;
    font-weight: 300;
    line-height: 1.2;
    margin: 0 0 14px;
  }

  @media (min-width: 600px) {
    h1 {
      font-size: 48px;
      margin-bottom: 20px;
    }
  }

  a {
    color: #005cb0;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  p {
    margin: 0;
  }

  @media (min-width: 600px) {
    .check-engine {
      background: 50% 0
        url('//file.sample.com/sample/images/error/checkEngine3.jpg') no-repeat;
      background-size: contain;
      height: 130px;
      margin-top: 5vh;
      width: 100%;
    }
  }

  @media (min-width: 768px) {
    .check-engine {
      height: 200px;
      margin-top: 10vh;
    }
  }
`;

const ErrorPage = ({ history, error, ...props  }) => {
  const exception = error || 'No js exception found; a redirect most likely occurred';
  const url = {
    queryrequestedurl: history?.location?.state?.from?.pathname || history?.location?.pathname,
    dataError: history?.location?.state?.error || 'No data error; js exception most likely occurred'
  }

  useEffect(() => {
    logger.log404();
  }, []);

  const errorParams = {
    queryrequestedurl: url.queryrequestedurl,
    dataError: url.dataError,
    triggeringMessage: exception && exception.toString(),
    exception
  }
  newRelicLogger('React 404 page rendered', errorParams);

  return (
    <ErrorWrapper>
      <Helmet>
        <title>Sample App | Error</title>
      </Helmet>
      <div className="check-engine" />
      <div className="content">
        <h1>Sorry, we couldn't find that page.</h1>
        <p>
          Let’s try again with the <a href="/">homepage</a>.
        </p>
      </div>
    </ErrorWrapper>
  );
};

export default ErrorPage;
