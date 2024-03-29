/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.message;

import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.ChannelsBuilder;
import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;
import ch.colabproject.colab.generator.model.interfaces.WithJsonDiscriminator;
import javax.json.bind.annotation.JsonbTransient;
import javax.validation.constraints.NotNull;

/**
 * No need to send full object details, @class + id is way sufficient
 */
@ExtractJavaDoc
public class IndexEntry implements WithJsonDiscriminator {

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
     * Some extra data
     */
    @NotNull
    private Object payload;

    /**
     * Get the channels this entity shall be sent through.
     */
    @JsonbTransient
    private ChannelsBuilder channelsBuilder;

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

    /**
     * Get payload
     *
     * @return the payload
     */
    public Object getPayload() {
        return payload;
    }

    /**
     * Set the payload
     *
     * @param payload set extra data
     */
    public void setPayload(Object payload) {
        this.payload = payload;
    }

    /**
     * get the channels builder
     *
     * @return channels builder
     */
    public ChannelsBuilder getChannelsBuilder() {
        return channelsBuilder;
    }

    /**
     * set the channels builder
     *
     * @param channelsBuilder the channels builder
     */
    public void setChannelsBuilder(ChannelsBuilder channelsBuilder) {
        this.channelsBuilder = channelsBuilder;
    }

    /**
     * Create an new index entry based on the given wihId object
     *
     * @param object object to index
     *
     * @return index entry which represent the object
     */
    public static IndexEntry build(WithWebsocketChannels object) {
        IndexEntry entry = new IndexEntry();

        entry.type = object.getJsonDiscriminator();
        entry.id = object.getId();
        entry.payload = object.getIndexEntryPayload();

        entry.channelsBuilder = object.getChannelsBuilder();

        return entry;
    }

}
