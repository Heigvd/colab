/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller;

import ch.colabproject.colab.api.controller.document.BlockManager;
import ch.colabproject.colab.api.controller.project.ProjectManager;
import ch.colabproject.colab.api.controller.security.SecurityManager;
import ch.colabproject.colab.api.model.document.TextDataBlock;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.jpa.user.UserDao;
import ch.colabproject.colab.api.presence.PresenceManager;
import ch.colabproject.colab.api.presence.model.TouchUserPresence;
import ch.colabproject.colab.api.security.permissions.Conditions;
import ch.colabproject.colab.api.ws.WebsocketEndpoint;
import ch.colabproject.colab.api.ws.WebsocketMessagePreparer;
import ch.colabproject.colab.api.ws.channel.model.BlockChannel;
import ch.colabproject.colab.api.ws.channel.model.BroadcastChannel;
import ch.colabproject.colab.api.ws.channel.model.ProjectContentChannel;
import ch.colabproject.colab.api.ws.channel.model.UserChannel;
import ch.colabproject.colab.api.ws.channel.model.WebsocketChannel;
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
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
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
     * Project specific logic management
     */
    @Inject
    private ProjectManager projectManager;

    /**
     * Block specific logic management
     */
    @Inject
    private BlockManager blockManager;

    /**
     * User DAO
     */
    @Inject
    private UserDao userDao;

    /**
     * Presence Manager
     */
    @Inject
    private PresenceManager presenceManager;

    /** to propagate changes */
    @Inject
    private EntityGatheringBagForPropagation bag;

    /**
     * channel subscriptions.
     */
    private ConcurrentMap<WebsocketChannel, Set<Session>> subscriptions = new ConcurrentHashMap<>();

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
    private ConcurrentMap<Session, Set<WebsocketChannel>> wsSessionMap = new ConcurrentHashMap<>();

    /**
     * Get list of all occupied channels.
     * <p>
     * This method is cluster-aware. In short, {@link #getSubscriptionsCount() } will be called for
     * each instance of the cluster.
     *
     * @return list of all occupied channels URN mapped to the number of subscribers
     */
    public Map<String, Integer> getExistingChannels() {
        IExecutorService executorService = hzInstance.getExecutorService("COLAB_WS");
        Map<Member, Future<Map<String, Integer>>> results = executorService
            .submitToAllMembers(new CallableGetChannel());

        Map<String, Integer> map = new HashMap<>();

        results.values().stream()
            .flatMap((result) -> {
                try {
                    return result.get(5, TimeUnit.SECONDS).entrySet().stream();
                } catch (InterruptedException | ExecutionException | TimeoutException ex) {
                    return null;
                }
            })
            .forEach(entry -> {
                String key = entry.getKey();
                var currentCount = map.get(entry.getKey());
                if (currentCount != null) {
                    map.put(key, currentCount + entry.getValue());
                } else {
                    map.put(key, entry.getValue());
                }
            });

        return map;
    }

    /**
     * Get the list of occupied channels this instance is in charge.
     *
     * @return the list of channels and the number of sessions subscribed to each of them
     */
    public Map<String, Integer> getSubscriptionsCount() {
        return this.subscriptions.entrySet().stream()
            .collect(Collectors.toMap(entry -> entry.getKey().getUrn(),
                entry -> entry.getValue().size()));
    }

    /**
     * Current user wants to subscribe the broadcast channel
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
     * Current user wants to unsubscribe from the broadcast channel
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
     * Current user wants to subscribe to its own channel.
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
     * Current user wants to unsubscribe from its own channel.
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
     * Current user wants to subscribe to a project channel.
     *
     * @param sessionId websocket session identifier
     * @param projectId id of the project
     *
     * @throws HttpErrorMessage notFound if the project does not exist
     */
    public void subscribeToProjectChannel(WsSessionIdentifier sessionId, Long projectId) {
        logger.debug("Session {} want to subscribe to Project#{}", sessionId, projectId);
        Project project = projectManager.assertAndGetProject(projectId);
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

            // Register user presence
            TouchUserPresence touch = new TouchUserPresence();
            touch.setProjectId(projectId);
            touch.setWsSessionId(sessionId.getSessionId());
            presenceManager.updateUserPresence(touch);
        } else {
            throw HttpErrorMessage.notFound();
        }
    }

    /**
     * Current user wants to unsubscribe from a project channel.
     *
     * @param sessionId websocket session identifier
     * @param projectId id of the project
     *
     * @throws HttpErrorMessage notFound if the project does not exist
     */
    public void unsubscribeFromProjectChannel(WsSessionIdentifier sessionId, Long projectId) {
        logger.debug("Session {} want to unsubscribe from Project#{}", sessionId, projectId);
        Project project = projectManager.assertAndGetProject(projectId);
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

            // user is not present any longer
            presenceManager.clearWsSession(projectId, sessionId.getSessionId());
        } else {
            throw HttpErrorMessage.notFound();
        }
    }

    /**
     * Current user wants to subscribe to a block channel.
     *
     * @param sessionId websocket session identifier
     * @param blockId   id of the block
     *
     * @throws HttpErrorMessage notFound if the block does not exist
     */
    public void subscribeToBlockChannel(WsSessionIdentifier sessionId, Long blockId) {
        logger.debug("Session {} want to subscribe to Block#{}", sessionId, blockId);
        TextDataBlock block = blockManager.findBlock(blockId);
        if (block != null) {
            // no explicit security check : if one can load the block, one can subscribe to its
            // channel
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
     * Current user wants to unsubscribe from a block channel.
     *
     * @param sessionId websocket session identifier
     * @param blockId   id of the block
     */
    public void unsubscribeFromBlockChannel(WsSessionIdentifier sessionId, Long blockId) {
        logger.debug("Session {} want to unsubscribe from Block#{}", sessionId, blockId);
        SubscriptionRequest request = SubscriptionRequest.build(
            SubscriptionRequest.SubscriptionType.UNSUBSCRIBE,
            SubscriptionRequest.ChannelType.BLOCK,
            blockId,
            sessionId.getSessionId(),
            requestManager.getAndAssertHttpSession().getId());
        subscriptionEvents.fire(request);
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
                WebsocketChannel channel = getChannel(request);
                if (channel != null) {
                    synchronized (this) {
                        // make sure the http session has its own set of wsSessions
                        // and make sure the websocket session is linked to the http session
                        httpSessionToWsSessions
                            .computeIfAbsent(request.getColabSessionId(), (key) -> {
                                return new HashSet<>();
                            })
                            // and make sure the websocket session is linked to the http session
                            .add(session);

                        // make sure to link wsSession to its Http session
                        // wsSessionToHttpSession.put(session, request.getColabSessionId()); //
                        // TODO: is it even used ?
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
                                Set<WebsocketChannel> channels = wsSessionMap.get(session);
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
    private void subscribe(WebsocketChannel channel, Session session) {
        if (logger.isDebugEnabled()) {
            String sessionId = WebsocketEndpoint.getSessionId(session);
            logger.debug("Session {} subscribes to {}", sessionId, channel);
        }
        subscriptions.computeIfAbsent(channel, (key -> {
            return new HashSet<>();
        })).add(session);

        // make sure to propagate channelCHange after subscription
        // (the ChannelChange event may be send through this very subscription, eg if an admin
        // is subscribing to its own userChannel)
        this.propagateChannelChange(channel, 1);
    }

    /**
     * Unsubscribe all sessions from given channel. If the channel is empty after the operation, it
     * will be destroyed.
     *
     * @param channel  channel to update
     * @param sessions session to remove from channel
     */
    private void unsubscribe(WebsocketChannel channel, Set<Session> sessions) {
        Set<Session> chSessions = subscriptions.get(channel);
        if (logger.isDebugEnabled()) {
            logger.debug("Sessions {} unsubscribes from {}",
                sessions.stream().map(session -> WebsocketEndpoint.getSessionId(session)
                ), channel);
        }
        if (chSessions != null) {
            int size = chSessions.size();
            chSessions.removeAll(sessions);

            // make sure to propagate change before the unsubscription is effective
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
    private void propagateChannelChange(WebsocketChannel channel, int diff) {
        try {
            PrecomputedWsMessages prepareWsMessage = WebsocketMessagePreparer
                .prepareWsMessageForAdmins(
                    userDao,
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
    private WebsocketChannel getChannel(SubscriptionRequest request) {
        if (request.getChannelType() == SubscriptionRequest.ChannelType.PROJECT) {
            Project project = projectManager.assertAndGetProject(request.getChannelId());
            if (project != null) {
                return ProjectContentChannel.build(project.getId());
            }
        } else if (request.getChannelType() == SubscriptionRequest.ChannelType.BLOCK) {
            TextDataBlock block = blockManager.findBlock(request.getChannelId());
            if (block != null) {
                return BlockChannel.build(block.getId());
            }
        } else if (request.getChannelType() == SubscriptionRequest.ChannelType.USER) {
            User user = userDao.findUser(request.getChannelId());
            if (user != null) {
                return UserChannel.build(user);
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
     * @param payload the messagesByChannels to send to clients though relevant websocket channels
     */
    public void onMessagePropagation(
        @Observes @Inbound(eventName = WS_PROPAGATION_CHANNEL) PrecomputedWsMessages payload) {

        Map<WebsocketChannel, List<String>> messagesByChannels = payload.getMessages();
        if (messagesByChannels != null) {

            Map<Session, List<String>> mappedMessages = new HashMap<>();

            // Group messages by effective websocket session
            messagesByChannels.forEach((channel, messages) -> {
                Set<Session> subscribers = this.subscriptions.get(channel);
                if (subscribers != null) {
                    subscribers.forEach(session -> {
                        List<String> list = mappedMessages.computeIfAbsent(session,
                            (k) -> new LinkedList<>());
                        list.addAll(messages);
                    });
                }
            });

            // send one big message to each session
            mappedMessages.entrySet().forEach(entry -> {
                Session session = entry.getKey();
                String jsonArray = entry.getValue().stream()
                    .collect(Collectors.joining(", ", "[", "]"));
                try {
                    logger.debug("Send {} to {} ({})", jsonArray, session.getId());
                    if (session.isOpen()) {
                        session.getBasicRemote().sendText(jsonArray);
                    }
                } catch (IOException ex) {
                    logger.error("Failed to send websocket message {} to {}",
                        jsonArray, session);
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
            // TODO send logout event, so each client (each browser tab) knows it has been
            // disconnected
            Set<Session> wsSessions = this.httpSessionToWsSessions.get(httpSessionId);
            if (wsSessions != null) {
                // the http session is linked to one or more websocket session, let's cancel all
                // their
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
     * @param session   websocket session to clean subscription for
     * @param sessionId public websocket identifier
     */
    public void unsubscribeFromAll(Session session, String sessionId) {
        synchronized (this) {
            Set<WebsocketChannel> set = this.wsSessionMap.get(session);
            if (set != null) {
                Set<Session> setOfSession = Set.of(session);
                set.forEach(channel -> {
                    unsubscribe(channel, setOfSession);
                    if (channel instanceof ProjectContentChannel) {
                        ProjectContentChannel pChannel = (ProjectContentChannel) channel;
                        presenceManager.clearWsSession(pChannel.getProjectId(), sessionId);
                    }
                });
                this.wsSessionMap.remove(session);
                // flush changes ASAP
                WebsocketTxSync synchronizer = bag.getSynchronizer();
                if (synchronizer != null) {
                    synchronizer.flush();
                }
            }
        }
    }
}
