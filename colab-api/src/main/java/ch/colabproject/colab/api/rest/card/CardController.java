/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.card;

import ch.colabproject.colab.api.ejb.CardFacade;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.persistence.card.CardDao;
import ch.colabproject.colab.generator.model.annotations.AdminResource;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
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
public class CardController {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(CardController.class);

    /**
     * The card persistence manager
     */
    @Inject
    private CardDao cardDao;

    /**
     * The card-related logic
     */
    @Inject
    private CardFacade cardFacade;

    /**
     * Retrieve the list of all cards. This is available to admin only
     *
     * @return all known cards
     */
    // FIXME sandra - It certainly has no reason to be called so (except for
    // preliminary tests)
    // To remove or change at the right moment
    @GET
    @AdminResource
    public List<Card> getAllCards() {
        logger.debug("get all cards");
        return cardDao.getAllCard();
    }

    /**
     * Get card identified by the given id
     *
     * @param id id of the card to fetch
     *
     * @return the card or null
     */
    @GET
    @Path("{id}")
    public Card getCard(@PathParam("id") Long id) {
        logger.debug("get card #{}", id);
        return cardDao.getCard(id);
    }

    /**
     * Persist the card
     *
     * @param card the card to persist
     *
     * @return id of the persisted new card
     *
     * @deprecated a priori there will be no need to directly create a card
     */
    @Deprecated
    @POST
    public Long createCard(Card card) {
        logger.debug("create card {}", card);
        return cardDao.createCard(card).getId();
    }

    /**
     * Create and persist a new card
     *
     * @param parentId id of the new card's parent
     * @param cardDefinitionId id of the card definition of the new card
     *
     * @return the persisted new card
     */
    @POST
    @Path("create/{parentId}/{cardDefId}")
    public Card createNewCard(@PathParam("parentId") Long parentId,
            @PathParam("cardDefId") Long cardDefinitionId) {
        logger.debug("create a new card for the parent #{} and the definition #{}", parentId,
                cardDefinitionId);
        return cardFacade.createNewCard(parentId, cardDefinitionId);
    }

    /**
     * Save changes to database
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
     * Permanently delete a card
     *
     * @param id id of the card to delete
     */
    @DELETE
    @Path("{id}")
    public void deleteCard(@PathParam("id") Long id) {
        logger.debug("delete card #{}", id);
        cardDao.deleteCard(id);
    }

    /**
     * Get all card content variants of a card
     *
     * @param cardId Card of the searched content variants
     *
     * @return list of card contents
     */
    @GET
    @Path("{id}/CardContents")
    public List<CardContent> getContentVariantsOfCard(@PathParam("id") Long cardId) {
        logger.debug("Get card #{} content variants", cardId);
        return cardFacade.getContentVariants(cardId);
    }

}
