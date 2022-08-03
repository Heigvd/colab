/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { MessageI18nKey } from 'colab-rest-client';

export const en = {
  //////////////////////////////////////////////////////////////////////////////////////////////////
  // COMMON
  common: {
    cancel: 'Cancel',
    create: 'Create',
    save: 'Save',
    confirm: 'confirm',
    close: 'Close',
    open: 'Open',
    add: 'Add',
    select: 'Select',
    selectAll: 'Select all',
    next: 'Next',
    back: 'Back',
    updated: 'updated',
    empty: 'empty',
    loading: 'loading...',
    copiedToClipboard: 'copied to clipboard',
    copyToClipboard: 'copy to clipboard',
    reconnecting: 'reconnecting...',
    search: 'search...',
    logout: 'logout',
    langSettings: 'Languages',
    changeLanguage: 'change language',
    sortBy: 'sort by: ',
    createdBy: 'created by',
    createdOn: 'Created on',
    name: 'name',
    date: 'date',
    by: 'by',
    settings: 'settings',
    basicSettings: 'Basic parameters',
    advancedSettings: 'Advanced parameters',
    comments: 'comments',
    commentsAreOptional: 'Comments are optional',
    dateFn: (timestamp: number | null | undefined) => {
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
    error: {
      missingContent: 'oh there is nothing to display, dear developer please fix it',
      unknown: 'Unknown',
    },
    info: {
      pleaseWait: 'Please wait...',
      processing: 'processing...',
      tokenNotFound: 'Token not found',
      youAreConnectedAsUser: (user: string): string => `You are currently logged in as "${user}"`,
      nameIsRequired: 'Name is required',
      accessKeyIsRequired: 'access key is required',
    },
  },
  //////////////////////////////////////////////////////////////////////////////////////////////////
  // USER
  user: {
    model: {
      username: 'username',
      commonName: 'common name',
      firstname: 'firstname',
      lastname: 'lastname',
      affiliation: 'affiliation',
    },
    missingFirstname: 'please enter your firstname',
    missingLastname: 'please enter your lastname',
    editProfile: 'Edit profile',
    viewProfile: 'View profile',
    updatePassword: 'Update pasword',
    passwordEditionImpossible: 'You cannot update your password',
    editUser: 'edit user',
  },
  team: {
    roles: 'Roles',
    members: 'Members',
  },
  //////////////////////////////////////////////////////////////////////////////////////////////////
  // ACTIVITY
  activity: {
    pendingChanges: 'Some changes were not saved...',
    nothingToDisplay: 'there is nothing to display...',
    anonymous: 'anonymous',
    lastSeenAtKey: 'last seen',
    lastSeenAt: 'Last seen: ',
    lastActivityDate: 'Activity date: ',
    notifications: {
      error: 'Oops! An error',
      warning: 'Warning!',
      information: 'Information',
    },
  },
  //////////////////////////////////////////////////////////////////////////////////////////////////
  // ADMIN
  admin: {
    adminPanel: 'Admin',
    adminConsole: 'Welcome to the admin console',
    who: 'Who',
    connectedUsers: 'Connected Users',
    users: 'Users',
    loggers: 'Loggers',
    stats: 'Stats',
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // FORM
  form: {
    missingMandatory: 'please fill in data',
    defaultFieldError: 'please correct data',
    pleaseProvideData: 'Some data are missing',
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
      reconnecting: 'Reconnecting...',
      checkYourMailbox: 'Check your mailbox!',
      logoutForPrivacy: 'To ensure your privacy, you have to log out',
      logoutToContinue: 'In order to continue, you have to log out',
      butCraftedFor: (user: string): string => `but your link/token has been crafted for "${user}"`,
    },
    error: {
      emailAddressNotValid: 'e-mail address is not valid',
      emailOrUserNotValid: 'The username/email or password is invalid. Please try again.',
      usernameNotValid:
        'username can only contain letters without accent, numbers, dots, underscores and dashes',
      passwordTooWeak: 'password is not strong enough',
      passwordsMismatch: 'passwords do not match',
      yourPasswordIsWeak: 'your password is weak',
      invalidToken: 'Invalid Token',
    },
    aai: {
      aaiAccount: 'AAI Account',
      aaiAffiliation: 'Affiliation',
      aaiNotEditable: 'Personal data are not editable',
    },
  },
  //////////////////////////////////////////////////////////////////////////////////////////////////
  // MODULES
  modules: {
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
      mimeType: 'MIME type',
      document: 'document',
    },
    resource: {
      untitled: 'New document',
      noTeaser: 'no document teaser',
    },
    cardType: {
      referencedByOther: 'It can be referenced by other projects (with regards to access rights)',
      shouldNotBeUsed: 'It should not be used anymore',
      globalType: 'It is a global type',
      fromProject: 'It comes from the project',
      fromAProject: 'It comes from a project',
      nothingMatchTag: 'Nothing matches tag selection',
    },
  },
  //////////////////////////////////////////////////////////////////////////////////////////////////
  // Tips
  tips: {
    label: {
      todo: 'Display Todo',
      tips: 'Display Tips',
      news: 'Display News',
      wip: 'Display work in progress elements',
    },
    example: {
      todo: {
        title: 'Todo example',
        content: 'We know what to do, but we have not done it yet',
      },
      tips: {
        title: 'Tips example',
        content: 'Some useful info to help users',
      },
      news: {
        title: 'News example',
        content: 'Some new feature to emphasis',
      },
      wip: {
        title: 'WIP Example',
        content: 'Some features not completely finished yet',
      },
    },
    info: { wip: 'Work in progress feature below' },
  },
  //////////////////////////////////////////////////////////////////////////////////////////////////
  // Terms of use + data management policy
  dataPolicy: {
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
};
