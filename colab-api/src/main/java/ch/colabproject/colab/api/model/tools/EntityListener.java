/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.tools;

import ch.colabproject.colab.api.ejb.RequestManager;
import ch.colabproject.colab.api.ejb.SecurityFacade;
import ch.colabproject.colab.api.ejb.TransactionManager;
import ch.colabproject.colab.api.model.WithPermission;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import javax.inject.Inject;
import javax.persistence.PostLoad;
import javax.persistence.PostPersist;
import javax.persistence.PostUpdate;
import javax.persistence.PreRemove;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * JPA Entity listener defined in orm.xml
 *
 * @author maxence
 */
public class EntityListener {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(EntityListener.class);

    /**
     * RequestManager
     */
    @Inject
    private TransactionManager transactionManager;

    /**
     * Security check
     */
    @Inject
    private SecurityFacade securityFacade;

    /**
     *
     */
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
        if (o instanceof WithPermission) {
            if (requestManager.isInSecurityTx()) {
                securityFacade.assertReadPermission((WithPermission) o);
            } else {
                securityFacade.assertReadPermissionTx((WithPermission) o);
            }
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

        if (o instanceof WithPermission) {
            if (requestManager.isInSecurityTx()) {
                securityFacade.assertCreatePermission((WithPermission) o);
            } else {
                securityFacade.assertCreatePermissionTx((WithPermission) o);
            }
        }

        if (o instanceof WithWebsocketChannels) {
            transactionManager.registerUpdate((WithWebsocketChannels) o);
        }
    }

    /**
     * Track all updated
     *
     * @param o just updated object
     */
    @PostUpdate
    public void onUpdate(Object o) {
        logger.trace("Update {}", o);
        if (o instanceof WithPermission) {
            if (requestManager.isInSecurityTx()) {
                securityFacade.assertUpdatePermission((WithPermission) o);
            } else {
                securityFacade.assertUpdatePermissionTx((WithPermission) o);
            }
        }

        if (o instanceof WithWebsocketChannels) {
            transactionManager.registerUpdate((WithWebsocketChannels) o);
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
        if (o instanceof WithPermission) {
            if (requestManager.isInSecurityTx()) {
                securityFacade.assertDeletePermission((WithPermission) o);
            } else {
                securityFacade.assertDeletePermissionTx((WithPermission) o);
            }
        }

        if (o instanceof WithWebsocketChannels) {
            transactionManager.registerDeletion((WithWebsocketChannels) o);
        }
    }
}
