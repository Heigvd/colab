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
    duplicate: 'Duplicate',
    confirm: 'Confirm',
    close: 'Close',
    delete: 'Delete',
    remove: 'Remove',
    ok: 'OK',
    open: 'Open',
    show: 'Show',
    hide: 'Hide',
    add: 'Add',
    edit: 'Edit',
    select: 'Select',
    selectAll: 'Select all',
    next: 'Next',
    back: 'Back',
    updated: 'Updated',
    empty: 'Empty',
    loading: 'Loading...',
    copiedToClipboard: 'Copied to clipboard',
    copyToClipboard: 'Copy to clipboard',
    reconnecting: 'Reconnecting...',
    search: 'Search...',
    logout: 'Logout',
    langSettings: 'Languages',
    changeLanguage: 'Change language',
    sortBy: 'Sort by: ',
    createdBy: 'created by',
    createdOn: 'Created on',
    name: 'Name',
    date: 'Date',
    by: 'By',
    settings: 'Settings',
    blank: 'Blank',
    deprecated: 'Deprecated',
    published: 'Published',
    //comments: 'comments',
    //commentsAreOptional: 'Comments are optional',
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
      accessDenied: 'Unfortunately you are not allowed to see this',
      missingContent: 'Oh there is nothing to display, dear developer please fix it',
      unknown: 'Unknown',
    },
    info: {
      pleaseWait: 'Please wait...',
      processing: 'Processing...',
      tokenNotFound: 'Token not found',
      youAreConnectedAsUser: (user: string): string => `You are currently logged in as "${user}"`,
      nameIsRequired: 'Name is required',
      accessKeyIsRequired: 'Access key is required',
      nothingMatchTag: 'Nothing matches tag selection',
    },
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // Basic components
  basicComponent: {
    form: {
      missingMandatory: 'Please fill in data',
      defaultFieldError: 'Please correct data',
      pleaseProvideData: 'Some data are missing',
    },
    selectInput: {
      noMatch: 'No match',
      noItemTypeToCreate: 'Type to create the first item',
      select: 'Select',
      selectOrCreate: 'Select or type to create',
      create: (newValue: string): string => `Create "${newValue}"`,
    },
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // USER
  user: {
    model: {
      username: 'Username',
      commonName: 'Common name',
      firstname: 'Firstname',
      lastname: 'Lastname',
      affiliation: 'Affiliation',
    },
    missingFirstname: 'Please enter your firstname',
    missingLastname: 'Please enter your lastname',
    editProfile: 'Edit profile',
    viewProfile: 'View profile',
    updatePassword: 'Update pasword',
    passwordEditionImpossible: 'You cannot update your password',
    editUser: 'Edit user',
  },
  team: {
    roles: 'Roles',
    members: 'Members',
    generalInvolvement: 'General involvement',
    involvementHelper:
      'Add or select an involvement level for all members and roles. You can fine-tune it below by choosing indiviually a different level.  When undefined, the involvement level is calculated based on parent(s) card(s), and then on your rights in the project.',
  },
  //////////////////////////////////////////////////////////////////////////////////////////////////
  // ACTIVITY
  activity: {
    pendingChanges: 'Some changes were not saved...',
    nothingToDisplay: 'There is nothing to display...',
    anonymous: 'Anonymous',
    lastSeenAtKey: 'Last seen',
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
    admin: 'Admin',
    adminPanel: 'Admin',
    adminConsole: 'Welcome to the admin console',
    who: 'Who',
    connectedUsers: 'Connected Users',
    users: 'Users',
    loggers: 'Loggers',
    stats: 'Stats',
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // Authentication
  authentication: {
    field: {
      emailOrUsername: 'Username or e-mail',
      emailAddress: 'E-mail address',
      username: 'Username',
      password: 'Password',
      passwordConfirmation: 'Password again',
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
      pendingInvitation: 'Pending invitation',
      reconnecting: 'Reconnecting...',
      checkYourMailbox: 'Check your mailbox!',
      logoutForPrivacy: 'To ensure your privacy, you have to log out',
      logoutToContinue: 'In order to continue, you have to log out',
      butCraftedFor: (user: string): string => `but your link/token has been crafted for "${user}"`,
    },
    error: {
      emailAddressNotValid: 'E-mail address is not valid',
      emailOrUserNotValid: 'The username/email or password is invalid. Please try again.',
      usernameNotValid:
        'Username can only contain letters without accent, numbers, dots, underscores and dashes',
      passwordTooWeak: 'Password is not strong enough',
      passwordsMismatch: 'Passwords do not match',
      yourPasswordIsWeak: 'Your password is weak',
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
    project: {
      actions: {
        createProject: 'Create project',
        createAProject: 'Create a project',
        chooseAModel: 'Choose a model',
        createAProjectFrom: (templateTitle?: string | null): string =>
          `Create a project from ${'"' + templateTitle + '"'}`,
      },
      info: {
        noProjectSelected: 'No project selected',
      },
    },
    team: {
      actions: {
        createRole: 'Create role',
      },
    },
    card: {
      card: 'Card',
      variant: 'Variant',
      subcards: 'Subcards',
      untitled: 'New card',
      createCard: 'Create card',
      createACard: 'Create a card',
      createVariant: 'Create variant',
      createNew: (parentTitle?: string | null): string =>
        `Create a ${parentTitle ? 'subcard for ' + parentTitle : 'card'}`,
      deleteCardVariant: (hasVariant?: boolean): string =>
        `Delete ${hasVariant ? 'variant' : 'card'}`,
      confirmDeleteCardVariant: (hasVariant?: boolean): string =>
        `Are you sure you want to delete this whole ${
          hasVariant ? 'variant' : 'card'
        }? This will delete all subcards inside.`,
      involvements: 'Involvements',
      completion: 'Completion',
      position: 'Position',
      showCardType: 'Show model information',
      editCompletion: 'Edit card completion',
      action: {
        chooseACardType: 'Choose a model',
      },
      editor: {
        toggleToolbox: 'Toggle toolbox',
        fullScreen: 'Full screen mode',
      },
      settings: {
        title: 'Card settings',
        acl: {
          title: 'Access Control',
        },
        locked: 'Locked',
        color: 'Color',
        status: 'Status',
        completionLevelMode: 'Completion level mode',
        cardPosition: 'Card position',
      },
      infos: {
        createFirstCard: 'Create the first card',
        noCardYetPleaseCreate:
          'This project has no card yet. Create some to begin this co-design journey !',
        cardLocked: 'Card is locked. To unlock it go to Card settings and uncheck "locked".',
        lockingCard: 'Locking sets to read-only.',
        noDeliverable: 'No deliverable available',
        completionModeInfo:
          'Select completion mode (MANUAL | AUTO | NO_OP). Manual: input to set completion; Auto: based on children; No: do not event diplay the bar',
      },
      error: {
        withoutId: 'Card without id is invalid...',
      },
    },
    content: {
      none: 'no version',
      untitled: 'New version',
      mimeType: 'MIME type',
      document: 'Document',
      mdMode: 'Markdown mode',
      showTree: 'Show tree',
      dlFile: 'Download file',
      editBlock: 'Edit block',
      deleteBlock: 'Delete block',
      createText: 'Create text block',
      createFile: 'Create file',
      createLink: 'Create link',
      moveBlockUpDown: (direction: string): string =>
        `Move block ${direction === 'up' ? 'up' : 'down'}`,
      deleteBlockType: (isText: boolean, isLink: boolean): string =>
        `Delete ${isText ? 'text' : isLink ? 'link' : 'doc'}`,
      confirmDeleteBlock:
        'Are you sure you want to delete this whole block? This will be lost forever.',
      openUrlNewTab: 'Open URL in new tab',
    },
    document: {
      createDocument: 'Create document',
      createADocument: 'Create a document',
    },
    resource: {
      untitled: 'New document',
      noTeaser: 'There is no teaser',
      noTeaserForNow: 'There is no teaser for the moment. Feel free to fill it.',
      category: 'Category',
      documentation: 'Documentation',
      docDescription: 'Documentation related to the card.',
      docDescriptionWithType:
        'Documentation related to the card. The model may provide basic documentation.',
    },
    cardType: {
      cardType: 'Model',
      cardTypesLongWay: 'Card models',
      titlePlaceholder: 'New Model',
      purpose: 'Purpose',
      globalTypes: 'Global models',
      sharedAvailableTypes: 'Shared available models',
      action: {
        createType: 'Create model',
        createAType: 'Create a model',
        deleteType: 'Delete model',
        confirmDeleteType: 'Are you sure you want to delete this model ?',
        useInProject: 'Use in project',
        removeFromProject: 'Remove from project',
      },
      route: {
        backToCardType: 'Back to models',
        manageTypes: 'Manage models',
      },
      info: {
        infoPublished: (usageInAProject: boolean): string =>
          `${
            usageInAProject ? 'Can be used in other related projects' : 'Can be used in any project'
          }`,
        infoDeprecated: 'Should not be used anymore',
        explainPurpose: 'Explain the purpose',
        providedByCardType: 'Provided by the model',
        cannotRemoveCardType: 'Cannot remove model',
        cannotRemoveFromProject: 'Impossible to remove this model. It is used by some cards.',
        cannotDeleteType: 'Impossible to delete this model. It is used in this project.',
        createFirstGlobalType: 'Create first global model',
        createFirstProjectType: 'Create first model',
        createEmptyType: 'You can create an empty model with the button',
        orAddSharedType: 'or add a "shared available model".',
        noExternalType: 'There is no available external model',
        referencedByOther: 'It can be referenced by other projects (with regards to access rights)',
        shouldNotBeUsed: 'It should not be used anymore',
        isGlobalType: 'It comes from a global model',
        fromProject: (projectName: string): string => `It comes from project "${projectName}"`,
        fromAProject: 'It comes from a project',
      },
    },
    stickyNotes: {
      stickyNotes: 'Sticky notes',
      listStickyNotes: 'List of sticky notes stuck on the card',
      snDescription:
        'Sticky notes come from a source (card, card specific version, resource, block)',
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
    agree: 'Agree',
    termOfUse: 'The general terms of use',
    and: 'and',
    dataPolicy: 'The data management policy',
    termOfUseUrl: 'about:error',
    dataPolicyUrl: 'about:error',
    notAgreed: 'You have to agree with our policies',
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
    SMTP_ERROR: 'E-mail server error',
    EMAIL_MESSAGE_ERROR: 'E-mail not sent',
    BAD_REQUEST: 'Bad request',
    TOO_MANY_ATTEMPTS: 'Too many attempts, please wait a moment before trying again',
  },
};
