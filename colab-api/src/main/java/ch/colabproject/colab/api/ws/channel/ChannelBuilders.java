/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.channel;

import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.user.Account;
import ch.colabproject.colab.api.model.user.HttpSession;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.jpa.card.CardTypeDao;
import ch.colabproject.colab.api.persistence.jpa.user.UserDao;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Compute the channels needed to propagate alteration changes.
 *
 * @author sandra
 */
public final class ChannelBuilders {

    /**
     * Private constructor prevents instantiation
     */
    private ChannelBuilders() {
        throw new UnsupportedOperationException("This is a utility class");
    }

    /**
     * To determine the channels to use
     */
    public static abstract class ChannelBuilder {
        /**
         * Determine the channels to use
         *
         * @param userDao     the dao to fetch users
         * @param cardTypeDao the dao to fetch card type
         *
         * @return all channels to use for propagation
         */
        public Set<WebsocketEffectiveChannel> computeEffectiveChannels(UserDao userDao,
            CardTypeDao cardTypeDao) {
            return build(userDao, cardTypeDao);
        }

        /**
         * Determine the channels to use
         *
         * @param userDao     the dao to fetch users
         * @param cardTypeDao the dao to fetch card type
         *
         * @return all channels to use for propagation
         */
        abstract protected Set<WebsocketEffectiveChannel> build(UserDao userDao,
            CardTypeDao cardTypeDao);
    }

    /**
     * When there is no channel
     */
    public static class EmptyChannelBuilder extends ChannelBuilder {
        @Override
        protected Set<WebsocketEffectiveChannel> build(UserDao userDao, CardTypeDao cardTypeDao) {
            return Set.of();
        }
    }

    /**
     * To build a block channel
     */
    public static class BlockChannelBuilder extends ChannelBuilder {
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
        protected Set<WebsocketEffectiveChannel> build(UserDao userDao, CardTypeDao cardTypeDao) {
            if (blockId != null) {
                return Set.of(BlockChannel.build(blockId));
            } else {
                return Set.of();
            }
        }
    }

    /**
     * To build a project content channel
     */
    public static class ProjectContentChannelBuilder extends ChannelBuilder {
        /** the project */
        private final Project project;

        /**
         * Create a builder for a project content channel
         *
         * @param project the project
         */
        public ProjectContentChannelBuilder(Project project) {
            this.project = project;
        }

        @Override
        protected Set<WebsocketEffectiveChannel> build(UserDao userDao, CardTypeDao cardTypeDao) {
            if (project != null) {
                return Set.of(ProjectContentChannel.build(project));
            } else {
                return Set.of();
            }
        }
    }

    /**
     * To build all channels needed to propagate a project overview alteration
     */
    public static class ProjectOverviewChannelBuilder extends ChannelBuilder {
        /** the project */
        private final Project project;

        /**
         * Create a builder for the channels to use when a project overview data is changed
         *
         * @param project the project
         */
        public ProjectOverviewChannelBuilder(Project project) {
            this.project = project;
        }

        @Override
        protected Set<WebsocketEffectiveChannel> build(UserDao userDao, CardTypeDao cardTypeDao) {
            Set<WebsocketEffectiveChannel> channels = new HashSet<>();

            if (project != null) {
                channels.addAll(buildTeammemberChannels(this.project));

                channels.addAll(buildAdminChannels(userDao));
            }

            return channels;
        }
    }

    /**
     * To build a channel for each admin
     */
    public static class ForAdminChannelBuilder extends ChannelBuilder {

        @Override
        protected Set<WebsocketEffectiveChannel> build(UserDao userDao, CardTypeDao cardTypeDao) {
            return buildAdminChannels(userDao);
        }
    }

    /**
     * To build all channels needed to propagate a user alteration
     */
    public static class UserChannelBuilder extends ChannelBuilder {
        /** the user */
        private final User user;

        /**
         * Create a builder for the channels to use when a user is changed
         *
         * @param user the user
         */
        public UserChannelBuilder(User user) {
            this.user = user;
        }

