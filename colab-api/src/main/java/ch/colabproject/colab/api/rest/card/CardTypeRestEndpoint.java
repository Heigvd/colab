/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.card;

import ch.colabproject.colab.api.controller.card.CardTypeManager;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.persistence.jpa.card.CardTypeDao;
import ch.colabproject.colab.api.rest.card.bean.CardTypeCreationData;
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
     * Retrieve the list of all global card types. This is available to admin only
     *
     * @return all known global card types
     */
    @GET
    @Path("allGlobals")
    @AdminResource
    public List<CardType> getAllGlobalCardTypes() {
        logger.debug("get all global card types");
        return cardTypeDao.findGlobalCardTypes();
    }

    /**
     * Retrieve the list of published global card types.
     *
     * @return all published global types
     */
    @GET
    @Path("allPublishedGlobals")
    public List<CardType> getPublishedGlobalsCardTypes() {
        logger.debug("get published global card types");
        return cardTypeDao.findPublishedGlobalCardTypes();
    }

    /**
     * Retrieve the list of published card types accessible to current user. It means all the
     * published types of project the current user is member of.
     *
     * @return all published card types defined in a project the current user has access to
     */
    @GET
    @Path("allProjectsPublished")
    public Set<AbstractCardType> getPublishedCardTypesOfReachableProjects() {
        logger.debug("get published projects card types");
        return cardTypeManager.getCurrentUserExpandedPublishedProjectTypes();
    }

    /**
     * Retrieve the abstract card type and its chain of targets until the card type.
     *
     * @param id the id of the wanted abstract card type
     *
     * @return the corresponding abstract card type and its target if it is a reference (recursively
     *         until the card type)
     */
    @GET
    @Path("expanded/{id}")
    public List<AbstractCardType> getExpandedCardType(@PathParam("id") Long id) {
        logger.debug("get abstract card type #{} and its target chain", id);
        return cardTypeManager.getExpandedCardType(id);
    }

    // TODO sandra work in progress remove when the tests are changed to getExpandedCardType
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
        return cardTypeDao.findAbstractCardType(id);
    }

    /**
     * Persist a card type.
     *
     * @param cardTypeCreationData Everything need to create the card type
     *
     * @return id of the persisted new card type
     */
    @POST
    public Long createCardType(CardTypeCreationData cardTypeCreationData) {
        logger.debug("create card type {}", cardTypeCreationData);

        CardType cardType = new CardType();
        cardType.setProjectId(cardTypeCreationData.getProjectId());
        cardType.setTitle(cardTypeCreationData.getTitle());
        cardType.setPurpose(cardTypeCreationData.getPurpose());
        cardType.setTags(cardTypeCreationData.getTags());

        if (cardTypeCreationData.getPurpose() != null) {
            cardTypeCreationData.getPurpose().setPurposingCardType(cardType);
        }

        return cardTypeManager.createCardType(cardType).getId();
    }

    /**
     * Save changes to database. Only fields which are editable by users will be impacted.
     *
     * @param cardTypeOrRef the card type or reference to update
     *
     * @throws ColabMergeException if the merge is not possible
     */
    @PUT
    public void updateCardType(AbstractCardType cardTypeOrRef) throws ColabMergeException {
        logger.debug("update abstract card type {}", cardTypeOrRef);
        cardTypeDao.updateCardTypeOrRef(cardTypeOrRef);
    }

    /**
     * Permanently delete a card type
     *
     * @param id the id of the card type to delete
     */
    @DELETE
    @Path("{id}")
    public void deleteCardType(@PathParam("id") Long id) {
        logger.debug("delete card type #{}", id);
        cardTypeManager.deleteCardType(id);
    }

    /**
     * If the card type is not already in the project, create a reference to it. Else simply return
     * the card type.
     *
     * @param cardTypeId the id of the target card type (or reference)
     * @param projectId  the id of the project in which we want to use the card type
     *
     * @return The card type
     */
    @PUT
    @Path("useCardTypeInProject/{cardTypeId}/{projectId}")
    public AbstractCardType useCardTypeInProject(@PathParam("cardTypeId") Long cardTypeId,
        @PathParam("projectId") Long projectId) {
        logger.debug("use card type #{} in project #{}", cardTypeId, projectId);

        return cardTypeManager.useCardTypeInProject(cardTypeId, projectId);
    }

    /**
     * Remove the card type use of the project. That means delete the reference in the project if it
     * has no use. If the abstract card type is used, throws an error.
     *
     * @param cardTypeRefId the id of the card type reference no more useful for the project
     * @param projectId     the id of the project in which we don't want to use the card type
     *                      anymore
     */
    @PUT
    @Path("removeCardTypeFromProject/{cardTypeId}/{projectId}")
    public void removeCardTypeRefFromProject(@PathParam("cardTypeId") Long cardTypeRefId,
        @PathParam("projectId") Long projectId) {
        logger.debug("remove card type reference #{} from project #{}", cardTypeRefId, projectId);

        cardTypeManager.removeCardTypeRefFromProject(cardTypeRefId, projectId);
    }

}
