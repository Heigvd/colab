/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.channel.tool;

import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.user.Account;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.jpa.card.CardTypeDao;
import ch.colabproject.colab.api.persistence.jpa.user.UserDao;
import ch.colabproject.colab.api.ws.channel.model.BlockChannel;
import ch.colabproject.colab.api.ws.channel.model.BroadcastChannel;
import ch.colabproject.colab.api.ws.channel.model.ProjectContentChannel;
import ch.colabproject.colab.api.ws.channel.model.UserChannel;
import ch.colabproject.colab.api.ws.channel.model.WebsocketChannel;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Compute the channels needed to propagate alteration changes.
 *
 * @author sandra
 */
public final class ChannelsBuilders {

    /**
     * Private constructor prevents instantiation
     */
    private ChannelsBuilders() {
        throw new UnsupportedOperationException("This is a utility class");
    }

    /**
     * To determine the channels to use
     */
    public static abstract class ChannelsBuilder {
        /**
         * Determine the channels to use
         *
         * @param userDao     the dao to fetch users
         * @param cardTypeDao the dao to fetch card type
         *
         * @return all channels to use for propagation
         */
        public Set<WebsocketChannel> computeChannels(UserDao userDao, CardTypeDao cardTypeDao) {
            return build(userDao, cardTypeDao);
        }

        /**
         * Determine the channels to use (internal implementation)
         *
         * @param userDao     the dao to fetch users
         * @param cardTypeDao the dao to fetch card type
         *
         * @return all channels to use for propagation
         */
        abstract protected Set<WebsocketChannel> build(UserDao userDao, CardTypeDao cardTypeDao);
    }

    /**
     * When there is no channel
     */
    public static class EmptyChannelBuilder extends ChannelsBuilder {
        @Override
        protected Set<WebsocketChannel> build(UserDao userDao, CardTypeDao cardTypeDao) {
            return Set.of();
        }
    }

    /**
     * To build a block channel
     */
    public static class BlockChannelBuilder extends ChannelsBuilder {
        /** the id of the block */
        private final Long blockId;

        /**
         * Create a builder for a block channel
         *
         * @param blockId the id of the block
         */
        public BlockChannelBuilder(Long blockId) {
            this.blockId = blockId;
        }

        @Override
        protected Set<WebsocketChannel> build(UserDao userDao, CardTypeDao cardTypeDao) {
            return Set.of(BlockChannel.build(blockId));
        }
    }

    /**
     * To build a project content channel
     */
    public static class ProjectContentChannelBuilder extends ChannelsBuilder {
        /** the id of the project */
        private final Long projectId;

        /**
         * Create a builder for a project content channel
         *
         * @param project the project
         */
        public ProjectContentChannelBuilder(Project project) {
            projectId = project.getId();
        }

        @Override
        protected Set<WebsocketChannel> build(UserDao userDao, CardTypeDao cardTypeDao) {
            return Set.of(ProjectContentChannel.build(projectId));
        }
    }

    /**
     * To build all channels needed to propagate a project overview alteration
     */
    public static class AboutProjectOverviewChannelsBuilder extends ChannelsBuilder {
        /** the id of the users that are team members */
        private final Set<Long> teamMemberUserIds;

        /**
         * Create a builder for the channels to use when a project overview data is changed
         *
         * @param project the project
         */
        public AboutProjectOverviewChannelsBuilder(Project project) {
            teamMemberUserIds = retrieveTeamMemberUserIds(project);
        }

        @Override
        protected Set<WebsocketChannel> build(UserDao userDao, CardTypeDao cardTypeDao) {
            Set<WebsocketChannel> channels = new HashSet<>();

            channels.addAll(teamMemberUserIds.stream()
                .map(userId -> UserChannel.build(userId))
                .collect(Collectors.toSet()));

            channels.addAll(buildAdminChannels(userDao));

            return channels;
        }
    }

    /**
     * To build a channel for each admin
     */
    public static class ForAdminChannelsBuilder extends ChannelsBuilder {

        @Override
        protected Set<WebsocketChannel> build(UserDao userDao, CardTypeDao cardTypeDao) {
            return buildAdminChannels(userDao);
        }
    }

    /**
     * To build all channels needed to propagate a user alteration
     */
    public static class AboutUserChannelsBuilder extends ChannelsBuilder {
        /** the id of the user */
        private final Long userId;
        /** the id of the users that are team mates */
        private final Set<Long> teamMatesUserIds;

        /**
         * Create a builder for the channels to use when a user is changed
         *
         * @param user the user
         */
        public AboutUserChannelsBuilder(User user) {
            userId = user.getId();
            teamMatesUserIds = retrieveTeamMatesUserId(user);
        }

