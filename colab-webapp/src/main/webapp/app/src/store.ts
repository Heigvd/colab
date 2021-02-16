/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as API from './API/client';

import {createStore, applyMiddleware, Action, AnyAction} from 'redux';
import thunk from 'redux-thunk';
import {ThunkAction, ThunkDispatch} from 'redux-thunk';

export interface ColabState {
    wsSession?: string;
    status: 'UNINITIALIZED' | 'SYNC' | 'READY';
    projects: {
        [id: number]: API.Project;
    };
    error?: Error
}

const initialState: ColabState = {
    status: 'UNINITIALIZED',
    projects: {},
};

export const ACTIONS = {
    error: (error: Error) => ({
        type: 'ERROR' as "ERROR",
        error: error
    }),
    startInit: () => ({
        type: "START_INIT" as 'START_INIT'
    }),
    initWsSessionId: (sessionId: string) => ({
        type: "INIT_WS_SESSION_ID" as "INIT_WS_SESSION_ID",
        sessionId: sessionId
    }),
    initDone: () => ({
        type: "INIT_DONE" as "INIT_DONE"
    }),
    /**
     * Project related actions
     */
    initProjects: (projects: API.Project[]) => ({
        type: "INIT_PROJECTS" as "INIT_PROJECTS",
        projects: projects
    }),
    updateProject: (project: API.Project) => ({
        type: "UPDATE_PROJECT" as "UPDATE_PROJECT",
        project: project
    }),
    removeProject: (id: number) => ({
        type: "REMOVE_PROJECT" as "REMOVE_PROJECT",
        id: id
    }),
};

function unreachableStatement(_x: never) {
}

type ACTIONS_TYPES = ReturnType<typeof ACTIONS[keyof typeof ACTIONS]>;

function reducer(state = initialState, action: ACTIONS_TYPES): ColabState {

    switch (action.type) {
        case 'START_INIT':
            return {...state, status: 'SYNC'};
        case 'INIT_DONE':
            return {...state, status: 'READY'};
        case 'INIT_WS_SESSION_ID':
            return {...state, wsSession: action.sessionId};
        case 'ERROR':
            return {
                ...state,
                error: action.error
            }
        case 'INIT_PROJECTS':
            return {
                ...state,
                projects: action.projects.reduce<ColabState["projects"]>((acc, current) => {
                    if (current.id) {
                        acc[current.id] = current;
                    }
                    return acc;
                }, {})
            };
        case 'UPDATE_PROJECT':
            if (action.project.id) {
                const newProjects = {
                    ...state.projects,
                    [action.project.id]: action.project
                };
                return {...state, projects: newProjects};
            }
            return state;
        case 'REMOVE_PROJECT':
            if (action.id) {
                const newProjects = {
                    ...state.projects,
                };
                delete newProjects[action.id]
                return {...state, projects: newProjects};
            }
            return state;
    }

    unreachableStatement(action);
    return state;
}

const store = createStore(reducer, applyMiddleware(thunk));

export const getStore = () => store;

export const dispatch = store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    ColabState,
    unknown,
    Action<string>
>

export type TDispatch = ThunkDispatch<ColabState, void, AnyAction>;

export function initData(): AppThunk {
    return async (dispatch, _getState) => {
        dispatch(ACTIONS.startInit());

        const promises = {
            projects: API.getProjects(),
        };

        const array = Object.values(promises) as Promise<any>[];
        Promise.all(array)
            .then(() => {
                dispatch(ACTIONS.initDone());
            })

        promises.projects
            .then((projects) =>
                dispatch(ACTIONS.initProjects(projects)))
            .catch((e) =>
                dispatch(ACTIONS.error(e))
            );
    }
}

export function createProject(project: API.Project): AppThunk {
    return async dispatch => {
        const id = await API.createProject({
            ...project,
            id: undefined
        })
        //dispatch(ACTIONS.editProject(id));
    }
}


export function updateProject(project: API.Project): AppThunk {
    return async dispatch => {
        API.updateProject({
            ...project,
        })
    }
}

export function deleteProject(project: API.Project): AppThunk {
    return async dispatch => {
        if (project.id) {
            API.deleteProject(project.id);
        }
    }
}