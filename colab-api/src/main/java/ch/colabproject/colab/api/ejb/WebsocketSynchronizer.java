/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.model.WithId;
import ch.colabproject.colab.api.ws.WebsocketEndpoint;
import ch.colabproject.colab.api.ws.message.WsDeleteMessage.IndexEntry;
import java.io.Serializable;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import javax.transaction.Status;
import javax.transaction.Synchronization;

/**
 * Simple websocket JTA synchronizer
 *
 * @author maxence
 */
public class WebsocketSynchronizer implements Synchronization, Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * set of updated entities to be propagated
     */
    private Set<WithId> updated = new HashSet<>();

    /**
     * set of entities which have been deleted during the transaction
     */
    private Set<IndexEntry> deleted = new HashSet<>();

    /**
     * TODO should assert everything is propagatable
     */
    @Override
    public void beforeCompletion() {
        // maybe nothing to do
    }

    /**
     * Called once the transaction has been fully validated. Send pending messages to their
     * respective audience
     *
     * @param status The status of the transaction completion.
     */
    @Override
    public void afterCompletion(int status) {
        if (status == Status.STATUS_COMMITTED) {

            /* Ignore updated entities which have been deleted */
            List<WithId> filtered = updated.stream()
                .filter(
                    (u) -> !deleted.stream()
                        .anyMatch(
                            (d) -> d.getId().equals(u.getId())
                            && d.getType().equals(u.getJsonDiscriminator())
                        )
                ).collect(Collectors.toList());

            if (!filtered.isEmpty()) {
                WebsocketEndpoint.propagate(filtered);
            }
            if (!deleted.isEmpty()) {
                WebsocketEndpoint.propagateDeletion(deleted);
            }
        }
    }

    /**
     * Register the given object within the updated set
     *
     * @param o object to register
     */
    public void registerUpdate(WithId o) {
        updated.add(o);
    }

    /**
     * register just deleted object
     *
     * @param o object which has been deleted
     */
    public void registerDelete(WithId o) {
        deleted.add(new IndexEntry(o));
    }
}
