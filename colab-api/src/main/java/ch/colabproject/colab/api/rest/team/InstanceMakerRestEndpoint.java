package ch.colabproject.colab.api.rest.team;

import ch.colabproject.colab.api.controller.team.InstanceMakerManager;
import ch.colabproject.colab.api.model.project.InstanceMaker;
import ch.colabproject.colab.api.persistence.jpa.project.InstanceMakerDao;
import ch.colabproject.colab.generator.model.annotations.AdminResource;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.List;

/**
 * REST InstanceMaker controller
 *
 * @author mikkelvestergaard
 */
@Path("instanceMaker")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@AuthenticationRequired
public class InstanceMakerRestEndpoint {

    /**
     * logger
     */
    private static final Logger logger = LoggerFactory.getLogger(InstanceMakerRestEndpoint.class);

    /**
     * InstanceMaker specific logic
     */
    @Inject
    private InstanceMakerManager instanceMakerManager;

    /**
     * Instance maker persistence handler
     */
    @Inject
    private InstanceMakerDao instanceMakerDao;

    // *********************************************************************************************
    // InstanceMakers
    // *********************************************************************************************

    /**
     * Get all instanceMakers
     *
     * @return list of all instanceMakers
     */
    @GET
    @AdminResource
    public List<InstanceMaker> getAllInstanceMakers() {
        logger.debug("get all instanceMakers");
        return instanceMakerDao.findAllInstanceMakers();
    }

    /**
     * Get the instanceMakers of the project
     *
     * @param projectId id of the project
     *
     * @return list of instanceMakers
     */
    @GET
    @Path("byproject/{projectId: [0-9]+}")
    public List<InstanceMaker> getInstanceMakersForProject(@PathParam("projectId") Long projectId) {
        logger.debug("Get project #{} instanceMakers", projectId);
        return instanceMakerManager.getInstanceMakersForProject(projectId);
    }

    /**
     *  Get an instanceMaker by id
     *
     * @param instanceMakerId id of the instanceMaker
     *
     * @return the instanceMaker
     *
     */
    @GET
    @Path("get/{instanceMakerId: [0-9]+}")
    public InstanceMaker getInstanceMaker(@PathParam("instanceMakerId") Long instanceMakerId) {
        logger.debug("Get instanceMaker #{}", instanceMakerId);
        return instanceMakerDao.findInstanceMaker(instanceMakerId);
    }

    /**
     * Delete an instanceMaker by id
     *
     * @param instanceMakerId if of the instanceMaker
     */
    @DELETE
    @Path("delete/{instanceMakerId: [0-9]+}")
    public void deleteInstanceMaker(@PathParam("instanceMakerId") Long instanceMakerId) {
        logger.debug("Delete instanceMaker #{}", instanceMakerId);
        instanceMakerManager.deleteInstanceMaker(instanceMakerId);
    }


    // *********************************************************************************************
    // share
    // *********************************************************************************************

    /**
     * Share the model to someone
     *
     * @param modelId the id of the model
     *
     * @param email the recipient address
     *
     * @return the pending potential instance maker
     */
    @POST
    @Path("shareModel/{id: [0-9]+}/{email}")
    public InstanceMaker shareModel(@PathParam("id") Long modelId, @PathParam("email") String email) {
        logger.debug("Share model #{} to {}", modelId, email);
        return instanceMakerManager.shareModel(modelId, email);
    }
}
