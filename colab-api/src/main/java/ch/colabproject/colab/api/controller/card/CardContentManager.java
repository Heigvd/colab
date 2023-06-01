/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.card;

import ch.colabproject.colab.api.controller.document.DocumentManager;
import ch.colabproject.colab.api.controller.document.IndexGeneratorHelper;
import ch.colabproject.colab.api.controller.document.RelatedPosition;
import ch.colabproject.colab.api.controller.document.ResourceReferenceSpreadingHelper;
import ch.colabproject.colab.api.controller.security.SecurityManager;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.card.CardContentStatus;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.persistence.jpa.card.CardContentDao;
import ch.colabproject.colab.api.persistence.jpa.document.DocumentDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.generator.model.exceptions.MessageI18nKey;
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
    private static final CardContentStatus CARD_CONTENT_INITIAL_STATUS = null;

    /**
     * Default value for frozen status
     */
    private static final boolean FROZEN_DEFAULT = false;

    // *********************************************************************************************
    // injections
    // *********************************************************************************************

    /**
     * Card content persistence handler
     */
    @Inject
    private CardContentDao cardContentDao;

    /**
     * Document persistence handling
     */
    @Inject
    private DocumentDao documentDao;

    /**
     * Document specific logic
     */
    @Inject
    private DocumentManager documentManager;

    /**
     * Card specific logic management
     */
    @Inject
    private CardManager cardManager;

    /**
     * Index generation specific logic management
     */
    @Inject
    private IndexGeneratorHelper<Document> indexGenerator;

    /**
     * Resource reference spreading specific logic handling
     */
    @Inject
    private ResourceReferenceSpreadingHelper resourceReferenceSpreadingHelper;
    
    /**
     * Access control manager
     */
    @Inject
    private SecurityManager securityManager;

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
        CardContent cardContent = cardContentDao.findCardContent(cardContentId);

        if (cardContent == null) {
            logger.error("card content #{} not found", cardContentId);
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_NOT_FOUND);
        }

        return cardContent;
    }
    
        /**
     * Get the card content identified by the given id
     *
     * @param id id of the card to access
     * 
     * @throws HttpErrorMessage if the document was not found or access denied
     */
    public void assertCardContentReadWrite(Long id) {
        logger.debug("get document #{}", id);
        CardContent cardContent = assertAndGetCardContent(id);
        if (cardContent == null) {
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_NOT_FOUND);
        }
        securityManager.assertUpdatePermissionTx(cardContent);
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

        resourceReferenceSpreadingHelper.extractReferencesFromUp(cardContent);

        return cardContentDao.persistCardContent(cardContent);
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

        resetProgression(cardContent);

        cardContent.setCard(card);
        card.getContentVariants().add(cardContent);

        return cardContent;
    }

    /**
     * Reset progression data of the given card content : status, completion level
     * and frozen
     *
     * @param cardContent the card content
     */
    public void resetProgression(CardContent cardContent) {
        cardContent.setStatus(CARD_CONTENT_INITIAL_STATUS);
        cardContent.setCompletionLevel(MIN_COMPLETION_LEVEL);
        cardContent.setFrozen(FROZEN_DEFAULT);
    }

    /**
     * Delete the given card content
     *
     * @param cardContentId the id of the card content to delete
     */
    public void deleteCardContent(Long cardContentId) {
        CardContent cardContent = assertAndGetCardContent(cardContentId);

        if (!checkDeletionAcceptability(cardContent)) {
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }

        cardContent.getCard().getContentVariants().remove(cardContent);

        cardContentDao.deleteCardContent(cardContent);
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
     * Add the deliverable to the end of the card content.
     *
     * @param cardContentId the id of the card content
     * @param document      the document to use as deliverable. It must be a new
     *                      document
     *
     * @return the newly created document
     */
    public Document addDeliverable(Long cardContentId, Document document) {
        logger.debug("add deliverable {} to card content #{}", document, cardContentId);

        return addDeliverable(cardContentId, document, RelatedPosition.AT_END);
    }

    /**
     * Add the deliverable to the card content. It will be placed on the given
     * relatedPosition.
     *
     * @param cardContentId   the id of the card content
     * @param document        the document to use as deliverable. It must be a new
     *                        document
     * @param relatedPosition to define the place where the deliverable will be
     *                        added in the card
     *                        content
     *
     * @return the newly created document
     */
    public Document addDeliverable(Long cardContentId, Document document,
            RelatedPosition relatedPosition) {
        logger.debug("add deliverable {} {} to card content #{}", document, relatedPosition,
                cardContentId);

        return addDeliverable(cardContentId, document, relatedPosition, null);
    }

    /**
     * Add the deliverable to the card content.
     *
     * @param cardContentId   the id of the card content
     * @param document        the document to use as deliverable. It must be a new
     *                        document
     * @param relatedPosition to define the place where the deliverable will be
     *                        added in the card
     *                        content
     * @param neighbourDocId  the existing document which defines where the new
     *                        document will be
     *                        set. If relatedPosition is BEFOR or AFTER, it must be
     *                        not null
     *
     * @return the newly created document
     */
    public Document addDeliverable(Long cardContentId, Document document,
            RelatedPosition relatedPosition, Long neighbourDocId) {
        logger.debug("add deliverable {} to card content #{} {} doc #{}", document, cardContentId,
                relatedPosition, neighbourDocId);

        CardContent cardContent = assertAndGetCardContent(cardContentId);

        if (document == null) {
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }

        if (document.hasOwningResource() || document.hasOwningCardContent()) {
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }

        if (cardContent.getDeliverables().contains(document)) {
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }

        switch (relatedPosition) {
            case BEFORE:
                Document neighbourBDocument = documentManager.assertAndGetDocument(neighbourDocId);
                indexGenerator.moveItemBefore(document, neighbourBDocument,
                        cardContent.getDeliverables());
                break;
            case AFTER:
                Document neighbourADocument = documentManager.assertAndGetDocument(neighbourDocId);
                indexGenerator.moveItemAfter(document, neighbourADocument,
                        cardContent.getDeliverables());
                break;
            case AT_BEGINNING:
                indexGenerator.moveItemToBeginning(document, cardContent.getDeliverables());
                break;
            case AT_END:
            default:
                indexGenerator.moveItemToEnd(document, cardContent.getDeliverables());
                break;
        }

        cardContent.getDeliverables().add(document);
        document.setOwningCardContent(cardContent);

        return documentDao.persistDocument(document);
    }

    /**
     * Remove the deliverable of the card content.
     *
     * @param cardContentId the id of the card content
     * @param documentId    the id of the document to remove from the card content
     */
    public void removeDeliverable(Long cardContentId, Long documentId) {
        logger.debug("remove deliverable #{} of card content #{}", documentId, cardContentId);

        CardContent cardContent = assertAndGetCardContent(cardContentId);

        Document document = documentManager.assertAndGetDocument(documentId);

        if (!(cardContent.getDeliverables().contains(document))) {
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }

        cardContent.getDeliverables().remove(document);

        documentDao.deleteDocument(document);
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
