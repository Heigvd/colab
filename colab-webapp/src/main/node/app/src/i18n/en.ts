/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { MessageI18nKey } from 'colab-rest-client';

export const en = {
  //////////////////////////////////////////////////////////////////////////////////////////////////
  // COMMON
  common: {
    advanced: 'Advanced',
    cancel: 'Cancel',
    create: 'Create',
    save: 'Save',
    duplicate: 'Duplicate',
    confirm: 'Confirm',
    close: 'Close',
    delete: 'Delete',
    finalDelete: 'Irremediably delete',
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
    upload: 'Upload',
    replace: 'Replace',
    refresh: 'Refresh',
    change: 'Change',
    display: 'Display',
    restore: 'Restore',
    send: 'Send',
    empty: 'Empty',
    loading: 'Loading...',
    copiedToClipboard: 'Copied to clipboard',
    copyToClipboard: 'Copy to clipboard',
    search: 'Search...',
    logout: 'Logout',
    langSettings: 'Languages',
    changeLanguage: 'Change language',
    sortBy: 'Sort by: ',
    filter: 'Filter',
    name: 'Name',
    date: 'Date',
    by: 'By',
    and: 'and',
    icon: 'Icon',
    settings: 'Settings',
    general: 'General',
    about: 'About co.LAB',
    blank: 'Blank',
    none: 'None',
    current: 'Current',
    description: 'Description',
    noDescription: 'No description',
    deprecated: 'Deprecated',
    published: 'Published',
    project: 'Project',
    projectsList: 'Projects list',
    title: 'Title',
    views: {
      board: 'View as a board',
      hierarchy: 'View as a hierarchy',
      activityFlow: 'View as an activity flow',
      list: 'View as a list',
    },
    welcome: 'Welcome!',
    zoom: 'zoom',
    //comments: 'comments',
    //commentsAreOptional: 'Comments are optional',
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
    dateFn: (timestamp: number | null | undefined) => {
      if (timestamp != null) {
        return new Date(timestamp).toLocaleDateString('en');
      } else {
        return 'never';
      }
    },
    time: (timestamp: number | null | undefined) => {
      if (timestamp != null) {
        return new Date(timestamp).toLocaleTimeString('en');
      } else {
        return 'never';
      }
    },
    datetime: (timestamp: number | null | undefined) => {
      if (timestamp != null) {
        return new Date(timestamp).toLocaleString('en');
      } else {
        return 'never';
      }
    },
    ago: (timestamp: number | null | undefined) => {
      if (timestamp == null) {
        return 'never';
      }
      const now = new Date().getTime();
      const delta = now - timestamp;
      if (delta < 5000) {
        return 'now';
      } else if (delta < 60000) {
        return `${Math.floor(delta / 1000)}s ago`;
      } else if (delta < 3600000) {
        return `${Math.floor(delta / 60000)}m ago`;
      } else if (delta < 3600000 * 12) {
        return `${Math.floor(delta / 3600000)}h ago`;
      } else {
        return en.common.datetime(timestamp);
      }
    },
    action: {
      backToHome: 'Back to co.LAB home',
      showDetails: 'Show details',
      hideDetails: 'Hide details',
      showMore: 'Show more',
      showLess: 'Show less',
      moveAbove: 'Move above',
    },
    error: {
      accessDenied: 'Unfortunately you are not allowed to see this',
      tryToLogOut: 'Try to log out first',
      missingContent: 'Oh there is nothing to display, dear developer please fix it',
      somethingWentWrong: 'Something went wrong',
      unknown: 'Unknown',
      sorryError: 'Sorry... There was an error',
      notImplemented: 'Not implemented yet',
      missingIcon:
        'Oh a new icon library, dear developer please make what is needed to display the icon.',
    },
    info: {
      pleaseWait: 'Please wait...',
      processing: 'Processing...',
      youAreConnectedAsUser: (user: string): string => `You are currently logged in as "${user}"`,
      nameIsRequired: 'Name is required',
      accessKeyIsRequired: 'Access key is required',
      nothingMatchTag: 'Nothing matches tag selection',
      writeDescription: 'Write a description here',
    },
    bin: {
      pageTitle: 'Bin',
      action: {
        moveToBin: 'Move to bin',
        seeBin: 'Open the bin',
        restore: 'Restore',
        deleteForever: 'Delete forever',
        view: 'View',
      },
      info: {
        isEmpty: 'Bin is empty.',
        isInBin: {
          project: 'Project is in bin.',
          card: 'Card is in bin.',
          variant: 'Variant is in bin.',
          resource: 'Resource is in bin',
        },
        movedToBin: {
          project: (name: string) => `Project "${name}" moved to bin`,
          card: (title: string) => `Card "${title}" moved to bin`,
          variant: (title: string | null | undefined) =>
            title != null ? `Variant "${title}" moved to bin` : 'Variant moved to bin',
          resource: (title: string) => `Resource "${title}" moved to bin`,
        },
      },
      name: 'Name',
      dateBinned: 'Date binned',
      originalParent: 'Original parent',
      deleted: {
        project: 'Deleted project',
        card: 'Deleted card',
        resource: 'Deleted resource',
        resources: 'Deleted resources',
      },
    },
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // USER
  user: {
    label: {
      user: 'User',
      profile: 'Profile',
      userProfile: 'User profile',
      username: 'Username',
      firstname: 'First name',
      lastname: 'Last name',
      affiliation: 'Affiliation',
      activeSessions: 'Active sessions',
      settings: 'User settings',
      anonymous: 'Anonymous',
      admin: 'Admin',
    },
    action: {
      editUser: 'Edit user',
    },
  },
  team: {
    team: 'Team',
    roles: 'Roles',
    members: 'Members',
    teamManagement: 'Team management',
    inviteMembers: 'Invite members',
    inviteNewMember: 'Invite new member',
    deleteMember: 'Delete team member',
    removeGuest: 'Remove guest',
    clickToRemoveRole: 'Click to remove role',
    clickToGiveRole: 'Click to give role',
    fillRoleName: 'Fill the role name',
    deleteRole: 'Delete role',
    deleteModelSharing: 'Revoke model sharing',
    me: 'me',
    myTasks: 'My tasks',
    tasks: 'Tasks',
    assignment: {
      labels: {
        assignments: 'Assignments',
        responsible: 'Responsible',
        accountable: 'Accountable',
        support: 'Support',
      },
      actions: {
        clickToRemoveAssignment: 'Click to remove assignment',
        clickToGiveAssignment: 'Click to give assignment',
      },
    },
    rolesHelper:
      'Create and assign roles to the team members. Ex. Designer, teacher, developer. It can be used to keep all project members aware of the skills involved.',
    rightsHelper: {
      guest: 'Read only',
    },
    sureChangeOwnRights: 'Are you sure you want to change your own rights?',
    sureDeleteMember: 'Are you sure you want to delete this team member ?',
    sureDeleteRole: 'Are you sure you want to delete this role ?',
    sureDeleteModelSharing: 'Are you sure you want to revoke model sharing ?',
    changeOwnRights: 'Change my own rights',
    oneOwnerPerProject:
      'You cannot change this right. There must be at least one Owner of the project.',
    notAllowedToChangeOwnerRights: 'You are not allowed to alter the owners of the project.',
    mailInstructions:
      'Enter one or more email addresses. Separate them with commas, semicolons or new lines.',
    mailInvalid: 'Check and correct the following email(s)',
    actions: {
      createRole: 'Create role',
      resendInvitation: 'Resend invitation mail',
      invitationResent: 'Invitation has been sent again.',
    },
    rights: 'Rights',
    right: {
      label: {
        owner: 'Owner',
        member: 'Member',
        guest: 'Guest',
      },
    },
  },
  //////////////////////////////////////////////////////////////////////////////////////////////////
  // ACTIVITY
  activity: {
    pendingChanges: 'Some changes were not saved...',
    nothingToDisplay: 'There is nothing to display...',
    anonymous: 'Anonymous',
    lastActivityDate: 'Activity date: ',
    inconsistentState: 'Inconsistent state',
    label: {
      lastSeen: 'Last seen',
    },
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
    debugger: 'Debugger',
    label: {
      adminRights: 'Admin rights',
    },
    action: {
      grant: 'Grant',
      revoke: 'Revoke',
      grantAdminRightTo: 'Grant admin right to',
      revokeAdminRightTo: 'Revoke admin right to',
    },
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // Authentication
  authentication: {
    label: {
      emailOrUsername: 'Username or e-mail',
      emailAddress: 'E-mail address',
      username: 'Username',
      firstname: 'Firstname',
      lastname: 'Lastname',
      affiliation: 'Affiliation',
      password: 'Password',
      passwordConfirmation: 'Password again',
      newPassword: 'New password',
      iAccept: 'I accept',
      agreed: 'Agreed',
      termOfUse: 'the general terms of use',
      dataPolicy: 'the data management policy',
      account: 'Account',
    },
    action: {
      login: 'Login',
      createAnAccount: 'Create an account',
      resetPassword: 'Forgot your password ?',
      sendMeLinkToChangePassword: 'Send me a recovery link',
      changePassword: 'Change password',
    },
    info: {
      reconnecting: 'Reconnecting...',
      pendingInvitation: 'Pending invitation',
      min7Char: 'Min. 7 characters',
      checkYourMailbox: 'Check your mailbox!',
      resetPasswordSent: 'We sent you a link to change your password',
      passwordSuccessfullyChanged: 'Password successfully changed',
      projectInvitationCoLab: {
        part1: 'Hi !',
        part2: 'You have been invited to collaborate on a project in co.LAB.',
        part3: 'Sign in or create your very own account.',
        part4: "Happy colabbin' !",
      },
      otherInvitationCoLab: {
        part1: 'Hi !',
        part2: 'You have been invited to collaborate in co.LAB.',
        part3: 'Sign in or create your very own account.',
        part4: "Happy colabbin' !",
      },
      updatedTermsOfUse:
        'Our Terms of Use and Data Policy have been revised. Please take a moment to review and confirm acceptance before proceeding.',
    },
    error: {
      emailAddressNotValid: 'E-mail address is not valid',
      usernameNotValid:
        'Username can only contain letters without accent, numbers, dots, underscores and dashes',
      passwordTooWeak: 'Password is not strong enough',
      passwordsMismatch: 'Passwords do not match',
      yourPasswordIsWeak: 'Your password is weak',
      invalidLink: 'Invalid or deprecated link',
      notAgreed: 'you have to agree with our policies',
      pleaseRefresh: 'Please try to refresh or contact the admin of your co.LAB project.',
    },
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // MODULES
  modules: {
    project: {
      projectCopy: (name: string) => name + ' - copy',
      labels: {
        projectDisplaySettings: 'Project display settings',
        projectSettings: 'Project settings',
        projects: 'Projects',
        modelDisplaySettings: 'Project display settings',
        modelSettings: 'Model settings',
        models: 'Models',
        extractNewFromProject: 'Extract a new model from this project',
        extractRoles: 'Extract the roles',
        extractDeliverables: 'Extract the card contents',
        extractDocuments: 'Extract the documents',
        keepTheSimpleProject: 'Keep the simple project',
        include: 'Include',
        roles: 'Roles',
        cardContents: 'Card contents',
        documentation: 'Documentation',
        connect: 'Connect',
        invite: 'Invite',
        invitationToProject: 'Invitation to collaborate on the project',
        share: 'Share',
        modelSharing: 'Sharing the model',
        sharing: 'Sharing',
        sharingParams: 'Sharing parameters',
        modelScope: {
          global: 'Global',
          normal: 'Model',
        },
      },
      actions: {
        createProject: 'Create project',
        createAProject: 'Create a project',
        chooseAModel: 'Choose a model',
        createAProjectFrom: (templateTitle?: string | null): string =>
          `Create a project from ${'"' + templateTitle + '"'}`,
        editIllustration: 'Edit project illustration',
        newProject: 'New project',
        saveAsModel: 'Create a model',
        saveProjectAsModelPart: 'Create a model from project',
        extractAModel: 'Extract a model from a project',
        extractAModelFromProject: 'Extract a model from project ',
        createModel: 'Create model',
        convertToModel: 'Convert to a model',
        convertToProject: 'Convert to a simple project',
        shareTo: 'Share to',
      },
      info: {
        noProjectSelected: 'No project selected',
        noProjectYet: "You don't have any project yet",
        noProject: 'The project could not be loaded',
        emptyProject: 'Empty project',
        useBlankProject: "Use this empty project and you'll be free to create a whole new world",
        isAModel: 'This is a project model',
        mailSentToShare: (recipientAddress: string): string =>
          `${recipientAddress} will get an email inviting to use the model`,
        newModelShared: 'A new model is shared to you. You can now use it to create a new project.',
        newProjectAccess: 'You can now access a new project.',
        initialProjectNotFound: 'Initial project not found',
      },
      settings: {
        currentIcon: 'Current Icon',
        resources: {
          label: 'Project documentation',
        },
      },
    },
    card: {
      card: 'Card',
      cards: 'Cards',
      theCard: 'The card',
      variant: 'Variant',
      theVariant: 'The variant',
      //subcardTooltip: (name: string) => `Subcard: ${name}`,
      //subcards: 'Subcards',
      untitled: 'New card',
      addCard: 'Add card',
      addVariant: 'Add variant',
      createNew: (parentTitle?: string | null): string =>
        `Create a ${parentTitle ? 'subcard for ' + parentTitle : 'card'}`,
      deleteVariant: 'Delete variant',
      completion: 'Completion',
      position: 'Position',
      positioning: {
        organizeCards: 'Organize cards',
        width: 'Width',
        height: 'Height',
      },
      showCardType: 'Show theme description',
      editCompletion: 'Edit card completion',
      action: {
        lock: 'Lock',
        unlock: 'Unlock',
        changeStatus: 'Change status',
        chooseACardType: 'What theme is your card about?',
        createAType: 'Create a theme',
        removeTheType: 'Remove the theme',
      },
      editor: {
        toolbox: 'toolbox',
        showToolbox: 'Show toolbox',
        hideToolbox: 'Hide toolbox',
        toggleToolbox: 'Toggle toolbox',
        fullScreen: 'Full screen mode',
        contentOnly: 'Display text only',
        split: 'Display text and cards',
        cardsOnly: 'Display cards only',
      },
      // navigation: {
      //   toggleViewZoomToEdit: 'Edit card',
      //   toggleViewEditToZoom: 'Show subcards',
      // },
      settings: {
        title: 'Card settings',
        locked: 'Locked',
        color: 'Color',
        status: 'Status',
        noStatus: 'No status is defined',
        statusIs: 'Status: ',
        statuses: {
          ACTIVE: 'In progress',
          TO_VALIDATE: 'To validate',
          VALIDATED: 'Validated',
          REJECTED: 'Rejected',
          ARCHIVED: 'Archived',
        },
        completionLevelMode: 'Completion level mode',
        cardPosition: 'Card position',
      },
      infos: {
        createFirstCard: 'Create the first card',
        cardLocked: 'Card is locked. Unlock it first for edition',
        lockingCard: 'Locking sets to read-only.',
        noDeliverable: 'No deliverable available',
        completionModeInfo:
          'Select completion mode (MANUAL | AUTO | NO_OP). Manual: input to set completion; Auto: based on children; No: do not event display the bar',
        noBlockYet: 'Empty doc',
      },
      error: {
        withoutId: 'Card without id is invalid...',
      },
    },
    content: {
      none: 'no version',
      untitled: 'New version',
      mimeType: 'MIME type',
      unknownMimeType: 'Unknown MIME type',
      document: 'Document',
      unknownDocument: 'Unknown document',
      documentSettings: 'Document settings',
      mdMode: 'Markdown mode',
      showTree: 'Show tree',
      tree: 'Tree',
      orphans: 'Orphans',
      result: 'Result',
      uploadFile: 'Upload file',
      replaceFile: 'Replace file',
      dlFile: 'Download file',
      uploadImage: 'Upload image',
      editBlock: 'Edit block',
      deleteBlock: 'Delete block',
      addText: 'Add text block',
      addFile: 'Add file',
      addLink: 'Add link',
      openLink: 'Open link',
      editLink: 'Edit link',
      removeLink: 'Remove link',
      emptyLink: 'Empty link',
      insertLink: 'Insert a link',
      insertTable: 'Insert table',
      insertImage: 'Insert image',
      insertFile: 'Insert file',
      insertCardLink: 'Insert a link to another card',
      nbOfRows: 'Number of rows',
      nbOfColumns: 'Number of columns',
      moveBlockUpDown: (direction: string): string =>
        `Move block ${direction === 'up' ? 'up' : 'down'}`,
      deleteBlockType: (isText: boolean, isLink: boolean): string =>
        `Delete ${isText ? 'text' : isLink ? 'link' : 'doc'}`,
      confirmDeleteBlock:
        'Are you sure you want to delete this whole block? This will be lost forever.',
      noFileUploaded: 'No file uploaded',
      before: 'Before',
      onTop: 'On top',
      after: 'After',
      end: 'At the end',
      liveEditor: {
        browserNotDisplay:
          'Your browser does not support to display this text in its pretty form. Our technicians are on the case.',
        updatesWillBeLost: 'Some updates could not be taken into account and will be lost.',
        clickRollback: 'Click on the "rollback" button to restore the previous version',
        disconnected: 'Disconnected...',
        restorePrevVersion: 'Restore previous version',
        placeholder: 'Enter your text...',
      },
      textFormat: {
        clearStyles: 'Clear all currently applied styles',
        strikeText: 'Strikethrough',
        formatAsStrike: `Format text as Strikethrough.`,
        underlineSC: 'Underlined (Ctrl+U)',
        formatUnderline: 'Format text as Underlined. Shortcut: Ctrl+U',
        italicSC: 'Italic (Ctrl+I)',
        formatItalic: `Format text as Italic. Shortcut: ${'Ctrl+I'}`,
        boldSC: 'Bold (Ctrl+B)',
        formatBold: `Format text as bold. Shortcut: ${'Ctrl+B'}`,
        formatText: 'Format text ',
        paragraph: 'Paragraph',
        heading1: 'Heading 1',
        heading2: 'Heading 2',
        heading3: 'Heading 3',
        heading4: 'Heading 4',
        heading5: 'Heading 5',
        code: 'Code',
        quote: 'Quote',
        alignText: 'Align text',
        leftAlign: 'Left align',
        centerAlign: 'Center align',
        rightAlign: 'Right align',
        justify: 'Justify',
        formatList: 'Format text as list',
        bulletList: 'Bullet list',
        numberList: 'Numbered list',
        checkList: 'Check list',
        colorText: 'Color text',
        highlightText: 'Highlight text',
      },
    },
    document: {
      createDocument: 'Create document',
      createADocument: 'Create a document',
      openInNewTab: 'Open in new tab',
      unknownDocument: 'Unknown document',
    },
    resource: {
      untitled: 'New document',
      teaser: 'teaser',
      showTeaser: 'Show teaser',
      hideTeaser: 'Hide teaser',
      noTeaser: 'There is no teaser',
      noTeaserForNow: 'There is no teaser for the moment. Feel free to fill it.',
      category: 'Category',
      documentation: 'Documentation',
      categorytip: 'Group of documents',
      noResource: 'It does not contain any document',
      oneResource: 'It contains 1 document',
      xResources: (nbR: number): string => `It contains ${nbR} documents`,
      onlyForVariant: 'Available only for this variant',
      backList: 'Back to the list',
      unpublishMakePrivate: 'Unpublish the document to make it private for this card',
      publishMakeAvailableSubs: 'Publish the document to make it available for subcards',
      publishedInfo: 'A published document is available for subcards',
      publishedInfoRootCard: 'A published document is available for all cards in the project',
      unpublishedInfo: 'An unpublished document is private for this card',
      publishedInfoType: 'A published document is available for cards',
      unpublishedInfoType: 'An unpublished document is not visible for any cards',
      info: {
        noContent: 'The document is empty',
        providedByCardType: (cardTypeName: string) => `Provided by "${cardTypeName}" theme`,
        ownedByThisCardType: 'Owned by this theme',
        providedByUpperCard: (name: string) => `Provided by the "${name}" upper card`,
        ownedByThisCard: 'Owned by this card',
        ownedByThisCardContent: 'Owned by this variant',
        providedByTheCurrentProject: 'Provided by the project documentation',
        providedByExternalCardType: (cardTypeName: string, projectName: string) =>
          `Provided by "${cardTypeName}" theme of the "${projectName}" project`,
        providedByGlobalCardType: (cardTypeName: string) =>
          `Provided by "${cardTypeName}" global theme`,
        forceTooltip:
          'This documentation is provided from another place, but you can edit it from here',
        source: {
          card: 'Card',
          theme: 'Theme',
          inherited: 'Inherited',
          project: 'Project',
        },
      },
      actions: {
        makeOwnCopy: 'Copy to card',
        shareWithChildren: 'Share within children',
        makePrivate: 'Attach to card',
      },
      scope: {
        disclaimer: '', // TODO
        confirm: 'move',
        reset: 'reset',
        cancel: 'cancel',
        showAllCards: 'show all cards',
        alsoUsedByExternalProject: 'Also used visible for others projects',
        projectDocDesc:
          'A document can be linked to the whole project. Thus, it will be visible for all cards',
        thematicDesc:
          'A document can be linked to a specific theme. Thus, it will only be visible to cards within that theme',
        mainViewTitle: 'Project Cards',
        mainViewDesc:
          'A document can be linked to a specific card. Thus, it will only be visible for this card, or for this card and its descendants if the document is published.',
      },
      sortByCategory: 'by category',
      sortByProvider: 'by source',
      noDocumentationYet: 'There is not documentation yet!',
    },
    cardType: {
      cardType: 'Theme',
      cardTypesLongWay: 'Thematic documentation',
      titlePlaceholder: 'New Theme',
      noCardType: 'No theme',
      purpose: 'Description',
      globalTypes: 'Global Themes',
      sharedAvailableTypes: 'Shared available themes',
      action: {
        createType: 'Create theme',
        createAType: 'Create a theme',
        deleteType: 'Delete theme',
        confirmDeleteType: 'Are you sure you want to delete this theme?',
        useInProject: 'Use in project',
        removeFromProject: 'Remove from project',
      },
      route: {
        backToCardType: 'Back to themes',
        manageTypes: 'Manage themes',
      },
      info: {
        infoPublished: (usageInAProject: boolean): string =>
          `${
            usageInAProject ? 'Can be used in other related projects' : 'Can be used in any project'
          }`,
        infoDeprecated: 'Should not be used anymore',
        explainPurpose: 'Explain the purpose',
        cannotRemoveCardType: 'Cannot remove theme',
        cannotRemoveFromProject: 'Impossible to remove this theme. It is used by some cards.',
        cannotDeleteType: 'Impossible to delete this theme. It is used in this project.',
        createFirstGlobalType: 'Create first global theme',
        createFirstProjectType: 'Create first theme',
        createEmptyType: 'You can create an empty theme with the button',
        orAddSharedType: 'or add a "shared available theme".',
        noExternalType: 'There is no available external theme',
        referencedByOther: 'It can be referenced by other projects (with regards to access rights)',
        shouldNotBeUsed: 'It should not be used anymore',
        isGlobalType: 'It comes from a global theme',
        fromProject: (projectName: string): string => `It comes from project "${projectName}"`,
        fromAProject: 'It comes from a project',
      },
    },
    presence: {
      date: (name: string, date: number) => `${name} is online (${en.common.ago(date)})`,
    },
  },
  //////////////////////////////////////////////////////////////////////////////////////////////////
  // Tips
  tips: {
    label: {
      tips: 'Display Tips',
      news: 'Display News',
      feature_preview: 'Display upcoming new features',
      wip: 'Display work in progress elements',
      todo: 'Display Todo',
      debug: 'Display debug info',
    },
    example: {
      tips: {
        title: 'Tips example',
        content: 'Some useful info to help users',
      },
      news: {
        title: 'News example',
        content: 'Some new feature to emphasis',
      },
      feature_preview: {
        title: 'Feature Preview',
        content: 'To preview upcoming new features',
      },
      wip: {
        title: 'WIP Example',
        content: 'Some features not completely finished yet',
      },
      todo: {
        title: 'Todo example',
        content: 'We know what to do, but we have not done it yet',
      },
      debug: {
        title: 'Debug Example',
        content: 'Some internal data useful to debug',
      },
    },
    info: { wip: 'Work in progress feature below' },
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  //Co.LAB info page

  colabPage: {
    whatColab: 'What is the co.LAB design platform ?',
    colabDescription:
      'The design platform is one of the deliverables of the co.LAB project. Our goal is to create an intuitive, friendly and meaningful web platform, that should facilitate the collaboration during serious games design. Two main ingredients are at the heart of the platform:',
    colabFramework: 'co.LAB framework',
    supportsCoDesign: 'that supports the co-design serious games.',
    friendlyInterfaces: 'Friendly and intuitive interfaces',
    forAll: ' for all user profiles.',
    slogan:
      'We want to create a platform for all of you, that let to imagine and design the serious game you need !',
    contactUs: 'Do not hesitate to contact us for any recommendation you may have.',
    whatColabProject: 'What is the co.LAB project ?',
    colabProjectDescription:
      'The goal of the co.LAB project is to improve the design, development and uses of digital learning games. This goal will be achieved by the development of a collaborative methodological framework associated with a collaborative digital platform dedicated to co-design, co-development and co-evaluation of digital learning games. The co.LAB project is founded by the Swiss National Science Foundation (SNF) in the frame of the NRP 77 program “Digital Transformation”.',
    furtherInfo: 'For further information and to contact us: ',
    colabProject: 'co.LAB project',
    version: 'Version',
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
      case 'USER_IS_ALREADY_A_TEAM_MEMBER':
        return 'The current user is already a team member';
      case 'CURRENT_USER_CAN_ALREADY_USE_MODEL':
        return 'The current user can already use the model';
      case 'DATA_NOT_FOUND':
        return 'Data not found';
      case 'DATA_INTEGRITY_FAILURE':
        return 'Data integrity failure';
    }
  },

  httpErrorMessage: {
    AUTHENTICATION_FAILED: 'Authentication failed',
    AUTHENTICATION_REQUIRED: 'Please authenticate',
    ACCESS_DENIED: 'Access denied',
    NOT_FOUND: 'Not found',
    SMTP_ERROR: 'E-mail server error',
    EMAIL_MESSAGE_ERROR: 'E-mail not sent',
    DUPLICATION_ERROR: 'Duplication error',
    BAD_REQUEST: 'Bad request',
    TOO_MANY_ATTEMPTS: 'Too many attempts, please wait a moment before trying again',
  },
};
