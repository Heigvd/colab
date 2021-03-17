/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.message;

import ch.colabproject.colab.api.model.WithId;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import javax.validation.constraints.NotNull;

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
    @NotNull
    private Collection<IndexEntry> items;

    /**
     * Default constructor
     */
    public WsDeleteMessage() {
        this.items = new ArrayList<>();
    }

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
        @NotNull
        private String type;

        /**
         * Object id
         */
        @NotNull
        private Long id;

        /**
         * Default constructor
         */
        public IndexEntry() {
            /* no-op */
        }

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
         * Set type, aka @class
         *
         * @param type type of the indexed object
         */
        public void setType(String type) {
            this.type = type;
        }

        /**
         * @return object id
         */
        public Long getId() {
            return id;
        }

        /**
         * Set id of indexed object
         *
         * @param id id of object
         */
        public void setId(Long id) {
            this.id = id;
        }
    }
}