        @Override
        protected Set<WebsocketEffectiveChannel> build(UserDao userDao, CardTypeDao cardTypeDao) {
            Set<WebsocketEffectiveChannel> channels = new HashSet<>();

            if (user != null) {
                channels.add(UserChannel.build(user));

                channels.addAll(buildTeammatesChannels(user));

                channels.addAll(buildAdminChannels(userDao));
            }

            return channels;
        }
    }

    /**
     * To build all channels needed to propagate an account alteration
     */
    public static class AccountChannelBuilder extends ChannelBuilder {
        /** the account */
        private final Account account;

        /**
         * Create a builder for the channels to use when an account is changed
         *
         * @param account the account
         */
        public AccountChannelBuilder(Account account) {
            this.account = account;
        }

        @Override
        protected Set<WebsocketEffectiveChannel> build(UserDao userDao, CardTypeDao cardTypeDao) {
            Set<WebsocketEffectiveChannel> channels = new HashSet<>();

            if (account.getUser() != null) {
                channels.add(UserChannel.build(account.getUser()));
            }

            channels.addAll(buildAdminChannels(userDao));

            return channels;
        }
    }

    /**
     * To build all channels needed to propagate a http session alteration
     */
    public static class HttpSessionBuilder extends ChannelBuilder {
        /** the http session */
        private final HttpSession httpSession;

        /**
         * Create a builder for the channels to user when a http session is changed
         *
         * @param httpSession the http session
         */
        public HttpSessionBuilder(HttpSession httpSession) {
            this.httpSession = httpSession;
        }

        @Override
        protected Set<WebsocketEffectiveChannel> build(UserDao userDao, CardTypeDao cardTypeDao) {
            if (httpSession.getAccount() != null) {
                return new AccountChannelBuilder(httpSession.getAccount())
                    .build(userDao, cardTypeDao);
            } else {
                return new ForAdminChannelBuilder().build(userDao, cardTypeDao);
            }
        }
    }

    /**
     * To build all channels needed for a card type belonging to a project
     */
    public static class CardTypeChannelBuilder extends ChannelBuilder {
        /** the card type */
        private final AbstractCardType cardType;

        /**
         * Create a channel builder for everything needed for a card type belonging to a project
         *
         * @param cardType the card type
         */
        public CardTypeChannelBuilder(AbstractCardType cardType) {
            this.cardType = cardType;
        }

        @Override
        protected Set<WebsocketEffectiveChannel> build(UserDao userDao,
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
    private static Set<WebsocketEffectiveChannel> buildAdminChannels(UserDao userDao) {
        return userDao.findAllAdmin().stream()
            .map(user -> UserChannel.build(user))
            .collect(Collectors.toSet());
    }

    /**
     * Build a channel for each team mates of the user
     *
     * @param user the user
     *
     * @return a set of channels : one user channel for each team member of each project
     */
    private static Set<WebsocketEffectiveChannel> buildTeammatesChannels(User user) {
        Set<WebsocketEffectiveChannel> channels = new HashSet<>();

        user.getTeamMembers().forEach(member -> {
            channels.addAll(buildTeammemberChannels(member.getProject()));
        });

        return channels;
    }

    /**
     * Build a channel for each team member of the project
     *
     * @param project the project
     *
     * @return a set of user channels : one for each team member
     */
    private static Set<WebsocketEffectiveChannel> buildTeammemberChannels(Project project) {
        return project.getTeamMembers().stream()
            // filter out pending invitation
            .filter(member -> member.getUser() != null)
            .map(member -> UserChannel.build(member.getUser()))
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
    private static Set<WebsocketEffectiveChannel> buildCardTypeInProjectChannel(
        AbstractCardType cardType, UserDao userDao,
        CardTypeDao cardTypeDao) {
        Set<WebsocketEffectiveChannel> channels = new HashSet<>();

        if (cardType.getProject() != null) {
            // this type belongs to a specific project
            // first, everyone who is editing the project shall receive updates
            channels.add(ProjectContentChannel.build(cardType.getProject()));

            if (cardType.isOrWasPublished()) {
                // eventually, published types are available to each project members
                // independently of the project they're editing
                channels.addAll(buildTeammemberChannels(cardType.getProject()));
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
