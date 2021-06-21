/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { useAppSelector, useAppDispatch, shallowEqual } from '../../store/hooks';
import { getLoggerLevels, changeLoggerLevel } from '../../API/api';
import InlineLoading from '../common/InlineLoading';
import { css, cx } from '@emotion/css';
import { linkStyle } from '../styling/style';
import { faSync, faSearch, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import IconButton from '../common/IconButton';

const LEVELS = ['OFF', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];

import { levels as clientLevels } from '../../logger';

const levelStyle = css({});

const effectiveStyle = cx(
  levelStyle,
  css({
    fontWeight: 'bold',
  }),
);

const selectedStyle = cx(
  effectiveStyle,
  css({
    textDecoration: 'underline',
  }),
);

export default function (): JSX.Element {
  const levels = useAppSelector(state => state.admin.loggers, shallowEqual);
  const dispatch = useAppDispatch();

  const keys = Object.keys(clientLevels) as (keyof typeof levelState)[];

  const [search, setSearch] = React.useState('');

  const [levelState, setClientLevels] = React.useState(clientLevels);

  const serverTitle = <h3>Server Loggers</h3>;
  const clientLoggers = (
    <div>
      <h3>Client Loggers</h3>
      <ul>
        {keys.map(level => (
          <li key={level}>
            <IconButton
              title={level}
              icon={levelState[level] ? faCheck : faTimes}
              onClick={() => {
                setClientLevels({ ...levelState, [level]: !levelState[level] });
                levelState[level] = !levelState[level];
              }}
            >
              {level}
            </IconButton>
          </li>
        ))}
      </ul>
    </div>
  );

  if (levels === undefined) {
    // not yet initialized
    dispatch(getLoggerLevels());
  }

  if (levels == null) {
    return (
      <div>
        {serverTitle}
        <div>
          <InlineLoading />
        </div>
        {clientLoggers}
      </div>
    );
  } else {
    const keys = Object.keys(levels)
      .filter(logger => !search || logger.includes(search))
      .sort();
    return (
      <div>
        {serverTitle}
        <IconButton
          icon={faSync}
          onClick={() => {
            dispatch(getLoggerLevels());
          }}
        />
        <div>
          <label>
            <IconButton icon={faSearch} />
            <input type="text" onChange={e => setSearch(e.target.value)} />
          </label>
        </div>
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: 'repeat(7, max-content)',
            '& div div': {
              paddingRight: '10px',
            },
          })}
        >
          {keys.map(loggerName => {
            const level = levels[loggerName];
            if (level != null) {
              return (
                <div
                  key={loggerName}
                  className={css({
                    display: 'contents',
                    ':hover': {
                      color: 'var(--hoverFgColor)',
                      '& > div:first-child': {
                        textDecoration: 'underline',
                      },
                    },
                  })}
                >
                  <div>{loggerName}</div>
                  {LEVELS.map(lvl => {
                    const item = (
                      <span
                        onClick={() => {
                          dispatch(
                            changeLoggerLevel({
                              loggerName: loggerName,
                              loggerLevel: lvl,
                            }),
                          );
                        }}
                        className={cx(linkStyle, css({ marginLeft: '5px' }))}
                      >
                        {lvl}
                      </span>
                    );
                    if (level.effectiveLevel !== lvl) {
                      return (
                        <div key={lvl} className={levelStyle}>
                          {item}
                        </div>
                      );
                    } else if (level.effectiveLevel === level.level) {
                      return (
                        <div key={lvl} className={selectedStyle}>
                          {item}
                        </div>
                      );
                    } else {
                      return (
                        <div key={lvl} className={effectiveStyle}>
                          {item}
                        </div>
                      );
                    }
                  })}
                </div>
              );
            } else {
              return null;
            }
          })}
        </div>
        {clientLoggers}
      </div>
    );
  }
}
