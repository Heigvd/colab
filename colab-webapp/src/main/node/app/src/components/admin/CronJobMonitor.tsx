/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { space_2xl, text_xs } from '../../styling/style';
import { css } from '@emotion/css';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import * as API from '../../API/api';
import logger from '../../logger';
import IconButton from '../common/element/IconButton';
import { CronJobLog } from 'colab-rest-client/dist/ColabClient';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';

const tableStyle = css({
  textAlign: 'left',
  borderCollapse: 'collapse',
  'td, th': {
    padding: '10px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: text_xs,
  },
});

const headerStyle = css({
  fontWeight: 'bold',
  height: space_2xl,
});

export default function CronJobMonitor(): React.ReactElement {
  const dispatch = useAppDispatch();

  const data = useAppSelector(state => state.admin.cronJobLogs);

  React.useEffect(() => {
    logger.info(data);
    if (data === 'NOT_INITIALIZED') {
      dispatch(API.getCronJobLogs());
    }
  }, [data, dispatch]);

  const sync = React.useCallback(() => {
    dispatch(API.getCronJobLogs());
  }, [dispatch]);

  React.useEffect(() => {
    if (data === 'NOT_INITIALIZED') {
      sync();
    }
  }, [data, sync]);

  return (
    <div>
      <h3>
        Cronjob Monitoring <IconButton icon={'sync'} onClick={sync} title="Sync" />
      </h3>
      <div>
        {typeof data === 'string' ? (
          <AvailabilityStatusIndicator status={data} />
        ) : data.length === 0 ? (
          <div>
            <em>no cronjob logs available</em>
          </div>
        ) : (
          <table className={tableStyle}>
            <thead>
              <tr
                className={css({
                  borderBottom: '1px solid black',
                })}
              >
                <th className={headerStyle}>Job Name</th>
                <th className={headerStyle}>Last Run Time</th>
              </tr>
            </thead>
            <tbody>
              {data.map((cronJobLog: CronJobLog) => (
                <CronJobRow
                  key={cronJobLog.id}
                  name={cronJobLog.jobName!}
                  time={cronJobLog.lastRunTime!}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function CronJobRow({ name, time }: { name: string; time: number }): React.ReactElement {
  const cronJobTime = new Date(0);
  cronJobTime.setUTCMilliseconds(time);

  return (
    <tr>
      <td>{name}</td>
      <td>{cronJobTime.toLocaleString()}</td>
    </tr>
  );
}
