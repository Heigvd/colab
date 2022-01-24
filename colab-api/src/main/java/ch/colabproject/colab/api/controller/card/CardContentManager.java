/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.card;

import ch.colabproject.colab.api.controller.document.DocumentManager;
import ch.colabproject.colab.api.controller.document.ResourceReferenceSpreadingHelper;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.card.CardContentStatus;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.persistence.jpa.card.CardContentDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.List;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Card content specific logic
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class CardContentManager {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(CardContentManager.class);

    /**
     * Minimal completion level
     */
    private static final int MIN_COMPLETION_LEVEL = 0;

    /**
     * Maximal completion level
     */
    private static final int MAX_COMPLETION_LEVEL = 100;

    /**
     * Initial card status
     */
    private static final CardContentStatus CARD_CONTENT_INITIAL_STATUS = CardContentStatus.ACTIVE;

    // *********************************************************************************************
    // injections
    // *********************************************************************************************

    /**
     * Card content persistence handler
     */
    @Inject
    private CardContentDao cardContentDao;

    /**
     * Card specific logic management
     */
    @Inject
    private CardManager cardManager;

    /**
     * Document specific logic management
     */
    @Inject
    private DocumentManager documentManager;

    // *********************************************************************************************
    // find card contents
    // *********************************************************************************************

    /**
     * Retrieve the card content. If not found, throw a {@link HttpErrorMessage}.
     *
     * @param cardContentId the id of the card content
     *
     * @return the card content if found
     *
     * @throws HttpErrorMessage if the card content was not found
     */
    public CardContent assertAndGetCardContent(Long cardContentId) {
        CardContent cardContent = cardContentDao.getCardContent(cardContentId);

        if (cardContent == null) {
            logger.error("card content #{} not found", cardContentId);
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return cardContent;
    }

    // *********************************************************************************************
    // life cycle
    // *********************************************************************************************

    /**
     * Complete and persist a new card content variant for the given card.
     * <p>
     * Also create its default resource references.
     *
     * @param cardId the id of the card needing a new card content variant
     *
     * @return a new, initialized and persisted card content
     */
    public CardContent createNewCardContent(Long cardId) {
        logger.debug("create a new card content for the card #{}", cardId);

        Card card = cardManager.assertAndGetCard(cardId);

        CardContent cardContent = initNewCardContentForCard(card);

        ResourceReferenceSpreadingHelper.extractReferencesFromUp(cardContent);

        return cardContentDao.createCardContent(cardContent);
    }

    /**
     * Initialize a new card content which will be a content of the given card.
     *
     * @param card the card needing a new card content
     *
     * @return a new, initialized card content (just the object, no persistence)
     */
    public CardContent initNewCardContentForCard(Card card) {
        CardContent cardContent = new CardContent();

        cardContent.setStatus(CARD_CONTENT_INITIAL_STATUS);
        cardContent.setCompletionLevel(MIN_COMPLETION_LEVEL);

        cardContent.setCard(card);
        card.getContentVariants().add(cardContent);

        return cardContent;
    }

    /**
     * Delete the given card content
     *
     * @param cardContentId the id of the card content to delete
     *
     * @return the freshly deleted card content
     */
    public CardContent deleteCardContent(Long cardContentId) {
        CardContent cardContent = assertAndGetCardContent(cardContentId);

        if (!checkDeletionAcceptability(cardContent)) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        cardContent.getCard().getContentVariants().remove(cardContent);

        return cardContentDao.deleteCardContent(cardContentId);
    }

    /**
     * Ascertain that the card content can be deleted.
     *
     * @param cardContent the card content to check for deletion
     *
     * @return True iff it can be safely deleted
     */
    private boolean checkDeletionAcceptability(CardContent cardContent) {
        // A card must have at least one card content
        if (cardContent.getCard().getContentVariants().size() == 1) {
            return false;
        }

        return true;
    }

    // *********************************************************************************************
    // add a deliverable to a card content
    // *********************************************************************************************

    /**
     * Add the deliverable to the card content
     *
     * @param cardContentId the id of the card content
     * @param document      the document to use as deliverable. It must be a new document
     *
     * @return the newly created document
     */
    public Document addDeliverable(Long cardContentId, Document document) {
        logger.debug("add deliverable {} to card content #{}", document, cardContentId);

        CardContent cardContent = assertAndGetCardContent(cardContentId);

        if (document == null) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        if (document.hasResource() || document.hasOwningCardContent()) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        if (cardContent.getDeliverables().contains(document)) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        cardContent.setDeliverable(document);// kept temporarily for backward compatibility
        document.setDeliverableCardContent(cardContent);// kept temporarily for backward compatibility
        cardContent.getDeliverables().add(document);
        document.setOwningCardContent(cardContent);

        return documentManager.persistDocument(document);
    }

    // *********************************************************************************************
    // retrieve the elements of a card content
    // *********************************************************************************************

    /**
     * Get all sub cards of a given card content
     *
     * @param cardContentId the id of the card content
     *
     * @return all cards of the card content
     */
    public List<Card> getSubCards(Long cardContentId) {
        logger.debug("get all sub cards of card content #{}", cardContentId);

        CardContent cardContent = assertAndGetCardContent(cardContentId);

        return cardContent.getSubCards();
    }

    /**
     * Get the deliverables of the card content
     *
     * @param cardContentId the id of the card content
     *
     * @return the deliverables linked to the card content
     */
    public List<Document> getDeliverablesOfCardContent(Long cardContentId) {
        logger.debug("get deliverables of card content #{}", cardContentId);

        CardContent cardContent = assertAndGetCardContent(cardContentId);

        return cardContent.getDeliverables();
    }

    /**
     * Get all sticky note links whose source is the given card content
     *
     * @param cardContentId the id of the card content
     *
     * @return all sticky note links linked to the card content
     */
    public List<StickyNoteLink> getStickyNoteLinkAsSrcCardContent(Long cardContentId) {
        logger.debug("get sticky note links where the card content #{} is the source",
            cardContentId);

        CardContent cardContent = assertAndGetCardContent(cardContentId);

        return cardContent.getStickyNoteLinksAsSrc();
    }

    // *********************************************************************************************
    // dedicated to access control
    // *********************************************************************************************

    // *********************************************************************************************
    // integrity check
    // *********************************************************************************************

    /**
     * Check the integrity of the project
     *
     * @param cardContent the card content to check
     *
     * @return true iff the card content is complete and safe
     */
    public boolean checkIntegrity(CardContent cardContent) {
        if (cardContent == null) {
            return false;
        }

        if (cardContent.getCard() == null) {
            return false;
        }

        if (cardContent.getCompletionLevel() < MIN_COMPLETION_LEVEL) {
            return false;
        }

        if (cardContent.getCompletionLevel() > MAX_COMPLETION_LEVEL) {
            return false;
        }

        return true;
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************
}
