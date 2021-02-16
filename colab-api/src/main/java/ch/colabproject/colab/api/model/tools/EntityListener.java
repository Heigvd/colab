/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.tools;

import ch.colabproject.colab.api.ejb.RequestManager;
import ch.colabproject.colab.api.model.WithId;
import javax.inject.Inject;
import javax.persistence.PostPersist;
import javax.persistence.PreRemove;
import javax.persistence.PostUpdate;

/**
 * JPA Entity listener defined in orm.xml
 *
 * @author maxence
 */
public class EntityListener {

    /**
     * RequestManager
     */
    @Inject
    private RequestManager requestManager;

    /**
     * Track all updates and insert
     *
     * @param o updated or just persisted object
     */
    @PostPersist
    @PostUpdate
    public void onUpdate(Object o) {
        if (o instanceof WithId) {
            requestManager.registerUpdate((WithId) o);
        }
    }

    /**
     * Intercept object just before their deletion
     *
     * @param o just deleted object
     */
    @PreRemove
    public void onDestroy(Object o) {
        if (o instanceof WithId) {
            requestManager.registerDelete((WithId) o);
        }
    }
}
