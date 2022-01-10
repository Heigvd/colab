/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.mock;

import ch.colabproject.colab.api.security.SessionManager;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.enterprise.inject.Specializes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Specializes SessionManager to prevent saving activity-dates automatically.
 *
 * Such auto save pollutes websocket messages and prevents their prediction.
 *
 * @author maxence
 */
@Stateless
@LocalBean
@Specializes
public class SessionManagerMock extends SessionManager {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(SessionManagerMock.class);

    /**
     * Same as super but no @Schedule
     */
    @Override
    public void writeActivityDatesToDatabase() {
        logger.info("Intercept writeActivityDatesToDatabase: do nothing");
    }
}
