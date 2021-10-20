/**
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013-2021 School of Management and Engineering Vaud, Comem, MEI
 * Licensed under the MIT License
 */

// import { ColabTranslations } from './I18nContext';

export const fr /*: ColabTranslations */ = {
  pleaseProvideData: 'Merci de remplir tous les champs',
  cancel: 'annuler',
  agree: 'Accepter',
  confirm: 'confirmer',
  emailAddress: 'adresse e-mail',
  emailAddressNotValid: 'adresse e-mail invalide',
  emailShort: 'E-Mail',
  pleaseEnterId: 'Veuillez entrer un identifiant',
  username: "nom d'utilisateur",
  emailOrUsername: "e-mail ou nom d'utilisateur",
  password: 'mot de passe',
  weakPassword: 'mot de passe trop faible',
  password_again: 'confirmation du mot de passe',
  passwordsMismatch: 'les mots de passe ne correspondent pas',
  login: 'connexion',
  forgottenPassword: 'mot de pass oublié ?',
  createAnAccount: 'créer un compte',
  sendMePassword: 'Envoyez-moi un nouveau mot de passe',
  unverifiedEmail: 'e-mail non vérifié',
  verifyEmail: 'Cliquez ici pour vérifier votre mot de passe',
  firstname: 'prénom',
  missingFirstname: 'Veuillez entrer votre prénom',
  lastname: 'nom de famille',
  missingLastname: 'Veuillez entrer votre nom de famille',
  agreementDisclaimer: "L'utilisation de ce service implique que vous en acceptez",
  iAccept: "J'accepte",
  termOfUse: 'les conditions générales',
  and: 'et',
  dataPolicy: 'la politique de gestion des données',
  termOfUseUrl: 'https://www.albasim.ch/en/terms-of-use/',
  dataPolicyUrl: 'https://www.albasim.ch/en/data-policy/',
  notAgreed: 'vous devez accepter les conditions générales et la politique de gestion des données',
  agreedTime: "A accepter les conditions d'utilisations le ",
  never: 'jamais',

  // settings
  editProfile: 'Édition du profile',
  viewProfile: 'Voir le profile',
  updatePassword: 'Mise à jour du mot de passe',

  passwordEditionImpossible: 'Vous ne pouvez pas mettre à jour votre mot de passe',

  // common
  copiedToClipboard: 'copié dans le presse papier',
  copyToClipboard: 'copier dans le presse papier',
  reconnecting: 'reconnexion en cours..',
  search: 'recherche...',
  logout: 'déconnexion',
  changeLanguage: 'changer de langue',
  //
  sortBy: 'trier par: ',
  createdBy: 'crée par',
  name: 'nom',
  date: 'date',
  //
  createdOn: 'Créé le ',
  by: 'par',
  //

  settings: 'paramètres',
  basicSettings: 'Paramètres',
  nameIsRequired: 'le nom est requis',
  accessKeyIsRequiered: "clé d'accès requise",
  advancedSettings: 'Paramètres avancés',
  langSettings: 'Langues',
  submit: 'sauver',
  comments: 'commentaires',
  commentsAreOptional: 'les commentaires sont facultatifs',

  pendingChanges: "Des changements n'ont pas été sauvés...",
  save: 'sauver',
  nothingToDisplay: "il n'y a rien à afficher...",

  //
  anonymous: 'anonyme',
  //ADMIN
  adminConsole: "Bienvenue dans la console d'administration",

  lastSeenAtKey: 'Vu pour la dernière fois',
  lastSeenAt: 'Vu pour la dernière fois :',
  lastActivityDate: "Date d'activité :",

  adminPanel: 'Admin',
  who: 'Qui',
  connectedUsers: 'Utilisateurs connectés',
  users: 'Utilisateurs',
  loggers: 'Loggers',
  stats: 'Stats',

  editUser: "éditer l'utilisateur",

  pleaseWait: 'Veuillet patienter...',
  tokenNotFound: 'Jeton introuvable',
  youAreConnectedAsUser: (user: string) => `Vous êtes actuellement connecter en tant que "${user}"`,
  butCraftedFor: (user: string) => `alors que votre lien a été préparer pour "${user}"`,
  logoutForPrivacy: 'Pour garantir votre anonymat, vous devez vous déconnecter',
  logoutToContinue: 'Pour pouvoir continuer, vous devez vous déconnecter',
  invalidToken: 'Jeton invalide',
  processing: 'en cours...',
  aaiAccount: 'Compte AAI',
  aaiAffiliation: 'Etablissement',
  aaiNotEditable: 'Les données personnelles ne sont pas éditables',

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
};
