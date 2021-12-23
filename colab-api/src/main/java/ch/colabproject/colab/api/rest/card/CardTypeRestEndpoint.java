/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.card;

import ch.colabproject.colab.api.controller.card.CardTypeManager;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.persistence.card.CardTypeDao;
import ch.colabproject.colab.generator.model.annotations.AdminResource;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import java.util.List;
import java.util.Set;
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
 * REST card type controller
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
     * The card type persistence manager
     */
    @Inject
    private CardTypeDao cardTypeDao;

    /**
     * Card type specific logic management
     */
    @Inject
    private CardTypeManager cardTypeManager;

    /**
     * Retrieve the list of all card types. This is available to admin only
     *
     * @return all known card types
     */
    @GET
    @AdminResource
    public List<CardType> getAllCardTypes() {
        logger.debug("get all card types");
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
        logger.debug("get all global card types");
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
        logger.debug("get published global card types");
        return cardTypeDao.getPublishedGlobalCardType();
    }

    /**
     * Retrieve the list of published card types accessible to current user. It means all the
     * published types of project the current user is member of.
     *
     * @return all published card types
     */
    @GET
    @Path("allProjectsPublished")
    public Set<AbstractCardType> getPublishedCardTypes() {
        logger.debug("get published projects card types");
        return cardTypeManager.getExpandedProjectPublishedTypes();
    }

    /**
     * Get card type identified by the given id
     *
     * @param id id of the card type to fetch
     *
     * @return the card type or null
     */
    @GET
    @Path("{id}")
    public AbstractCardType getCardType(@PathParam("id") Long id) {
        logger.debug("get card type #{}", id);
        return cardTypeDao.getAbstractCardType(id);
    }

    /**
     * Persist a card type.
     *
     * @param cardTypeCreationBean Everything need to create the card type
     *
     * @return id of the persisted new card type
     */
    @POST
    public Long createCardType(CardTypeCreationBean cardTypeCreationBean) {
        logger.debug("create card type {}", cardTypeCreationBean);

        CardType cardType = new CardType();
        cardType.setProjectId(cardTypeCreationBean.getProjectId());
        cardType.setTitle(cardTypeCreationBean.getTitle());
        cardType.setPurpose(cardTypeCreationBean.getPurpose());
        cardType.setTags(cardTypeCreationBean.getTags());

        return cardTypeManager.createCardType(cardType).getId();
    }

//    /**
//     * Create and persist a new card type. The card type belongs to the given project.
//     *
//     * @param projectId the project the new card type belongs to
//     *
//     * @return the persisted new card type
//     */
//    @POST
//    @Path("create/{projectId}")
//    public CardType createNewCardType(@PathParam("projectId") Long projectId) {
//        logger.debug("create new card type for the project #{}", projectId);
//        return facade.createNewCardType(projectId);
//    }

    /**
     * Save changes to database
     *
     * @param cardType card type to update
     *
     * @throws ColabMergeException if the merge is not possible
     */
    @PUT
    public void updateCardType(AbstractCardType cardType) throws ColabMergeException {
        logger.debug("update abstract card type {}", cardType);
        cardTypeDao.updateCardType(cardType);
    }

    /**
     * Permanently delete a card type
     *
     * @param id id of the card type to delete
     */
    @DELETE
    @Path("{id}")
    public void deleteCardType(@PathParam("id") Long id) {
        logger.debug("delete card type #{}", id);
        cardTypeManager.deleteCardType(id);
    }

}
