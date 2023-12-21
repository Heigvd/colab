/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller;

import ch.colabproject.colab.api.controller.card.CardContentManager;
import ch.colabproject.colab.api.controller.document.FileManager;
import ch.colabproject.colab.api.controller.document.ResourceReferenceSpreadingHelper;
import ch.colabproject.colab.api.controller.document.YjsException;
import ch.colabproject.colab.api.controller.document.YjsLexicalCaller;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.DuplicationParam;
import ch.colabproject.colab.api.model.card.*;
import ch.colabproject.colab.api.model.document.*;
import ch.colabproject.colab.api.model.link.ActivityFlowLink;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.team.TeamRole;
import ch.colabproject.colab.api.model.team.acl.Assignment;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.generator.model.exceptions.MessageI18nKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.RepositoryException;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.Map.Entry;

/**
 * Duplication of colab entities.
 * <p>
 * Usage :
 * <ul>
 * <li>Create a {@link DuplicationManager}</li>
 * <li>Duplicate the object with any duplicateXXX</li>
 * <li>Save to JPA database</li>
 * <li>Call {@link #duplicateDataIntoJCR()} in order to save to JCR
 * database</li>
 * </ul>
 *
 * @author sandra
 */
public class DuplicationManager {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(DuplicationManager.class);

    /** Comparator for sorting data to create objects in the same order */
    private static final Comparator<ColabEntity> ID_COMPARATOR = Comparator
            .comparingLong(entity -> entity.getId());

    /** parameters to fine tune a duplication */
    private final DuplicationParam params;

    /** helper for resource references */
    private final ResourceReferenceSpreadingHelper resourceSpreader;

    /** File persistence management */
    private final FileManager fileManager;

    /** Card content specific logic handling */
    private final CardContentManager cardContentManager;

    /** To call the YJS lexical server */
    private YjsLexicalCaller yjsLexicalCaller;

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

    /** Matching between the old id and the new document */
    private Map<Long, Document> documentMatching = new HashMap<>();

    /** the sticky note links to duplicate. They are filled when handling cards */
    private List<StickyNoteLink> stickyNoteLinksToDuplicate = new ArrayList<>();

    /** the activity flow links to duplicate. They are filled when handling cards */
    private List<ActivityFlowLink> activityFlowLinksToDuplicate = new ArrayList<>();

    /** Document files to process once the ids are here */
    private Map<Long, DocumentFile> documentFilesToProcessOnceIds = new HashMap<>();

    /**
     * @param params             Parameters to fine tune duplication
     * @param resourceSpreader   Helper for resource references
     * @param fileManager        File persistence management
     * @param cardContentManager Card content specific logic handling
     */
    public DuplicationManager(DuplicationParam params,
            ResourceReferenceSpreadingHelper resourceSpreader,
            FileManager fileManager, CardContentManager cardContentManager) {
        this.params = params;
        this.resourceSpreader = resourceSpreader;
        this.fileManager = fileManager;
        this.cardContentManager = cardContentManager;
    }

    // *********************************************************************************************
    // duplication
    // *********************************************************************************************

    /**
     * Duplicate the given project. No database action is provided.
     *
     * @param originalProject the project to duplicate
     *
     * @return the duplicated project
     */
    public Project duplicateProject(Project originalProject) {
        try {
            Project newProject = new Project();
            newProject.mergeToDuplicate(originalProject);

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
            // instance makers
            /* are never duplicated */

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
            // sticky notes
            if (params.isWithStickyNotes()) {
                stickyNoteLinksToDuplicate.sort(ID_COMPARATOR);

                for (StickyNoteLink original : stickyNoteLinksToDuplicate) {
                    duplicateStickyNoteLink(original);
                }
            }

            ////////////////////////////////////////////////////////////////////////////////////////
            // activity flow
            if (params.isWithActivityFlow()) {
                activityFlowLinksToDuplicate.sort(ID_COMPARATOR);

                for (ActivityFlowLink original : activityFlowLinksToDuplicate) {
                    duplicateActivityFlowLink(original);
                }
            }

            return newProject;
        } catch (ColabMergeException e) {
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }
        // TODO sandra work in progress : handle exceptions
    }

