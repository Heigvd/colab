/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.tests;

import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.document.Resource;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.client.ColabClient;

/**
 * Test data for test purpose
 *
 * @author sandra
 */
public class SampleTestData {

    private Long unpublishedGlobalCardTypeId;
    private Long publishedGlobalCardTypeId;

    private Long theProjectId;
    private Long friendProjectId;
    private Long anotherProjectId;

    private Long publishedGlobalCardTypeRefId;

    private Long cardWithGlobalTypeId;
    private Long cardContentWithGlobalTypeId;
    private Long subCardWitchGlobalTypeId;

    private Long localCardTypeId;

    private Long cardWithLocalTypeId;
    private Long cardContentWithLocalTypeId;
    private Long subCardWithSameLocalTypeId;

    private Long friendCardTypeId;
    private Long friendCardTypeRefId;

    private Long cardWithFriendTypeId;
    private Long cardContentWithFriendTypeId;
    private Long subCardWithSameFriendTypeId;

    private Long deliverableDocumentId;
    private Long deliverableBlockId;


    private Long thirdCardId;

    private Long resourceOnGlobalTypeId;
    private Long documentIdGlobal;
    private Long blockIdGlobal;

    private Long resourceOnLocalTypeId;
    private Long documentIdLocal;
    private Long blockIdLocal;

    private Long activityFlowLink;
    private Long stickyNoteLink;

    private Long role1Id;
    private Long role2Id;

    private Long someTeamMemberId;

    /**
     * Init the data
     *
     * @param client rest client to execute HTTP requests
     */
    public SampleTestData(ColabClient client) {
        initData(client);
    }

    private void initData(ColabClient client) {
        unpublishedGlobalCardTypeId = ColabFactory.createCardType(client, null).getId();
        publishedGlobalCardTypeId = ColabFactory.createPublishedCardType(client, null).getId();

        Project theProject = ColabFactory.createProject(client, "THE Sample test data project");
        theProjectId = theProject.getId();

        Project friendProject = ColabFactory.createProject(client, "a friend project");
        friendProjectId = friendProject.getId();

        Project anotherProject = ColabFactory.createProject(client, "another project");
        anotherProjectId = anotherProject.getId();

        Long rootCardContentId = ColabFactory.getRootContent(client, theProject).getId();

        Card cardWithGlobalType = ColabFactory
            .createNewCard(client, rootCardContentId, publishedGlobalCardTypeId);
        cardWithGlobalTypeId = cardWithGlobalType.getId();
        cardContentWithGlobalTypeId = ColabFactory.getCardContent(client, cardWithGlobalTypeId)
            .getId();
        publishedGlobalCardTypeRefId = cardWithGlobalType.getCardTypeId();

        subCardWitchGlobalTypeId = ColabFactory
            .createNewCard(client, cardContentWithGlobalTypeId, publishedGlobalCardTypeId).getId();

        localCardTypeId = ColabFactory.createCardType(client, theProjectId).getId();

        cardWithLocalTypeId = ColabFactory.createNewCard(client, rootCardContentId, localCardTypeId)
            .getId();
        cardContentWithLocalTypeId = ColabFactory.getCardContent(client, cardWithLocalTypeId).getId();

        subCardWithSameLocalTypeId = ColabFactory
            .createNewCard(client, cardContentWithLocalTypeId, localCardTypeId).getId();

        friendCardTypeId = ColabFactory.createCardType(client,  friendProjectId).getId();

        Card cardWithFriendType = ColabFactory.createNewCard(client, rootCardContentId, friendCardTypeId);
        cardWithFriendTypeId = cardWithFriendType.getId();
        cardContentWithFriendTypeId = ColabFactory.getCardContent(client, cardWithFriendTypeId).getId();
        friendCardTypeRefId = cardWithFriendType.getCardTypeId();

        subCardWithSameFriendTypeId = ColabFactory.createNewCard(client, cardContentWithFriendTypeId, friendCardTypeId).getId();

        deliverableDocumentId = ColabFactory.assignNewBlockDocumentDeliverable(client, cardContentWithLocalTypeId).getId();
        deliverableBlockId = ColabFactory.addBlockToDocument(client, deliverableDocumentId).getId();




        Resource resourceOnGlobalType = ColabFactory.createCardTypeResourceBlockDoc(client,
            publishedGlobalCardTypeId, "Mastering ACL");
        resourceOnGlobalTypeId = resourceOnGlobalType.getId();
        documentIdGlobal = resourceOnGlobalType.getDocumentId();
        blockIdGlobal = ColabFactory.addBlockToDocument(client, documentIdGlobal).getId();

        Resource resourceOnLocalType = ColabFactory.createCardTypeResourceBlockDoc(client,
            localCardTypeId, "locally handling");
        resourceOnLocalTypeId = resourceOnLocalType.getId();
        documentIdLocal = resourceOnLocalType.getDocumentId();
        blockIdLocal = ColabFactory.addBlockToDocument(client, documentIdLocal).getId();

        thirdCardId = ColabFactory.createNewCard(client, theProject).getId();

        activityFlowLink = ColabFactory.createActivityFlowLink(client, cardWithGlobalTypeId,
            cardWithLocalTypeId);

        stickyNoteLink = ColabFactory.createStickyNoteLink(client, cardWithGlobalTypeId,
            thirdCardId);

        role1Id = ColabFactory.createRole(client, theProject, "designer").getId();
        role2Id = ColabFactory.createRole(client, theProject, "developer").getId();

        someTeamMemberId = client.teamRestEndpoint
            .inviteSomeone(theProject.getId(), "dupont@test.albasim.ch").getId();

    }

