/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { ColabClient, AuthInfo, SignUpInfo, Project } from 'colab-rest-client';

import { getStore, AppThunk } from '../store';
import * as Auth from '../store/auth';
import * as Navigation from '../store/navigation';
import * as ProjectAction from '../store/project';

import { addError } from '../store/error';
import { hashPassword } from '../SecurityHelper';

const restClient = ColabClient('', error => {
  if (error instanceof Object && '@class' in error) {
    getStore().dispatch(addError(error));
  } else {
  }
});

export function signInWithLocalAccount(identifier: string, password: string): AppThunk {
  return async dispatch => {
    // first, fetch a
    const authMethod = await restClient.UserController.getAuthMethod(identifier);
    const authInfo: AuthInfo = {
      '@class': 'AuthInfo',
      identifier: identifier,
      mandatoryHash: await hashPassword(authMethod.mandatoryMethod, authMethod.salt, password),
    };

    await restClient.UserController.signIn(authInfo);
    dispatch(reloadCurrentUser());
  };
}

export function signOut(): AppThunk {
  return async dispatch => {
    await restClient.UserController.signOut();
    dispatch(Auth.signOut());
  };
}

export function signUp(username: string, email: string, password: string): AppThunk {
  return async dispatch => {
    // first, fetch a
    const authMethod = await restClient.UserController.getAuthMethod(email);

    const signUpInfo: SignUpInfo = {
      '@class': 'SignUpInfo',
      email: email,
      username: username,
      hashMethod: authMethod.mandatoryMethod,
      salt: authMethod.salt,
      hash: await hashPassword(authMethod.mandatoryMethod, authMethod.salt, password),
    };
    await restClient.UserController.signUp(signUpInfo);

    // go back to login page
    dispatch(signInWithLocalAccount(email, password));
  };
}

export function reloadCurrentUser(): AppThunk {
  return async dispatch => {
    // one would like to await both query result later, but as those requests are most likely
    // the very firsts to be sent to the server, it shoudl be avoided to prevent creatiing two
    // colab_session_id
    const currentAccount = await restClient.UserController.getCurrentAccount();
    const currentUser = await restClient.UserController.getCurrentUser();

    dispatch(Auth.signIn({ currentUser: currentUser, currentAccount: currentAccount }));
  };
}

export function initData(): AppThunk {
  return async (dispatch, _getState) => {
    dispatch(Navigation.goto('SYNCING'));

    const promises = {
      projects: restClient.ProjectController.getAllProjects(),
    };

    const array = Object.values(promises) as Promise<any>[];
    Promise.all(array).then(() => {
      dispatch(Navigation.goto('READY'));
    });

    promises.projects.then(projects => dispatch(ProjectAction.initProjects(projects)));
  };
}

export function createProject(project: Project): AppThunk {
  return async _dispatch => {
    await restClient.ProjectController.createProject({
      ...project,
      id: undefined,
    });
    //dispatch(ACTIONS.editProject(id));
  };
}

export function updateProject(project: Project): AppThunk {
  return async _dispatch => {
    restClient.ProjectController.updateProject({
      ...project,
    });
  };
}

export function deleteProject(project: Project): AppThunk {
  return async _dispatch => {
    if (project.id) {
      restClient.ProjectController.deleteProject(project.id);
    }
  };
}
