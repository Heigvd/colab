/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { CardContentStatus, MessageI18nKey } from 'colab-rest-client';
import { ColabTranslations } from './I18nContext';

export const fr: ColabTranslations = {
  //////////////////////////////////////////////////////////////////////////////////////////////////
  // COMMON
  common: {
    cancel: 'Annuler',
    create: 'Créer',
    save: 'Sauvegarder',
    duplicate: 'Dupliquer',
    confirm: 'Confirmer',
    close: 'Fermer',
    delete: 'Supprimer',
    remove: 'Retirer',
    finalDelete: 'Supprimer définitivement',
    ok: 'OK',
    open: 'Ouvrir',
    show: 'Afficher',
    hide: 'Masquer',
    add: 'Ajouter',
    edit: 'Éditer',
    select: 'Sélectionner',
    selectAll: 'Tout sélectionner',
    next: 'Suivant',
    back: 'Retour',
    updated: 'Mis à jour',
    upload: 'Télécharger',
    replace: 'Remplacer',
    refresh: 'Rafraîchir',
    change: 'Changer',
    display: 'Affichage',
    restore: 'Rétablir',
    send: 'Envoyer',
    empty: 'Vide',
    loading: 'Chargement...',
    copiedToClipboard: 'Copié dans le presse-papiers',
    copyToClipboard: 'Copier dans le presse-papiers',
    reconnecting: 'Reconnexion...',
    search: 'Rechercher...',
    logout: 'Déconnexion',
    langSettings: 'Langues',
    changeLanguage: 'Changer de langue',
    sortBy: 'Trier par: ',
    filter: 'Filtrer',
    createdBy: 'Créé par',
    createdOn: 'Créé sur',
    createdAt: 'Créé à',
    name: 'Nom',
    date: 'Date',
    by: 'Par',
    settings: 'Paramètres',
    general: 'Général',
    about: 'À propos de co.LAB',
    blank: 'Vide',
    description: 'Description',
    noDescription: 'Aucune description',
    deprecated: 'Déprécié',
    published: 'Publié',
    project: 'Projet',
    title: 'Titre',
    views: {
      board: 'Cartes',
      hierarchy: 'Hiérarchie',
      activityFlow: "Réseau d'activité",
    },
    welcome: 'Bienvenue!',
    //comments: 'comments',
    //commentsAreOptional: 'Comments are optional',
    dateFn: (timestamp: number | null | undefined) => {
      if (timestamp != null) {
        return new Date(timestamp).toLocaleDateString('FR');
      } else {
        return 'jamais';
      }
    },
    time: (timestamp: number | null | undefined) => {
      if (timestamp != null) {
        return new Date(timestamp).toLocaleTimeString('FR');
      } else {
        return 'jamais';
      }
    },
    datetime: (timestamp: number | null | undefined) => {
      if (timestamp != null) {
        return new Date(timestamp).toLocaleString('FR');
      } else {
        return 'jamais';
      }
    },
    ago: (timestamp: number | null | undefined) => {
      if (timestamp == null) {
        return 'jamais';
      }
      const now = new Date().getTime();
      const delta = now - timestamp;
      if (delta < 5000) {
        return 'maintenant';
      } else if (delta < 60000) {
        return `Il y a ${Math.floor(delta / 1000)} sec.`;
      } else if (delta < 3600000) {
        return `Il y a ${Math.floor(delta / 60000)} min.`;
      } else if (delta < 3600000 * 12) {
        return `Il y a ${Math.floor(delta / 3600000)} heures`;
      } else {
        return fr.common.datetime(timestamp);
      }
    },
    action: {
      backToHome: "Retour à l'accueil co.LAB",
      backToProjects: 'Retour aux projets',
      backProjectRoot: 'Retour à la racine du projet',
      backCardView: 'Retour à la vue carte',
      showProjectDetails: 'Afficher les détails du projet',
    },
    error: {
      accessDenied: "Malheureusement, vous n'êtres pas autorisé à voir cela",
      tryToLogOut: "Essayez de vous déconnecter d'abord.",
      missingContent:
        "Oh, il n'y a rien à afficher. Cher-e-s développeur-euses, réparez cela s'il vous plaît.",
      somethingWentWrong: "Quelque chose s'est mal passé",
      unknown: 'Inconnu',
      sorryError: 'Toutes nos excuses... il y a eu une erreur',
      notImplemented: 'Pas encore implémenté',
    },
    info: {
      pleaseWait: "Attendez s'il vous plaît...",
      processing: 'En traitement...',
      youAreConnectedAsUser: (user: string): string =>
        `Vous êtes actuellement connecté en tant que "${user}"`,
      nameIsRequired: 'Le nom est requis',
      accessKeyIsRequired: "La clé d'accès est requise",
      nothingMatchTag: 'Rien ne correspond à votre sélection',
      writeDescription: 'Écrivez une description',
    },
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // Basic components
  basicComponent: {
    form: {
      missingMandatory: "Remplissez les données s'il vous plaît",
      defaultFieldError: "Corrigez les données s'il vous plaît",
      pleaseProvideData: 'Des données sont manquantes',
    },
    selectInput: {
      noMatch: 'Aucune correspondance',
      noItemTypeToCreate: 'Écrivez pour créer le premier élément',
      select: 'Sélectionner',
      selectOrCreate: 'Sélectionnez ou écrivez pour créer un nouvel élément',
      create: (newValue: string): string => `Créer "${newValue}"`,
    },
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // USER
  user: {
    model: {
      username: "Nom d'utilisateur",
      commonName: 'Surnom',
      firstname: 'Prénom',
      lastname: 'Nom',
      affiliation: 'Affiliation',
    },
    user: 'Utilisateur',
    account: 'Compte',
    missingFirstname: 'Veuillez entrer votre prénom',
    missingLastname: 'Veuillez entrer votre nom',
    userProfile: 'Profil utilisateur',
    editProfile: 'Éditer le profil',
    viewProfile: 'Voir le profil',
    updatePassword: 'Mettre à jour le mot de passe',
    passwordEditionImpossible: 'Vous ne pouvez pas mettre à jour le mot de passe',
    noUserSelected: 'Aucun utilisateur sélectionné',
    editUser: "Éditer l'utilisateur",
    activeSessions: 'Sessions actives',
    current: 'Actuel',
  },
  team: {
    team: 'Équipe',
    roles: 'Rôles',
    rights: 'Droits',
    members: 'Membres',
    generalInvolvement: 'Implication générale',
    resetInvolvement: 'Réinitialiser implication',
    involvementHelper:
      "Ajoutez ou sélectionnez un niveau d'implication pour tous les membres et les rôles. Vous pouvez l'affiner ci-dessous en choisissant individuellement un niveau différent. Lorsqu'il n'est pas défini, le niveau d'implication est calculé en fonction de la carte du ou des parents, puis de vos droits dans le projet.",
    inviteMembers: 'Inviter des membres',
    inviteNewMember: 'Inviter un nouveau membre',
    deleteMember: "Supprimer un membre de l'équipe",
    removeGuest: 'Retirer un invité',
    removeRole: 'Retirer un rôle',
    giveRole: 'Donner un rôle',
    fillRoleName: 'Entrez le nom du rôle',
    me: 'moi',
    rolesNames: {
      owner: 'Propriétaire',
      projectLeader: 'Responsable de projet',
      member: 'Membre',
      guest: 'Invité',
    },
    sureChangeOwnRights: 'Êtes-vous sûr-e-s de vouloir changer vos propres droits?',
    sureDeleteMember: "Êtes-vous sûr-e-s de vouloir supprimer ce membre de l'équipe?",
    changeOwnRights: 'Changer mes propres droits',
    oneOwnerPerProject:
      'Vous ne pouvez pas modifier ces droits. Il doit y avoir au moins un propriétaire du projet.',
    memberAlreadyExist: 'Un membre avec la même adresse e-mail est déjà dans le projet.',
  },
  //////////////////////////////////////////////////////////////////////////////////////////////////
  // ACTIVITY
  activity: {
    pendingChanges: "Des changements n'ont pas été sauvés",
    nothingToDisplay: 'Rien à afficher',
    anonymous: 'Anonyme',
    lastSeenAt: 'Dernière vue: ',
    lastActivityDate: "Date d'activité: ",
    inconsistentState: 'État inconsistent',
    notifications: {
      error: 'Oups! Une erreur',
      warning: 'Attention!',
      information: 'Information',
    },
  },
  //////////////////////////////////////////////////////////////////////////////////////////////////
  // ADMIN
  admin: {
    admin: 'Administrateur',
    adminPanel: 'Administrateur',
    adminConsole: 'Bienvenue dans la console administrateur',
    who: 'Qui',
    connectedUsers: 'Utilisateurs connectés',
    users: 'Utilisateurs',
    loggers: 'Logueur',
    stats: 'Statistiques',
    debugger: 'Débogueur',
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // Authentication
  authentication: {
    field: {
      emailOrUsername: "Nom d'utilisateur ou e-mail",
      emailAddress: 'Adresse e-mail',
      username: "Nom d'utilisateur",
      password: 'Mot de passe',
      passwordConfirmation: 'Répétez le mot de passe',
    },
    placeholder: {
      min7Char: 'Min. 7 caractères',
    },
    action: {
      login: 'Connexion',
      resetPassword: 'Mot de passe oublié?',
      changePassword: 'Changer le mot de passe',
      createAnAccount: 'Créer un compte',
      sendMePassword: 'Envoyer un nouveau mot de passe',
      newPassword: 'Nouveau mot de passe',
    },
    info: {
      resetPasswordSent:
        'Nous vous avons envoyé un lien pour changer votre mot de passe. Changez-le, sécurisez-le et profitez de la plateforme co.LAB!',
      pendingInvitation: 'Invitation en attente',
      reconnecting: 'Reconnexion...',
      checkYourMailbox: 'Vérifiez votre boîte mail.',
      invitationCoLab:
        'Bonjour ! Vous avez été invité-e à collaborer à un projet co.LAB. Connectez-vous ou créez un compte. Bon co.LAB!',
    },
    error: {
      emailAddressNotValid: "L'adresse e-mail n'est pas valide",
      emailOrUserNotValid:
        "Le nom d'utilisateur/e-mail ou le mot de passe n'est pas valide. Veuillez réessayer.",
      usernameNotValid:
        "Le nom d'utilisateur ne peut contenir que des lettres sans accent, des chiffres, des points, des caractères de soulignement et des tirets.",
      passwordTooWeak: "Le mot de passe n'est pas assez fort.",
      passwordsMismatch: 'Les mots de passe ne correspondent pas.',
      yourPasswordIsWeak: 'Votre mot de passe est faible',
      mustBeAuthenticated: 'Vous devez être authentifié',
      invalidLink: 'Lien invalide ou déprécié',
      pleaseRefresh:
        "Veuillez essayer de rafraîchir ou contacter l'administrateur de votre projet co.LAB.",
    },
    aai: {
      aaiAccount: 'Compte AAI',
      aaiAffiliation: 'Affiliation',
      aaiNotEditable: 'Données personnelles non éditables',
    },
  },
  //////////////////////////////////////////////////////////////////////////////////////////////////
  // MODULES
  modules: {
    project: {
      labels: {
        projectDisplaySettings: "Paramètres d'affichage du projet",
        projectSettings: 'Paramètres du projet',
        projects: 'Projets',
      },
      actions: {
        createProject: 'Créer projet',
        createAProject: 'Créer un projet',
        deleteProject: 'Supprimer project',
        chooseAModel: 'Choisissez un modèle',
        createAProjectFrom: (templateTitle?: string | null): string =>
          `Créer un projet à partir de ${'"' + templateTitle + '"'}`,
        editIllustration: "Éditer l'illustration du projet",
        newProject: 'Nouveau projet',
      },
      info: {
        noProjectSelected: 'Aucun projet sélectionné',
        noProjectYet: "Vous n'avez aucun projet pour le moment",
        noProject: "Le projet n'a pas pu être chargé",
        emptyProject: 'Projet vide',
        useBlankProject: 'Utilisez ce projet vide et vous serez libre de créer un monde nouveau.',
        deleteConfirmation:
          "Êtes-vous sûr-e-s de vouloir supprimer tout le projet? Cela va également supprimer toutes les cartes à l'intérieur.",
      },
      settings: {
        icon: 'Icône',
        involvements: {
          label: 'Implications',
        },
        resources: {
          label: 'Documentation du projet',
        },
        missingIcon:
          "Oh une nouvelle bibliothèque d'icônes, cher développeur s'il vous plaît faites ce qui est nécessaire pour afficher l'icône.",
      },
    },
    team: {
      actions: {
        createRole: 'Créer un rôle',
      },
    },
    card: {
      card: 'Carte',
      variant: 'Variante',
      subcardTooltip: (name: string) => `Sous-carte: ${name}`,
      subcards: 'Sous-cartes',
      untitled: 'Nouvelle carte',
      createCard: 'Créer carte',
      createACard: 'Créer une carte',
      createVariant: 'Créer une variante',
      createNew: (parentTitle?: string | null): string =>
        `Créer une ${parentTitle ? 'sous-carte pour ' + parentTitle : 'carte'}`,
      deleteCardVariant: (hasVariant?: boolean): string =>
        `Supprimer la ${hasVariant ? 'variante' : 'carte'}`,
      confirmDeleteCardVariant: (hasVariant?: boolean): string =>
        `Êtes-vous sûr-e-s de vouloir supprimer cette ${
          hasVariant ? 'variante' : 'carte'
        }? Cela va également supprimer toutes les sous-cartes à l'intérieur.`,
      involvements: 'Implications',
      completion: 'Avancement',
      position: 'Position',
      showCardType: 'Afficher les informations du modèle',
      editCompletion: "Éditer l'avancement",
      action: {
        chooseACardType: 'Choisissez un modèle',
      },
      editor: {
        toolbox: 'Boîte à outils',
        toggleToolbox: 'Basculer la boîte à outils',
        showToolbox: 'Afficher la boîte à outils',
        hideToolbox: 'Masquer la boîte à outils',
        fullScreen: 'Mode plein écran',
      },
      settings: {
        title: 'Paramètres de la carte',
        acl: {
          title: "Contrôle d'accès",
        },
        locked: 'Verrouillé',
        color: 'Couleur',
        status: 'Statut',
        statusTooltip: (status: CardContentStatus) =>
          `Statut: ${fr.modules.card.settings.statuses[status].toLocaleLowerCase('fr')}`,
        statuses: {
          ACTIVE: 'Actif',
          POSTPONED: 'Reporté',
          ARCHIVED: 'Archivé',
          REJECTED: 'Rejeté',
        },
        completionLevelMode: "Mode de niveau d'avancement",
        cardPosition: 'Position de la carte',
      },
      infos: {
        createFirstCard: 'Créer la première carte',
        noCardYetPleaseCreate:
          "Ce projet n'a pas encore de carte. Créez-en pour commencer votre voyage de co-design !",
        cardLocked:
          'Carte verrouillée. Pour la déverrouiller, allez dans les paramètres de la carte et décochez "Verrouillé"',
        lockingCard: 'Le verrouillage passe en lecture seule.',
        noDeliverable: 'Aucun livrable disponible',
        completionModeInfo:
          "Sélectionnez le mode d'avancement (manuel | auto | no-op). Manuel: entrez une valeur pour changer l'avancement; Auto: basé sur les enfants; Aucune: n'affiche pas de barre d'avancement",
        noBlockYet: 'Il n\'y a aucun bloc pour l\'instant. Ajoutez-en un:',
      },
      error: {
        withoutId: 'Une carte sans id est invalide...',
      },
    },
    content: {
      none: 'Aucune version',
      untitled: 'Nouvelle version',
      mimeType: 'Type de MIME',
      unknownMimeType: 'MIME type inconnu',
      document: 'Document',
      unknownDocument: 'Document inconnu',
      documentSettings: 'Paramètres du document',
      removedDocuments: 'Documents retirés',
      mdMode: 'Mode markdown',
      showTree: "Afficher l'arbre",
      tree: 'Arbre',
      orphans: 'Orphelins',
      result: 'Résultat',
      uploadFile: 'Télécharger le fichier',
      replaceFile: 'Remplacer le fichier',
      dlFile: 'Télécharger un fichier',
      editBlock: 'Éditer le bloc',
      deleteBlock: 'Supprimer le bloc',
      addText: 'Ajouter un bloc de texte',
      addFile: 'Ajouter un fichier',
      addLink: 'Ajouter un lien',
      emptyLink: 'Lien vide',
      moveBlockUpDown: (direction: string): string =>
        `Déplacer le bloc vers le ${direction === 'up' ? 'haut' : 'bas'}`,
      deleteBlockType: (isText: boolean, isLink: boolean): string =>
        `Supprimer ${isText ? 'le texte' : isLink ? 'le lien' : 'le document'}`,
      confirmDeleteBlock:
        'Êtes-vous sûr-e-s de vouloir supprimer ce bloc ? Il sera perdu définitivement',
      noFileUploaded: 'Aucun fichier téléchargé',
      before: 'Avant',
      onTop: 'Au début',
      after: 'Après',
      end: 'À la fin',
      liveEditor: {
        browserNotDisplay:
          "Votre navigateur ne prend pas en charge l'affichage de ce texte et de sa mise en forme. Nos techniciens sont sur le coup.",
        updatesWillBeLost:
          "Certaines mises à jour n'ont pas pu être prises en compte et seront perdues.",
        clickRollback: 'Cliquez sur le bouton "rétablir" pour restaurer la version précédente.',
        disconnected: 'Déconnexion...',
        restorePrevVersion: 'Rétablir la version précédente',
      },
    },
    document: {
      createDocument: 'Créer un document',
      createADocument: 'Créer un document',
      openInNewTab: 'Ouvrir dans un nouvel onglet',
      unknownDocument: 'Document inconnu',
    },
    resource: {
      untitled: 'Nouveau document',
      teaser: 'Résumé',
      hideTeaser: 'Masquer le résumé',
      showTeaser: 'Afficher le résumé',
      noTeaser: "Il n'y a aucun résumé",
      noTeaserForNow:
        "Il n'y a aucun résumé pour le moment. Vous pouvez en ajouter si vous le souhaitez",
      category: 'Catégorie',
      documentation: 'Documentation',
      docDescription: 'Documentation liée à la carte',
      docDescriptionWithType:
        'Documentation liée à la carte. Le modèle peut fournir de la documentation de base.',
      categorytip: 'Groupe de documents',
      noResource: 'Contient aucune documentation',
      oneResource: 'Contient 1 document',
      xResources: (nbR: number): string => `Contient ${nbR} documents`,
      onlyForVariant: 'Disponible uniquement pour cette variante',
      backList: 'Retour à la liste',
      unpublishMakePrivate: 'Dépublier la ressource pour la rendre privée pour cette carte.',
      publishMakeAvailableSubs:
        'Publier la documentation pour la rendre disponible pour les sous-cartes',
      publishedInfo: 'Une documentation publiée est disponible pour les sous-cartes',
      unpublishedInfo: 'Une documentation non publiée est privée pour cette carte',
      info: {
        providedByCardType: 'Fourni par le modèle',
        providedByUpperCard: 'Fourni par une carte parente',
      },
    },
    cardType: {
      cardType: 'Modèle',
      cardTypesLongWay: 'Modèle de carte',
      titlePlaceholder: 'Nouveau modèle',
      purpose: 'Objectif',
      globalTypes: 'Modèles globaux',
      sharedAvailableTypes: 'Modèles disponibles partagés',
      action: {
        createType: 'Créer un modèle',
        createAType: 'Créer un modèle',
        deleteType: 'Supprimer le modèle',
        confirmDeleteType: 'Êtes-vous sûr-e-s de vouloir supprimer ce modèle',
        useInProject: 'Utiliser dans le projet',
        removeFromProject: 'Retirer du projet',
      },
      route: {
        backToCardType: 'Retour aux modèles',
        manageTypes: 'Gérer les modèles',
      },
      info: {
        infoPublished: (usageInAProject: boolean): string =>
          `${
            usageInAProject
              ? "Peut être utilisé dans d'autres projets liés"
              : "Peut être utilisé dans n'importe quel projet"
          }`,
        infoDeprecated: 'Ne devrait plus être utilisé',
        explainPurpose: "Expliquez l'objectif",
        cannotRemoveCardType: 'Impossible de retirer le modèle',
        cannotRemoveFromProject:
          'Impossible de retirer le modèle. Il est utilisé par une/des cartes.',
        cannotDeleteType: 'Impossible de supprimer le modèle. Il est utilisé dans le projet.',
        createFirstGlobalType: 'Créer le premier modèle global',
        createFirstProjectType: 'Créer le premier modèle',
        createEmptyType: 'Vous pouvez créer un modèle vide grâce à ce bouton',
        orAddSharedType: 'ou ajouter un "modèle disponible partagé".',
        noExternalType: "Il n'y a aucun modèle externe disponible",
        referencedByOther:
          "Peut être référencé par d'autres projets (en ce qui concerne les droits d'accès).",
        shouldNotBeUsed: 'Ne devrait plus être utilisé',
        isGlobalType: "Provient d'un modèle global",
        fromProject: (projectName: string): string => `Provient du projet "${projectName}"`,
        fromAProject: "Provient d'un projet",
      },
    },
    presence: {
      date: (name: string, date: number) => `${name} est en ligne (${fr.common.ago(date)})`,
    },
    stickyNotes: {
      stickyNotes: 'Post it',
      listStickyNotes: 'Liste de post it sur la carte',
      snDescription:
        "Les post its proviennent d'une source (carte, version spécifique de la carte, documentation, bloc)",
    },
  },
  //////////////////////////////////////////////////////////////////////////////////////////////////
  // Tips
  tips: {
    label: {
      todo: 'Afficher les éléments à faire',
      tips: 'Afficher les conseils',
      news: 'Afficher les actualités',
      wip: 'Afficher les éléments de travail en cours',
      debug: "Afficher l'information de déboguage",
    },
    example: {
      todo: {
        title: "Exemple d'élément à faire",
        content: "Nous savons ce qu'il faut faire, mais nous ne l'avons pas encore fait.",
      },
      tips: {
        title: 'Exemple de conseil',
        content: 'Quelques informations utiles pour aider les utilisateurs',
      },
      news: {
        title: "Exemple d'actualité",
        content: 'Quelques nouvelles fonctionnalités à souligner',
      },
      wip: {
        title: 'Exemple de travail en cours',
        content: 'Certaines fonctionnalités ne sont pas encore complètement terminées',
      },
      debug: {
        title: 'Exemple de débogue',
        content: 'Quelques données internes utiles pour le débogage',
      },
    },
    info: { wip: 'Fonctionnalités en cours de développement ci-dessous' },
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  //Co.LAB info page

  colabPage: {
    whatColab: "Qu'est-ce que la plateforme de conception co.LAB ?",
    colabDescription:
      "La plateforme de conception est l'un des livrables du projet co.LAB. Notre objectif est de créer une plateforme web intuitive, conviviale et significative, qui devrait faciliter la collaboration lors de la conception de jeux sérieux (serious games). Deux ingrédients principaux sont au cœur de la plateforme :",
    colabFramework: 'Le modèle co.LAB',
    supportsCoDesign: 'qui soutient la co-conception de jeux sérieux.',
    friendlyInterfaces: 'Des interfaces intuitives et amicales',
    forAll: ' pour tous types de profils utilisateurs.',
    slogan:
      "Nous voulons créer une plateforme pour toutes et tous, qui vous permette d'imaginer et de concevoir le jeu sérieux (serious game) dont vous avez besoin !",
    contactUs: "N'hésitez pas à nous contacter pour toute recommandation que vous pourriez avoir.",
    whatColabProject: "Qu'est-ce que le projet co.LAB?",
    colabProjectDescription:
      "L'objectif du projet co.LAB est d'améliorer la conception, le développement et les usages des jeux d'apprentissage numériques. Ce but sera atteint par le développement d'un cadre méthodologique collaboratif associé à une plateforme numérique collaborative dédiée à la co-conception, au co-développement et à la co-évaluation de jeux sérieux. Le projet co.LAB est financé par le Fonds national suisse pour la recherche scientifique (FNS) dans le cadre du programme PNR 77 \"Transformation numérique\".",
    futherInfo: 'Pour de plus amples informations et/ou nous contacter: ',
    colabProject: 'site du projet co.LAB',
    version: 'Version',
  },
  //////////////////////////////////////////////////////////////////////////////////////////////////
  // Terms of use + data management policy
  dataPolicy: {
    agreementDisclaimer: "L'utilisation de ce service implique que vous acceptiez de",
    iAccept: "J'accepte",
    agree: 'Accepter',
    termOfUse: "Les conditions générales d'utilisation",
    and: 'et',
    dataPolicy: 'Politique de gestion des données',
    termOfUseUrl: 'about:error',
    dataPolicyUrl: 'about:error',
    notAgreed: "Vous devez accepter nos conditions d'utilisation",
    agreedTime: "Accepter les conditions d'utilisation",
    never: 'jamais',
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // keys direct from server side

  keyFromServer: (i18nKey: MessageI18nKey): string => {
    // NB : If this method does not compile any more,
    // it means that the MessageI18nKey do not exactly match the case entries
    // Dear developer, please make them match
    switch (i18nKey) {
      case 'EMAIL_NOT_VALID':
        return 'Adresse e-mail invalide';
      case 'IDENTIFIER_ALREADY_TAKEN':
        return 'Veuillez choisir un autre identifiant';
      case 'INVITATION_CONSUMING_BY_TEAMMEMBER':
        return "L'utilisateur actuel est déjà un membre de l'équipe";
    }
  },

  httpErrorMessage: {
    AUTHENTICATION_FAILED: "L'authentification a échoué",
    AUTHENTICATION_REQUIRED: 'Veuillez vous authentifier',
    ACCESS_DENIED: 'Accès refusé',
    NOT_FOUND: 'Introuvable',
    SMTP_ERROR: 'Erreur du serveur mail',
    EMAIL_MESSAGE_ERROR: 'E-mail non envoyé',
    BAD_REQUEST: 'Mauvaise requête',
    TOO_MANY_ATTEMPTS: 'Trop de tentatives, veuillez attendre un moment avant de réessayer.',
  },
};
