/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import {useAppSelector, useAppDispatch} from '../../store/hooks';
import {getLoggerLevels, changeLoggerLevel} from '../../API/api';
import InlineLoading from '../common/InlineLoading';
import {css, cx} from '@emotion/css';
import {buttonStyle} from '../styling/style';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSync} from '@fortawesome/free-solid-svg-icons';

const LEVELS = ['OFF', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];

const levelStyle = css({
})

const effectiveStyle = cx(levelStyle, css({
  fontWeight: 'bold'
}))

const selectedStyle = cx(effectiveStyle, css({
  textDecoration: "underline"
}))

export default () => {
  const levels = useAppSelector(state => state.admin.loggers);
  const dispatch = useAppDispatch();

  const title = <h3>Loggers</h3>;

  if (levels === undefined) {
    // not yet initialized
    dispatch(getLoggerLevels());
  }

  if (levels == null) {
    return (
      <div>
        {title}
        <div>
          <InlineLoading />
        </div>
      </div>
    );
  } else {
    const keys = Object.keys(levels).sort();
    return (
      <div>
        {title}
        <span
          className={buttonStyle}
          onClick={() => {
            dispatch(getLoggerLevels());
          }}
        >
          <FontAwesomeIcon icon={faSync} />
        </span>
        <div className={css({
          display: 'grid',
          gridTemplateColumns: 'repeat(7, auto)'
        })}>
          {keys.map(loggerName => {
            const level = levels[loggerName];
            return (
              <div
                key={loggerName}
                className={css({
                  display: 'contents',
                  ':hover > div:first-child': {
                    textDecoration: 'underline'
                  }
                })}>
                <div>
                  {loggerName}
                </div>
                {LEVELS.map(lvl => {
                  const item = (
                    <span
                      onClick={() => {
                        dispatch(changeLoggerLevel({
                          loggerName: loggerName,
                          loggerLevel: lvl
                        }))
                      }}
                      className={cx(buttonStyle, css({marginLeft: '5px'}))}>{lvl}</span>
                  );
                  if (level.effectiveLevel !== lvl) {
                    return <div key={lvl} className={levelStyle}>{item}</div>;
                  } else if (level.effectiveLevel === level.level) {
                    return <div key={lvl} className={selectedStyle}>{item}</div>;
                  } else {
                    return <div key={lvl} className={effectiveStyle}>{item}</div>;
                  }
                })}
              </div>
            );
          })}
        </div>
      </div >
    );
  }
};
