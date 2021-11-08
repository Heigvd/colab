/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

export const en = {
  pleaseProvideData: 'Some data are missing',
  cancel: 'cancel',
  agree: 'agree',
  confirm: 'confirm',
  emailAddress: 'e-mail address',
  emailAddressNotValid: 'e-mail address is not valid',
  emailShort: 'E-Mail',
  pleaseEnterId: 'Please enter an identifier',
  username: 'username',
  emailOrUsername: 'e-mail or username',
  password: 'password',
  weakPassword: 'password is too weak',
  password_again: 'password again',
  passwordsMismatch: 'passwords do not match',
  login: 'login',
  forgottenPassword: 'FORGOTTEN PASSWORD?',
  createAnAccount: 'create an account',
  sendMePassword: 'send me a new password',
  unverifiedEmail: 'unverified e-mail',
  verifyEmail: 'click to verify your e-mail address',
  firstname: 'firstname',
  missingFirstname: 'please enter your firstname',
  lastname: 'lastname',
  missingLastname: 'please enter your lastname',
  agreementDisclaimer: 'The use of this service implies that you agree to',
  iAccept: 'I accept',
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
  submit: 'submit',
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

  errors: {
    AUTHENTICATION_FAILED: 'Authentication failed',
    AUTHENTICATION_REQUIRED: 'Please authenticate',
    ACCESS_DENIED: 'Access denied',
    NOT_FOUND: 'Not fouund',
    USERNAME_ALREADY_TAKEN: 'Please choose another username',
    SMTP_ERROR: 'e-mail server error',
    EMAIL_MESSAGE_ERROR: 'e-mail not sent',
    BAD_REQUEST: 'Bad request',
  },
  card: {
    untitled: 'unnamed card',
    settings: {
      title: 'Settings',
      acl: {
        title: 'Access Control',
      },
    },
  },
  content: {
    none: 'no version',
    untitled: 'unnamed version',
  },
  resource: {
    untitled: 'unnamed document',
    noTeaser: 'no document teaser',
  },
};
