/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { BlockMonitoring } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { putInBinDefaultIcon } from '../../styling/IconDefault';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import Button from '../common/element/Button';
import IconButton from '../common/element/IconButton';

const grid = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, max-content)',
  gridGap: '10px',
});

const newLine = css({
  display: 'contents',
});

const header = css({
  display: 'contents',
  fontWeight: 'bolder',
});

function Grid({ data, sync }: { data: BlockMonitoring[]; sync: () => void }): JSX.Element {
  const dispatch = useAppDispatch();

  return (
    <div className={grid}>
      <div className={header}>
        <div>BlockId</div>
        <div>Path</div>
        <div>Status</div>
        <div>Action</div>
      </div>
      {data.map((entry, i) => (
        <div className={newLine} key={i}>
          <div>{entry.blockId}</div>
          <div>{entry.title}</div>
          <div>{entry.status}</div>
          {(entry.status === 'UNHEALTHY' || entry.status === 'DATA_ERROR') && (
            <Button
              title="Restore previous version"
              icon={'history'}
              onClick={() => {
                dispatch(API.deletePendingChanges(entry.blockId)).then(() => {
                  sync();
                });
              }}
            />
          )}
          {entry.status === 'DELETED' && (
            <Button
              title="Clean"
              icon={putInBinDefaultIcon}
              onClick={() => {
                dispatch(API.deletePendingChanges(entry.blockId)).then(() => {
                  sync();
                });
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function LiveMonitor(): JSX.Element {
  const dispatch = useAppDispatch();
  const data = useAppSelector(store => store.admin.liveMonitoring);

  const sync = React.useCallback(() => {
    dispatch(API.getLiveMonitoringData());
  }, [dispatch]);

  React.useEffect(() => {
    if (data === 'NOT_INITIALIZED') {
      sync();
    }
  }, [data, sync]);

  return (
    <div>
      <h3>
        Live Edition Monitoring <IconButton icon={'sync'} onClick={sync} title="sync" />
      </h3>
      <div>
        {typeof data === 'string' ? (
          <AvailabilityStatusIndicator status={data} />
        ) : data.length === 0 ? (
          <div>
            <em>no active edition</em>
          </div>
        ) : (
          <Grid data={data} sync={sync} />
        )}
      </div>
    </div>
  );
}
