/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.card;

import ch.colabproject.colab.api.controller.card.CardContentManager;
import ch.colabproject.colab.api.controller.card.CardManager;
import ch.colabproject.colab.api.controller.card.grid.GridPosition;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.link.ActivityFlowLink;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.model.team.acl.AccessControl;
import ch.colabproject.colab.api.persistence.jpa.card.CardDao;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.generator.model.exceptions.MessageI18nKey;
import java.util.List;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * REST card controller
 *
 * @author sandra
 */
@Path("cards")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@AuthenticationRequired
public class CardRestEndpoint {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(CardRestEndpoint.class);

    /**
     * The card persistence manager
     */
    @Inject
    private CardDao cardDao;

    /**
     * The card-related logic
     */
    @Inject
    private CardManager cardManager;

    /**
     * Card content specific logic management
     */
    @Inject
    private CardContentManager cardContentManager;

    /**
     * Get card identified by the given id
     *
     * @param id id of the card to fetch
     *
     * @return the card or null
     */
    @GET
    @Path("{id: [0-9]+}")
    public Card getCard(@PathParam("id") Long id) {
        logger.debug("get card #{}", id);
        return cardDao.findCard(id);
    }

    /**
     * Create and persist a new card
     *
     * @param parentId id of the new card's parent
     *
     * @return the persisted new card
     */
    @POST
    @Path("create/{parentId: [0-9]+}")
    public Card createNewCardWithoutType(@PathParam("parentId") Long parentId) {
        logger.debug("create a new card for the parent #{} without type", parentId);
        return cardManager.createNewCard(parentId, null);
    }

    /**
     * Create and persist a new card
     *
     * @param parentId   id of the new card's parent
     * @param cardTypeId id of the card type of the new card
     *
     * @return the persisted new card
     */
    @POST
    @Path("create/{parentId: [0-9]+}/{cardTypeId: [0-9]+}")
    public Card createNewCard(@PathParam("parentId") Long parentId,
        @PathParam("cardTypeId") Long cardTypeId) {
        logger.debug("create a new card for the parent #{} and the type #{}", parentId,
            cardTypeId);
        return cardManager.createNewCard(parentId, cardTypeId);
    }

    /**
     * Create and persist a new card
     *
     * @param parentId id of the new card's parent
     * @param document deliverable of the new card content
     *
     * @return the persisted new card
     */
    @POST
    @Path("createWithDeliverable/{parentId: [0-9]+}")
    public Card createNewCardWithDeliverableWithoutType(@PathParam("parentId") Long parentId,
        Document document) {
        logger.debug("create a new card in the parent #{} without type with the deliverable {}",
            parentId, document);
        Card card = cardManager.createNewCard(parentId, null);

        List<CardContent> variants = card.getContentVariants();
        if (variants != null && variants.size() == 1 && variants.get(0) != null) {
            cardContentManager.addDeliverable(variants.get(0).getId(), document);
        } else {
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }

        return card;
    }

    /**
     * Create and persist a new card
     *
     * @param parentId   id of the new card's parent
     * @param cardTypeId id of the card type of the new card
     * @param document   deliverable of the new card content
     *
     * @return the persisted new card
     */
    @POST
    @Path("createWithDeliverable/{parentId: [0-9]+}/{cardTypeId: [0-9]+}")
    public Card createNewCardWithDeliverable(@PathParam("parentId") Long parentId,
        @PathParam("cardTypeId") Long cardTypeId, Document document) {
        logger.debug("create a new card in the parent #{} for the type #{} with the deliverable {}",
            parentId, cardTypeId, document);
        Card card = cardManager.createNewCard(parentId, cardTypeId);

        List<CardContent> variants = card.getContentVariants();
        if (variants != null && variants.size() == 1 && variants.get(0) != null) {
            cardContentManager.addDeliverable(variants.get(0).getId(), document);
        } else {
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }

        return card;
    }

    /**
     * Save changes to database. Only fields which are editable by users will be impacted.
     *
     * @param card card to update
     *
     * @throws ColabMergeException if the merge is not possible
     */
    @PUT
    public void updateCard(Card card) throws ColabMergeException {
        logger.debug("update card {}", card);
        cardDao.updateCard(card);
    }

