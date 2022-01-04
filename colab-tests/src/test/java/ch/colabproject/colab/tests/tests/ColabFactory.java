/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.tests;

import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.model.document.Block;
import ch.colabproject.colab.api.model.document.BlockDocument;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.Resource;
import ch.colabproject.colab.api.model.link.ActivityFlowLink;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.team.TeamRole;
import ch.colabproject.colab.api.model.token.InvitationToken;
import ch.colabproject.colab.api.model.token.Token;
import ch.colabproject.colab.api.rest.card.CardTypeCreationBean;
import ch.colabproject.colab.api.rest.document.ResourceCreationBean;
import ch.colabproject.colab.api.rest.link.StickyNoteLinkCreationBean;
import ch.colabproject.colab.client.ColabClient;
import ch.colabproject.colab.tests.mailhog.MailhogClient;
import ch.colabproject.colab.tests.mailhog.model.Message;
import java.util.HashSet;
import java.util.regex.Matcher;
import org.junit.jupiter.api.Assertions;

/**
 * Some method to create item easily
 *
 * @author maxence
 */
public class ColabFactory {

    private ColabFactory() {
        throw new UnsupportedOperationException(
            "This is a utility class and cannot be instantiated");
    }

    /**
     * Create a brand new global card type.
     *
     * @param client  rest client to execute HTTP requests
     *
     * @return the CardType
     */
    public static CardType createGlobalCardType(ColabClient client) {
        return createCardType(client, (Long) null);
    }

    /**
     * Create a brand new card type in the given project.
     *
     * @param client  rest client to execute HTTP requests
     * @param project the project the card type will belongs to. If the project is null the type
     *                will be a global type
     *
     * @return the CardType
     */
    public static CardType createCardType(ColabClient client, Project project) {
        return createCardType(client, project.getId());
    }

    /**
     * Create a brand new card type in the given project.
     *
     * @param client    rest client to execute HTTP requests
     * @param projectId id of the project the card type will belongs to. If this id is null the type
     *                  will be a global type
     *
     * @return the CardType
     */
    public static CardType createCardType(ColabClient client, Long projectId) {
        CardTypeCreationBean cardTypeToCreate = new CardTypeCreationBean();
        cardTypeToCreate.setProjectId(projectId);
        cardTypeToCreate.setTags(new HashSet<>());

        Long cardTypeId = client.cardTypeRestEndpoint.createCardType(cardTypeToCreate);
        return (CardType) client.cardTypeRestEndpoint.getCardType(cardTypeId);
    }

    /**
     * Create a brand new global card type.
     * <p>
     * The card type is published
     *
     * @param client    rest client to execute HTTP requests
     *
     * @return the CardType
     */
    public static CardType createGlobalPublishedCardType(ColabClient client) {
        CardType cardType = createGlobalCardType(client);
        cardType.setPublished(true);
        client.cardTypeRestEndpoint.updateCardType(cardType);
        return (CardType) client.cardTypeRestEndpoint.getCardType(cardType.getId());
    }

    /**
     * Create a brand new card in the given parent with the given type
     *
     * @param client   rest client to execute HTTP requests
     * @param parent   the card content the card will belong to
     * @param cardType the card type
     *
     * @return the newly created card
     */
    public static Card createNewCard(ColabClient client, CardContent parent,
        AbstractCardType cardType) {
        return client.cardRestEndpoint.createNewCard(parent.getId(), cardType.getId());
    }

    /**
     * Create a brand new card in the given parent with the given type
     *
     * @param client     rest client to execute HTTP requests
     * @param parentId   id of the card content the card will belong to
     * @param cardTypeId id of the card type
     *
     * @return the newly created card
     */
    public static Card createNewCard(ColabClient client, Long parentId, Long cardTypeId) {
        return client.cardRestEndpoint.createNewCard(parentId, cardTypeId);
    }

    /**
     * Create a brand new card in the given project just under the root card and with a new card
     * type
     *
     * @param client  rest client to execute HTTP requests
     * @param project project in which the card is
     *
     * @return the newly created card
     */
    public static Card createNewCard(ColabClient client, Project project) {
        CardType cardType = ColabFactory.createCardType(client, project.getId());
        Long cardTypeId = cardType.getId();

        Long parentId = ColabFactory.getRootContent(client, project).getId();

        return ColabFactory.createNewCard(client, parentId, cardTypeId);
    }

    /**
     * Create a new variant card content for the card
     *
     * @param client rest client to execute HTTP requests
     * @param cardId id of the card of the new variant
     *
     * @return the newly created card content
     */
    public static CardContent createNewCardContent(ColabClient client, Long cardId) {
        return client.cardContentRestEndpoint.createNewCardContent(cardId);
    }

    /**
     * Create a brand new project.
     *
     * @param client rest client to execute HTTP requests
     * @param name   name of the new project
     *
     * @return the new project
     */
    public static Project createProject(ColabClient client, String name) {
        Project p = new Project();
        p.setName(name);
        Long id = client.projectRestEndpoint.createProject(p);
        return client.projectRestEndpoint.getProject(id);
    }

    /**
     * Retrieve the root card of the given project
     *
     * @param client  rest client to execute HTTP requests
     * @param project the project to fetch the root card in
     *
     * @return the root card of project
     */
    public static Card getRootCard(ColabClient client, Project project) {
        return client.projectRestEndpoint.getRootCardOfProject(project.getId());
    }