        @Override
        protected Set<WebsocketChannel> build(UserDao userDao, CardTypeDao cardTypeDao) {
            Set<WebsocketChannel> channels = new HashSet<>();

            channels.add(UserChannel.build(userId));

            channels.addAll(teamMatesUserIds.stream()
                .map(userId -> UserChannel.build(userId))
                .collect(Collectors.toSet()));

            channels.addAll(buildAdminChannels(userDao));

            return channels;
        }
    }

    /**
     * To build all channels needed to propagate an account alteration
     */
    public static class AboutAccountChannelsBuilder extends ChannelsBuilder {
        /** the id of the user */
        private final Long userId;

        /**
         * Create a builder for the channels to use when an account is changed
         *
         * @param account the account
         */
        public AboutAccountChannelsBuilder(Account account) {
            userId = account.getUser().getId();
        }

        @Override
        protected Set<WebsocketChannel> build(UserDao userDao, CardTypeDao cardTypeDao) {
            Set<WebsocketChannel> channels = new HashSet<>();

            if (userId != null) {
                channels.add(UserChannel.build(userId));
            }

            channels.addAll(buildAdminChannels(userDao));

            return channels;
        }
    }

    /**
     * To build all channels needed for a card type belonging to a project
     */
    public static class AboutCardTypeChannelsBuilder extends ChannelsBuilder {
        /** the card type */
        private final AbstractCardType cardType;

        /**
         * Create a channel builder for everything needed for a card type belonging to a project
         *
         * @param cardType the card type
         */
        public AboutCardTypeChannelsBuilder(AbstractCardType cardType) {
            this.cardType = cardType;
        }

        @Override
        protected Set<WebsocketChannel> build(UserDao userDao,
            CardTypeDao cardTypeDao) {
            return buildCardTypeInProjectChannel(cardType, userDao, cardTypeDao);
        }

    }

    ////////////////////////////////////////////////////////////////////////////////////////////////
    // Helpers

    /**
     * Build a channel for each admin
     *
     * @param userDao To fetch the admin
     *
     * @return a set of channels : one user channel for each admin
     */
    private static Set<WebsocketChannel> buildAdminChannels(UserDao userDao) {
        return userDao.findAllAdmin().stream()
            .map(user -> UserChannel.build(user.getId()))
            .collect(Collectors.toSet());
    }

    /**
     * Retrieve the id of the users team mates of the given user
     *
     * @param user the user
     *
     * @return the ids of the users team mates
     */
    private static Set<Long> retrieveTeamMatesUserId(User user) {
        return user.getTeamMembers().stream()
            .map(member -> member.getProject())
            .flatMap(project -> {
                return retrieveTeamMemberUserIds(project).stream();
            })
            .collect(Collectors.toSet());
    }

    /**
     * Retrieve the id of the user of the team members of the project
     *
     * @param project the project
     *
     * @return the project team members user ids
     */
    private static Set<Long> retrieveTeamMemberUserIds(Project project) {
        return project.getTeamMembers().stream()
            // filter out pending invitation
            .filter(member -> member.getUser() != null && member.getUser().getId() != null)
            .map(member -> member.getUser().getId())
            .collect(Collectors.toSet());
    }

    /**
     * Build a channel for each team member of the project
     *
     * @param project the project
     *
     * @return a set of user channels : one for each team member
     */
    private static Set<WebsocketChannel> buildTeamMemberChannels(Project project) {
        return project.getTeamMembers().stream()
            // filter out pending invitation
            .filter(member -> member.getUser() != null)
            .map(member -> UserChannel.build(member.getUser().getId()))
            .collect(Collectors.toSet());
    }

    /**
     * Build all channels needed when a card type is changed
     *
     * @param cardType    the card type
     * @param userDao     to fetch the admin
     * @param cardTypeDao to fetch the references of a card type
     *
     * @return
     */
    private static Set<WebsocketChannel> buildCardTypeInProjectChannel(
        AbstractCardType cardType, UserDao userDao,
        CardTypeDao cardTypeDao) {
        Set<WebsocketChannel> channels = new HashSet<>();

        if (cardType.getProject() != null) {
            // this type belongs to a specific project
            // first, everyone who is editing the project shall receive updates
            channels.add(ProjectContentChannel.build(cardType.getProject().getId()));

            if (cardType.isOrWasPublished()) {
                // eventually, published types are available to each project members
                // independently of the project they're editing
                channels.addAll(buildTeamMemberChannels(cardType.getProject()));
            }

            // then, the type must be propagated to all projects which reference it
            cardType.getDirectReferences().forEach(ref -> {
                channels.addAll(buildCardTypeInProjectChannel(ref, userDao, cardTypeDao));
            });
        } else {
            // This is a global type
            if (cardType.isOrWasPublished()) {
                // As the type is published, everyone may use this type -> broadcast
                channels.add(BroadcastChannel.build());
            } else {
                // Not published type are only available to admin
                channels.addAll(buildAdminChannels(userDao));
            }
        }

        return channels;
    }

}
