/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faSearch, faSync } from '@fortawesome/free-solid-svg-icons';
import { LevelDescriptor } from 'colab-rest-client';
import * as React from 'react';
import { changeLoggerLevel, getLoggerLevels } from '../../API/api';
import { getLogger, LoggerLevel, loggers as clientLoggers } from '../../logger';
import { shallowEqual, useAppDispatch, useAppSelector } from '../../store/hooks';
import IconButton from '../common/IconButton';
import InlineLoading from '../common/InlineLoading';
import { linkStyle } from '../styling/style';

const LEVELS = ['OFF', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];

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

interface LoggerGridProps {
  title: string;
  levels: Record<string, LevelDescriptor>;
  changeLevel: (loggerName: string, level: string) => void;
}

function LoggerGrid({ title, levels, changeLevel }: LoggerGridProps) {
  const [search, setSearch] = React.useState('');

  const keys = Object.keys(levels)
    .filter(logger => !search || logger.includes(search))
    .sort();

  return (
    <>
      <h3>{title}</h3>
      <div>
        <label>
          <IconButton icon={faSearch} title="Search"/>
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
                      onClick={() => changeLevel(loggerName, lvl)}
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
    </>
  );
}

function isClientLevel(level: number): level is LoggerLevel {
  return level >= 0 && level <= 5;
}

function computeClientState(): { [key: string]: LevelDescriptor } {
  const state: Record<string, LevelDescriptor> = {};

  Object.entries(clientLoggers).forEach(([name, logger]) => {
    const currentLevel = LEVELS[logger.getLevel()];
    if (currentLevel != undefined) {
      state[name] = {
        level: currentLevel,
        effectiveLevel: currentLevel,
      };
    }
  });
  return state;
}

export default function (): JSX.Element {
  const serverLevels = useAppSelector(state => state.admin.loggers, shallowEqual);
  const dispatch = useAppDispatch();

  const [clientsState, setClientLoggers] = React.useState(computeClientState());

  React.useEffect(() => {
    if (serverLevels === undefined) {
      // not yet initialized
      dispatch(getLoggerLevels());
    }
  }, [serverLevels, dispatch]);

  const clientLoggers = (
    <LoggerGrid
      title="Client Loggers"
      levels={clientsState}
      changeLevel={(loggerName, level) => {
        const index = LEVELS.indexOf(level);
        if (isClientLevel(index)) {
          getLogger(loggerName).setLevel(index);
          setClientLoggers(computeClientState());
        }
      }}
    />
  );

  if (serverLevels == null) {
    return (
      <div>
        <div>
          <InlineLoading />
        </div>
        {clientLoggers}
      </div>
    );
  } else {
    return (
      <div>
        <h2>Loggers Config</h2>
        <IconButton
          icon={faSync}
          title='Sync'
          onClick={() => {
            dispatch(getLoggerLevels());
          }}
        />
        {clientLoggers}
        <LoggerGrid
          title="Server Loggers"
          levels={serverLevels}
          changeLevel={(loggerName, level) => {
            dispatch(
              changeLoggerLevel({
                loggerName: loggerName,
                loggerLevel: level,
              }),
            );
          }}
        />
      </div>
    );
  }
}
