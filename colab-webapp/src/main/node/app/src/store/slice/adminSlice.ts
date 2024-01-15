/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
    BlockMonitoring,
    CronJobLog,
    LevelDescriptor,
    VersionDetails,
    WebsocketChannel,
} from 'colab-rest-client';
import * as API from '../../API/api';
import { InlineAvailabilityStatus, LoadingStatus} from '../store';

export interface AdminState {
    loggers: { [key: string]: LevelDescriptor } | undefined | null;
    userStatus: LoadingStatus;
    occupiedChannels: Record<string, number> | 'NOT_INITIALIZED' | 'LOADING';
    versionStatus: LoadingStatus;
    liveMonitoring: InlineAvailabilityStatus<BlockMonitoring[]>;
    version: VersionDetails;
    cronJobLogs: CronJobLog[] | 'NOT_INITIALIZED' | 'LOADING';
}

const initialState: AdminState = {
    loggers: undefined,
    userStatus: 'NOT_INITIALIZED',
    occupiedChannels: 'NOT_INITIALIZED',
    versionStatus: 'NOT_INITIALIZED',
    version: {buildNumber: '', dockerImages: ''},
    liveMonitoring: 'NOT_INITIALIZED',
    cronJobLogs: 'NOT_INITIALIZED',
};

function getChannelUrn(channel: WebsocketChannel): string {
    const baseUrn = 'urn:coLAB:WebsocketChannel/' + channel['@class'];

    switch (channel['@class']) {
        case 'BlockChannel':
            return baseUrn + '/' + channel.blockId;
        case 'BroadcastChannel':
            return baseUrn;
        case 'ProjectContentChannel':
            return baseUrn + '/' + channel.projectId;
        case 'UserChannel':
            return baseUrn + '/' + channel.userId;
    }
}

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        channelUpdate: (
            state,
            action: PayloadAction<{ channel: WebsocketChannel; diff: number }[]>,
        ) => {
            const channels = state.occupiedChannels;
            if (typeof channels != 'string') {
                action.payload.forEach(message => {
                    const channel = message.channel;
                    const count = message.diff;

                    const urn = getChannelUrn(channel);
                    const found = channels[urn];
                    if (found != null) {
                        const newCount = found + count;
                        if (newCount > 0) {
                            // update channel
                            channels[urn] = newCount;
                        } else {
                            // remove channel
                            delete channels[urn];
                        }
                    } else if (count > 0) {
                        channels[urn] = count;
                    }
                });
            }
        },
    },
    extraReducers: builder =>
        builder
            .addCase(API.getVersionDetails.pending, state => {
                state.versionStatus = 'LOADING';
            })
            .addCase(API.getVersionDetails.fulfilled, (state, action) => {
                state.versionStatus = 'READY';
                state.version = action.payload;
            })
            .addCase(API.getAllUsers.pending, state => {
                state.userStatus = 'LOADING';
            })
            .addCase(API.getAllUsers.fulfilled, state => {
                state.userStatus = 'READY';
            })
            .addCase(API.getLoggerLevels.pending, state => {
                // undefined means not-loaded
                if (state.loggers === undefined) {
                    // null means loading
                    state.loggers = null;
                }
            })
            .addCase(API.getLoggerLevels.fulfilled, (state, action) => {
                state.loggers = action.payload;
            })
            .addCase(API.getOccupiedChannels.pending, state => {
                state.occupiedChannels = 'LOADING';
            })
            .addCase(API.getOccupiedChannels.fulfilled, (state, action) => {
                state.occupiedChannels = action.payload;
            })
            .addCase(API.getLiveMonitoringData.pending, state => {
                state.liveMonitoring = 'LOADING';
            })
            .addCase(API.getLiveMonitoringData.fulfilled, (state, action) => {
                state.liveMonitoring = action.payload;
            })
            .addCase(API.getLiveMonitoringData.rejected, state => {
                state.liveMonitoring = 'ERROR';
            })
            .addCase(API.getCronJobLogs.pending, state => {
                state.cronJobLogs = 'LOADING';
            })
            .addCase(API.getCronJobLogs.fulfilled, (state, action) => {
                state.cronJobLogs = action.payload;
            })
            .addCase(API.closeCurrentSession.fulfilled, () => {
                return initialState;
            })
    ,
});

export const {channelUpdate} = adminSlice.actions;

export default adminSlice.reducer;
