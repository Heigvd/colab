/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from "react";
import {space_2xl, text_xs} from "../../styling/style";
import {css} from "@emotion/css";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import * as API from '../../API/api';
import logger from "../../logger";
import IconButton from "../common/element/IconButton";

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
})

const headerStyle = css({
    fontWeight: 'bold',
    height: space_2xl,
});

export default function CronJobMonitor(): React.ReactElement {
    const dispatch = useAppDispatch();

    const cronJobLogs = useAppSelector(state => state.admin.cronJobLogs);

    React.useEffect(() => {
        logger.info(cronJobLogs);
        if (cronJobLogs === 'NOT_INITIALIZED') {
            dispatch(API.getCronJobLogs());
        }
    }, [cronJobLogs, dispatch])

    const sync = React.useCallback(() => {
        dispatch(API.getCronJobLogs());
    }, [dispatch])

    if (cronJobLogs === 'LOADING' || cronJobLogs === 'NOT_INITIALIZED') {
        return (
            <div>Loading</div>
        )
    }

    return (
        <div>
            <h3>Cronjob Monitoring</h3>
            <IconButton icon={'sync'} onClick={sync} title="Sync"/>
            <table
                className={tableStyle}
            >
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
                {cronJobLogs.map(cronJobLog => (
                    <CronJobRow key={cronJobLog.id} name={cronJobLog.jobName!} time={cronJobLog.lastRunTime!}/>
                ))}
                </tbody>
            </table>
        </div>
    )
}

function CronJobRow({name, time}: { name: string, time: number }): React.ReactElement {
    const cronJobTime = new Date(0);
    cronJobTime.setUTCMilliseconds(time);

    return (
        <tr>
            <td>{name}</td>
            <td>{cronJobTime.toLocaleString()}</td>
        </tr>
    )
}