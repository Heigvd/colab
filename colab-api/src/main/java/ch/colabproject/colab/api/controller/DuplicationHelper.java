/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.DuplicationParam;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.model.card.CardTypeRef;
import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.DocumentFile;
import ch.colabproject.colab.api.model.document.ExternalLink;
import ch.colabproject.colab.api.model.document.Resource;
import ch.colabproject.colab.api.model.document.ResourceRef;
import ch.colabproject.colab.api.model.document.TextDataBlock;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.team.TeamRole;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Duplication of colab entities
 *
 * @author sandra
 */
public class DuplicationHelper {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(DuplicationHelper.class);

    /** Comparator for sorting data to create objects in the same order */
    private static final Comparator<ColabEntity> ID_COMPARATOR = Comparator
        .comparingLong(entity -> entity.getId());

    /** parameters to fine tune a duplication */
    private final DuplicationParam params;

    /** Matching between the old id and the new team roles */
    private Map<Long, TeamRole> teamRoleMatching = new HashMap<>();

    /** Matching between the old id and the new team members */
    private Map<Long, TeamMember> teamMemberMatching = new HashMap<>();

    /** Matching between the old id and the new card types */
    private Map<Long, AbstractCardType> cardTypeMatching = new HashMap<>();

    /** Matching between the old id and the new cards */
    private Map<Long, Card> cardMatching = new HashMap<>();

    /** Matching between the old id and the new card contents */
    private Map<Long, CardContent> cardContentMatching = new HashMap<>();

    /** Matching between the old id and the new resources */
    private Map<Long, AbstractResource> resourceMatching = new HashMap<>();

    /**
     * @param params Parameters to fine tune duplication
     */
    public DuplicationHelper(DuplicationParam params) {
        this.params = params;
    }

    // *********************************************************************************************
    // duplication
    // *********************************************************************************************

