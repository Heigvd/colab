package ch.colabproject.colab.api.controller.team;

import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;

import ch.colabproject.colab.api.controller.project.ProjectManager;
import ch.colabproject.colab.api.controller.token.TokenManager;
import ch.colabproject.colab.api.model.project.InstanceMaker;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.jpa.project.InstanceMakerDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.generator.model.exceptions.MessageI18nKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * @author mikkelvestergaard
 */
@Stateless
@LocalBean
public class InstanceMakerManager {

    /**
     * logger
     */
    private static final Logger logger = LoggerFactory.getLogger(InstanceMakerManager.class);

    /**
     * InstanceMaker persistence
     */
    @Inject
    private InstanceMakerDao instanceMakerDao;

    /**
     * Token specific logic management
     */
    @Inject
    private TokenManager tokenManager;

//    /**
//     * Retrieve the instanceMaker. If not found, throw a {@link HttpErrorMessage}
//     *
//     * @param instanceMakerId the id of the instanceMaker
//     *
//     * @return the instanceMaker found
//     *
//     * @throws HttpErrorMessage if the instanceMaker was not found
//     */
//    public InstanceMaker assertAndGetInstanceMaker(Long instanceMakerId) {
//        InstanceMaker instanceMaker = instanceMakerDao.findInstanceMaker(instanceMakerId);
//
//        if (instanceMaker == null) {
//            logger.error("instanceMaker #{} not found", instanceMakerId);
//            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_NOT_FOUND);
//        }
//
//        return instanceMaker;
//    }

    /**
     * Project specific logic handling
     */
    @Inject
    private ProjectManager projectManager;

    public List<InstanceMaker> getInstanceMakersForProject(Long projectId) {
        Project project = projectManager.assertAndGetProject(projectId);
        logger.debug("Get instanceMakers: {}", project);

        return instanceMakerDao.findInstanceMakersByProject(project);
    }

    /**
     * Retrieve all users of the instanceMakers
     *
     * @param projectId the id of the project
     * @return list of users
     */
    public List<User> getUsersForProject(Long projectId) {
        return getInstanceMakersForProject(projectId).stream()
                .map(InstanceMaker::getUser)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    // *********************************************************************************************
    // sharing
    // *********************************************************************************************

    /**
     * Send a token by email to grant access to use the model.
     *
     * @param modelId the id of the model
     * @param email   the address to send the sharing token to
     * @return the pending potential instance maker
     */
    public InstanceMaker shareModel(Long modelId, String email) {
        logger.debug("Share the model #{} to {}", modelId, email);
        Project model = projectManager.assertAndGetProject(modelId);

        return tokenManager.sendModelSharingToken(model, email);
    }


    /**
     * Create an instance maker for the model and the user and then persist it in database
     *
     * @param user  the user
     * @param model the model
     * @return the brand-new potential instance maker
     */
    public InstanceMaker addAndPersistInstanceMaker(Project model, User user) {
        logger.debug("Add and persist instance maker to user {} for model {}", user, model);

        InstanceMaker instanceMaker = addInstanceMaker(model, user);
        instanceMakerDao.persistInstanceMaker(instanceMaker);

        return instanceMaker;
    }

    /**
     * Create an instance maker for the model and the user
     *
     * @param user  the user
     * @param model the model
     * @return the brand-new potential instance maker
     */
    public InstanceMaker addInstanceMaker(Project model, User user) {
        logger.debug("Add instance maker to user {} for model {}", user, model);

        if (model != null && user != null
                && findInstanceMakerByProjectAndUser(model, user) != null) {
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }

        InstanceMaker instanceMaker = new InstanceMaker();

        instanceMaker.setUser(user);
        instanceMaker.setProject(model);

        return instanceMaker;
    }

    /**
     * Find the instance maker linked to the given project and the given user.
     *
     * @param project the project
     * @param user    the user
     * @return the matching instance makers
     */
    public InstanceMaker findInstanceMakerByProjectAndUser(Project project, User user) {
        return instanceMakerDao.findInstanceMakerByProjectAndUser(project, user);
    }

}
