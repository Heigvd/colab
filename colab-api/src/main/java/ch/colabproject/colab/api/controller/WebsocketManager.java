/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller;

import ch.colabproject.colab.api.controller.security.SecurityManager;
import ch.colabproject.colab.api.model.document.Block;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.jpa.document.BlockDao;
import ch.colabproject.colab.api.persistence.jpa.project.ProjectDao;
import ch.colabproject.colab.api.persistence.jpa.user.UserDao;
import ch.colabproject.colab.api.security.permissions.Conditions;
import ch.colabproject.colab.api.ws.WebsocketEndpoint;
import ch.colabproject.colab.api.ws.WebsocketHelper;
import ch.colabproject.colab.api.ws.channel.AdminChannel;
import ch.colabproject.colab.api.ws.channel.BlockChannel;
import ch.colabproject.colab.api.ws.channel.BroadcastChannel;
import ch.colabproject.colab.api.ws.channel.ChannelOverview;
import ch.colabproject.colab.api.ws.channel.ProjectContentChannel;
import ch.colabproject.colab.api.ws.channel.WebsocketEffectiveChannel;
import ch.colabproject.colab.api.ws.message.PrecomputedWsMessages;
import ch.colabproject.colab.api.ws.message.WsChannelUpdate;
import ch.colabproject.colab.api.ws.message.WsSessionIdentifier;
import ch.colabproject.colab.api.ws.utils.CallableGetChannel;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import fish.payara.micro.cdi.Inbound;
import fish.payara.micro.cdi.Outbound;
import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.stream.Collectors;
import javax.ejb.Lock;
import javax.ejb.LockType;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.enterprise.event.Event;
import javax.enterprise.event.Observes;
import javax.inject.Inject;
import javax.websocket.EncodeException;
import javax.websocket.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.hazelcast.cluster.Member;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.core.IExecutorService;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Some methods to handle websocket connections. In the future, we may consider using external
 * services (eg Pusher) to delegate such thing. We may want to challenge this implementation in a
 * real "production-like" env.
 *
 * @author maxence
 */
@Singleton
// make sure the singleton is available as soon as possible with @Startup annotation
@Startup
// Since few methods actually need mutual exclusion, make sure to set default locktype to READ
// mutual exclusion is managed by hand in methods with synchronized blocks
@Lock(LockType.READ)
public class WebsocketManager {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(WebsocketManager.class);

    /**
     * Subscription event name.
     */
    private static final String WS_SUBSCRIPTION_EVENT_CHANNEL = "WS_SUBSCRIPTION_CHANNEL";

    /**
     * Hazelcast instance.
     */
    @Inject
    private HazelcastInstance hzInstance;

    /**
     * Instance which receive the REST subscription request may not be the same as the one which
     * owns the websocket connection. Use cluster event to delegate the processing to the correct
     * instance.
     */
    @Inject
    @Outbound(eventName = WS_SUBSCRIPTION_EVENT_CHANNEL, loopBack = true)
    private Event<SubscriptionRequest> subscriptionEvents;

    /**
     * Cluster-wide propagation event channel
     */
    private static final String WS_PROPAGATION_CHANNEL = "WS_PROPAGATION_CHANNEL";

    /**
     * In order to propagate changes to everyone. Each cluster instance must propagate changes to
     * sessions the instance is in change. This is the hz event to request such a propagation.
     */
    @Inject
    @Outbound(eventName = WS_PROPAGATION_CHANNEL, loopBack = true)
    private Event<PrecomputedWsMessages> messagePropagation;

    /**
     * Access control
     */
    @Inject
    private SecurityManager securityManager;

    /**
     * Request sidekick
     */
    @Inject
    private RequestManager requestManager;

    /**
     * Project DAO
     */
    @Inject
    private ProjectDao projectDao;

    /**
     * Block DAO
     */
    @Inject
    private BlockDao blockDao;

    /**
     * User DAO
     */
    @Inject
    private UserDao userDao;

    /**
     * channel subscriptions.
     */
    private ConcurrentMap<WebsocketEffectiveChannel, Set<Session>> subscriptions = new ConcurrentHashMap<>();

