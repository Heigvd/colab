/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws;

import ch.colabproject.colab.api.ejb.RequestManager;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.persistence.user.UserDao;
import ch.colabproject.colab.api.ws.channel.WebsocketChannel;
import ch.colabproject.colab.api.ws.channel.WebsocketEffectiveChannel;
import ch.colabproject.colab.api.ws.channel.WebsocketMetaChannel;
import ch.colabproject.colab.api.ws.message.IndexEntry;
import ch.colabproject.colab.api.ws.message.PrecomputedWsMessages;
import ch.colabproject.colab.api.ws.message.WsMessage;
import ch.colabproject.colab.api.ws.message.WsUpdateMessage;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Consumer;
import java.util.stream.Stream;
import javax.websocket.EncodeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Some convenient methods to help sending data through websockets.
 *
 * @author maxence
 */
public class WebsocketHelper {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(WebsocketHelper.class);

    /**
     * never-called private constructor
     */
    private WebsocketHelper() {
        throw new UnsupportedOperationException(
            "This is a utility class and cannot be instantiated");
    }

    /**
     * Get the message that will be sent through the given channel.
     *
     * @param byChannels all messagesByChannels
     * @param key        key to select to correct message
     *
     * @return the message
     */
    private static WsUpdateMessage getOrCreateWsUpdateMessage(
        Map<WebsocketEffectiveChannel, List<WsMessage>> byChannels,
        WebsocketEffectiveChannel key
    ) {
        logger.trace("GetOrCreate WsUpdateMessge for channel {}", key);
        if (!byChannels.containsKey(key)) {
            logger.trace(" -> create channel {}", key);
            byChannels.put(key, List.of(new WsUpdateMessage()));
            return (WsUpdateMessage) byChannels.get(key).get(0);
        } else {
            List<WsMessage> get = byChannels.get(key);
            logger.trace(" -> use existing channel {} := {}", key, get);
            Optional<WsMessage> find = get.stream()
                .filter(message -> message instanceof WsUpdateMessage)
                .findFirst();
            if (find.isPresent()) {
                logger.trace("   -> use existing message {}", find.get());
                return (WsUpdateMessage) find.get();
            } else {
                logger.trace("   -> create emtpy message");
                WsUpdateMessage wsUpdateMessage = new WsUpdateMessage();
                get.add(wsUpdateMessage);
                return wsUpdateMessage;
            }
        }
    }

    /**
     * Add entity to the set identified by the channel.
     *
     * @param byChannels all sets
     * @param channel    channel to identify correct set
     * @param entity     entity to add
     */
    private static void add(Map<WebsocketEffectiveChannel, List<WsMessage>> byChannels,
        WebsocketEffectiveChannel channel,
        WithWebsocketChannels entity) {
        Collection<WithWebsocketChannels> set
            = WebsocketHelper.getOrCreateWsUpdateMessage(byChannels, channel).getUpdated();
        logger.trace("Add {} to updated set {}", entity, set);
        set.add(entity);
        if (logger.isTraceEnabled()) {
            set.forEach(e -> {
                logger.trace("Entity: {}", e);
                logger.trace("Entity hashCode: {}", e.hashCode());
                logger.trace("Entity equals new: {}", e.equals(entity));
            });
        }
    }

    /**
     * Add index entry to the set identified by the channel.
     *
     * @param byChannels all sets
     * @param channel    channel to identify correct set
     * @param entry      entry to add
     */
    private static void add(Map<WebsocketEffectiveChannel, List<WsMessage>> byChannels,
        WebsocketEffectiveChannel channel,
        IndexEntry entry) {
        Collection<IndexEntry> set
            = WebsocketHelper.getOrCreateWsUpdateMessage(byChannels, channel).getDeleted();
        logger.trace("Add {} to deleted set {}", entry, set);
        set.add(entry);
    }

