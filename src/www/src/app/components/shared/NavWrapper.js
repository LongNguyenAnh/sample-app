import styled from '@emotion/styled';

export default styled('div')`
max-width: calc(100vw - ${size.lg}px);
  min-height: 48px;

  > div {
    min-height: 48px;
  }

  > div > div > div > div:first-child {
    @media (min-width: ${breakpoints.sm}px) {
      max-width: ${({ isDesktop, isStuck }) => (isDesktop && isStuck) ? '50vw' : '100%'};
    }

    @media (min-width: ${breakpoints.lg}px) {
      max-width: ${({ isDesktop, isStuck }) => (isDesktop && isStuck) ? '60vw' : '100%'};
    }

    @media (min-width: ${breakpoints.max}px) {
      max-width: 100%;
    }
  }

  > div > div > div > div:nth-of-type(2) {
    width: 0;
  }
  
  button[role="tab"] {
    min-height: 48px;

    div, h3 {
      min-height: 48px;
    }

    div {
      margin: 0;
      padding: 16px 0;
    }
  }

  button[direction="left"] {
    background: ${({ gradientColor }) => `linear-gradient(-90deg,rgba(255,255,255,0) 0%,${gradientColor} 50%,${gradientColor} 100%)`};
  }

  button[direction="right"] {
    background: ${({ gradientColor }) => `linear-gradient(90deg,rgba(255,255,255,0) 0%,${gradientColor} 50%,${gradientColor} 100%)`};
  }
`;