    /**
     * HTTP sessions to websocket sessions registry.
     * <p />
     * Since one can open several tabs in its browser, all tabs share the same httpSessionId
     * (cookie) but each has its own websocket session, we have to maintain such a map.
     * <p />
     * This is required cancel all subscription on logout.
     */
    private ConcurrentMap<Long, Set<Session>> httpSessionToWsSessions = new ConcurrentHashMap<>();

//    /**
//     * Each websocket session is linked to one http session.
//     * <p>
//     * This is the {@link httpSessionToWsSessions} reverse registry.
//     */
//    private Map<Session, Long> wsSessionToHttpSession = new HashMap<>();
    /**
     * List the channels each websocket session subscribe to.
     */
    private ConcurrentMap<Session, Set<WebsocketEffectiveChannel>> wsSessionMap = new ConcurrentHashMap<>();

    /**
     * Get list of all occupied channels.
     * <p>
     * This method is cluster-aware. In short, {@link #getSubscrciptionsCount() } will be called for
     * each instance of the cluster.
     *
     * @return list of all occupied channels mapped to the number of subscribers
     */
    public Set<ChannelOverview> getExistingChannels() {
        IExecutorService executorService = hzInstance.getExecutorService("COLAB_WS");
        Map<Member, Future<Map<WebsocketEffectiveChannel, Integer>>> results
            = executorService.submitToAllMembers(new CallableGetChannel());

        Map<WebsocketEffectiveChannel, Integer> aggregate = new HashMap<>();

        results.values().stream()
            .flatMap((result) -> {
                try {
                    return result.get(5, TimeUnit.SECONDS).entrySet().stream();
                } catch (InterruptedException | ExecutionException | TimeoutException ex) {
                    return null;
                }
            })
            .forEach(entry -> {
                if (aggregate.containsKey(entry.getKey())) {
                    aggregate.put(entry.getKey(), aggregate.get(entry.getKey()) + entry.getValue());
                } else {
                    aggregate.put(entry.getKey(), entry.getValue());
                }
            });

        return aggregate.entrySet().stream().map(entry -> {
            ChannelOverview channelOverview = new ChannelOverview();
            channelOverview.setChannel(entry.getKey());
            channelOverview.setCount(entry.getValue());
            return channelOverview;
        }).collect(Collectors.toSet());
    }

    /**
     * Get the list of occupied channels this instance is in charge.
     *
     * @return the list of channels and the number of sessions subscribed to each of them
     */
    public Map<WebsocketEffectiveChannel, Integer> getSubscrciptionsCount() {
        return this.subscriptions.entrySet().stream()
            .collect(Collectors.toMap(Entry::getKey, entry -> entry.getValue().size()));
    }

    /**
     * Current user want to subscribe the broadcast channel
     *
     * @param sessionId websocket session identifier
     */
    public void subscribeToBroadcastChannel(WsSessionIdentifier sessionId) {
        logger.debug("Session {} want to subscribe to broadcast channel", sessionId);
        SubscriptionRequest request = SubscriptionRequest.build(
            SubscriptionRequest.SubscriptionType.SUBSCRIBE,
            SubscriptionRequest.ChannelType.BROADCAST,
            0L,
            sessionId.getSessionId(),
            requestManager.getAndAssertHttpSession().getId());
        subscriptionEvents.fire(request);
    }

    /**
     * Current user want to unsubscribe from the broadcast channel
     *
     * @param sessionId websocket session identifier
     */
    public void unsubscribeFromBroadcastChannel(WsSessionIdentifier sessionId) {
        logger.debug("Session {} want to unsubscribe from the broadcast channel", sessionId);
        // assert current user is authenticated
        securityManager.assertAndGetCurrentUser();
        SubscriptionRequest request = SubscriptionRequest.build(
            SubscriptionRequest.SubscriptionType.UNSUBSCRIBE,
            SubscriptionRequest.ChannelType.BROADCAST,
            0L,
            sessionId.getSessionId(),
            requestManager.getAndAssertHttpSession().getId());
        subscriptionEvents.fire(request);
    }

    /**
     * Current user want to subscribe to its own channel.
     *
     * @param sessionId websocket session identifier
     */
    public void subscribeToUserChannel(WsSessionIdentifier sessionId) {
        logger.debug("Session {} want to subscribe to its UserChannel", sessionId);
        User user = securityManager.assertAndGetCurrentUser();
        SubscriptionRequest request = SubscriptionRequest.build(
            SubscriptionRequest.SubscriptionType.SUBSCRIBE,
            SubscriptionRequest.ChannelType.USER,
            user.getId(),
            sessionId.getSessionId(),
            requestManager.getAndAssertHttpSession().getId());
        subscriptionEvents.fire(request);
    }

