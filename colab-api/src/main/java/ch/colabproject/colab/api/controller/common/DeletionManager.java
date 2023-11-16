package ch.colabproject.colab.api.controller.common;

import ch.colabproject.colab.api.controller.security.SecurityManager;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.common.DeletionStatus;
import ch.colabproject.colab.api.model.user.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;

/**
 * Handles the specific logic of the deletion process for any ColabEntity
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
     * Access control manager
     */
    @Inject
    private SecurityManager securityManager;

    // *********************************************************************************************
    // check deletion status
    // *********************************************************************************************

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
     * <br/>
     * Set the deletion status to BIN and initialise the erasure tracking data.
     * <br/>
     * It means that the object is only visible in the bin panel.
     *
     * @param object Object to delete
     */
    public void putInBin(ColabEntity object) {
        logger.debug("put in bin {} # {} ", object.getClass(), object.getId());

        User currentUser = securityManager.assertAndGetCurrentUser();

        object.setDeletionStatus(DeletionStatus.BIN);
        object.initErasureTrackingData(currentUser);
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
        object.resetErasureTrackingData();
    }

    // *********************************************************************************************
    // mark as to delete forever (no more visible from users)
    // *********************************************************************************************

    /**
     * Set the deletion status to TO_DELETE.
     * <p>
     * It means that the object is only visible in the bin panel.
     *
     * @param object Object to delete
     */
    public void markAsToDeleteForever(ColabEntity object) {
        logger.debug("mark as to delete forever {} # {} ", object.getClass(), object.getId());

        object.setDeletionStatus(DeletionStatus.TO_DELETE);
    }

}