    /**
     * Change the position of the card (stay in the same parent)
     * <p>
     * Recompute the position of all the sister cards
     *
     * @param cardId   the id of the card
     * @param position the new position of the card
     */
    @PUT
    @Path("{cardId: [0-9]+}/changePosition")
    public void changeCardPosition(@PathParam("cardId") Long cardId, GridPosition position) {
        cardManager.changeCardPosition(cardId, position);
    }

    /**
     * Move a card to a new parent
     *
     * @param cardId      id of the card to move
     * @param newParentId id of the new parent
     *
     * @throws HttpErrorMessage if card or parent does not exist or if parent if a child of the card
     */
    @PUT
    @Path("{cardId: [0-9]+}/MoveTo/{newParentId: [0-9]+}")
    public void moveCard(
        @PathParam("cardId") Long cardId,
        @PathParam("newParentId") Long newParentId) {
        cardManager.moveCard(cardId, newParentId);
    }

    /**
     * Permanently delete a card
     *
     * @param id id of the card to delete
     */
    @DELETE
    @Path("{id: [0-9]+}")
    public void deleteCard(@PathParam("id") Long id) {
        logger.debug("delete card #{}", id);
        cardManager.deleteCard(id);
    }

    /**
     * Get all card content variants of a card
     *
     * @param cardId Card id of the searched content variants
     *
     * @return list of card contents
     */
    @GET
    @Path("{id: [0-9]+}/CardContents")
    public List<CardContent> getContentVariantsOfCard(@PathParam("id") Long cardId) {
        logger.debug("Get card #{} content variants", cardId);
        return cardManager.getContentVariants(cardId);
    }

    /**
     * Get all sticky note links of which the card is the destination
     *
     * @param cardId Card id of the searched links
     *
     * @return list of links
     */
    @GET
    @Path("{id: [0-9]+}/StickyNoteLinksDestinationCard")
    public List<StickyNoteLink> getStickyNoteLinksAsDest(@PathParam("id") Long cardId) {
        logger.debug("Get sticky note links to card #{} as destination", cardId);
        return cardManager.getStickyNoteLinkAsDest(cardId);
    }

    /**
     * Get all sticky note links of which the card is the source
     *
     * @param cardId Card id of the searched links
     *
     * @return list of links
     */
    @GET
    @Path("{id: [0-9]+}/StickyNoteLinksSrcCard")
    public List<StickyNoteLink> getStickyNoteLinksAsSrc(@PathParam("id") Long cardId) {
        logger.debug("Get sticky note links to card #{} as source", cardId);
        return cardManager.getStickyNoteLinkAsSrcCard(cardId);
    }

    /**
     * Get all activity flow links of which the card is the previous one
     *
     * @param cardId Card id of the searched links
     *
     * @return list of links
     */
    @GET
    @Path("{id: [0-9]+}/ActivityFlowLinksPreviousCard")
    public List<ActivityFlowLink> getActivityFlowLinksAsPrevious(@PathParam("id") Long cardId) {
        logger.debug("Get activity flow links to card #{} as previous", cardId);
        return cardManager.getActivityFlowLinkAsPrevious(cardId);
    }

    /**
     * Get all activity flow links of which the card is the next one
     *
     * @param cardId Card id of the searched links
     *
     * @return list of links
     */
    @GET
    @Path("{id: [0-9]+}/ActivityFlowLinksNextCard")
    public List<ActivityFlowLink> getActivityFlowLinksAsNext(@PathParam("id") Long cardId) {
        logger.debug("Get activity flow links to card #{} as next", cardId);
        return cardManager.getActivityFlowLinkAsNext(cardId);
    }

    /**
     * Retrieve the list of access-control for the given card
     *
     * @param cardId id of the card
     *
     * @return list of access-control
     */
    @GET
    @Path("{cardId: [0-9]+}/ACLs")
    public List<AccessControl> getAcls(@PathParam("cardId") Long cardId) {
        logger.debug("Get Card #{} access-control list", cardId);
        return cardManager.getAcls(cardId);
    }

    /**
     * @param cardId the card id
     */
    @POST
    @Path("createCardType/{cardId: [0-9]+}")
    public void createCardType(@PathParam("cardId") Long cardId) {
        cardManager.createCardType(cardId);
    }

    /**
     * Remove the card type of the card. For now, it can be done only if there is no resource in the
     * card type.
     *
     * @param cardId the card id
     */
    @POST
    @Path("removeCardType/{cardId: [0-9]+}")
    public void removeCardType(@PathParam("cardId") Long cardId) {
        cardManager.removeCardType(cardId);
    }
}