    /**
     * Current user want to unsubscribe from its own channel.
     *
     * @param sessionId websocket session identifier
     */
    public void unsubscribeFromUserChannel(WsSessionIdentifier sessionId) {
        logger.debug("Session {} want to unsubscribe from its UserChannel", sessionId);
        User user = securityManager.assertAndGetCurrentUser();
        SubscriptionRequest request = SubscriptionRequest.build(
            SubscriptionRequest.SubscriptionType.UNSUBSCRIBE,
            SubscriptionRequest.ChannelType.USER,
            user.getId(),
            sessionId.getSessionId(),
            requestManager.getAndAssertHttpSession().getId());
        subscriptionEvents.fire(request);
    }

    /**
     * Current user want to subscribe to a project channel.
     *
     * @param sessionId websocket session identifier
     * @param projectId if of the project
     *
     * @throws HttpErrorMessage notFound if the project does not exists
     */
    public void subscribeToProjectChannel(WsSessionIdentifier sessionId, Long projectId) {
        logger.debug("Session {} want to subscribe to Project#{}", sessionId, projectId);
        Project project = projectDao.getProject(projectId);
        if (project != null) {
            securityManager.assertConditionTx(new Conditions.IsCurrentUserMemberOfProject(project),
                "Subscribe to project channel: Permision denied");
            SubscriptionRequest request = SubscriptionRequest.build(
                SubscriptionRequest.SubscriptionType.SUBSCRIBE,
                SubscriptionRequest.ChannelType.PROJECT,
                project.getId(),
                sessionId.getSessionId(),
                requestManager.getAndAssertHttpSession().getId());
            subscriptionEvents.fire(request);
        } else {
            throw HttpErrorMessage.notFound();
        }
    }

    /**
     * Current user want to unsubscribe from a project channel.
     *
     * @param sessionId websocket session identifier
     * @param projectId if of the project
     *
     * @throws HttpErrorMessage notFound if the project does not exists
     */
    public void unsubscribeFromProjectChannel(WsSessionIdentifier sessionId, Long projectId) {
        logger.debug("Session {} want to unsubscribe from Project#{}", sessionId, projectId);
        Project project = projectDao.getProject(projectId);
        if (project != null) {
            securityManager.assertConditionTx(new Conditions.IsCurrentUserMemberOfProject(project),
                "Subscribe to project channel: Permision denied");
            SubscriptionRequest request = SubscriptionRequest.build(
                SubscriptionRequest.SubscriptionType.UNSUBSCRIBE,
                SubscriptionRequest.ChannelType.PROJECT,
                project.getId(),
                sessionId.getSessionId(),
                requestManager.getAndAssertHttpSession().getId());
            subscriptionEvents.fire(request);
        } else {
            throw HttpErrorMessage.notFound();
        }
    }

    /**
     * Current user want to subscribe to a block channel.
     *
     * @param sessionId websocket session identifier
     * @param blockId   if of the block
     *
     * @throws HttpErrorMessage notFound if the block does not exists
     */
    public void subscribeToBlockChannel(WsSessionIdentifier sessionId, Long blockId) {
        logger.debug("Session {} want to subscribe to Block#{}", sessionId, blockId);
        Block block = blockDao.findBlock(blockId);
        if (block != null) {
            // no explicit security check : if one can load the block, one can subscribe to its channel
//            securityManager.assertConditionTx(new Conditions.IsCurrentUserMemberOfBlock(block),
//                "Subscribe to block channel: Permission denied");
            SubscriptionRequest request = SubscriptionRequest.build(
                SubscriptionRequest.SubscriptionType.SUBSCRIBE,
                SubscriptionRequest.ChannelType.BLOCK,
                block.getId(),
                sessionId.getSessionId(),
                requestManager.getAndAssertHttpSession().getId());
            subscriptionEvents.fire(request);
        } else {
            throw HttpErrorMessage.notFound();
        }
    }

    /**
     * Current user want to unsubscribe from a block channel.
     *
     * @param sessionId websocket session identifier
     * @param blockId   if of the block
     *
     * @throws HttpErrorMessage notFound if the block does not exists
     */
    public void unsubscribeFromBlockChannel(WsSessionIdentifier sessionId, Long blockId) {
        logger.debug("Session {} want to unsubscribe from Block#{}", sessionId, blockId);
        Block block = blockDao.findBlock(blockId);
        if (block != null) {
            // no explicit security check : if one can load the block, one can subscribe to its channel
//            securityManager.assertConditionTx(new Conditions.IsCurrentUserMemberOfBlock(block),
//                "Subscribe to block channel: Permission denied");
            SubscriptionRequest request = SubscriptionRequest.build(
                SubscriptionRequest.SubscriptionType.UNSUBSCRIBE,
                SubscriptionRequest.ChannelType.BLOCK,
                block.getId(),
                sessionId.getSessionId(),
                requestManager.getAndAssertHttpSession().getId());
            subscriptionEvents.fire(request);
        } else {
            throw HttpErrorMessage.notFound();
        }
    }

