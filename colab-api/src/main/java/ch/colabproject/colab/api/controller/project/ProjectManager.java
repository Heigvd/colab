/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.project;

import ch.colabproject.colab.api.controller.card.CardTypeManager;
import ch.colabproject.colab.api.ejb.SecurityFacade;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.project.ProjectDao;
import java.util.List;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Project specific logic
 *
 * @author sandra
 */
public class ProjectManager {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(ProjectManager.class);

    // *********************************************************************************************
    // injections

    /**
     * Project persistence handling
     */
    @Inject
    private ProjectDao projectDao;

    /**
     * Card type specific logic
     */
    @Inject
    private CardTypeManager cardTypeManager;

    /**
     * Access control manager
     */
    @Inject
    private SecurityFacade securityFacade;

    // *********************************************************************************************
    // Access control
    // *********************************************************************************************

    /**
     * Retrieve the ids of the projects the current user is a member of
     *
     * @return the ids of the matching projects
     */
    public List<Long> findIdsOfProjectsCurrentUserIsMemberOf() {
        User user = securityFacade.assertAndGetCurrentUser();

        List<Long> projectsIds = projectDao.getIdsOfProjectUserIsMemberOf(user.getId());

        logger.debug("found projects where the user {} is a team member : {}", user, projectsIds);

        return projectsIds;
    }

    /**
     * Retrieve the ids of the project for which the current user can read any local card type or
     * reference
     *
     * @return the ids of the matching projects
     */
    public List<Long> findProjectsIdsReadableByCardTypes() {
        List<Long> cardTypeOrRefIds = cardTypeManager.findCurrentUserReadableProjectsCardTypesIds();

        List<Long> projectsIds = cardTypeManager.findProjectIdsFromCardTypeIds(cardTypeOrRefIds);

        logger.debug("found projects from readable card types {} : {}", cardTypeOrRefIds,
            projectsIds);

        return projectsIds;
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
