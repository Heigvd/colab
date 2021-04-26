/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.card.CardContentStatus;
import ch.colabproject.colab.api.model.card.CardDef;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.persistence.card.CardContentDao;
import ch.colabproject.colab.api.persistence.card.CardDao;
import ch.colabproject.colab.api.persistence.card.CardDefDao;
import ch.colabproject.colab.api.persistence.project.ProjectDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Card, card def and card content specific logic
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class CardFacade {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(CardFacade.class);

    /**
     * Minimal completion level
     */
    private static final int MIN_COMPLETION_LEVEL = 0;

    /**
     * Initial card status
     */
    private static final CardContentStatus CARD_CONTENT_INITIAL_STATUS = CardContentStatus.ACTIVE;

    // *********************************************************************************************
    // injections
    // *********************************************************************************************

    /**
     * Card definition persistence handling
     */
    @Inject
    private CardDefDao cardDefDao;

    /**
     * Card persistence
     */
    @Inject
    private CardDao cardDao;

    /**
     * Card content persistence handling
     */
    @Inject
    private CardContentDao cardContentDao;

    /**
     * Project persistence handling
     */
    @Inject
    private ProjectDao projectDao;

    /**
     * To check access rights
     */
    @Inject
    private SecurityFacade securityFacade;

    // *********************************************************************************************
    // card definition stuff
    // *********************************************************************************************

    /**
     * Create a new card definition for the project
     *
     * @param projectId id of the project the card definition belongs to
     *
     * @return a new, persisted card definition
     */
    public CardDef createNewCardDef(Long projectId) {
        logger.debug("create a new card def in the project #{}", projectId);

        Project project = projectDao.getProject(projectId);
        if (project == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
        securityFacade.assertCanCreateCardDef(project);

        CardDef cardDef = initNewCardDef();
        cardDef.setProject(project);
        cardDefDao.createCardDef(cardDef);

        project.getElementsToBeDefined().add(cardDef);

        return cardDef;
    }

    /**
     * @return a new card definition initialized object
     */
    private CardDef initNewCardDef() {
        CardDef cardDef = new CardDef();

        // see if uniqueId must be initialized

        return cardDef;
    }

    // *********************************************************************************************
    // card stuff
    // *********************************************************************************************

    /**
     * Initialize a new root card. This card contains every other cards of a
     * project.
     * <p>
     * No persistence stuff in there
     *
     * @return a new card dedicated to be the root card of a project
     */
    public Card initNewRootCard() {
        logger.debug("initialize a new root card");

        Card rootCard = initNewCard();
        rootCard.setIndex(0);

        return rootCard;
    }

    /**
     * Create a new card into a card content with a card definition
     *
     * @param parentId parent id of the new card
     * @param cardDefinitionId card definition id of the new card
     *
     * @return a new, initialized and persisted card
     */
    public Card createNewCard(Long parentId, Long cardDefinitionId) {
        logger.debug("create a new sub card of #{} with the definition of #{}", parentId,
                cardDefinitionId);

        CardContent parent = cardContentDao.getCardContent(parentId);
        if (parent == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        CardDef cardDefinition = cardDefDao.getCardDef(cardDefinitionId);
        if (cardDefinition == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        securityFacade.assertCanCreateCard(parent, cardDefinition);

        Card card = initNewCard(parent, cardDefinition);

        return cardDao.createCard(card);
    }

    /**
     * @param parent Parent of the new card
     * @param cardDefinition Related card definition
     *
     * @return a new card containing a new card content with cardDefinition
     */
    private Card initNewCard(CardContent parent, CardDef cardDefinition) {
        Card card = initNewCard();

        card.setParent(parent);
        parent.getSubCards().add(card);

        card.setCardDefinition(cardDefinition);

        return card;
    }

    /**
     * @return a new card containing a new card content
     */
    private Card initNewCard() {
        Card card = new Card();

        initNewCardContent(card);

        return card;
    }

    // *********************************************************************************************
    // card content stuff
    // *********************************************************************************************

    /**
     * Create a new card content variant for the card
     *
     * @param cardId id of the card needing a new card content variant
     *
     * @return a new, initialized and persisted card content
     */
    public CardContent createNewCardContent(Long cardId) {
        logger.debug("create a new card content for the card #{}", cardId);

        Card card = cardDao.getCard(cardId);
        if (card == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
        securityFacade.assertCanCreateCardContent(card);

        CardContent cardContent = initNewCardContent(card);

        return cardContentDao.createCardContent(cardContent);
    }

    /**
     * @param card the card needing a new card content
     *
     * @return a new, initialized card content
     */
    private CardContent initNewCardContent(Card card) {
        CardContent cardContent = new CardContent();
        cardContent.setStatus(CARD_CONTENT_INITIAL_STATUS);
        cardContent.setCompletionLevel(MIN_COMPLETION_LEVEL);
        cardContent.setCard(card);
        card.getContentVariants().add(cardContent);
        return cardContent;
    }

}
