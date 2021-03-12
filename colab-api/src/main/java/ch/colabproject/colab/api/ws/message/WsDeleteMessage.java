/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.message;

import ch.colabproject.colab.api.model.WithId;
import java.io.Serializable;
import java.util.Collection;
import java.util.List;

/**
 * WebSocker Message which indicates some objects have been deleted
 *
 * @author maxence
 */
public class WsDeleteMessage extends WsMessage {

    private static final long serialVersionUID = 1L;

    /**
     * List of object to send through websocket
     */
    private Collection<IndexEntry> items;

    /**
     * Create a new message which contains all provided objects
     *
     * @param objects list of objet which have been deleted
     */
    public WsDeleteMessage(Collection<IndexEntry> objects) {
        this.items = objects;
    }

    /**
     * @return get the list of deleted object
     */
    public Collection<IndexEntry> getItems() {
        return items;
    }

    /**
     * Set the list of deleted object
     *
     * @param items new list
     */
    public void setItems(List<IndexEntry> items) {
        this.items = items;
    }

    /**
     * No need to send full object details, @class + id is way sufficient
     */
    public static class IndexEntry implements Serializable {

        private static final long serialVersionUID = 1L;

        /**
         * object @class
         */
        private final String type;

        /**
         * Object id
         */
        private final Long id;

        /**
         * Create an new index entry based on the given wihId object
         *
         * @param object object to index
         */
        public IndexEntry(WithId object) {
            this.type = object.getJsonDiscriminator();
            this.id = object.getId();
        }

        /**
         * @return index entry type
         */
        public String getType() {
            return type;
        }

        /**
         * @return object id
         */
        public Long getId() {
            return id;
        }

    }

}
