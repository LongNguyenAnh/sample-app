import React from 'react';
import styled from '@emotion/styled';

const TextCenter = styled('div')`
  text-align: center;
`;

const LoadingPageWrapper = styled('div')`
  padding-top: 50%;
  transform: translateY(-50%);
`;

export default () => (
  <LoadingPageWrapper>
    <TextCenter>
      <Spinner/>
    </TextCenter>
  </LoadingPageWrapper>
);
