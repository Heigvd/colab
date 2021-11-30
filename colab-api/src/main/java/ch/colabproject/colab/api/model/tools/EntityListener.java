/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.tools;

import ch.colabproject.colab.api.ejb.RequestManager;
import ch.colabproject.colab.api.ejb.SecurityFacade;
import ch.colabproject.colab.api.ejb.EntityGatheringBagForPropagation;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.WithPermission;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.security.SessionManager;
import java.time.OffsetDateTime;
import javax.inject.Inject;
import javax.persistence.PostLoad;
import javax.persistence.PostPersist;
import javax.persistence.PostUpdate;
import javax.persistence.PrePersist;
import javax.persistence.PreRemove;
import javax.persistence.PreUpdate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * JPA Entity listener defined in orm.xml
 * <p>
 * The purposes are to
 * <ul>
 * <li>check permissions</li>
 * <li>register modifications</li>
 * <li>set tracking data</li>
 * </ul>
 *
 * @author maxence
 */
public class EntityListener {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(EntityListener.class);

    /** To collect entities for later propagation */
    @Inject
    private EntityGatheringBagForPropagation wsEntityBag;

    /** Security check */
    @Inject
    private SecurityFacade securityFacade;

    /** request manager */
    @Inject
    private RequestManager requestManager;

    /** activity date cache */
    @Inject
    private SessionManager sessionManager;

    /**
     * Track all reads from database
     *
     * @param o just loaded object
     */
    @PostLoad
    public void onLoad(Object o) {
        logger.trace("Load {}", o);
        // Skip permission check if a condition assertion is already in progress
        if (o instanceof WithPermission && !requestManager.isInSecurityTx()) {
            securityFacade.assertReadPermissionTx((WithPermission) o);
        }
        if (o instanceof User){
            OffsetDateTime activityDate = sessionManager.getActivityDate((User) o);
            ((User) o).setActivityDate(activityDate);
        }
    }

    /**
     * Track all insertions
     *
     * @param o just persisted object
     */
    @PostPersist
    public void onPersist(Object o) {
        logger.trace("Persist {}", o);

        // Skip permission check if a condition assertion is already in progress
        if (o instanceof WithPermission && !requestManager.isInSecurityTx()) {
            securityFacade.assertCreatePermissionTx((WithPermission) o);
        }

        if (o instanceof WithWebsocketChannels) {
            wsEntityBag.registerUpdate((WithWebsocketChannels) o);
        }
    }

    /**
     * Track all updates
     *
     * @param o just updated object
     */
    @PostUpdate
    public void onUpdate(Object o) {
        logger.trace("Update {}", o);
        // Skip permission check if a condition assertion is already in progress
        if (o instanceof WithPermission && !requestManager.isInSecurityTx()) {
            securityFacade.assertUpdatePermissionTx((WithPermission) o);
        }

        if (o instanceof WithWebsocketChannels) {
            wsEntityBag.registerUpdate((WithWebsocketChannels) o);
        }
    }

    /**
     * Before persist and before update, update tracking data
     *
     * @param o object to track
     */
    @PrePersist
    @PreUpdate
    public void touch(Object o) {
        if (!requestManager.isDoNotTrackChange() && o instanceof ColabEntity) {
            ((ColabEntity) o).touch(requestManager.getCurrentUser());
        }
    }

    /**
     * Intercept object just before their deletion
     *
     * @param o just deleted object
     */
    @PreRemove
    public void onDestroy(Object o) {
        logger.trace("Destroy {}", o);
        // Skip permission check if a condition assertion is already in progress
        if (o instanceof WithPermission && !requestManager.isInSecurityTx()) {
            securityFacade.assertDeletePermissionTx((WithPermission) o);
        }

        if (o instanceof WithWebsocketChannels) {
            wsEntityBag.registerDeletion((WithWebsocketChannels) o);
        }
    }
}
