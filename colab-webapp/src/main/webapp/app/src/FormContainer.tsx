/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import {css, cx} from '@emotion/css';

import Logo from './images/logo.svg';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {fullPageStyle, darkMode} from './comp/style';

interface Props {
  children: React.ReactNode
}

export default function ({children}: Props) {
  return (
    <div className={fullPageStyle}>
      <div
        className={cx(
          css({
            margin: "auto"
          })
        )}
      >
        <div
          className={cx(
            darkMode,
            css({
              display: "flex",
              alignItems: 'center'
            })
          )}
        >
          <Logo
            className={css({
              height: "110px",
              width: "200px",
              padding: "10px"
            })}
          />
          <h1>co.LAB</h1>
        </div>
        <div
          className={css({
            textAlign: "center",
            padding: "10px"
          })}
        >
          {children}
        </div>
      </div>
    </div>
  );
}