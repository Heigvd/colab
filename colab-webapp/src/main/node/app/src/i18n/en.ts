/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { MessageI18nKey } from 'colab-rest-client';

export const en = {
  //////////////////////////////////////////////////////////////////////////////////////////////////
  // Common
  common: {
    cancel: 'Cancel',
    create: 'Create',
    add: 'Add',
    next: 'Next',
    back: 'Back',
    date: (timestamp: number | null | undefined) => {
      if (timestamp != null) {
        return new Date(timestamp).toLocaleDateString('EN');
      } else {
        return 'never';
      }
    },
    time: (timestamp: number | null | undefined) => {
      if (timestamp != null) {
        return new Date(timestamp).toLocaleTimeString('EN');
      } else {
        return 'never';
      }
    },
    datetime: (timestamp: number | null | undefined) => {
      if (timestamp != null) {
        return new Date(timestamp).toLocaleString('EN');
      } else {
        return 'never';
      }
    },
    info: {
      checkYourMailbox: 'Check your mailbox!',
    },
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // Form
  form: {
    missingMandatory: 'please fill in data',
    defaultFieldError: 'please correct data',
    submit: 'Submit',
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // Authentication
  authentication: {
    field: {
      emailOrUsername: 'e-mail or username',
      emailAddress: 'e-mail address',
      username: 'username',
      password: 'password',
      passwordConfirmation: 'password again',
    },
    placeholder: {
      min7Char: 'Min. 7 characters',
    },
    action: {
      login: 'Login',
      resetPassword: 'Forgot your password ?',
      createAnAccount: 'Create an account',
      sendMePassword: 'Send me a new password',
    },
    info: {
      resetPasswordSent:
        'We sent you a link to change your password. Change it, make it safe, and enjoy colabbing !',
      pendingInvitation: 'pending invitation',
    },
    error: {
      emailAddressNotValid: 'e-mail address is not valid',
      usernameNotValid:
        'username can only contain letters without accent, numbers, dots, underscores and dashes',
      passwordTooWeak: 'password is not strong enough',
      passwordsMismatch: 'passwords do not match',
    },
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // keys direct from server side

  keyFromServer: (i18nKey: MessageI18nKey): string => {
    // NB : If this method does not compile any more,
    // it means that the MessageI18nKey do not exactly match the case entries
    // Dear developer, please make them match
    switch (i18nKey) {
      case 'EMAIL_NOT_VALID':
        return 'E-mail address is not valid';
      case 'IDENTIFIER_ALREADY_TAKEN':
        return 'Please choose another identifier';
    }
  },

  httpErrorMessage: {
    AUTHENTICATION_FAILED: 'Authentication failed',
    AUTHENTICATION_REQUIRED: 'Please authenticate',
    ACCESS_DENIED: 'Access denied',
    NOT_FOUND: 'Not found',
    SMTP_ERROR: 'e-mail server error',
    EMAIL_MESSAGE_ERROR: 'e-mail not sent',
    BAD_REQUEST: 'Bad request',
    TOO_MANY_ATTEMPTS: 'Too many attempts, please wait a moment before trying again',
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // the remaining is to be done ....

  model: {
    user: {
      username: 'username',
      commonName: 'common name',

      firstname: 'firstname',
      missingFirstname: 'please enter your firstname',
      lastname: 'lastname',
      missingLastname: 'please enter your lastname',
      affiliation: 'affiliation',
    },
  },

  // common
  confirm: 'confirm',

  // form
  pleaseProvideData: 'Some data are missing',

  // Terms of use + data management policy
  agreementDisclaimer: 'The use of this service implies that you agree to',
  iAccept: 'I accept',
  agree: 'agree',
  termOfUse: 'the general terms of use',
  and: 'and',
  dataPolicy: 'the data management policy',
  termOfUseUrl: 'about:error',
  dataPolicyUrl: 'about:error',
  notAgreed: 'you have to agree with our policies',
  agreedTime: 'Agreed to terms of use: ',
  never: 'never',

  // settings
  editProfile: 'Edit profile',
  viewProfile: 'View profile',
  updatePassword: 'Update pasword',

  passwordEditionImpossible: 'You cannot update your password',

  // common
  loading: 'loading...',
  copiedToClipboard: 'copied to clipboard',
  copyToClipboard: 'copy to clipboard',
  reconnecting: 'reconnecting...',
  search: 'search...',
  logout: 'logout',
  changeLanguage: 'change language',
  //
  sortBy: 'sort by: ',
  createdBy: 'created by',
  createdOn: 'Created on',
  name: 'name',
  date: 'date',
  by: 'by',

  settings: 'settings',
  basicSettings: 'Basic parameters',
  nameIsRequired: 'Name is required',
  accessKeyIsRequiered: 'access key is required',
  advancedSettings: 'Advanced parameters',
  langSettings: 'Languages',
  comments: 'comments',
  commentsAreOptional: 'Comments are optional',

  pendingChanges: 'Some changes were not saved...',
  save: 'save',
  nothingToDisplay: 'there is nothing to display...',

  anonymous: 'anonymous',

  lastSeenAtKey: 'last seen',
  lastSeenAt: 'Last seen: ',
  lastActivityDate: 'Activity date: ',

  adminPanel: 'Admin',
  adminConsole: 'Welcome to the admin console',
  who: 'Who',
  connectedUsers: 'Connected Users',
  users: 'Users',
  loggers: 'Loggers',
  stats: 'Stats',

  editUser: 'edit user',

  pleaseWait: 'Please wait...',
  tokenNotFound: 'Token not found',
  youAreConnectedAsUser: (user: string): string => `You are currently logged in as "${user}"`,
  butCraftedFor: (user: string): string => `but your link/token has been crafted for "${user}"`,
  logoutForPrivacy: 'To ensure your privacy, you have to log out',
  logoutToContinue: 'In order to continue, you have to log out',
  invalidToken: 'Invalid Token',
  processing: 'processing...',
  aaiAccount: 'AAI Account',
  aaiAffiliation: 'Affiliation',
  aaiNotEditable: ' Personal data are not editable',

  card: {
    untitled: 'New card',
    settings: {
      title: 'Settings',
      acl: {
        title: 'Access Control',
      },
    },
  },
  content: {
    none: 'no version',
    untitled: 'New version',
  },
  resource: {
    untitled: 'New document',
    noTeaser: 'no document teaser',
  },
};
