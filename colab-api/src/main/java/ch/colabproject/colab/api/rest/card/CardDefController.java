/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.card;

import ch.colabproject.colab.api.ejb.CardFacade;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.card.CardDef;
import ch.colabproject.colab.api.persistence.card.CardDefDao;
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
@Path("cardDefs")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@AuthenticationRequired
public class CardDefController {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(CardDefController.class);

    /**
     * The card definition persistence manager
     */
    @Inject
    private CardDefDao cardDefDao;

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
    public List<CardDef> getAllCardDefs() {
        logger.debug("get all card defs");
        return cardDefDao.getAllCardDef();
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
    public CardDef getCardDef(@PathParam("id") Long id) {
        logger.debug("get card def #{}", id);
        return cardDefDao.getCardDef(id);
    }

    /**
     * Persist the card definition
     *
     * @param cardDef the card definition to persist
     *
     * @return id of the persisted new card definition
     *
     * @deprecated a priori there will be no need to directly create a card
     *             definition
     */
    @Deprecated
    @POST
    public Long createCardDef(CardDef cardDef) {
        logger.debug("create card def {}", cardDef);
        return cardDefDao.createCardDef(cardDef).getId();
    }

    /**
     * Create and persist a new card definition
     *
     * @param projectId the project the new card definition belongs to
     *
     * @return the persisted new card definition
     */
    @POST
    @Path("create/{projectId}")
    public CardDef createNewCardDef(@PathParam("projectId") Long projectId) {
        logger.debug("create new card def for the project #{}", projectId);
        return facade.createNewCardDef(projectId);
    }

    /**
     * Save changes to database
     *
     * @param cardDef card def to update
     *
     * @throws ColabMergeException if the merge is not possible
     */
    @PUT
    public void updateCardDef(CardDef cardDef) throws ColabMergeException {
        logger.debug("update card def {}", cardDef);
        cardDefDao.updateCardDef(cardDef);
    }

    /**
     * Permanently delete a card def
     *
     * @param id id of the card def to delete
     */
    @DELETE
    @Path("{id}")
    public void deleteCardDef(@PathParam("id") Long id) {
        logger.debug("delete card def #{}", id);
        cardDefDao.deleteCardDef(id);
    }

}
