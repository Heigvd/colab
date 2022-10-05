/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.channel.model;

import ch.colabproject.colab.api.Helper;
import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;

/**
 * The channel to be used to transmit data to all online users.<br>
 * <p>
 * Usage:
 * </p>
 * <p>
 * Subscription : as soon as possible on client side + on current user reload<br>
 * Unsubscription : none<br>
 * </p>
 *
 * @author maxence
 */
@ExtractJavaDoc
public class BroadcastChannel implements WebsocketChannel {

    private static final long serialVersionUID = 1L;

    @Override
    public String getUrn() {
        return Helper.getColabBaseUrn(this);
    }

    @Override
    public int hashCode() {
        int hash = 23;
        return hash;
    }

    /**
     * Channel equals if they both refer to the same user
     *
     * @param obj other channel
     *
     * @return true if both refer to the same user
     */
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
        return true;
    }

    @Override
    public String toString() {
        return "BroadcastChannel{}";
    }

    /**
     * get the broadcast channel
     *
     * @return the broadcast channel
     */
    public static BroadcastChannel build() {
        return new BroadcastChannel();
    }
}