    private TeamRole duplicateTeamRole(TeamRole original) throws ColabMergeException {
        TeamRole newTeamRole = new TeamRole();
        newTeamRole.mergeToDuplicate(original);

        teamRoleMatching.put(original.getId(), newTeamRole);

        return newTeamRole;
    }

    private TeamMember duplicateTeamMember(TeamMember original) throws ColabMergeException {
        TeamMember newTeamMember = new TeamMember();
        newTeamMember.mergeToDuplicate(original);

        teamMemberMatching.put(original.getId(), newTeamMember);

        ////////////////////////////////////////////////////////////////////////////////////////////
        // Team members's user
        User user = original.getUser();
        if (user != null) {
            newTeamMember.setUser(user);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////
        // Team members's roles
        if (params.isWithRoles()) {
            List<TeamRole> linkedRoles = original.getRoles();
            linkedRoles.sort(ID_COMPARATOR);

            for (TeamRole linkedRole : linkedRoles) {
                TeamRole newRole = teamRoleMatching.get(linkedRole.getId());

                if (newRole == null) {
                    throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
                }

                newRole.getMembers().add(newTeamMember);
                newTeamMember.getRoles().add(newRole);
            }
        }

        return newTeamMember;
    }

    private AbstractCardType duplicateCardType(AbstractCardType original)
            throws ColabMergeException {

        if (params.isMakeOnlyCardTypeReferences()) {
            CardTypeRef newCardTypeRef = new CardTypeRef();
            newCardTypeRef.setTarget(original);
            newCardTypeRef.setDeprecated(original.isDeprecated());
            newCardTypeRef.setPublished(false);

            cardTypeMatching.put(original.getId(), newCardTypeRef);

            if (resourceSpreader == null) {
                throw new IllegalStateException(
                        "Dear developer, please define the resource spreader");
            }

            List<ResourceRef> createdRefs = resourceSpreader
                    .extractReferencesFromUp(newCardTypeRef);
            createdRefs.stream().forEach(ref -> resourceMatching.put(ref.getTarget().getId(), ref));

            return newCardTypeRef;
        } else {
            AbstractCardType newAbstractCardType;
            if (original instanceof CardType) {
                CardType originalCardType = (CardType) original;

                CardType newCardType = new CardType();
                newCardType.mergeToDuplicate(originalCardType);

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
                newCardTypeRef.mergeToDuplicate(originalCardTypeRef);

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

            if (params.isWithResources()) {
                List<AbstractResource> originalResources = original.getDirectAbstractResources();
                originalResources.sort(ID_COMPARATOR);

                for (AbstractResource originalResource : originalResources) {
                    AbstractResource newResource = duplicateResource(originalResource);

                    newResource.setAbstractCardType(newAbstractCardType);
                    newAbstractCardType.getDirectAbstractResources().add(newResource);
                }
            } else {
                logger.info("param do not duplicate project's resources");
            }

            return newAbstractCardType;
        }
    }

    private Card duplicateCard(Card original) throws ColabMergeException {
        Card newCard = new Card();
        newCard.mergeToDuplicate(original);

        cardMatching.put(original.getId(), newCard);

        AbstractCardType originalCardType = original.getCardType();
        if (originalCardType != null) {
            AbstractCardType newCardType = cardTypeMatching.get(originalCardType.getId());

            if (newCardType == null) {
                throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
            }

            newCard.setCardType(newCardType);
        }

        if (params.isWithResources()) {
            List<AbstractResource> originalResources = original.getDirectAbstractResources();
            originalResources.sort(ID_COMPARATOR);

            for (AbstractResource originalResource : originalResources) {
                AbstractResource newResource = duplicateResource(originalResource);

                newResource.setCard(newCard);
                newCard.getDirectAbstractResources().add(newResource);
            }
        } else {
            logger.info("param do not duplicate project's resources");
        }

        List<CardContent> originalContents = original.getContentVariants();
        originalContents.sort(ID_COMPARATOR);

        for (CardContent originalCardContent : originalContents) {
            CardContent newCardContent = duplicateCardContent(originalCardContent);

            newCardContent.setCard(newCard);
            newCard.getContentVariants().add(newCardContent);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////
        // Assignments

        List<Assignment> originalAssignments = original.getAssignments();
        originalAssignments.sort(ID_COMPARATOR);

        for (Assignment originalAssignment : originalAssignments) {
            if ((params.isWithTeamMembers() || originalAssignment.getMember() == null)
                    && (params.isWithRoles() || originalAssignment.getRole() == null)) {

                Assignment newAssignment = duplicateAssignment(originalAssignment);

                if (newAssignment != null) { // if we got a null, no need to duplicate
                    newAssignment.setCard(newCard);
                    newCard.getAssignments().add(newAssignment);
                }
            }

        }

        ////////////////////////////////////////////////////////////////////////////////////////
        // sticky notes
        if (params.isWithStickyNotes()) {
            stickyNoteLinksToDuplicate.addAll(original.getStickyNoteLinksAsDest());
        }

        ////////////////////////////////////////////////////////////////////////////////////////
        // activity flow
        if (params.isWithActivityFlow()) {
            activityFlowLinksToDuplicate.addAll(original.getActivityFlowLinksAsPrevious());
        }

        return newCard;
    }

    private CardContent duplicateCardContent(CardContent original) throws ColabMergeException {
        CardContent newCardContent = new CardContent();
        newCardContent.mergeToDuplicate(original);

        if (params.isResetProgressionData()) {
            cardContentManager.resetProgression(newCardContent);
        }

        cardContentMatching.put(original.getId(), newCardContent);

        if (params.isWithDeliverables()) {
            List<Document> originalDeliverables = original.getDeliverables();
            originalDeliverables.sort(ID_COMPARATOR);

            for (Document originalDoc : originalDeliverables) {
                Document newDoc = duplicateDocument(originalDoc);

                newDoc.setOwningCardContent(newCardContent);
                newCardContent.getDeliverables().add(newDoc);
            }
        } else {
            logger.info("param do not duplicate project's deliverables");
        }

        if (params.isWithResources()) {
            List<AbstractResource> originalResources = original.getDirectAbstractResources();
            originalResources.sort(ID_COMPARATOR);

            for (AbstractResource originalResource : originalResources) {
                AbstractResource newResource = duplicateResource(originalResource);

                newResource.setCardContent(newCardContent);
                newCardContent.getDirectAbstractResources().add(newResource);
            }
        } else {
            logger.info("param do not duplicate project's resources");
        }

        List<Card> originalSubCards = original.getSubCards();
        originalSubCards.sort(ID_COMPARATOR);

        for (Card originalSubCard : originalSubCards) {
            Card newSubCard = duplicateCard(originalSubCard);

            newSubCard.setParent(newCardContent);
            newCardContent.getSubCards().add(newSubCard);
        }

        return newCardContent;
    }

    private Document duplicateDocument(Document original) throws ColabMergeException {
        if (original instanceof DocumentFile) {
            DocumentFile originalDocumentFile = (DocumentFile) original;

            DocumentFile newDocumentFile = duplicateDocumentFile(originalDocumentFile);

            documentMatching.put(originalDocumentFile.getId(), newDocumentFile);

            return newDocumentFile;
        } else if (original instanceof ExternalLink) {
            ExternalLink originalExternalLink = (ExternalLink) original;

            ExternalLink newExternalLink = new ExternalLink();
            newExternalLink.mergeToDuplicate(originalExternalLink);

            documentMatching.put(originalExternalLink.getId(), newExternalLink);

            return newExternalLink;
        } else if (original instanceof TextDataBlock) {
            TextDataBlock originalTextDataBlock = (TextDataBlock) original;

            TextDataBlock newTextDataBlock = new TextDataBlock();
            newTextDataBlock.mergeToDuplicate(originalTextDataBlock);

            documentMatching.put(originalTextDataBlock.getId(), newTextDataBlock);

            return newTextDataBlock;
        } else {
            throw new IllegalStateException("abstract card type implementation not handled");
        }
    }

    private DocumentFile duplicateDocumentFile(DocumentFile original) throws ColabMergeException {
        DocumentFile newDocumentFile = new DocumentFile();
        newDocumentFile.mergeToDuplicate(original);

        documentFilesToProcessOnceIds.put(original.getId(), newDocumentFile);

        return newDocumentFile;
    }

    /**
     * Duplicate the given resource. No database action is provided.
     *
     * @param original the resource to duplicate
     *
     * @return the duplicated resource
     *
     * @throws ColabMergeException if merging is not possible
     */
    public AbstractResource duplicateResource(AbstractResource original)
            throws ColabMergeException {
        if (original instanceof Resource) {
            Resource originalResource = (Resource) original;

            Resource newResource = new Resource();
            newResource.mergeToDuplicate(originalResource);

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
            newResourceRef.mergeToDuplicate(originalResourceRef);

            resourceMatching.put(originalResourceRef.getId(), newResourceRef);

            AbstractResource originalTarget = originalResourceRef.getTarget();
            if (originalTarget != null) {
                AbstractResource newTarget;
                if (resourceMatching.containsKey(originalTarget.getId())) {
                    newTarget = resourceMatching.get(originalTarget.getId());
                } else {
                    newTarget = originalTarget;
                }
                newResourceRef.setTarget(newTarget);
            }

            return newResourceRef;

        } else {
            throw new IllegalStateException("abstract card type implementation not handled");
        }
    }

    private Assignment duplicateAssignment(Assignment original)
            throws ColabMergeException {
        Assignment newAssignment = new Assignment();
        newAssignment.mergeToDuplicate(original);

        if (original.getMember() != null) {
            TeamMember member = teamMemberMatching.get(original.getMember().getId());

            if (member == null) {
                throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
            }

            member.getAssignments().add(newAssignment);
            newAssignment.setMember(member);
        }

        if (original.getRole() != null) {
            TeamRole role = teamRoleMatching.get(original.getRole().getId());

            if (role == null) {
                throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
            }

            role.getAssignments().add(newAssignment);
            newAssignment.setRole(role);
        }

        return newAssignment;
    }

    private StickyNoteLink duplicateStickyNoteLink(StickyNoteLink original)
            throws ColabMergeException {
        StickyNoteLink newLink = new StickyNoteLink();
        newLink.mergeToDuplicate(original);

        TextDataBlock explanation = original.getExplanation();
        if (explanation != null) {
            TextDataBlock newExplanation = (TextDataBlock) duplicateDocument(explanation);
            newExplanation.setExplainingStickyNoteLink(newLink);
            newLink.setExplanation(newExplanation);
        }

        if (original.getDestinationCard() != null) {
            Card destinationCard = cardMatching.get(original.getDestinationCard().getId());

            if (destinationCard == null) {
                throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
            }

            destinationCard.getStickyNoteLinksAsDest().add(newLink);
            newLink.setDestinationCard(destinationCard);
        }

        if (original.getSrcCard() != null) {
            Card srcCard = cardMatching.get(original.getSrcCard().getId());

            if (srcCard == null) {
                throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
            }

            srcCard.getStickyNoteLinksAsSrc().add(newLink);
            newLink.setSrcCard(srcCard);
        }

        if (original.getSrcCardContent() != null) {
            CardContent srcCardContent = cardContentMatching
                    .get(original.getSrcCardContent().getId());

            if (srcCardContent == null) {
                throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
            }

            srcCardContent.getStickyNoteLinksAsSrc().add(newLink);
            newLink.setSrcCardContent(srcCardContent);
        }

        if (original.getSrcResourceOrRef() != null) {
            AbstractResource srcResourceOrRef = resourceMatching
                    .get(original.getSrcResourceOrRef().getId());

            if (srcResourceOrRef == null) {
                throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
            }

            srcResourceOrRef.getStickyNoteLinksAsSrc().add(newLink);
            newLink.setSrcResourceOrRef(srcResourceOrRef);
        }

        if (original.getSrcDocument() != null) {
            Document srcDocument = documentMatching.get(original.getSrcDocument().getId());

            if (srcDocument == null) {
                throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
            }

            srcDocument.getStickyNoteLinksAsSrc().add(newLink);
            newLink.setSrcDocument(srcDocument);
        }

        return newLink;
    }

    private ActivityFlowLink duplicateActivityFlowLink(ActivityFlowLink original)
            throws ColabMergeException {
        ActivityFlowLink newLink = new ActivityFlowLink();
        newLink.mergeToDuplicate(newLink);

        if (original.getPreviousCard() != null) {
            Card previousCard = cardMatching.get(original.getPreviousCard().getId());

            if (previousCard == null) {
                throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
            }

            previousCard.getActivityFlowLinksAsPrevious().add(newLink);
            newLink.setPreviousCard(previousCard);
        }

        if (original.getNextCard() != null) {
            Card nextCard = cardMatching.get(original.getNextCard().getId());

            if (nextCard == null) {
                throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
            }

            nextCard.getActivityFlowLinksAsNext().add(newLink);
            newLink.setNextCard(nextCard);
        }

        return newLink;
    }

    /**
     * Duplicate the data in the JCR. It must happen after creating the data in JPA
     * as long as we
     * need the ids.
     */
    public void duplicateDataIntoJCR() {
        try {
            for (Entry<Long, DocumentFile> data : documentFilesToProcessOnceIds.entrySet()) {
                duplicateFileDocumentIntoJCR(data.getKey(), data.getValue());
            }
        } catch (RepositoryException e) {
            throw HttpErrorMessage.duplicationError();
        }
    }

    /**
     * Duplicate the data in the Lexical YJS service.
     * <p>
     * That is the text data of the card contents and resources
     */
    public void duplicateLexicalData() {
        if (params.isWithDeliverables()) {
            for (Entry<Long, CardContent> data : cardContentMatching.entrySet()) {

                callDuplicateYjsService(data.getKey(), LexicalDataOwnershipKind.CARD_CONTENT,
                        data.getValue().getId(), LexicalDataOwnershipKind.CARD_CONTENT);
            }
        }

        if (params.isWithResources()) {
            for (Entry<Long, AbstractResource> data : resourceMatching.entrySet()) {
                if (data.getValue() instanceof Resource) {
                    callDuplicateYjsService(data.getKey(), LexicalDataOwnershipKind.RESOURCE,
                            data.getValue().getId(), LexicalDataOwnershipKind.RESOURCE);
                }
            }
        }
    }

    /**
     * Duplicate lexical data for a specific owner
     *
     * @param srcOwnerId    the original owner id
     * @param srcOwnerKind  the original kind of owner
     * @param destOwnerId   the new owner id
     * @param destOwnerKind the new kind of owner
     */
    private void callDuplicateYjsService(Long srcOwnerId, LexicalDataOwnershipKind srcOwnerKind,
            Long destOwnerId, LexicalDataOwnershipKind destOwnerKind) {
        try {
            // yjsLexicalCaller must be instanced here, else only 6 texts can be duplicated
            // please, make it stronger and consistent if you can
            yjsLexicalCaller = new YjsLexicalCaller();

            yjsLexicalCaller.sendDuplicationRequest(
                    srcOwnerId, srcOwnerKind, destOwnerId, destOwnerKind);
        } catch (YjsException e) {
            throw HttpErrorMessage.duplicationError();
        }
    }

    /**
     * Duplicate the file document data into JCR
     *
     * @param srcDocId
     * @param newDocFile
     */
    private void duplicateFileDocumentIntoJCR(Long srcDocId, DocumentFile newDocFile)
            throws RepositoryException {
        if (fileManager == null) {
            throw new IllegalStateException("Dear developer, you must have defined a file manager");
        }

        if (fileManager.hasFile(srcDocId)) {
            InputStream fileStream = null;
            try {
                fileStream = fileManager.getFileStream(srcDocId);
                fileManager.updateOrCreateFile(newDocFile.getId(), fileStream);
            } finally {
                if (fileStream != null) {
                    try {
                        fileStream.close();
                    } catch (IOException e) {
                        // not really a problem
                        // silent ex
                        logger.warn("Could not close stream", e);
                    }
                }
            }
        }
    }

    /**
     * Clear processed data
     */
    public void clear() {
        teamRoleMatching.clear();
        teamMemberMatching.clear();
        cardTypeMatching.clear();
        cardMatching.clear();
        cardContentMatching.clear();
        resourceMatching.clear();
        documentMatching.clear();
        stickyNoteLinksToDuplicate.clear();
        activityFlowLinksToDuplicate.clear();
        documentFilesToProcessOnceIds.clear();
    }

}
