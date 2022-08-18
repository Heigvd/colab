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
    ok: 'OK',
    open: 'Open',
    add: 'Add',
    select: 'Select',
    selectAll: 'Select all',
    next: 'Next',
    back: 'Back',
    updated: 'updated',
    deprecated: 'deprecated',
    published: 'published',
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
  // Basic components
  basicComponent: {
    form: {
      missingMandatory: 'please fill in data',
      defaultFieldError: 'please correct data',
      pleaseProvideData: 'Some data are missing',
      submit: 'Submit',
    },
    selectInput: {
      noMatch: 'No match',
      noItemTypeToCreate: 'Type to create the first item',
      select: 'Select',
      selectOrCreate: 'Select or type to create',
      create: 'Create',
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
    generalInvolvement: 'General involvement',
    involvementHelper:
      'Add or select an involvement level for all members and roles. You can fine-tune it below by choosing indiviually a different level.  When undefined, the involvement level is calculated based on parent(s) card(s), and then on your rights in the project.',
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
      card: 'Card',
      variant: 'Variant',
      subcards: 'Subcards',
      untitled: 'New card',
      addCard: 'Add a card',
      editCard: 'Edit card',
      addVariant: 'Add a variant',
      createNew: (parentTitle?: string | null): string =>
        `Create a new ${parentTitle ? 'subcard for ' + parentTitle : 'card'}"`,
      deleteCardVariant: (hasVariant?: boolean): string =>
        `Delete ${hasVariant ? 'variant' : 'card'}`,
      confirmDeleteCardVariant: (hasVariant?: boolean): string =>
        `Are you sure you want to delete this whole ${
          hasVariant ? 'variant' : 'card'
        }? This will delete all subcards inside.`,
      involvements: 'Involvements',
      completion: 'Completion',
      position: 'position',
      showCardType: 'Show card type information',
      editCompletion: 'Edit card completion',
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
        cardColor: 'Card color',
        contentStatus: 'Card content status',
        completionLevelMode: 'Completion level mode',
        cardPosition: 'Card position',
      },
      infos: {
        cardLocked: 'Card is locked. To unlock it go to Card settings and uncheck "locked".',
        lockingCard:
          'Locking the variant (card if only one variant) will artificially set it as read-only and prevent the edition.',
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
      document: 'document',
      mdMode: 'Markdown mode',
      showTree: 'Show tree',
      dlFile: 'Download file',
      editBlock: 'Edit block',
      deleteBlock: 'Delete block',
      addText: 'Add a text block',
      addFile: 'Add a file',
      addLink: 'Add a link',
      moveBlockUpDown: (direction: string): string =>
        `Move block ${direction === 'up' ? 'up' : 'down'}`,
      deleteBlockType: (isText: boolean, isLink: boolean): string =>
        `Delete ${isText ? 'text' : isLink ? 'link' : 'doc'}"`,
      confirmDeleteBlock:
        'Are you sure you want to delete this whole block? This will be lost forever.',
      openUrlNewTab: 'Open URL in new tab',
    },
    resource: {
      untitled: 'New document',
      noTeaser: 'no document teaser',
      category: 'category',
      documentation: 'Documentation',
      docDescription:
        'Use documentation panel to add pieces of (meta)information related to the card or variant. Pieces of documentation can come from card type.',
    },
    stickyNotes: {
      stickyNotes: 'Sticky notes',
      listStickyNotes: 'List of sticky notes stuck on the card',
      snDescription:
        'Sticky notes come from a source (card, card specific version, resource, block)',
    },
    cardType: {
      cardType: 'Card type',
      blankType: 'Blank card type',
      purpose: 'Purpose',
      addType: 'Add a type',
      editType: 'Edit type',
      deleteType: 'Delete card type',
      manageTypes: 'Manage card types',
      useInProject: 'Use in project',
      RmFromProject: 'Remove from project',
      typeSettings: 'Type Settings',
      advancedTypeSettings: 'Advanced type settings',
      globalTypes: 'Global card types',
      explainPurpose: 'Explain the purpose',
      confirmDeleteType: 'Are you sure you want to delete this card type?',
      infos: {
        referencedByOther: 'It can be referenced by other projects (with regards to access rights)',
        shouldNotBeUsed: 'It should not be used anymore',
        isIsglobalType: 'It is a global type',
        addFirstGlobalTypes: 'Add first global card type',
        addFirstProjectType: 'Add first card type to the project',
        fromProject: 'It comes from the project',
        fromAProject: 'It comes from a project',
        nothingMatchTag: 'Nothing matches tag selection',
        noProjectSelected: 'No project selected',
        infoDeprecated:
          'Make a Card type deprecated whether it is obsolete or another version should be used instead.',
        infoPublished: 'Make a card type published if you want to access it in your other projects',
        cannotRemoveType: 'Impossible to remove this card type. It is used in this project.',
        cannotDeleteType: 'Impossible to remove this card type. It is used in this project.',
        createEmptyType: 'You can create an empty type with the button',
        orAddSharedType: 'or add a "shared available type" to the project.',
        noExternalType: 'There are no available external card types',
      },
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
