/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.tools;

import ch.colabproject.colab.api.controller.EntityGatheringBagForPropagation;
import ch.colabproject.colab.api.controller.RequestManager;
import ch.colabproject.colab.api.controller.security.SecurityManager;
import ch.colabproject.colab.api.model.WithPermission;
import ch.colabproject.colab.api.model.WithTrackingData;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
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
    private SecurityManager securityManager;

    /** request manager */
    @Inject
    private RequestManager requestManager;

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
            securityManager.assertReadPermissionTx((WithPermission) o);
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
            securityManager.assertCreatePermissionTx((WithPermission) o);
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
            securityManager.assertUpdatePermissionTx((WithPermission) o);
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
        if (!requestManager.isDoNotTrackChange() && o instanceof WithTrackingData) {
            ((WithTrackingData) o).touch(requestManager.getCurrentUser());
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
            securityManager.assertDeletePermissionTx((WithPermission) o);
        }

        if (o instanceof WithWebsocketChannels) {
            wsEntityBag.registerDeletion((WithWebsocketChannels) o);
        }
    }
}
