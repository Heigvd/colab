/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.channel;

import ch.colabproject.colab.api.ws.channel.model.WebsocketChannel;
import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;
import ch.colabproject.colab.generator.model.interfaces.WithJsonDiscriminator;
import java.util.Objects;
import javax.validation.constraints.NotNull;

/**
 * Channel overview.
 *
 * @author maxence
 */
@ExtractJavaDoc
public class ChannelOverview implements WithJsonDiscriminator {

    private static final long serialVersionUID = 1L;

    /**
     * The channel
     */
    @NotNull
    private WebsocketChannel channel;

    /**
     * Number of subscriptions
     */
    @NotNull
    private Integer count;

    /**
     * Get the value of count
     *
     * @return the value of count
     */
    public Integer getCount() {
        return count;
    }

    /**
     * Set the value of count
     *
     * @param count new value of count
     */
    public void setCount(Integer count) {
        this.count = count;
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

    @Override
    public int hashCode() {
        int hash = 5;
        hash = 37 * hash + Objects.hashCode(this.channel);
        return hash;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final ChannelOverview other = (ChannelOverview) obj;
        if (!Objects.equals(this.channel, other.channel)) {
            return false;
        }
        if (!Objects.equals(this.count, other.count)) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "ChannelOverview{" + "channel=" + channel + ", count=" + count + '}';
    }
}