    /**
     * Duplicate the given project.
     *
     * @param originalProject the project we want to duplicate
     *
     * @return the duplicated project
     */
    public Project duplicateProject(Project originalProject) {
        try {
            Project newProject = new Project();
            newProject.duplicate(originalProject);

            ////////////////////////////////////////////////////////////////////////////////////////
            // Team roles
            if (params.isWithRoles()) {
                List<TeamRole> teamRoles = originalProject.getRoles();
                teamRoles.sort(ID_COMPARATOR);

                for (TeamRole original : teamRoles) {
                    TeamRole newTeamRole = duplicateTeamRole(original);

                    newTeamRole.setProject(newProject);
                    newProject.getRoles().add(newTeamRole);
                }
            } else {
                logger.info("param do not duplicate project's team roles");
            }

            ////////////////////////////////////////////////////////////////////////////////////////
            // Team members
            if (params.isWithTeamMembers()) {
                List<TeamMember> teamMembers = originalProject.getTeamMembers();
                teamMembers.sort(ID_COMPARATOR);

                for (TeamMember original : teamMembers) {
                    TeamMember newTeamMember = duplicateTeamMember(original);

                    newTeamMember.setProject(newProject);
                    newProject.getTeamMembers().add(newTeamMember);
                }
            } else {
                logger.info("param do not duplicate project's team members");
            }

            ////////////////////////////////////////////////////////////////////////////////////////
            // Card types
            if (params.isWithCardTypes()) {
                List<AbstractCardType> cardTypes = originalProject.getElementsToBeDefined();
                cardTypes.sort(ID_COMPARATOR);

                for (AbstractCardType original : cardTypes) {
                    AbstractCardType newCardType = duplicateCardType(original);

                    newCardType.setProject(newProject);
                    newProject.getElementsToBeDefined().add(newCardType);
                }
            }

            ////////////////////////////////////////////////////////////////////////////////////////
            // Cards
            if (params.isWithCardsStructure()) {
                Card original = originalProject.getRootCard();
                if (original != null) {
                    Card newRootCard = duplicateCard(original);

                    newRootCard.setRootCardProject(newProject);
                    newProject.setRootCard(newRootCard);
                }

            }

            ////////////////////////////////////////////////////////////////////////////////////////
            // TODO sticky notes
//            if (params.isWithStickyNotes()) {
//
//            }

            ////////////////////////////////////////////////////////////////////////////////////////
            // TODO activity flow
//            if (params.isWithActivityFlow()) {
//
//            }

            return newProject;
        } catch (ColabMergeException e) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }
        // TODO sandra work in progress : handle exceptions
    }

    private TeamRole duplicateTeamRole(TeamRole original) throws ColabMergeException {
        TeamRole newTeamRole = new TeamRole();
        newTeamRole.duplicate(original);

        teamRoleMatching.put(original.getId(), newTeamRole);

        return newTeamRole;
    }

    private TeamMember duplicateTeamMember(TeamMember original) throws ColabMergeException {
        TeamMember newTeamMember = new TeamMember();
        newTeamMember.duplicate(original);

        teamMemberMatching.put(original.getId(), newTeamMember);

        ////////////////////////////////////////////////////////////////////////////////////////////
        // Team members's user
        User user = original.getUser();
        if (user != null) {
            newTeamMember.setUser(user);

//            try {
//                requestManager.sudo(() -> {
//                    user.getTeamMembers().add(newTeamMember);
//                });
//            } catch (Exception ex) {
//                throw ex;
//            }
        }

        if (params.isWithRoles()) {
            List<TeamRole> linkedRoles = original.getRoles();
            linkedRoles.sort(ID_COMPARATOR);

            for (TeamRole linkedRole : linkedRoles) {
                TeamRole newRole = teamRoleMatching.get(linkedRole.getId());

                newRole.getMembers().add(newTeamMember);
                newTeamMember.getRoles().add(newRole);
            }
        }

        return newTeamMember;
    }

    private AbstractCardType duplicateCardType(AbstractCardType original)
        throws ColabMergeException {
        // params.isMakeOnlyCardTypeReferences()

        AbstractCardType newAbstractCardType;
        if (original instanceof CardType) {
            CardType originalCardType = (CardType) original;

            CardType newCardType = new CardType();
            newCardType.duplicate(originalCardType);

            cardTypeMatching.put(originalCardType.getId(), newCardType);

            TextDataBlock purpose = originalCardType.getPurpose();
            if (purpose != null) {
                TextDataBlock newPurpose = (TextDataBlock) duplicateDocument(purpose);
                newPurpose.setPurposingCardType(newCardType);
                newCardType.setPurpose(newPurpose);
            }

            newAbstractCardType = newCardType;
        } else if (original instanceof CardTypeRef) {
            CardTypeRef originalCardTypeRef = (CardTypeRef) original;

            CardTypeRef newCardTypeRef = new CardTypeRef();
            newCardTypeRef.duplicate(original);

            cardTypeMatching.put(originalCardTypeRef.getId(), newCardTypeRef);

            AbstractCardType originalTarget = originalCardTypeRef.getTarget();
            if (originalTarget != null) {
                if (originalTarget.getProjectId() != originalCardTypeRef.getProjectId()) {
                    newCardTypeRef.setTarget(originalTarget);
                } else {
                    throw new IllegalStateException(
                        "the target of a card type reference must be outside the project");
                    // Note for an hypothetical future evolution :
                    // if we break the condition that, in a project,
                    // there is only one reference per target type outside the project
                    // we must process the card types in the appropriate order
                }
            }

            newAbstractCardType = newCardTypeRef;
        } else {
            throw new IllegalStateException("abstract card type implementation not handled");
        }

        List<AbstractResource> originalResources = original.getDirectAbstractResources();
        originalResources.sort(ID_COMPARATOR);

        for (AbstractResource originalResource : originalResources) {
            AbstractResource newResource = duplicateResource(originalResource);

            newResource.setAbstractCardType(newAbstractCardType);
            newAbstractCardType.getDirectAbstractResources().add(newResource);
        }

        return newAbstractCardType;
    }

    private Card duplicateCard(Card original)
        throws ColabMergeException {
        Card newCard = new Card();
        newCard.duplicate(original);

        cardMatching.put(original.getId(), newCard);

        AbstractCardType originalCardType = original.getCardType();
        if (originalCardType != null) {
            AbstractCardType newCardType = cardTypeMatching.get(originalCardType.getId());
            newCard.setCardType(newCardType);
        }

        List<AbstractResource> originalResources = original.getDirectAbstractResources();
        originalResources.sort(ID_COMPARATOR);

        for (AbstractResource originalResource : originalResources) {
            AbstractResource newResource = duplicateResource(originalResource);

            newResource.setCard(newCard);
            newCard.getDirectAbstractResources().add(newResource);
        }

        List<CardContent> originalContents = original.getContentVariants();
        originalContents.sort(ID_COMPARATOR);

        for (CardContent originalCardContent : originalContents) {
            CardContent newCardContent = duplicateCardContent(originalCardContent);

            newCardContent.setCard(newCard);
            newCard.getContentVariants().add(newCardContent);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////
        // TODO Access control

        return newCard;
    }

    private CardContent duplicateCardContent(CardContent original)
        throws ColabMergeException {
        CardContent newCardContent = new CardContent();
        newCardContent.duplicate(original);

        cardContentMatching.put(original.getId(), newCardContent);

        List<Card> originalSubCards = original.getSubCards();
        originalSubCards.sort(ID_COMPARATOR);

        List<AbstractResource> originalResources = original.getDirectAbstractResources();
        originalResources.sort(ID_COMPARATOR);

        for (AbstractResource originalResource : originalResources) {
            AbstractResource newResource = duplicateResource(originalResource);

            newResource.setCardContent(newCardContent);
            newCardContent.getDirectAbstractResources().add(newResource);
        }

        for (Card originalSubCard : originalSubCards) {
            Card newSubCard = duplicateCard(originalSubCard);

            newSubCard.setParent(newCardContent);
            newCardContent.getSubCards().add(newSubCard);
        }

        if (params.isWithDeliverables()) {
            List<Document> originalDeliverables = original.getDeliverables();
            originalDeliverables.sort(ID_COMPARATOR);

            for (Document originalDoc : originalDeliverables) {
                Document newDoc = duplicateDocument(originalDoc);

                newDoc.setOwningCardContent(newCardContent);
                newCardContent.getDeliverables().add(newDoc);
            }
        }

        return newCardContent;
    }

    private Document duplicateDocument(Document original) throws ColabMergeException {
        if (original instanceof DocumentFile) {
            // TODO sandra work in progress : copy also the file
            DocumentFile originalDocumentFile = (DocumentFile) original;
            DocumentFile newDocumentFile = new DocumentFile();
            newDocumentFile.duplicate(originalDocumentFile);
            return newDocumentFile;
        } else if (original instanceof ExternalLink) {
            ExternalLink originalExternalLink = (ExternalLink) original;
            ExternalLink newExternalLink = new ExternalLink();
            newExternalLink.duplicate(originalExternalLink);
            return newExternalLink;
        } else if (original instanceof TextDataBlock) {
            TextDataBlock originalTextDataBlock = (TextDataBlock) original;
            TextDataBlock newTextDataBlock = new TextDataBlock();
            newTextDataBlock.duplicate(originalTextDataBlock);
            return newTextDataBlock;
        } else {
            throw new IllegalStateException("abstract card type implementation not handled");
        }
    }

    private AbstractResource duplicateResource(AbstractResource original)
        throws ColabMergeException {
        if (original instanceof Resource) {
            Resource originalResource = (Resource) original;

            Resource newResource = new Resource();
            newResource.duplicate(originalResource);

            resourceMatching.put(originalResource.getId(), newResource);

            List<Document> originalDocuments = originalResource.getDocuments();
            originalDocuments.sort(ID_COMPARATOR);

            for (Document originalDocument : originalDocuments) {
                Document newDocument = duplicateDocument(originalDocument);

                newDocument.setOwningResource(newResource);
                newResource.getDocuments().add(newDocument);
            }

            TextDataBlock teaser = originalResource.getTeaser();
            if (teaser != null) {
                TextDataBlock newTeaser = (TextDataBlock) duplicateDocument(teaser);

                newTeaser.setTeasingResource(newResource);
                newResource.setTeaser(newTeaser);
            }

            return newResource;
        } else if (original instanceof ResourceRef) {
            ResourceRef originalResourceRef = (ResourceRef) original;

            ResourceRef newResourceRef = new ResourceRef();
            newResourceRef.duplicate(originalResourceRef);

            resourceMatching.put(originalResourceRef.getId(), newResourceRef);

            AbstractResource originalTarget = originalResourceRef.getTarget();
            if (originalTarget != null) {
                AbstractResource newTarget = originalTarget;

                if (resourceMatching.containsKey(originalTarget.getId())) {
                    newTarget = resourceMatching.get(originalTarget.getId());
                }

                newResourceRef.setTarget(newTarget);
            }

            // and what if the user has not the rights to read the target ?!?

            return newResourceRef;

        } else {
            throw new IllegalStateException("abstract card type implementation not handled");
        }
    }

}
