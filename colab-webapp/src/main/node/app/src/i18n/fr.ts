/*
 * The coLAB project
 * Copyright (C) 2021-2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { MessageI18nKey } from 'colab-rest-client';
import { ColabTranslations } from './I18nContext';

export const fr: ColabTranslations = {
  //////////////////////////////////////////////////////////////////////////////////////////////////
  // COMMON
  common: {
    advanced: 'Avancé',
    cancel: 'Annuler',
    create: 'Créer',
    save: 'Sauvegarder',
    duplicate: 'Dupliquer',
    confirm: 'Confirmer',
    close: 'Fermer',
    delete: 'Supprimer',
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
    search: 'Rechercher...',
    logout: 'Déconnexion',
    langSettings: 'Langues',
    changeLanguage: 'Changer de langue',
    sortBy: 'Trier par: ',
    filter: 'Filtrer',
    name: 'Nom',
    date: 'Date',
    by: 'Par',
    and: 'et',
    icon: 'Icône',
    settings: 'Paramètres',
    general: 'Général',
    about: 'À propos de co.LAB',
    blank: 'Vide',
    none: 'Aucun',
    current: 'Actuel',
    description: 'Description',
    noDescription: 'Aucune description',
    deprecated: 'Déprécié',
    published: 'Publié',
    project: 'Projet',
    projectsList: 'Liste des projets',
    title: 'Titre',
    views: {
      board: 'Vue générale',
      hierarchy: 'Vue hiérarchique',
      activityFlow: "Vue en réseau d'activités",
      list: 'Vue en liste',
    },
    welcome: 'Bienvenue!',
    zoom: 'zoom',
    //comments: 'comments',
    //commentsAreOptional: 'Comments are optional',
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
    dateFn: (timestamp: number | null | undefined) => {
      if (timestamp != null) {
        return new Date(timestamp).toLocaleDateString('fr-CH');
      } else {
        return 'jamais';
      }
    },
    time: (timestamp: number | null | undefined) => {
      if (timestamp != null) {
        return new Date(timestamp).toLocaleTimeString('fr-CH');
      } else {
        return 'jamais';
      }
    },
    datetime: (timestamp: number | null | undefined) => {
      if (timestamp != null) {
        return new Date(timestamp).toLocaleString('fr-CH');
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
      showDetails: 'Afficher les détails',
      hideDetails: 'Cacher les détails',
      showMore: 'En afficher plus',
      showLess: 'En afficher moins',
      moveAbove: 'Déplacer au-dessus',
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
      missingIcon:
        "Oh une nouvelle bibliothèque d'icônes, cher développeur s'il vous plaît faites ce qui est nécessaire pour afficher l'icône.",
      fileSizeLimit: 'La taille du fichier ne peut pas dépasser',
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
    bin: {
      pageTitle: 'Corbeille',
      action: {
        moveToBin: 'Placer dans la corbeille',
        seeBin: 'Ouvrir la corbeille',
        restore: 'Restaurer',
        deleteForever: 'Supprimer définitivement',
        view: 'Voir',
      },
      info: {
        isEmpty: 'La corbeille est vide.',
        isInBin: {
          project: 'Le projet se trouve dans la corbeille.',
          card: 'La carte se trouve dans la corbeille.',
          variant: 'La variante se trouve dans la corbeille.',
          resource: 'La ressource se trouve dans la corbeille.',
        },
        movedToBin: {
          project: (title: string) => `Le projet "${title}" a été placé dans la corbeille`,
          card: (title: string) => `La carte "${title}" a été placée dans la corbeille`,
          variant: (title: string | null | undefined) =>
            title != null
              ? `La variante "${title}" a été placée dans la corbeille`
              : 'La variante a été placée dans la poubelle',
          resource: (title: string) => `La ressource "${title}" a été placée dans la corbeille`,
        },
      },
      name: 'Nom',
      names: {
        card: 'Nom de la carte',
        cardContent: 'Nom de la variante',
      },
      dateBinned: 'Date de suppression',
      originalParent: "Parent d'origine",
      deleted: {
        project: 'Projet supprimé',
        card: 'Carte supprimée',
        resource: 'Ressource supprimée',
        resources: 'Ressources supprimées',
      },
    },
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // USER
  user: {
    label: {
      user: 'Utilisateur',
      profile: 'Profil',
      userProfile: 'Profil utilisateur',
      username: "Nom d'utilisateur",
      firstname: 'Prénom',
      lastname: 'Nom',
      affiliation: 'Affiliation',
      activeSessions: 'Sessions actives',
      settings: "Paramètres de l'utilisateur",
      anonymous: 'Anonyme',
      admin: 'Admin',
    },
    action: {
      editUser: "Éditer l'utilisateur",
    },
  },
  team: {
    team: 'Équipe',
    roles: 'Rôles',
    members: 'Membres',
    teamManagement: "Gestion de l'équipe",
    inviteMembers: 'Inviter des membres',
    inviteNewMember: 'Inviter un membre',
    deleteMember: "Supprimer un membre de l'équipe",
    removeGuest: 'Retirer un invité',
    clickToRemoveRole: 'Cliquer pour retirer le rôle',
    clickToGiveRole: 'Cliquer pour donner le rôle',
    fillRoleName: 'Entrez le nom du rôle',
    deleteRole: 'Supprimer le rôle',
    deleteModelSharing: 'Révoquer le partage du modèle',
    me: 'moi',
    myTasks: 'Mes tâches',
    tasks: 'Tâches',
    assignment: {
      labels: {
        assignments: 'Assignations',
        responsible: 'Réalise',
        accountable: 'Approuve',
        support: 'Soutient',
      },
      actions: {
        clickToRemoveAssignment: "Cliquer pour retirer l'assignation",
        clickToGiveAssignment: 'Cliquer pour assigner',
      },
    },
    rolesHelper:
      "Créez et assignez un ou plusieurs rôles aux membres de l'équipe.Ex. Designer, professeur, développeur-euse. Cela peut être utile pour informer l'ensemble de l'équipe des compétences engagées dans le projet.",
    rightsHelper: {
      guest: 'Lecture seule',
    },
    sureChangeOwnRights: 'Êtes-vous sûr-e-s de vouloir changer vos propres droits?',
    sureDeleteMember: "Êtes-vous sûr-e-s de vouloir supprimer ce membre de l'équipe?",
    sureDeleteRole: 'Êtes-vous sûr-e-s de vouloir supprimer ce rôle ?',
    sureDeleteModelSharing: 'Êtes-vous sûr-e-s de vouloir révoquer le partage du modèle ?',
    changeOwnRights: 'Changer mes propres droits',
    oneOwnerPerProject:
      'Vous ne pouvez pas modifier ces droits. Il doit y avoir au moins un propriétaire du projet.',
    notAllowedToChangeOwnerRights:
      "Vous n'êtes pas autorisé à changer les propriétaires du projet.",
    mailInstructions:
      'Entrez une ou plusieurs adresses e-mail. Séparez-les par des virgules, points-virgules ou sauts de lignes.',
    mailInvalid: 'Vérifiez et corrigez les adresses e-mail suivantes',
    actions: {
      createRole: 'Créer un rôle',
      resendInvitation: "Renvoyer le mail d'invitation",
      invitationResent: "L'invitation a bien été renvoyée",
    },
    rights: 'Droits',
    right: {
      label: {
        owner: 'Propriétaire',
        member: 'Membre',
        guest: 'Invité',
      },
    },
  },
  //////////////////////////////////////////////////////////////////////////////////////////////////
  // ACTIVITY
  activity: {
    pendingChanges: "Des changements n'ont pas été sauvés",
    nothingToDisplay: 'Rien à afficher',
    anonymous: 'Anonyme',
    lastActivityDate: "Date d'activité: ",
    inconsistentState: 'État inconsistent',
    label: {
      lastSeen: 'Dernière vue',
    },
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
    label: {
      adminRights: 'Droits administrateur',
    },
    action: {
      grant: 'Accorder',
      revoke: 'Révoquer',
      grantAdminRightTo: 'Donner les droit admin à',
      revokeAdminRightTo: 'Révoquer les droit admin de',
    },
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // Authentication
  authentication: {
    label: {
      emailOrUsername: "Nom d'utilisateur ou e-mail",
      emailAddress: 'Adresse e-mail',
      username: "Nom d'utilisateur",
      firstname: 'Prénom',
      lastname: 'Nom de famille',
      affiliation: 'Affiliation',
      password: 'Mot de passe',
      passwordConfirmation: 'Répétez le mot de passe',
      newPassword: 'Nouveau mot de passe',
      iAccept: "J'accepte",
      agreed: 'Approuvé',
      termOfUse: 'les conditions générales',
      dataPolicy: 'la politique de gestion des données',
      account: 'Compte',
    },
    action: {
      login: 'Connexion',
      createAnAccount: 'Créer un compte',
      resetPassword: 'Mot de passe oublié ?',
      sendMeLinkToChangePassword: 'Envoyez-moi un lien de récupération',
      changePassword: 'Changer le mot de passe',
    },
    info: {
      reconnecting: 'Reconnexion...',
      pendingInvitation: 'Invitation en attente',
      min7Char: 'Min. 7 caractères',
      checkYourMailbox: 'Vérifiez votre boîte mail.',
      resetPasswordSent: 'Nous vous avons envoyé un lien pour changer votre mot de passe',
      passwordSuccessfullyChanged: 'Le mot de passe a été mis à jour',
      projectInvitationCoLab: {
        part1: 'Vous avez été invité-e à collaborer à un projet co.LAB.',
        part2: 'Connectez-vous ou créez un compte.',
      },
      otherInvitationCoLab: {
        part1: 'Vous avez été invité-e à collaborer sur co.LAB.',
        part2: 'Connectez-vous ou créez un compte.',
      },
      updatedTermsOfUse:
        "Nos conditions d'utilisation et notre politique de confidentialité ont été révisées. Veuillez prendre un moment pour les examiner et confirmer votre acceptation avant de continuer.",
    },
    error: {
      emailAddressNotValid: "L'adresse e-mail n'est pas valide",
      usernameNotValid:
        "Le nom d'utilisateur ne peut contenir que des lettres sans accent, des chiffres, des points, des caractères de soulignement et des tirets.",
      passwordTooWeak: "Le mot de passe n'est pas assez fort.",
      passwordsMismatch: 'Les mots de passe ne correspondent pas.',
      yourPasswordIsWeak: 'Votre mot de passe est faible',
      invalidLink: 'Lien invalide ou déprécié',
      notAgreed:
        'vous devez accepter les conditions générales et la politique de gestion des données',
      pleaseRefresh:
        "Veuillez essayer de rafraîchir ou contacter l'administrateur de votre projet co.LAB.",
    },
  },

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // MODULES
  modules: {
    project: {
      projectCopy: (name: string) => name + ' - copie',
      labels: {
        projectDisplaySettings: "Paramètres d'affichage du projet",
        projectSettings: 'Paramètres du projet',
        projects: 'Projets',
        modelDisplaySettings: "Paramètres d'affichage du modèle",
        modelSettings: 'Paramètres du modèle',
        models: 'Modèles',
        extractNewFromProject: 'Extraire un nouveau modèle à partir du projet',
        extractRoles: 'Extraire les roles',
        extractDeliverables: 'Extraire le contenu des cartes',
        extractDocuments: 'Extraire les documents',
        keepTheSimpleProject: 'Garder le projet simple',
        include: 'Inclure',
        roles: 'Rôles',
        cardContents: 'Contenu des cartes',
        documentation: 'Documentation',
        connect: 'Connecter',
        invite: 'Inviter',
        invitationToProject: 'Invitation à collaborer sur le projet',
        share: 'Partager',
        modelSharing: 'Partage du modèle',
        sharing: 'Partage',
        sharingParams: 'Paramètres de partage',
        modelScope: {
          global: 'Global',
          normal: 'Modèle',
        },
      },
      actions: {
        createProject: 'Créer projet',
        createAProject: 'Créer un projet',
        chooseAModel: 'Choisissez un modèle',
        createAProjectFrom: (templateTitle?: string | null): string =>
          `Créer un projet à partir de ${'"' + templateTitle + '"'}`,
        editIllustration: "Éditer l'illustration du projet",
        newProject: 'Nouveau projet',
        saveAsModel: 'Créer un modèle',
        saveProjectAsModelPart: 'Créer un modèle à partir du projet',
        extractAModel: "Extraire un modèle à partir d'un projet",
        extractAModelFromProject: 'Extraire un modèle à partir du projet ',
        createModel: 'Créer le modèle',
        convertToModel: 'Convertir en un modèle',
        convertToProject: 'Convertir en un simple projet',
        shareTo: 'Partager avec',
      },
      info: {
        noProjectSelected: 'Aucun projet sélectionné',
        noProjectYet: "Vous n'avez aucun projet pour le moment",
        noProject: "Le projet n'a pas pu être chargé",
        emptyProject: 'Projet vide',
        useBlankProject: 'Utilisez ce projet vide et vous serez libre de créer un monde nouveau.',
        isAModel: 'Ceci est un modèle de projet',
        mailSentToShare: (recipientAddress: string): string =>
          `${recipientAddress} va recevoir un email l'invitant à utiliser le modèle`,
        newModelShared:
          "Un nouveau modèle a été partagé avec vous. Vous pouvez désormais l'utiliser pour créer un nouveau projet.",
        newProjectAccess: 'Vous avez maintenant accès à un nouveau projet.',
        initialProjectNotFound: "Le projet initial n'a pas pu être trouvé",
      },
      settings: {
        currentIcon: 'Icône actuelle',
        resources: {
          label: 'Documentation du projet',
        },
      },
    },
    card: {
      card: 'Carte',
      cards: 'Cartes',
      theCard: 'La carte',
      variant: 'Variante',
      variants: 'Variantes',
      theVariant: 'La variante',
      //subcardTooltip: (name: string) => `Sous-carte: ${name}`,
      //subcards: 'Sous-cartes',
      untitled: 'Nouvelle carte',
      addCard: 'Ajouter une carte',
      addVariant: 'Ajouter une variante',
      createNew: (parentTitle?: string | null): string =>
        `Créer une ${parentTitle ? 'sous-carte pour ' + parentTitle : 'carte'}`,
      deleteVariant: 'Supprimer la variante',
      completion: 'Avancement',
      position: 'Position',
      positioning: {
        organizeCards: 'Organiser les cartes',
        width: 'Largeur',
        height: 'Hauteur',
      },
      showCardType: 'Afficher les informations du thème',
      editCompletion: "Éditer l'avancement",
      action: {
        lock: 'Verrouiller',
        unlock: 'Déverouiller',
        changeStatus: 'Changer le status',
        chooseACardType: 'Quel est le thème de votre carte ?',
        createAType: 'Créer un thème',
        removeTheType: 'Enlever le thème',
        generateASharingLink: 'Générer un lien de partage',
        removeAllSharingLink: 'Supprimer tous les liens de partage',
      },
      label: {
        sharingLink: 'Lien de partage',
      },
      editor: {
        toolbox: 'Boîte à outils',
        toggleToolbox: 'Basculer la boîte à outils',
        showToolbox: 'Afficher la boîte à outils',
        hideToolbox: 'Masquer la boîte à outils',
        fullScreen: 'Mode plein écran',
        contentOnly: 'Afficher le texte uniquement',
        split: 'Afficher le texte et les cartes',
        cardsOnly: 'Afficher les cartes uniquement',
      },
      // navigation: {
      //   toggleViewZoomToEdit: 'Editer la carte',
      //   toggleViewEditToZoom: 'Montrer les sous-cartes',
      // },
      settings: {
        title: 'Paramètres de la carte',
        locked: 'Verrouillé',
        color: 'Couleur',
        status: 'Statut',
        noStatus: "Aucun statut n'est défini",
        statusIs: 'Statut: ',
        statuses: {
          ACTIVE: 'En cours',
          TO_VALIDATE: 'A valider',
          VALIDATED: 'Validé',
          REJECTED: 'Rejeté',
          ARCHIVED: 'Archivé',
        },
        completionLevelMode: "Mode de niveau d'avancement",
        cardPosition: 'Position de la carte',
      },
      infos: {
        createFirstCard: 'Créer la première carte',
        cardLocked: 'Carte verrouillée. Déverrouillez-la pour la modifier',
        lockingCard: 'Le verrouillage passe en lecture seule.',
        noDeliverable: 'Aucun livrable disponible',
        completionModeInfo:
          "Sélectionnez le mode d'avancement (manuel | auto | no-op). Manuel: entrez une valeur pour changer l'avancement; Auto: basé sur les enfants; Aucune: n'affiche pas de barre d'avancement",
        noBlockYet: 'Document vide',
        sharingLink: {
          intro: 'Partager cette carte avec un lien',
          copyToShare: 'Copier ce lien pour la partager',
          generateTip1: "Partager le lien d'une carte donne accès en lecture et écriture.",
          generateTip2: "L'utilisateur pourra également consulter l'entièreté du projet.",
          generateTip3: "Les liens n'expirent pas sans action de votre part.",
          generateTip4:
            "Si vous souhaitiez donner accès à l'ensemble d'un projet, nous vous recommandons de l'inviter dans votre équipe directement.",
          revokeTip:
            "Révoquer un lien signifie qu'il ne sera plus valide. Les utilisateurs ne pourront plus s'en servir pour accéder à la carte.",
          revoked: 'Tous les liens de partage liés à cette carte ont été supprimés définitivement.',
        },
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
      mdMode: 'Mode markdown',
      showTree: "Afficher l'arbre",
      tree: 'Arbre',
      orphans: 'Orphelins',
      result: 'Résultat',
      uploadFile: 'Télécharger un fichier',
      replaceFile: 'Remplacer le fichier',
      dlFile: 'Télécharger le fichier',
      uploadImage: 'Télécharger une image',
      editBlock: 'Éditer le bloc',
      deleteBlock: 'Supprimer le bloc',
      addText: 'Ajouter un bloc de texte',
      addFile: 'Ajouter un fichier',
      addLink: 'Ajouter un lien',
      openLink: 'Ouvrir le lien',
      editLink: 'Modifier le lien',
      removeLink: 'Retirer le lien',
      emptyLink: 'Lien vide',
      insertLink: 'Insérer un lien',
      insertTable: 'Insérer un tableau',
      insertImage: 'Insérer une image',
      insertFile: 'Insérer un fichier',
      insertCardLink: 'Insérer un lien vers une autre carte',
      nbOfRows: 'Nombre de lignes',
      nbOfColumns: 'Nombre de colonnes',
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
        placeholder: 'Entrez votre texte...',
      },
      textFormat: {
        clearStyles: 'Supprimer tous les styles appliqués',
        strikeText: 'Tracé',
        formatAsStrike: `Rendre le texte tracé.`,
        underlineSC: 'Souligné (Ctrl+U)',
        formatUnderline: 'Souligner le texte. (Ctrl+U)',
        italicSC: 'Italique (Ctrl+I)',
        formatItalic: `Mettre le texte en italique (Ctrl+I)`,
        boldSC: 'Gras (Ctrl+B)',
        formatBold: `Mettre le texte en gras (Ctrl+B)`,
        formatText: 'Formatter le texte',
        paragraph: 'Paragraphe',
        heading1: 'Titre 1',
        heading2: 'Titre 2',
        heading3: 'Titre 3',
        heading4: 'Titre 4',
        heading5: 'Titre 5',
        code: 'Code',
        quote: 'Citation',
        alignText: 'Aligner le texte',
        leftAlign: 'Aligner à gauche',
        centerAlign: 'Aligner au centre',
        rightAlign: 'Aligner à droite',
        justify: 'Justifier',
        formatList: 'Mettre le texte en liste',
        bulletList: 'Liste à puces',
        numberList: 'Liste numérotée',
        checkList: 'Checklist',
        colorText: 'Colorier le texte',
        highlightText: 'Surligner le texte',
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
      publishedInfoType: 'Une documentation publiée est disponible pour les cartes',
      publishedInfoRootCard: 'Une documentation publiée est disponible pour toutes les cartes',
      unpublishedInfoType: "Une documentation non publiée n'est pas visible par les cartes",
      actions: {
        makeOwnCopy: 'Copier dans la carte',
        shareWithChildren: 'Partager dans les enfants',
        makePrivate: 'Rattacher à la carte',
      },
      info: {
        noContent: 'Le document est vide',
        providedByCardType: (cardTypeName: string) => `Fournie par le thème «${cardTypeName}»`,
        ownedByThisCardType: 'Appartient à ce thème',
        providedByUpperCard: (name: string) => `Fournie par la carte parente «${name}»`,
        ownedByThisCard: 'Appartient à la carte courante',
        ownedByThisCardContent: 'Appartient à la variante courante',
        providedByTheCurrentProject: 'Fournie par la documentation du projet',
        providedByExternalCardType: (cardTypeName: string, projectName: string) =>
          `Fournie par le thème «${cardTypeName}» du projet «${projectName}»`,
        providedByGlobalCardType: (cardTypeName: string) =>
          `Fournie par la thème globale «${cardTypeName}»`,
        forceTooltip:
          "Cette documentation provient d'ailleurs, vous pouvez néanmoins l'éditer depuis ici",
        source: {
          card: 'Carte',
          theme: 'Thème',
          inherited: 'Hérité',
          project: 'Projet',
        },
      },
      scope: {
        disclaimer: '', // TODO
        confirm: 'déplacer',
        reset: "retourner à l'état initial",
        cancel: 'annuler',
        showAllCards: 'afficher toutes les cartes',
        alsoUsedByExternalProject: 'Aussi visible par ces autres projets',
        projectDocDesc:
          'Un document peut être lié au projet entier. Ansi, il sera visible par toutes les cartes',
        thematicDesc:
          'Un document peut être lié à un thème spécifique. Ainsi, il ne sera visible que par les cartes relevant de ce thème.',
        mainViewTitle: 'Cartes du projet',
        mainViewDesc:
          'Un document peut être lié à une carte précise. Ainsi, il ne sera visible que par cette carte, ou par cette carte et tous ses descendants si le document est publié.',
      },
      sortByCategory: 'par catégorie',
      sortByProvider: 'par source',
      noDocumentationYet: "Il n'y a pas encore de documentation",
    },
    cardType: {
      cardType: 'Thème',
      cardTypesLongWay: 'Documentation thématique',
      titlePlaceholder: 'Nouveau thème',
      noCardType: 'Aucun thème',
      purpose: 'Description',
      globalTypes: 'Thèmes globaux',
      sharedAvailableTypes: 'Thèmes disponibles partagés',
      action: {
        createType: 'Créer un thème',
        createAType: 'Créer un thème',
        deleteType: 'Supprimer le thème',
        confirmDeleteType: 'Êtes-vous sûr-e-s de vouloir supprimer ce thème',
        useInProject: 'Utiliser dans le projet',
        removeFromProject: 'Retirer du projet',
      },
      route: {
        backToCardType: 'Retour aux thèmes',
        manageTypes: 'Gérer les thèmes',
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
        cannotRemoveCardType: 'Impossible de retirer le thème',
        cannotRemoveFromProject:
          'Impossible de retirer le thème. Il est utilisé par une/des cartes.',
        cannotDeleteType: 'Impossible de supprimer le thème. Il est utilisé dans le projet.',
        createFirstGlobalType: 'Créer le premier thème global',
        createFirstProjectType: 'Créer le premier thème',
        createEmptyType: 'Vous pouvez créer un thème vide grâce à ce bouton',
        orAddSharedType: 'ou ajouter un "thème disponible partagé".',
        noExternalType: "Il n'y a aucun thème externe disponible",
        referencedByOther:
          "Peut être référencé par d'autres projets (en ce qui concerne les droits d'accès).",
        shouldNotBeUsed: 'Ne devrait plus être utilisé',
        isGlobalType: "Provient d'un thème global",
        fromProject: (projectName: string): string => `Provient du projet "${projectName}"`,
        fromAProject: "Provient d'un projet",
      },
    },
    presence: {
      date: (name: string, date: number) => `${name} est en ligne (${fr.common.ago(date)})`,
    },
  },
  //////////////////////////////////////////////////////////////////////////////////////////////////
  // Tips
  tips: {
    label: {
      tips: 'Afficher les conseils',
      news: 'Afficher les actualités',
      feature_preview: 'Afficher les nouvelles fonctionnalités à venir',
      wip: 'Afficher les éléments de travail en cours',
      todo: 'Afficher les éléments à faire',
      debug: "Afficher l'information de déboguage",
    },
    example: {
      tips: {
        title: 'Exemple de conseil',
        content: 'Quelques informations utiles pour aider les utilisateurs',
      },
      news: {
        title: "Exemple d'actualité",
        content: 'Quelques nouvelles fonctionnalités à souligner',
      },
      feature_preview: {
        title: "Exemple d'avant-première",
        content: 'Pour afficher les prochaines nouvelles fonctionnalités en avant-première',
      },
      wip: {
        title: 'Exemple de travail en cours',
        content: 'Certaines fonctionnalités ne sont pas encore complètement terminées',
      },
      todo: {
        title: "Exemple d'élément à faire",
        content: "Nous savons ce qu'il faut faire, mais nous ne l'avons pas encore fait.",
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
    furtherInfo: 'Pour de plus amples informations et/ou nous contacter: ',
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
    // NB : If this method does not compile anymore,
    // it means that the MessageI18nKey do not exactly match the case entries
    // Dear developer, please make them match
    switch (i18nKey) {
      case 'EMAIL_NOT_VALID':
        return 'Adresse e-mail invalide';
      case 'IDENTIFIER_ALREADY_TAKEN':
        return 'Veuillez choisir un autre identifiant';
      case 'USER_IS_ALREADY_A_TEAM_MEMBER':
        return "L'utilisateur actuel est déjà un membre de l'équipe";
      case 'CURRENT_USER_CAN_ALREADY_USE_MODEL':
        return "L'utilisateur actuel peut déjà utiliser le modèle";
      case 'DATA_NOT_FOUND':
        return 'Donnée introuvable';
      case 'DATA_INTEGRITY_FAILURE':
        return "Problème d'intégrité des données";
    }
  },

  httpErrorMessage: {
    AUTHENTICATION_FAILED: "L'authentification a échoué",
    AUTHENTICATION_REQUIRED: 'Veuillez vous authentifier',
    ACCESS_DENIED: 'Accès refusé',
    NOT_FOUND: 'Introuvable',
    SMTP_ERROR: 'Erreur du serveur mail',
    EMAIL_MESSAGE_ERROR: 'E-mail non envoyé',
    DUPLICATION_ERROR: 'Error lors de la duplication',
    BAD_REQUEST: 'Mauvaise requête',
    TOO_MANY_ATTEMPTS: 'Trop de tentatives, veuillez attendre un moment avant de réessayer.',
  },
};
