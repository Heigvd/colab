/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.tools;

import ch.colabproject.colab.api.ejb.TransactionManager;
import ch.colabproject.colab.api.model.WithId;
import javax.inject.Inject;
import javax.persistence.PostPersist;
import javax.persistence.PostUpdate;
import javax.persistence.PreRemove;

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
    private TransactionManager transactionManager;

    /**
     * Track all updates and insert
     *
     * @param o updated or just persisted object
     */
    @PostPersist
    @PostUpdate
    public void onUpdate(Object o) {
        if (o instanceof WithId) {
            transactionManager.registerUpdate((WithId) o);
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
            transactionManager.registerDelete((WithId) o);
        }
    }
}