    /**
     * Retrieve the root cardContent of the given project.
     *
     * @param client  rest client to execute HTTP requests
     * @param project the project to fetch the root content in
     *
     * @return the root card content of project
     */
    public static CardContent getRootContent(ColabClient client, Project project) {
        return getCardContent(client, getRootCard(client, project).getId());
    }

    /**
     * Retrieve the card content of the given card
     *
     * @param client rest client to execute HTTP requests
     * @param cardId the id of the card containing the content
     *
     * @return the card content of the given card
     */
    public static CardContent getCardContent(ColabClient client, Long cardId) {
        return client.cardRestEndpoint.getContentVariantsOfCard(cardId).get(0);
    }

    /**
     * Create a block document deliverable for the given card content
     *
     * @param client        rest client to execute HTTP requests
     * @param cardContentId the id of the card content
     *
     * @return the new document
     */
    public static Document assignNewBlockDocumentDeliverable(ColabClient client,
        Long cardContentId) {

        Document newDoc = new BlockDocument();

        return client.cardContentRestEndpoint.assignDeliverable(cardContentId, newDoc);
    }

    /**
     * Add a new block to a document
     *
     * @param client     rest client to execute HTTP requests
     * @param documentId the id of a block document
     *
     * @return the new block
     */
    public static Block addBlockToDocument(ColabClient client, Long documentId) {
        return client.blockRestEndPoint.createNewTextDataBlock(documentId);
    }

    /**
     * <code>host</code> invites <code>guest</code> in the project.
     *
     * @param host         authenticated rest client with write-access on project
     * @param project      the project
     * @param emailAddress email address to send the message to
     * @param guest        authenticated rest client, not yet member of the project
     * @param mailClient   mailhost client to fetch the invitation
     *
     * @return the brand new team member
     */
    public static TeamMember inviteAndJoin(ColabClient host, Project project,
        String emailAddress, ColabClient guest, MailhogClient mailClient
    ) {
        TeamMember teamMember = host.teamRestEndpoint.inviteSomeone(project.getId(), emailAddress);
        Message invitation = TestHelper.getMessageByRecipient(mailClient, emailAddress).get(0);

        Matcher matcher = TestHelper.extractToken(invitation);

        if (matcher.matches()) {
            Long tokenId = Long.parseLong(matcher.group(1));
            String plainToken = matcher.group(2);

            mailClient.deleteMessage(invitation.getId());

            Token token = guest.tokenRestEndpoint.getToken(tokenId);
            Assertions.assertTrue(token instanceof InvitationToken);
            guest.tokenRestEndpoint.consumeToken(tokenId, plainToken);
        } else {
            Assertions.fail("Failed to parse token");
        }

        return teamMember;
    }

    public static TeamRole createRole(ColabClient client, Project project, String name) {
        TeamRole role = new TeamRole();
        role.setProjectId(project.getId());
        role.setName(name);

        Long roleId = client.teamRestEndpoint.createRole(role);

        return client.teamRestEndpoint.getRole(roleId);
    }

    /**
     * Create a resource block document for a card type for test purpose
     *
     * @param client     rest client to execute HTTP requests
     * @param cardTypeId the id of the card type the resource belongs to
     * @param title      title of the document
     *
     * @return the freshly created document
     */
    public static Resource createCardTypeResourceBlockDoc(ColabClient client, Long cardTypeId,
        String title) {
        ResourceCreationBean resourceToCreate = new ResourceCreationBean();
        resourceToCreate.setTitle(title);
        resourceToCreate.setDocument(new BlockDocument());
        resourceToCreate.setAbstractCardTypeId(cardTypeId);

        Long id = client.resourceRestEndpoint.createResource(resourceToCreate);

        return (Resource) client.resourceRestEndpoint.getAbstractResource(id);
    }

    /**
     * Create a resource block document for test purpose
     *
     * @param client rest client to execute HTTP requests
     * @param cardId the id of the card the resource belongs to
     * @param title  title of the document
     *
     * @return the freshly created document
     */
    public static Resource createCardResource(ColabClient client, Long cardId, String title) {
        ResourceCreationBean resourceToCreate = new ResourceCreationBean();
        resourceToCreate.setTitle(title);
        resourceToCreate.setDocument(new BlockDocument());
        resourceToCreate.setCardId(cardId);

        Long id = client.resourceRestEndpoint.createResource(resourceToCreate);

        return (Resource) client.resourceRestEndpoint.getAbstractResource(id);
    }

    /**
     * Create a sticky note link between two cards
     *
     * @param client            rest client to execute HTTP requests
     * @param srcCardId         the id of the source card
     * @param destinationCardId the id of the destination card
     *
     * @return the id of the created link
     */
    public static Long createStickyNoteLink(ColabClient client, Long srcCardId,
        Long destinationCardId) {
        StickyNoteLinkCreationBean linkToCreate = new StickyNoteLinkCreationBean();
        linkToCreate.setSrcCardId(srcCardId);
        linkToCreate.setDestinationCardId(destinationCardId);

        return client.stickyNoteLinkRestEndpoint.createLink(linkToCreate);
    }

    /**
     * Create an activity flow link between two cards
     *
     * @param client         rest client to execute HTTP requests
     * @param previousCardId the id of the previous card
     * @param nextCardId     the id of the next card
     *
     * @return the id of the created link
     */
    public static Long createActivityFlowLink(ColabClient client, Long previousCardId,
        Long nextCardId) {
        ActivityFlowLink link = new ActivityFlowLink();
        link.setPreviousCardId(previousCardId);
        link.setNextCardId(nextCardId);

        return client.activityFlowLinkRestEndpoint.createLink(link);
    }

}
