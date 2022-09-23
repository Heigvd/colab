/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.message;

import ch.colabproject.colab.api.ws.channel.model.WebsocketChannel;
import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;
import javax.validation.constraints.NotNull;

/**
 * Indicated channel subscription change
 *
 * @author maxence
 */
@ExtractJavaDoc
public class WsChannelUpdate extends WsMessage {

    private static final long serialVersionUID = 1L;

    /**
     * The channel this message is about
     */
    @NotNull
    private WebsocketChannel channel;

    /**
     * number of new (un)subscriptions
     */
    @NotNull
    private Integer diff;

    /**
     * Get the value of diff
     *
     * @return the value of diff
     */
    public Integer getDiff() {
        return diff;
    }

    /**
     * Set the value of diff
     *
     * @param diff new value of diff
     */
    public void setDiff(Integer diff) {
        this.diff = diff;
    }

    /**
     * Get the value of channel
     *
     * @return the value of channel
     */
    public WebsocketChannel getChannel() {
        return channel;
    }

    /**
     * Set the value of channel
     *
     * @param channel new value of channel
     */
    public void setChannel(WebsocketChannel channel) {
        this.channel = channel;
    }

    /**
     * Build a message
     *
     * @param channel the channel
     * @param diff    number of new (un)subscriptions
     *
     * @return the message
     */
    public static WsChannelUpdate build(WebsocketChannel channel, Integer diff) {
        WsChannelUpdate message = new WsChannelUpdate();
        message.setChannel(channel);
        message.setDiff(diff);
        return message;
    }

    @Override
    public String toString() {
        return "WsChannelUpdate{" + "channel=" + channel + ", diff=" + diff + "}";
    }

}
