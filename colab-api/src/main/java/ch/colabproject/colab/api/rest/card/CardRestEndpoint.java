/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.card;

import ch.colabproject.colab.api.ejb.CardFacade;
import ch.colabproject.colab.api.ejb.ResourceFacade;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.Resource;
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
    private CardFacade cardFacade;

    /**
     * The resource-related logic
     */
    @Inject
    private ResourceFacade resourceFacade;

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
     * @param parentId   id of the new card's parent
     * @param cardTypeId id of the card type of the new card
     *
     * @return the persisted new card
     */
    @POST
    @Path("create/{parentId}/{cardTypeId}")
    public Card createNewCard(@PathParam("parentId") Long parentId,
            @PathParam("cardTypeId") Long cardTypeId) {
        logger.debug("create a new card for the parent #{} and the type #{}", parentId,
            cardTypeId);
        return cardFacade.createNewCard(parentId, cardTypeId);
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
     * Get the available active resources linked to a card
     *
     * @param cardId id of the card
     *
     * @return list of matching resources
     */
    @GET
    @Path("{id}/Resources")
    public List<Resource> getAvailableActiveLinkedResources(@PathParam("id") Long cardId) {
        logger.debug("get available and active resources linked to card #{}", cardId);
        return resourceFacade.getAvailableActiveResourcesLinkedToCard(cardId);
    }

    /**
     * Get all abstract resources directly linked to the card
     *
     * @param cardId the id of the card
     *
     * @return list of directly linked abstract resources
     */
    @GET
    @Path("{id}/AbstractResources")
    public List<AbstractResource> getDirectAbstractResourcesOfCard(@PathParam("id") Long cardId) {
        logger.debug("get direct abstract resources linked to card #{}", cardId);
        return cardFacade.getDirectAbstractResourcesOfCard(cardId);
    }

    /**
     * Get all card content variants of a card
     *
     * @param cardId Card id of the searched content variants
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
