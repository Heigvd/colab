/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller;

import java.io.Serializable;

/**
 * Subscription request to be propagated through the cluster to reach the instance which is
 * responsible for the given wsSessionId
 *
 * @author maxence
 */
public class SubscriptionRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Subscript or unsubscribe
     */
    public enum SubscriptionType {
        /**
         * subscription request
         */
        SUBSCRIBE,
        /**
         * Unsubscribe request
         */
        UNSUBSCRIBE
    }

    /**
     * One-to-one mapping to EffectiveChannels
     */
    public enum ChannelType {
        /**
         * {@link ch.colabproject.colab.api.ws.channel.BroadcastChannel}
         */
        BROADCAST,
        /**
         * {@link ch.colabproject.colab.api.ws.channel.UserChannel user channel}
         */
        USER,
        /**
         * {@link ch.colabproject.colab.api.ws.channel.ProjectContentChannel project channel}
         */
        PROJECT,
        /**
         * {@link ch.colabproject.colab.api.ws.channel.BlockChannel block channel}
         */
        BLOCK
    }

    /**
     * Type of request
     */
    private SubscriptionType type;

    /**
     * Websocket session id which want to (un)subscribe
     */
    private String wsSessionId;

    /**
     *
     * HTTP session id which want to (un)subscribe
     */
    private Long colabSessionId;

    /**
     * Type of channel : User | Project
     */
    private ChannelType channelType;

    /**
     * Id of the channel. Id of a project or user.
     */
    private Long channelId;

    /**
     * Get the type of request
     *
     * @return request type
     */
    public SubscriptionType getType() {
        return type;
    }

    /**
     * Set type of request
     *
     * @param type subscript or unsubscribe
     */
    public void setType(SubscriptionType type) {
        this.type = type;
    }

    /**
     * Get the ws session id
     *
     * @return the ws session id
     */
    public String getWsSessionId() {
        return wsSessionId;
    }

    /**
     * Set the websocket session id
     *
     * @param wsSessionId ws session id
     */
    public void setWsSessionId(String wsSessionId) {
        this.wsSessionId = wsSessionId;
    }

    /**
     * Get http session id
     *
     * @return http session id
     */
    public Long getColabSessionId() {
        return colabSessionId;
    }

    /**
     * Set HTTP session id
     *
     * @param colabSessionId id of the HTTP session
     */
    public void setColabSessionId(Long colabSessionId) {
        this.colabSessionId = colabSessionId;
    }

    /**
     * get channel type.
     *
     * @return the type
     */
    public ChannelType getChannelType() {
        return channelType;
    }

    /**
     * Set the type of channel
     *
     * @param channelType new channel type
     */
    public void setChannelType(ChannelType channelType) {
        this.channelType = channelType;
    }

    /**
     * Get id channel
     *
     * @return id of the channel
     */
    public Long getChannelId() {
        return channelId;
    }

    /**
     * Set id of the channel
     *
     * @param channelId new id
     */
    public void setChannelId(Long channelId) {
        this.channelId = channelId;
    }

    @Override
    public String toString() {
        return "SubscriptionRequest{"
            + "type=" + type
            + ", wsSessionId=" + wsSessionId
            + ", colabSessionId=" + colabSessionId
            + ", channelType=" + channelType
            + ", channelId=" + channelId + '}';
    }

    /**
     * Build a request message
     *
     * @param type          type of the request
     * @param channelType   channel type
     * @param channelId     channel id
     * @param wsSessionId   ws id
     * @param httpSessionId http id
     *
     * @return the request
     */
    public static SubscriptionRequest build(
        SubscriptionType type,
        ChannelType channelType,
        Long channelId,
        String wsSessionId,
        Long httpSessionId
    ) {
        SubscriptionRequest sr = new SubscriptionRequest();

        sr.setType(type);
        sr.setChannelType(channelType);
        sr.setChannelId(channelId);
        sr.setColabSessionId(httpSessionId);
        sr.setWsSessionId(wsSessionId);
        return sr;
    }
}
