/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.project.ProjectDao;
import ch.colabproject.colab.api.persistence.user.UserDao;
import ch.colabproject.colab.api.ws.WebsocketEndpoint;
import ch.colabproject.colab.api.ws.channel.ProjectContentChannel;
import ch.colabproject.colab.api.ws.channel.WebsocketEffectiveChannel;
import ch.colabproject.colab.api.ws.message.PrecomputedWsMessages;
import ch.colabproject.colab.api.ws.message.WsSessionIdentifier;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import fish.payara.micro.cdi.Inbound;
import fish.payara.micro.cdi.Outbound;
import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.ejb.Singleton;
import javax.ejb.Startup;
import javax.enterprise.event.Event;
import javax.enterprise.event.Observes;
import javax.inject.Inject;
import javax.websocket.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Some methods to handle websocket connections. In the future, we may consider using external
 * services (eg Pusher) to delegate such thing. We may want to challenge this implementation in a
 * real "production-like" env.
 *
 * @author maxence
 */
@Singleton // use ejb @Singleton, as it provide concurrrency control
@Startup // make sure the singleton is available as soon as possible
public class WebsocketFacade {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(WebsocketFacade.class);

    /**
     * Subscription event name.
     */
    private static final String WS_SUBSCRIPTION_EVENT_CHANNEL = "WS_SUBSCRIPTION_CHANNEL";

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
    private SecurityFacade securityFacade;

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
     * User DAO
     */
    @Inject
    private UserDao userDao;

    /**
     * channel subscriptions.
     */
    private Map<WebsocketEffectiveChannel, Set<Session>> subscriptions = new HashMap<>();

    /**
     * HTTP sessions to websocket sessions registry.
     * <p />
     * Since one can open several tabs in its browser, all tabs sharing the same httpSessionId
     * (cookie) but each has its own websocket session, we have to maintain such a map.
     * <p />
     * This is required cancel all subscription on logout.
     */
    private Map<String, Set<Session>> httpSessionToWsSessions = new HashMap<>();

    /**
     * Each websocket session is linked to one http session.
     * <p>
     * This is the {@link httpSessionToWsSessions} reverse registry.
     */
    private Map<Session, String> wsSessionToHttpSession = new HashMap<>();

    /**
     * List the channels each websocket session subscribe to.
     */
    private Map<Session, Set<WebsocketEffectiveChannel>> wsSessionMap = new HashMap<>();

    /**
     * Current user want to subscribe to its own channel.
     *
     * @param sessionId websocket session identifier
     */
    public void subscribeToUserChannel(WsSessionIdentifier sessionId) {
        logger.debug("Session {} want to subscribe to its UserChannel", sessionId);
        User user = securityFacade.assertAndGetCurrentUser();
        SubscriptionRequest request = SubscriptionRequest.build(
            SubscriptionRequest.SubscriptionType.SUBSCRIBE,
            SubscriptionRequest.ChannelType.USER,
            user.getId(),
            sessionId.getSessionId(),
            requestManager.getHttpSession().getSessionId());
        subscriptionEvents.fire(request);
    }

    /**
     * Current user want to unsubscribe from its own channel.
     *
     * @param sessionId websocket session identifier
     */
    public void unsubscribeFromUserChannel(WsSessionIdentifier sessionId) {
        logger.debug("Session {} want to unsubscribe from its UserChannel", sessionId);
        User user = securityFacade.assertAndGetCurrentUser();
        SubscriptionRequest request = SubscriptionRequest.build(
            SubscriptionRequest.SubscriptionType.UNSUBSCRIBE,
            SubscriptionRequest.ChannelType.USER,
            user.getId(),
            sessionId.getSessionId(),
            requestManager.getHttpSession().getSessionId());
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
            securityFacade.assertIsMember(project);
            SubscriptionRequest request = SubscriptionRequest.build(
                SubscriptionRequest.SubscriptionType.SUBSCRIBE,
                SubscriptionRequest.ChannelType.PROJECT,
                project.getId(),
                sessionId.getSessionId(),
                requestManager.getHttpSession().getSessionId());
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
            securityFacade.assertIsMember(project);
            SubscriptionRequest request = SubscriptionRequest.build(
                SubscriptionRequest.SubscriptionType.UNSUBSCRIBE,
                SubscriptionRequest.ChannelType.PROJECT,
                project.getId(),
                sessionId.getSessionId(),
                requestManager.getHttpSession().getSessionId());
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
        logger.debug("Channel subscription request: {}", request);
        Session session = WebsocketEndpoint.getSession(request.getWsSessionId());
        if (session != null) {
            logger.debug("Process channel subscription request: {}", request);

            // first determine the effective channel
            WebsocketEffectiveChannel channel = getChannel(request);
            if (channel != null) {
                // make sure the http session has its own set of wsSessions
                if (!httpSessionToWsSessions.containsKey(request.getColabSessionId())) {
                    httpSessionToWsSessions.put(request.getColabSessionId(), new HashSet<>());
                }
                // and  make sure the websocket session is linked to the http session
                httpSessionToWsSessions.get(request.getColabSessionId()).add(session);

                // make sure to link wsSession to its Http session
                wsSessionToHttpSession.put(session, request.getColabSessionId());

                if (request.getType() == SubscriptionRequest.SubscriptionType.SUBSCRIBE) {
                    // make sure the http session has its own list of channels
                    if (!wsSessionMap.containsKey(session)) {
                        wsSessionMap.put(session, new HashSet<>());
                    }
                    // keep wsSession to channel registry up-to date
                    wsSessionMap.get(session).add(channel);

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
            } else {
                logger.debug("Failed to resolve {} to an effective channel", request);
            }
        } else {
            logger.debug("Ignore channel subscription: {}", request);
        }
    }

    /**
     * Add the given session to the set identified by the given channel, in the given map.
     *
     * @param map     map which contains sets
     * @param keyId   set id
     * @param session session to remove from the set
     */
    private void subscribe(WebsocketEffectiveChannel channel, Session session) {
        logger.debug("Session {} subscribes to {}", session, channel);
        if (!subscriptions.containsKey(channel)) {
            subscriptions.put(channel, new HashSet<>());
        }
        subscriptions.get(channel).add(session);
    }

    /**
     * Unsubscribe all sessions from given channel. If the channel is empty after the operation, it
     * will be destroyed.
     *
     * @param channel  chanel to update
     * @param sessions session to remove from channel
     */
    private void unsubscribe(WebsocketEffectiveChannel channel, Set<Session> sessions) {
        Set<Session> chSessions = subscriptions.get(channel);
        logger.debug("Sessions {} unsubscribes from {}", sessions, channel);
        if (chSessions != null) {
            chSessions.removeAll(sessions);
            if (chSessions.isEmpty()) {
                subscriptions.remove(channel);
            }
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
        } else if (request.getChannelType() == SubscriptionRequest.ChannelType.USER) {
            User user = userDao.findUser(request.getChannelId());
            if (user != null) {
                return user.getEffectiveChannel();
            }
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
                                session.getBasicRemote().sendText(message);
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
    public void signoutAndUnsubscribeFromAll(String httpSessionId) {
        // TODO send logout event, so each client (each browser tab) knows it has been disconected
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
                // no need to list same channel twise
                .distinct()
                // clean subscriptions
                .forEach(channel -> {
                    this.unsubscribe(channel, wsSessions);
                });
        }

        this.httpSessionToWsSessions.remove(httpSessionId);
    }

    /**
     * Clean subscription on session close
     *
     * @param session websocket session to clean subscription for
     */
    public void unsubscribeFromAll(Session session) {
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
