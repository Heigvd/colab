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
import ch.colabproject.colab.api.persistence.card.CardContentDao;
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
 * REST card content controller
 *
 * @author sandra
 */
@Path("cardContents")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@AuthenticationRequired
public class CardContentEndpoint {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(CardContentEndpoint.class);

    /**
     * The card content persistence manager
     */
    @Inject
    private CardContentDao cardContentDao;

    /**
     * The card-related logic
     */
    @Inject
    private CardFacade cardFacade;

    /**
     * Retrieve the list of all card contents. This is available to admin only
     *
     * @return all known card contents
     */
    // FIXME sandra - It certainly has no reason to be called so (except for
    // preliminary tests)
    // To remove or change at the right moment
    @GET
    @AdminResource
    public List<CardContent> getAllCardContents() {
        logger.debug("Get all card contents");
        return cardContentDao.getAllCardContent();
    }

    /**
     * Get card content identified by the given id
     *
     * @param id id of the card content to fetch
     *
     * @return the card content or null
     */
    @GET
    @Path("{id}")
    public CardContent getCardContent(@PathParam("id") Long id) {
        logger.debug("Get card #{}", id);
        return cardContentDao.getCardContent(id);
    }

    /**
     * Persist the card content
     *
     * @param cardContent the card content to persist
     *
     * @return id of the persisted new card content
     *
     * @deprecated a priori there will be no need to directly create a card content
     */
    @Deprecated
    @POST
    public Long createCardContent(CardContent cardContent) {
        logger.debug("Create card content {}", cardContent);
        return cardContentDao.createCardContent(cardContent).getId();
    }

    /**
     * Create and persist a new card content
     *
     * @param cardId id of the new card content's parent
     *
     * @return the persisted new card content
     */
    @POST
    @Path("create/{cardId}")
    public CardContent createNewCardContent(@PathParam("cardId") Long cardId) {
        logger.debug("create a new card content for the card #{}", cardId);
        return cardFacade.createNewCardContent(cardId);
    }

    /**
     * Save changes to database
     *
     * @param cardContent card content to update
     *
     * @throws ColabMergeException if the merge is not possible
     */
    @PUT
    public void updateCardContent(CardContent cardContent) throws ColabMergeException {
        logger.debug("Update card content {}", cardContent);
        cardFacade.updateCardContent(cardContent);
    }

    /**
     * Permanently delete a card content
     *
     * @param id id of the card content to delete
     */
    @DELETE
    @Path("{id}")
    public void deleteCardContent(@PathParam("id") Long id) {
        logger.debug("Delete card #{}", id);
        cardContentDao.deleteCardContent(id);
    }

    /**
     * Get all sub cards
     *
     * @param parentId parent of the searched cards
     *
     * @return list of cards
     */
    @GET
    @Path("{id}/Subcards")
    public List<Card> getSubCards(@PathParam("id") Long parentId) {
        logger.debug("Get parent #{} sub cards", parentId);
        return cardFacade.getSubCards(parentId);
    }

}
