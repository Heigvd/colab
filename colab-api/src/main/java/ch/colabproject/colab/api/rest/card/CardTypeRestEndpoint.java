/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.card;

import ch.colabproject.colab.api.ejb.CardFacade;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.persistence.card.CardTypeDao;
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
 * REST card def controller
 *
 * @author sandra
 */
// TODO will need access to a unique id generator
@Path("cardTypes")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@AuthenticationRequired
public class CardTypeRestEndpoint {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(CardTypeRestEndpoint.class);

    /**
     * The card definition persistence manager
     */
    @Inject
    private CardTypeDao cardTypeDao;

    /**
     * The card-related logic
     */
    @Inject
    private CardFacade facade;

    /**
     * Retrieve the list of all card defs. This is available to admin only
     *
     * @return all known card defs
     */
    @GET
    @AdminResource
    public List<CardType> getAllCardTypes() {
        logger.debug("get all card defs");
        return cardTypeDao.getAllCardType();
    }

    /**
     * Retrieve the list of all global card types. This is available to admin only
     *
     * @return all known global card types
     */
    @GET
    @Path("allGlobals")
    @AdminResource
    public List<CardType> getAllGlobalCardTypes() {
        logger.debug("get all global card defs");
        return cardTypeDao.getGlobalCardType();
    }

    /**
     * Retrieve the list of public global card types.
     *
     * @return all published global types
     */
    @GET
    @Path("publishedGlobals")
    public List<CardType> getPublishedGlobalsCardTypes() {
        logger.debug("get published global card defs");
        return cardTypeDao.getPublishedGlobalCardType();
    }


    /**
     * Retrieve the list of published card types accessible to current user.
     * It means all the published types of project the current user is member of.
     *
     * @return all published card types
     */
    @GET
    @Path("allProjectsPublished")
    public List<CardType> getPublishedCardTypes() {
        logger.debug("get published projects card defs");
        return cardTypeDao.getPublishedProjectsCardType();
    }

    /**
     * Get card def identified by the given id
     *
     * @param id id of the card def to fetch
     *
     * @return the card def or null
     */
    @GET
    @Path("{id}")
    public CardType getCardType(@PathParam("id") Long id) {
        logger.debug("get card def #{}", id);
        return cardTypeDao.getCardType(id);
    }

    /**
     * Persist a card type.
     *
     * @param cardType the card definition to persist
     *
     * @return id of the persisted new card definition
     */
    @POST
    public Long createCardType(CardType cardType) {
        logger.debug("create card def {}", cardType);
        return facade.createNewCardType(cardType).getId();
    }

    /**
     * Create and persist a new card type. The card type belongs to the given project.
     *
     * @param projectId the project the new card definition belongs to
     *
     * @return the persisted new card definition
    @POST
    @Path("create/{projectId}")
    public CardType createNewCardType(@PathParam("projectId") Long projectId) {
        logger.debug("create new card def for the project #{}", projectId);
        return facade.createNewCardType(projectId);
    }
     */

    /**
     * Save changes to database
     *
     * @param cardType card def to update
     *
     * @throws ColabMergeException if the merge is not possible
     */
    @PUT
    public void updateCardType(CardType cardType) throws ColabMergeException {
        logger.debug("update card def {}", cardType);
        cardTypeDao.updateCardType(cardType);
    }

    /**
     * Permanently delete a card def
     *
     * @param id id of the card def to delete
     */
    @DELETE
    @Path("{id}")
    public void deleteCardType(@PathParam("id") Long id) {
        logger.debug("delete card def #{}", id);
        cardTypeDao.deleteCardType(id);
    }

}
