/*
 * The coLAB project
 * Copyright (C) 2021-2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.common;

import ch.colabproject.colab.api.Helper;
import ch.colabproject.colab.api.controller.RequestManager;
import ch.colabproject.colab.api.controller.card.CardContentManager;
import ch.colabproject.colab.api.controller.card.CardManager;
import ch.colabproject.colab.api.controller.project.ProjectManager;
import ch.colabproject.colab.api.controller.security.SecurityManager;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.common.DeletionStatus;
import ch.colabproject.colab.api.model.user.User;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.cp.lock.FencedLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionAttributeType;
import javax.inject.Inject;

/**
 * Handles the specific logic of the deletion process for any ColabEntity
 * <p>
 * Most coLAB entities are directly deleted in database.
 * <p>
 * But for
 * <ul>
 *     <li>project</li>
 *     <li>card</li>
 *     <li>card content</li>
 * </ul>
 * there is a deletion workflow :
 * <ol>
 *     <li>place in bin (manually)</li>
 *     <li>flag as to delete forever (manually)</li>
 *     <li>delete in database (launched by a cron job). This is what this class is about</li>
 * </ol>
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class DeletionManager {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(DeletionManager.class);

    // *********************************************************************************************
    // injections
    // *********************************************************************************************

    /**
     * Project specific logic handling
     */
    @Inject
    private ProjectManager projectManager;


    /**
     * Card specific logic handling
     */
    @Inject
    private CardManager cardManager;

    /**
     * Card content specific logic handling
     */
    @Inject
    private CardContentManager cardContentManager;

    /**
     * Access control manager
     */
    @Inject
    private SecurityManager securityManager;

    /**
     * request manager
     */
    @Inject
    private RequestManager requestManager;

    /** hazelcast instance */
    @Inject
    private HazelcastInstance hzInstance;

    // *********************************************************************************************
    // check deletion status
    // *********************************************************************************************

    /**
     * @param object The colab entity to check
     * @return True if the colab entity is deleted, false otherwise
     */
    public boolean isAlive(ColabEntity object) {
        return object.getDeletionStatus() == null;
    }

    /**
     * @param object The colab entity to check
     * @return True if the colab entity is deleted, false otherwise
     */
    public boolean isDeleted(ColabEntity object) {
        return object.getDeletionStatus() != null;
    }

    // *********************************************************************************************
    // put in bin
    // *********************************************************************************************

    /**
     * Put the object in the bin.
     * <br>
     * Set the deletion status to BIN and initialise the erasure tracking data.
     * <br>
     * It means that the object is only visible in the bin panel.
     *
     * @param object Object to delete
     */
    public void putInBin(ColabEntity object) {
        logger.debug("put in bin {} # {} ", object.getClass(), object.getId());

        User currentUser = securityManager.assertAndGetCurrentUser();

        object.setDeletionStatus(DeletionStatus.BIN);
        object.setErasureTrackingData(
                currentUser != null ? currentUser.getUsername() : Helper.UNKNOWN_USER
        );
    }

    // *********************************************************************************************
    // restore from bin
    // *********************************************************************************************

    /**
     * Restore the object from the bin. The object won't contain any deletion or erasure data anymore.
     * <p>
     * It means that the object is back at its place (as much as possible).
     *
     * @param object Object to delete
     */
    public void restoreFromBin(ColabEntity object) {
        logger.debug("restore from bin {} # {} ", object.getClass(), object.getId());

        object.setDeletionStatus(null);
        object.clearErasureTrackingData();
    }

    // *********************************************************************************************
    // flag as to delete forever (no more visible from users)
    // *********************************************************************************************

    /**
     * Set the deletion status to TO_DELETE.
     * <p>
     * It means that the object is not visible anymore .
     *
     * @param object Object to delete
     */
    public void flagAsToDeleteForever(String erasedByName, ColabEntity object) {
        logger.debug("flag as to delete forever {} # {} ", object.getClass(), object.getId());

        object.setDeletionStatus(DeletionStatus.TO_DELETE);
        object.setErasureTrackingData(erasedByName);
    }

    /**
     * Set the deletion status to TO_DELETE.
     * <p>
     * It means that the object is not visible anymore .
     *
     * @param object Object to delete
     */
    public void flagAsToDeleteForever(ColabEntity object) {
        User currentUser = securityManager.assertAndGetCurrentUser();

        flagAsToDeleteForever(
                currentUser != null ? currentUser.getUsername() : Helper.UNKNOWN_USER, object);
    }

    /**
     * Remove from bin all projects, cards, card contents that were there since a long time ago
     * (the exact nb of days is set in configuration).
     * Flag them as "ready-for-permanent-deletion"
     */
    @TransactionAttribute(TransactionAttributeType.REQUIRES_NEW)
    public void cleanBinInTrn() {
        logger.debug("DeletionManager.cleanBin");

        FencedLock lock = hzInstance.getCPSubsystem().getLock("CleanBinScheduledJob");
        if (lock.tryLock()) {
            try {
                requestManager.sudo(() -> {
                    try {
                        projectManager.removeOldProjectsFromBin();
                    } catch (Throwable anyThrowable) {
                        logger.error("ERROR when removing from bin old projects", anyThrowable);
                    }

                    try {
                        cardManager.removeOldCardsFromBin();
                    } catch (Throwable anyThrowable) {
                        logger.error("ERROR when removing from bin old cards", anyThrowable);
                    }

                    try {
                        cardContentManager.removeOldCardContentsFromBin();
                    } catch (Throwable anyThrowable) {
                        logger.error("ERROR when removing from bin old card contents", anyThrowable);
                    }
                });
            } finally {
                lock.unlock();
            }
        }
    }

    // *********************************************************************************************
    // delete forever (does not exist anymore in database)
    // *********************************************************************************************

    /**
     * Delete all projects, cards, card contents that were flagged as "ready-for-permanent-deletion"
     * a long time ago (the exact nb of days is set in configuration)
     */
    @TransactionAttribute(TransactionAttributeType.REQUIRES_NEW)
    public void deleteForeverInTrn() {
        logger.debug("DeletionManager.deleteForever");
        FencedLock lock = hzInstance.getCPSubsystem().getLock("DeleteForeverScheduledJob");
        if (lock.tryLock()) {
            try {
                requestManager.sudo(() -> {
                    try {
                        projectManager.deleteForeverOldProjects();
                    } catch (Throwable anyThrowable) {
                        logger.error("ERROR when deleting forever old projects", anyThrowable);
                    }

                    try {
                        cardManager.deleteForeverOldCards();
                    } catch (Throwable anyThrowable) {
                        logger.error("ERROR when deleting forever old cards", anyThrowable);
                    }

                    try {
                        cardContentManager.deleteForeverOldCardContents();
                    } catch (Throwable anyThrowable) {
                        logger.error("ERROR when deleting forever old card contents", anyThrowable);
                    }
                });
            } finally {
                lock.unlock();
            }
        }
    }

}
