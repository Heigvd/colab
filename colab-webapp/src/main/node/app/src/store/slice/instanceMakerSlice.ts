/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import {AvailabilityStatus, FetchingStatus} from "../store";
import {InstanceMaker} from "colab-rest-client/dist/ColabClient";
import {createSlice} from "@reduxjs/toolkit";
import {processMessage} from "../../ws/wsThunkActions";
import * as API from '../../API/api';
import {mapById} from "../../helper";

/** what we have in the store */
export interface InstanceMakerState {
    /** all the instanceMakers we got so far, by id*/
    instanceMakers: Record<number, FetchingStatus | InstanceMaker>;

    /** did we load all the instanceMakers of the current project */
    statusInstanceMakersForCurrentProject: AvailabilityStatus;
}

const initialState: InstanceMakerState = {
    instanceMakers: {},

    statusInstanceMakersForCurrentProject: 'NOT_INITIALIZED',
}

const instanceMakerSlice = createSlice({
    name: 'instanceMakers',
    initialState,
    reducers: {},
    extraReducers: builder =>
        builder
            .addCase(processMessage.fulfilled, (state, action) => {
                action.payload.instanceMakers.upserted.forEach(instanceMaker => {
                    if (instanceMaker.id != null) {
                        state.instanceMakers[instanceMaker.id] = instanceMaker;
                    }
                });

                action.payload.instanceMakers.deleted.forEach(instanceMaker => {
                    if (instanceMaker.id != null) {
                        delete state.instanceMakers[instanceMaker.id]
                    }
                })
            })

            .addCase(API.getInstanceMakersForProject.pending, state => {
                state.statusInstanceMakersForCurrentProject = 'LOADING';
            })

            .addCase(API.getInstanceMakersForProject.fulfilled, (state, action) => {
                if (action.payload) {
                    state.instanceMakers = {...state.instanceMakers, ...mapById((action.payload))};
                    state.statusInstanceMakersForCurrentProject = 'READY';
                } else {
                    state.statusInstanceMakersForCurrentProject = 'ERROR';
                }
            })

            .addCase(API.getInstanceMakersForProject.rejected, state => {
                state.statusInstanceMakersForCurrentProject = 'ERROR';
            })

            .addCase(API.closeCurrentProject.fulfilled, () => {
                return initialState;
            })

            .addCase(API.closeCurrentSession.fulfilled, () => {
                return initialState;
            })

});

export default instanceMakerSlice.reducer;