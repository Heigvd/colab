/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.channel.model;

import ch.colabproject.colab.api.model.user.User;
import java.util.Objects;

/**
 * The channel to be used to transmit data to a specific user. Eg. its accounts, everything the user
 * sees in its lobby (project index and their teams, etc)
 * <p>
 * Usage :
 * </p>
 * <p>
 * Subscription : as soon as possible on client side + on current user reload<br>
 * Unsubscription : none<br>
 * </p>
 * <p>
 * Can be watched by admin in the Who page
 * </p>
 *
 * @author maxence
 */
public class UserChannel implements WebsocketChannel {

    private static final long serialVersionUID = 1L;

    /**
     * ID of the channel owner
     */
    private Long userId;

    /**
     * Get the value of userId
     *
     * @return the value of userId
     */
    public Long getUserId() {
        return userId;
    }

    /**
     * Set the value of userId
     *
     * @param userId new value of userId
     */
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    @Override
    public int hashCode() {
        int hash = 5;
        hash = 17 * hash + Objects.hashCode(this.userId);
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
        final UserChannel other = (UserChannel) obj;

        return Objects.equals(this.userId, other.userId);
    }

    @Override
    public String toString() {
        return "UserChannel{" + "userId=" + userId + '}';
    }

    /**
     * get the channel dedicated to the given user.
     *
     * @param user the user
     *
     * @return the user very own channel
     */
    public static UserChannel build(User user) {
        UserChannel channel = new UserChannel();
        channel.setUserId(user.getId());
        return channel;
    }
}
