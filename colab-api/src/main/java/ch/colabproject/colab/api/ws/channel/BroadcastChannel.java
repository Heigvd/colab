/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.channel;

/**
 *
 * The channel to be used to transmit data to all online users.
 *
 * @author maxence
 */
public class BroadcastChannel implements WebsocketEffectiveChannel {

    private static final long serialVersionUID = 1L;

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