    /**
     * Process subscription request
     *
     * @param request the subscription request
     */
    public void processSubscription(
        @Observes @Inbound(eventName = WS_SUBSCRIPTION_EVENT_CHANNEL) SubscriptionRequest request) {
        // all security checks have been done before firing the subscription event
        requestManager.sudo(() -> {
            logger.debug("Channel subscription request: {}", request);
            Session session = WebsocketEndpoint.getSession(request.getWsSessionId());
            if (session != null) {

                logger.debug("Process channel subscription request: {}", request);

                // first determine the effective channel
                WebsocketEffectiveChannel channel = getChannel(request);
                if (channel != null) {
                    synchronized (this) {
                        // make sure the http session has its own set of wsSessions
                        // and  make sure the websocket session is linked to the http session
                        httpSessionToWsSessions.computeIfAbsent(request.getColabSessionId(), (key) -> {
                            return new HashSet<>();
                        })
                            // and  make sure the websocket session is linked to the http session
                            .add(session);

                        // make sure to link wsSession to its Http session
                        // wsSessionToHttpSession.put(session, request.getColabSessionId()); // TODO: is it even used ?
                        if (request.getType() == SubscriptionRequest.SubscriptionType.SUBSCRIBE) {
                            // make sure the http session has its own list of channels
                            wsSessionMap.computeIfAbsent(session, (key) -> {
                                return new HashSet<>();
                            })
                                // keep wsSession to channel registry up-to date
                                .add(channel);

                            // subscribe to channel
                            subscribe(channel, session);
                        } else {
                            // Remove the channel from the set of channel linked to the wsSession
                            if (wsSessionMap.containsKey(session)) {
                                Set<WebsocketEffectiveChannel> channels = wsSessionMap.get(session);
                                channels.remove(channel);
                                if (channels.isEmpty()) {
                                    wsSessionMap.remove(session);
                                }
                            }
                            unsubscribe(channel, Set.of(session));
                        }
                    }
                } else {
                    logger.debug("Failed to resolve {} to an effective channel", request);
                }
            } else {
                logger.debug("Ignore channel subscription: {}", request);
            }
        });
    }

    /**
     * Add the given session to the set identified by the given channel, in the given map.
     *
     * @param map     map which contains sets
     * @param keyId   set id
     * @param session session to remove from the set
     */
    private void subscribe(WebsocketEffectiveChannel channel, Session session) {
        if (logger.isDebugEnabled()) {
            String sessionId = WebsocketEndpoint.getSessionId(session);
            logger.debug("Session {} subscribes to {}", sessionId, channel);
        }
        subscriptions.computeIfAbsent(channel, (key -> {
            return new HashSet();
        })).add(session);

        //  make sure to propgate channelCHange after subscription
        //  (the ChannelChange event may be send through this very subscription, eg if an admin
        //   is subscribing to its own userChannel)
        this.propagateChannelChange(channel, 1);
    }

    /**
     * Unsubscribe all sessions from given channel. If the channel is empty after the operation, it
     * will be destroyed.
     *
     * @param channel  channel to update
     * @param sessions session to remove from channel
     */
    private void unsubscribe(WebsocketEffectiveChannel channel, Set<Session> sessions) {
        Set<Session> chSessions = subscriptions.get(channel);
        if (logger.isDebugEnabled()) {
            logger.debug("Sessions {} unsubscribes from {}", sessions.stream().map(session
                -> WebsocketEndpoint.getSessionId(session)
            ), channel);
        }
        if (chSessions != null) {
            int size = chSessions.size();
            chSessions.removeAll(sessions);

            // make sure to propate change before the unsubscription is effective
            this.propagateChannelChange(channel, chSessions.size() - size);

            if (chSessions.isEmpty()) {
                subscriptions.remove(channel);
            }
        }
    }

