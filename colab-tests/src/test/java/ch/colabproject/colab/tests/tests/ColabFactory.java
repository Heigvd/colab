/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.tests;

import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.token.InvitationToken;
import ch.colabproject.colab.api.model.token.Token;
import ch.colabproject.colab.client.ColabClient;
import ch.colabproject.colab.tests.mailhog.MailhogClient;
import ch.colabproject.colab.tests.mailhog.model.Message;
import java.util.List;
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
     * Create a brand new card type in the given project.
     *
     * @param client    rest client to execute HTTP requests
     * @param projectId id of the project the card type will belongs to. If this id is null the type
     *                  will be a global type
     *
     * @return the CardType
     */
    public static CardType createCardType(ColabClient client, Long projectId) {
        CardType cardType = new CardType();
        cardType.setProjectId(projectId);

        Long cardTypeId = client.cardTypeRestEndpoint.createCardType(cardType);
        return (CardType) client.cardTypeRestEndpoint.getCardType(cardTypeId);
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
     * Retrieve the root cardContent of the given project.
     *
     * @param client  rest client to execute HTTP requests
     * @param project the project to fetch the root content in
     *
     * @return the root card content of project
     */
    public static CardContent getRootContent(ColabClient client, Project project) {
        Card card = client.cardRestEndpoint.getCard(project.getRootCardId());
        List<CardContent> rootCardContents = client.cardRestEndpoint
            .getContentVariantsOfCard(card.getId());

        return rootCardContents.get(0);
    }

    /**
     * <code>host</code> invites <code>guest</code> in the project.
     *
     * @param host         authenticated rest client with write-access on project
     * @param project      the project
     * @param emailAddress email address to send the message to
     * @param guest        authenticated rest client, not yet member of the project
     * @param mailClient   mailhost client to fetch the invitation
     */
    public static void inviteAndJoin(ColabClient host, Project project,
        String emailAddress, ColabClient guest, MailhogClient mailClient
    ) {
        host.projectRestEndpoint.inviteSomeone(project.getId(), emailAddress);
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
    }
}
