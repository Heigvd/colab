/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as API from "colab-rest-client";
import {createStore, applyMiddleware, Action, AnyAction} from "redux";
import thunk from "redux-thunk";
import {ThunkAction, ThunkDispatch} from "redux-thunk";
import {restClient} from "./API/client";
import {hashPassword} from "./SecurityHelper";

export interface ColabState {
  wsSession?: string;
  authenticationStatus: undefined | "UNAUTHENTICATED" | 'SIGNING_UP' | 'AUTHENTICATED';
  status: "UNINITIALIZED" | "SYNCING" | "READY";
  currentUser?: API.User,
  currentAccount?: API.Account,
  projects: {
    [id: number]: API.Project;
  };
  error?: Error;
}

const initialState: ColabState = {
  authenticationStatus: undefined,
  status: 'UNINITIALIZED',
  projects: {}
};

export const ACTIONS = {
  error: (error: Error) => ({
    type: "ERROR" as "ERROR",
    error: error
  }),
  /**
   * Sign in/out/up
   */
  signIn: (user?: API.User, account?: API.Account) => ({
    type: "SIGN_IN" as "SIGN_IN",
    currentUser: user,
    currentAccount: account,
  }),
  signOut: () => ({
    type: "SIGN_OUT" as "SIGN_OUT",
  }),
  changeAuthStatus: (status: ColabState['authenticationStatus']) => ({
    type: "CHANGE_AUTH_STATUS" as "CHANGE_AUTH_STATUS",
    status: status
  }),
  changeStatus: (status: ColabState['status']) => ({
    type: "CHANGE_STATUS" as "CHANGE_STATUS",
    status: status
  }),
  startInit: () => ({
    type: "START_INIT" as "START_INIT"
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
  })
};

function unreachableStatement(_x: never) {}

type ACTIONS_TYPES = ReturnType<typeof ACTIONS[keyof typeof ACTIONS]>;

function reducer(state = initialState, action: ACTIONS_TYPES): ColabState {
  switch (action.type) {
    case 'SIGN_IN':
      const signedIn = action.currentUser != null && action.currentAccount != null;
      return {
        ...state,
        authenticationStatus: signedIn ? 'AUTHENTICATED' : 'UNAUTHENTICATED',
        currentUser: action.currentUser,
        currentAccount: action.currentAccount,
      }
    case 'SIGN_OUT':
      return {
        ...state,
        authenticationStatus: 'UNAUTHENTICATED',
        status: 'UNINITIALIZED',
        projects: {},
        currentUser: undefined,
        currentAccount: undefined,
      }
    case 'CHANGE_STATUS':
      return {...state, status: action.status}
    case 'CHANGE_AUTH_STATUS':
      return {...state, authenticationStatus: action.status}
    case "START_INIT":
      return {...state, status: "SYNCING"};
    case "INIT_DONE":
      return {...state, status: "READY"};
    case "INIT_WS_SESSION_ID":
      return {...state, wsSession: action.sessionId};
    case "ERROR":
      return {
        ...state,
        error: action.error
      };
    case "INIT_PROJECTS":
      return {
        ...state,
        projects: action.projects.reduce<ColabState["projects"]>(
          (acc, current) => {
            if (current.id) {
              acc[current.id] = current;
            }
            return acc;
          },
          {}
        )
      };
    case "UPDATE_PROJECT":
      if (action.project.id) {
        const newProjects = {
          ...state.projects,
          [action.project.id]: action.project
        };
        return {...state, projects: newProjects};
      }
      return state;
    case "REMOVE_PROJECT":
      if (action.id) {
        const newProjects = {
          ...state.projects
        };
        delete newProjects[action.id];
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
>;

export type TDispatch = ThunkDispatch<ColabState, void, AnyAction>;

export function initData(): AppThunk {
  return async (dispatch, _getState) => {
    dispatch(ACTIONS.startInit());

    const promises = {
      projects: restClient.ProjectController.getAllProjects()
    };

    const array = Object.values(promises) as Promise<any>[];
    Promise.all(array).then(() => {
      dispatch(ACTIONS.initDone());
    });

    promises.projects
      .then(projects => dispatch(ACTIONS.initProjects(projects)))
      .catch(e => dispatch(ACTIONS.error(e)));
  };
}

export function createProject(project: API.Project): AppThunk {
  return async dispatch => {
    const id = await restClient.ProjectController.createProject({
      ...project,
      id: undefined
    });
    //dispatch(ACTIONS.editProject(id));
  };
}

export function updateProject(project: API.Project): AppThunk {
  return async dispatch => {
    restClient.ProjectController.updateProject({
      ...project
    });
  };
}

export function deleteProject(project: API.Project): AppThunk {
  return async dispatch => {
    if (project.id) {
      restClient.ProjectController.deleteProject(project.id);
    }
  };
}

export function signInWithLocalAccount(
  identifier: string,
  password: string
): AppThunk {
  return async dispatch => {
    // first, fetch a
    const authMethod = await restClient.UserController.getAuthMethod(identifier);
    const authInfo: API.AuthInfo = {
      "@class": 'AuthInfo',
      identifier: identifier,
      mandatoryHash: await hashPassword(authMethod.mandatoryMethod, authMethod.salt, password)
    };

    await restClient.UserController.signIn(authInfo);
    dispatch(reloadCurrentUser());
  };
}

export function signOut(): AppThunk {
  return async dispatch => {
    await restClient.UserController.signOut();
    dispatch(ACTIONS.signOut());
  };
}

export function signUp(
  username: string,
  email: string,
  password: string
): AppThunk {
  return async dispatch => {
    // first, fetch a
    const authMethod = await restClient.UserController.getAuthMethod(email);

    const signUpInfo: API.SignUpInfo = {
      "@class": 'SignUpInfo',
      email: email,
      username: username,
      hashMethod: authMethod.mandatoryMethod,
      salt: authMethod.salt,
      hash: await hashPassword(authMethod.mandatoryMethod, authMethod.salt, password)
    };
    await restClient.UserController.signUp(signUpInfo);

    // go back to login page
    dispatch(signInWithLocalAccount(email, password));
  };
}


export function reloadCurrentUser(
): AppThunk {
  return async dispatch => {
    // one would like to await both query result later, but as those requests are most likely
    // the very firsts to be sent to the server, it shoudl be avoided to prevent creatiing two
    // colab_session_id
    const currentAccount = await restClient.UserController.getCurrentAccount();
    const currentUser = await restClient.UserController.getCurrentUser();

    dispatch(ACTIONS.signIn(currentUser, currentAccount));
  };
}