    /**
     * Resolve all channels to a list of effective channels, then apply then action of each distinct
     * channel
     *
     * @param channels list of WebsocketChannel
     * @param userDao  the userDao to resolve meta channels
     * @param action   action to apply of each unique effective channel
     *
     * @return stream of unique WebsocketEffectiveChannel
     */
    private static void forEachDistinctEffectiveChannel(Set<WebsocketChannel> channels,
        UserDao userDao,
        RequestManager requestManager,
        Consumer<WebsocketEffectiveChannel> action
    ) {
        logger.trace("Flatten Channels {}", channels);
        channels.stream().flatMap(channel -> {
            if (channel instanceof WebsocketEffectiveChannel) {
                logger.trace(" -> {}", channel);
                return Stream.of((WebsocketEffectiveChannel) channel);
            } else if (channel instanceof WebsocketMetaChannel) {
                Set<WebsocketEffectiveChannel> resolved
                    = ((WebsocketMetaChannel) channel).resolve(userDao, requestManager);
                if (logger.isTraceEnabled()) {
                    logger.trace(" -> {}", resolved);
                }
                return resolved.stream();
            } else {
                logger.warn(" unknown channel type: {}", channel);
                return Stream.of();
            }
        }).distinct()
            .forEach(channel -> {
                logger.trace(" distinct: {}", channel);
                action.accept(channel);
            });
    }

    /**
     * Prepare all WsUpdateMessage.
     *
     * @param userDao        provide userDao to resolve meta channels
     * @param requestManager the request manager
     * @param updated        set of created/updated entities
     * @param deleted        set of just destroyed-entities index entry
     *
     * @return the precomputed messagesByChannels
     *
     * @throws EncodeException if creating JSON messagesByChannels failed
     */
    public static PrecomputedWsMessages prepareWsMessage(
        UserDao userDao,
        RequestManager requestManager,
        Set<WithWebsocketChannels> updated,
        Set<IndexEntry> deleted
    ) throws EncodeException {
        Map<WebsocketEffectiveChannel, List<WsMessage>> messagesByChannel = new HashMap<>();
        logger.debug("Prepare WsMessage. Update:{}; Deleted:{}", updated, deleted);

        updated.forEach(entity -> {
            logger.trace("Process updated entity {}", entity);
            forEachDistinctEffectiveChannel(entity.getChannels(), userDao, requestManager, channel -> {
                add(messagesByChannel, channel, entity);
            });
        });

        deleted.forEach(entity -> {
            logger.trace("Process deleted entry {}", entity);
            forEachDistinctEffectiveChannel(entity.getChannels(), userDao, requestManager, channel -> {
                add(messagesByChannel, channel, entity);
            });
        });

        return PrecomputedWsMessages.build(messagesByChannel);
    }

    /**
     * Prepare one message for one channel
     *
     * @param userDao        provide userDao to resolve meta channels
     * @param requestManager the request manager
     * @param channel        the channel
     * @param message        the message
     *
     * @return the precomputedMessage
     *
     * @throws EncodeException if json-encoding failed
     */
    public static PrecomputedWsMessages prepareWsMessage(
        UserDao userDao, RequestManager requestManager,
        WebsocketChannel channel, WsMessage message
    ) throws EncodeException {

        Map<WebsocketEffectiveChannel, List<WsMessage>> messagesByChannel = new HashMap<>();

        forEachDistinctEffectiveChannel(Set.of(channel), userDao, requestManager, (effectiveChannel) -> {
            messagesByChannel.put(effectiveChannel, List.of(message));
        });

        return PrecomputedWsMessages.build(messagesByChannel);
    }

    /**
     * Prepare one message for many channels
     *
     * @param userDao        provide userDao to resolve meta channels
     * @param requestManager the request manager
     * @param channels       the channel set
     * @param message        the message
     *
     * @return the precomputedMessage
     *
     * @throws EncodeException if json-encoding failed
     */
    public static PrecomputedWsMessages prepareWsMessage(
        UserDao userDao, RequestManager requestManager,
        Collection<WebsocketChannel> channels, WsMessage message
    ) throws EncodeException {

        Map<WebsocketEffectiveChannel, List<WsMessage>> messagesByChannel = new HashMap<>();

        channels.forEach(channel -> {
            forEachDistinctEffectiveChannel(Set.of(channel), userDao, requestManager, (effectiveChannel) -> {
                messagesByChannel.put(effectiveChannel, List.of(message));
            });
        });

        return PrecomputedWsMessages.build(messagesByChannel);
    }

}
