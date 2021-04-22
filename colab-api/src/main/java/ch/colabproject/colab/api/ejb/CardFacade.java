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
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Card specific logic
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
    static final int MIN_COMPLETION_LEVEL = 0;
    /**
     * Maximal completion level
     */
    static final int MAX_COMPLETION_LEVEL = 100;

    /**
     * Initial card status
     */
    static final CardContentStatus CARD_CONTENT_INITIAL_STATUS = CardContentStatus.ACTIVE;

    // *********************************************************************************************
    // injections
    // *********************************************************************************************

    /**
     * Card definition persistence
     */
    @Inject
    private CardDefDao cardDefDao;

    /**
     * Card persistence
     */
    @Inject
    private CardDao cardDao;

    /**
     * Card content persistence
     */
    @Inject
    private CardContentDao cardContentDao;

    // *********************************************************************************************
    // card definition stuff
    // *********************************************************************************************

    /**
     * Create a new card definition for the project
     *
     * @param project the project the card definition belongs to
     * @return a new, persisted card definition
     */
    public CardDef createNewCardDef(final Project project) {
        logger.debug("create a new card def in the project {}", project);
        CardDef cardDef = this.initNewCardDef();
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
        Card rootCard = this.initNewCard();
        rootCard.setIndex(0);
        return rootCard;
    }

    /**
     * Create a new sub card into a card content with a card definition
     *
     * @param parent Parent of the new card
     * @param cardDefinition Card definition of the new card
     * @return a new, initialized and persisted card
     */
    public Card createNewSubCard(final CardContent parent, final CardDef cardDefinition) {
        logger.debug("create a new sub card of {} with the definition of {}", parent,
                cardDefinition);
        Card card = this.initNewCard(parent, cardDefinition);
        cardDao.createCard(card);
        return card;
    }

    /**
     * @param parent Parent of the new card
     * @param cardDefinition Related card definition
     * @return a new card containing a new card content with cardDefinition
     */
    private Card initNewCard(final CardContent parent, final CardDef cardDefinition) {
        Card card = this.initNewCard();

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
        CardContent cardContent = this.initNewCardContent(card);
        card.getContentVariants().add(cardContent);
        return card;
    }

    // *********************************************************************************************
    // card content stuff
    // *********************************************************************************************

    /**
     * Create a new card content variant for the card
     *
     * @param card the card needing a new card content variant
     * @return a new, initialized and persisted card content
     */
    public CardContent createNewCardContent(final Card card) {
        logger.debug("create a new card content for the card {}", card);
        CardContent cardContent = this.initNewCardContent(card);
        return cardContentDao.createCardContent(cardContent);
    }

    /**
     * @param card the card needing a new card content
     * @return a new, initialized card content
     */
    private CardContent initNewCardContent(final Card card) {
        CardContent cardContent = new CardContent();
        cardContent.setStatus(CARD_CONTENT_INITIAL_STATUS);
        cardContent.setCompletionLevel(MIN_COMPLETION_LEVEL);
        cardContent.setCard(card);
        card.getContentVariants().add(cardContent);
        return cardContent;
    }
}
