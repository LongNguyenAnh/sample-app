/** @jsx jsx */

import React from 'react';
import { jsx, css } from "@emotion/react";
import loadingImg from '../../assets/BlueLoader-48px.gif';

const textCenter = css`
  text-align: center;
`

export default () => (
  <div className={textCenter}>
    <img src={loadingImg} alt="Loading..." />
  </div>
);
