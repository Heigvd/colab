/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.card;

import ch.colabproject.colab.api.controller.card.CardManager;
import ch.colabproject.colab.api.controller.card.grid.GridPosition;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.link.ActivityFlowLink;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.model.team.acl.Assignment;
import ch.colabproject.colab.api.persistence.jpa.card.CardDao;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.List;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
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
     * Save changes to database. Only fields which are editable by users will be
     * impacted.
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
     * @param cardId      the id of the card to move
     * @param newParentId the id of the new parent
     *
     * @throws HttpErrorMessage if card or parent does not exist or if parent is a
     *                          child of the card
     */
    @PUT
    @Path("{cardId: [0-9]+}/MoveTo/{newParentId: [0-9]+}")
    public void moveCard(
            @PathParam("cardId") Long cardId,
            @PathParam("newParentId") Long newParentId) {
        cardManager.moveCard(cardId, newParentId);
    }

    /**
     * Move a card into the parent of its parent
     *
     * @param cardId the id of the card
     *
     * @throws HttpErrorMessage if card or parent of parent does not exist
     */
    @PUT
    @Path("{cardId: [0-9]+}/MoveAbove")
    public void moveCardAbove(@PathParam("cardId") Long cardId) {
        cardManager.moveCardAbove(cardId);
    }

    /**
     * Put the given card in the bin. (= set DeletionStatus to BIN + set erasure
     * tracking data)
     *
     * @param cardId the id of the card
     *
     * @throws HttpErrorMessage if card does not exist
     */
    @PUT
    @Path("{cardId: [0-9]+}/PutInBin")
    public void putCardInBin(@PathParam("cardId") Long cardId) {
        logger.debug("put in bin card #{}", cardId);
        cardManager.putCardInBin(cardId);
    }

    /**
     * Restore from the bin. The object won't contain any deletion or erasure data
     * anymore.
     * <p>
     * It means that the object is back at its place (as much as possible).
     * <p>
     * If the parent card is deleted, the card is moved at the root of the project.
     *
     * @param cardId the id of the card
     *
     * @throws HttpErrorMessage if card does not exist
     */
    @PUT
    @Path("{cardId: [0-9]+}/RestoreFromBin")
    public void restoreCardFromBin(@PathParam("cardId") Long cardId) {
        logger.debug("restore from bin card #{}", cardId);
        cardManager.restoreCardFromBin(cardId);
    }

    /**
     * Set the deletion status to TO_DELETE.
     * <p>
     * It means that the object is only visible in the bin panel.
     *
     * @param cardId the id of the card
     *
     * @throws HttpErrorMessage if card does not exist
     */
    @PUT
    @Path("{cardId: [0-9]+}/MarkAsToDeleteForever")
    public void markCardAsToDeleteForever(@PathParam("cardId") Long cardId) {
        logger.debug("mark card #{} as to delete forever", cardId);
        cardManager.markCardAsToDeleteForever(cardId);
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
     * Retrieve the list of assignments for the given card
     *
     * @param cardId id of the card
     *
     * @return list of assignments
     */
    @GET
    @Path("{cardId: [0-9]+}/assignments")
    public List<Assignment> getAssignments(@PathParam("cardId") Long cardId) {
        logger.debug("Get Card #{} assignments list", cardId);
        return cardManager.getAssignments(cardId);
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
     * Remove the card type of the card. For now, it can be done only if there is no
     * resource in the
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
