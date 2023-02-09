/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jcr;

import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.generator.model.exceptions.MessageI18nKey;
import javax.jcr.RepositoryException;
import javax.transaction.Status;
import javax.transaction.Synchronization;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * To synchronize JCR session with JTA transaction
 *
 * @author maxence
 */
public class JcrSynchronizer implements Synchronization {

    /** Logger */
    private static final Logger logger = LoggerFactory.getLogger(JcrSynchronizer.class);

    /** The synchronized session */
    private final JcrSession session;

    /**
     * Create JCR session synchronizer
     *
     * @param session the session to synchronize
     */
    public JcrSynchronizer(JcrSession session) {
        logger.trace("Create synchronizer for {}", session);
        this.session = session;
    }

    @Override
    public void beforeCompletion() {
        try {
            logger.trace("Prepare commit for {}", session);
            session.prepareForCommit();
        } catch (RepositoryException ex) {
            // please rollback
            logger.trace("Prepare commit failed: rollback");
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }
    }

    @Override
    public void afterCompletion(int status) {
        switch (status) {
            case Status.STATUS_COMMITTED:
                logger.trace("JCR Sync afterCompletion: {} => COMMITED", status);
                session.saveAndClose();
                break;
            case Status.STATUS_ROLLEDBACK:
                logger.trace("JCR Sync afterCompletion: {} => ROLLED_BACK", status);
                session.rollback();
                break;
            default:
                logger.trace("JCR Sync afterCompletion: {} => UNKNOWN", status);
                break;
        }

    }
}