    /**
     * @return the unpublished global card type id
     */
    public Long getUnpublishedGlobalCardTypeId() {
        return unpublishedGlobalCardTypeId;
    }

    /**
     * @return the published global card type id
     */
    public Long getPublishedGlobalCardTypeId() {
        return publishedGlobalCardTypeId;
    }

    /**
     * @return THE project id
     */
    public Long getProjectId() {
        return theProjectId;
    }

    /**
     * @return the friend project id
     */
    public Long getFriendProjectId() {
        return friendProjectId;
    }

    /**
     * @return another project id
     */
    public Long getAnotherProjectId() {
        return anotherProjectId;
    }

    /**
     * @return the published global card type id
     */
    public Long getGlobalCardTypeId() {
        return publishedGlobalCardTypeId;
    }

    /**
     * @return the published global card type reference id
     */
    public Long getGlobalCardTypeRefId() {
        return publishedGlobalCardTypeRefId;
    }

    /**
     * @return the card with global type id
     */
    public Long getCardWithGlobalTypeId() {
        return cardWithGlobalTypeId;
    }

    /**
     * @return the sub card with global type id
     */
    public Long getSubCardWithGlobalTypeId() {
        return subCardWitchGlobalTypeId;
    }

    /**
     * @return the local card type id
     */
    public Long getLocalCardTypeId() {
        return localCardTypeId;
    }

    /**
     * @return the card with local type id
     */
    public Long getCardWithLocalTypeId() {
        return cardWithLocalTypeId;
    }

    /**
     * @return the sub card with local type id
     */
    public Long getSubCardWithLocalTypeId() {
        return subCardWithSameLocalTypeId;
    }

    /**
     * @return the friend card type id
     */
    public Long getFriendCardTypeId() {
        return friendCardTypeId;
    }

    /**
     * @return the friend card type reference id
     */
    public Long getFriendCardTypeRefId() {
        return friendCardTypeRefId;
    }

    /**
     * @return the card with friend type id
     */
    public Long getCardWithFriendTypeId() {
        return cardWithFriendTypeId;
    }

    /**
     * @return the sub card with friend type id
     */
    public Long getSubCardWithFriendTypeId() {
        return subCardWithSameFriendTypeId;
    }

    /**
     * @return a card id
     */
    public Long getCardId() {
        return cardWithLocalTypeId;
    }

    /**
     * @return a card content id
     */
    public Long getCardContentId() {
        return cardContentWithLocalTypeId;
    }

    /**
     * @return a sub card of the card
     */
    public Long getSubCardId() {
        return subCardWithSameLocalTypeId;
    }

    /**
     * @return a deliverable document
     */
    public Long getDeliverableDocumentId() {
        return deliverableDocumentId;
    }

    /**
     * @return a block of a deliverable document
     */
    public Long getDeliverableBlockId() {
        return deliverableBlockId;
    }



    /**
     * @return the globalCardTypeId
     */
    public Long getSecondCardId() {
        return cardWithLocalTypeId;
    }

    /**
     * @return the thirdCardId
     */
    public Long getThirdCardId() {
        return thirdCardId;
    }

    /**
     * @return the global resource id
     */
    public Long getResourceIdGlobal() {
        return resourceOnGlobalTypeId;
    }

    /**
     * @return the global document id
     */
    public Long getDocumentIdGlobal() {
        return documentIdGlobal;
    }

    /**
     * @return the global block id
     */
    public Long getBlockIdGlobal() {
        return blockIdGlobal;
    }

    /**
     * @return the local resource id
     */
    public Long getResourceIdLocal() {
        return resourceOnLocalTypeId;
    }

    /**
     * @return the local document id
     */
    public Long getDocumentIdLocal() {
        return documentIdLocal;
    }

    /**
     * @return the local block id
     */
    public Long getBlockIdLocal() {
        return blockIdLocal;
    }

    /**
     * @return the resourceId
     */
    public Long getResourceId() {
        return resourceOnGlobalTypeId;
    }

    /**
     * @return the documentId
     */
    public Long getDocumentId() {
        return documentIdGlobal;
    }

    /**
     * @return the blockId
     */
    public Long getBlockId() {
        return blockIdGlobal;
    }

    /**
     * @return the activityFlowLink
     */
    public Long getActivityFlowLink() {
        return activityFlowLink;
    }

    /**
     * @return the stickyNoteLink
     */
    public Long getStickyNoteLink() {
        return stickyNoteLink;
    }

    /**
     * @return a role id
     */
    public Long getRoleId() {
        return role1Id;
    }

    /**
     * @return the role1Id
     */
    public Long getRole1Id() {
        return role1Id;
    }

    /**
     * @return the role2Id
     */
    public Long getRole2Id() {
        return role2Id;
    }

    /**
     * @return the someTeamMemberId
     */
    public Long getSomeTeamMemberId() {
        return someTeamMemberId;
    }

}