    /**
     * Propagate a channel change
     *
     * @param channel the channel
     * @param diff    diff
     */
    private void propagateChannelChange(WebsocketEffectiveChannel channel, int diff) {
        try {
            PrecomputedWsMessages prepareWsMessage = WebsocketHelper.prepareWsMessage(
                userDao,
                requestManager,
                new AdminChannel(),
                WsChannelUpdate.build(channel, diff)
            );
            this.propagate(prepareWsMessage);
        } catch (EncodeException ex) {
            logger.error("Faild to propagate channel change :{}", channel);
        }
    }

    /**
     * Determine the EffectiveChannel
     *
     * @param request the request
     *
     * @return the channel which match the request
     */
    private WebsocketEffectiveChannel getChannel(SubscriptionRequest request) {
        if (request.getChannelType() == SubscriptionRequest.ChannelType.PROJECT) {
            Project project = projectDao.getProject(request.getChannelId());
            if (project != null) {
                return ProjectContentChannel.build(project);
            }
        } else if (request.getChannelType() == SubscriptionRequest.ChannelType.BLOCK) {
            Block block = blockDao.findBlock(request.getChannelId());
            if (block != null) {
                return BlockChannel.build(block);
            }
        } else if (request.getChannelType() == SubscriptionRequest.ChannelType.USER) {
            User user = userDao.findUser(request.getChannelId());
            if (user != null) {
                return user.getEffectiveChannel();
            }
        } else if (request.getChannelType() == SubscriptionRequest.ChannelType.BROADCAST) {
            return BroadcastChannel.build();
        }

        // not found...
        return null;
    }

    /**
     * Propagate precomputed message to clients. Actually, this methods, will ask all instances of
     * the hazelcast cluster to propagate the message to session they're in charge. This will call
     * {@link #onMessagePropagation(PrecomputedWsMessages) onMessagePropagation}cluster-wide.
     *
     * @param message precomputed message to propagate.
     */
    public void propagate(PrecomputedWsMessages message) {
        this.messagePropagation.fire(message);
    }

    /**
     * On Hazelcast event. Each instance receive precomputed message.
     *
     *
     * @param payload the messagesByChannels to send to clients though relevant websocket channels
     */
    public void onMessagePropagation(
        @Observes @Inbound(eventName = WS_PROPAGATION_CHANNEL) PrecomputedWsMessages payload) {

        Map<WebsocketEffectiveChannel, List<String>> messagesByChannels = payload.getMessages();
        if (messagesByChannels != null) {
            messagesByChannels.forEach((channel, messages) -> {
                Set<Session> subscribers = this.subscriptions.get(channel);
                if (subscribers != null) {
                    subscribers.forEach(session -> {
                        messages.forEach(message -> {
                            try {
                                logger.debug("Send {} to {} ({})", message, session.getId(), channel);
                                if (session.isOpen()) {
                                    session.getBasicRemote().sendText(message);
                                }
                            } catch (IOException ex) {
                                logger.error("Failed to send websocket message {} to {}",
                                    message, session);
                            }
                        });
                    });
                }
            });
        }
    }

    /**
     * Unsubscribe all channel linked to the given httpSessionId. This is required after the user
     * sign out.
     *
     * @param httpSessionId httpSessionId which just sign out
     */
    public void signoutAndUnsubscribeFromAll(Long httpSessionId) {
        synchronized (this) {
            // TODO send logout event, so each client (each browser tab) knows it has been disconnected
            Set<Session> wsSessions = this.httpSessionToWsSessions.get(httpSessionId);
            if (wsSessions != null) {
                // the http session is linked to one or more websocket session, let's cancel all their
                // subscriptions
                wsSessions.stream()
                    // get channels from each wsSession
                    .map(wsSession -> this.wsSessionMap.get(wsSession))
                    // filter out null channels set
                    .filter(channels -> channels != null)
                    // convert "stream of set of channels" to "stream of channels"
                    .flatMap(Collection::stream)
                    // no need to list same channel twice
                    .distinct()
                    // clean subscriptions
                    .forEach(channel -> {
                        this.unsubscribe(channel, wsSessions);
                    });
            }

            this.httpSessionToWsSessions.remove(httpSessionId);
        }
    }

    /**
     * Clean subscription on session close
     *
     * @param session websocket session to clean subscription for
     */
    public void unsubscribeFromAll(Session session) {
        synchronized (this) {
            Set<WebsocketEffectiveChannel> set = this.wsSessionMap.get(session);
            if (set != null) {
                Set<Session> setOfSession = Set.of(session);
                set.forEach(channel -> {
                    unsubscribe(channel, setOfSession);
                });
                this.wsSessionMap.remove(session);
            }
        }
    }
}
