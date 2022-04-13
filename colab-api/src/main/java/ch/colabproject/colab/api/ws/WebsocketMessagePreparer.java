/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws;

import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.persistence.jpa.card.CardTypeDao;
import ch.colabproject.colab.api.persistence.jpa.user.UserDao;
import ch.colabproject.colab.api.ws.channel.model.WebsocketChannel;
import ch.colabproject.colab.api.ws.channel.tool.ChannelBuilders.ChannelBuilder;
import ch.colabproject.colab.api.ws.channel.tool.ChannelBuilders.ForAdminChannelBuilder;
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
import javax.websocket.EncodeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Some convenient methods to help sending data through websockets.
 *
 * @author maxence
 */
// TODO rename WebsocketMessagePreparer
public class WebsocketMessagePreparer {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(WebsocketMessagePreparer.class);

    /**
     * never-called private constructor
     */
    private WebsocketMessagePreparer() {
        throw new UnsupportedOperationException(
            "This is a utility class and cannot be instantiated");
    }

    /**
     * Get the message that will be sent through the given channel.
     *
     * @param messagesByChannel all messagesByChannels
     * @param key               key to select to correct message
     *
     * @return the message
     */
    private static WsUpdateMessage getOrCreateWsUpdateMessage(
        Map<WebsocketChannel, List<WsMessage>> messagesByChannel,
        WebsocketChannel key
    ) {
        logger.trace("GetOrCreate WsUpdateMessge for channel {}", key);
        if (!messagesByChannel.containsKey(key)) {
            logger.trace(" -> create channel {}", key);
            messagesByChannel.put(key, List.of(new WsUpdateMessage()));
            return (WsUpdateMessage) messagesByChannel.get(key).get(0);
        } else {
            List<WsMessage> get = messagesByChannel.get(key);
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
     * @param messagesByChannel all sets
     * @param channel           channel to identify correct set
     * @param entity            entity to add
     */
    private static void addAsUpdated(
        Map<WebsocketChannel, List<WsMessage>> messagesByChannel,
        WebsocketChannel channel,
        WithWebsocketChannels entity) {
        Collection<WithWebsocketChannels> set = WebsocketMessagePreparer
            .getOrCreateWsUpdateMessage(messagesByChannel, channel).getUpdated();
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
    private static void addAsDeleted(Map<WebsocketChannel, List<WsMessage>> byChannels,
        WebsocketChannel channel,
        IndexEntry entry) {
        Collection<IndexEntry> set = WebsocketMessagePreparer.getOrCreateWsUpdateMessage(byChannels, channel)
            .getDeleted();
        logger.trace("Add {} to deleted set {}", entry, set);
        set.add(entry);
    }

    /**
     * Prepare all WsUpdateMessage.
     *
     * @param userDao     provide userDao to resolve meta channels
     * @param cardTypeDao provide cardTypeDao to resolve meta channels
     * @param updated     set of created/updated entities
     * @param deleted     set of just destroyed-entities index entry
     *
     * @return the precomputed messagesByChannels
     *
     * @throws EncodeException if creating JSON messagesByChannels failed
     */
    public static PrecomputedWsMessages prepareWsMessage(
        UserDao userDao,
        CardTypeDao cardTypeDao,
        Set<WithWebsocketChannels> updated,
        Set<WithWebsocketChannels> deleted
    ) throws EncodeException {
        Map<WebsocketChannel, List<WsMessage>> messagesByChannel = new HashMap<>();
        logger.debug("Prepare WsMessage. Update:{}; Deleted:{}", updated, deleted);

        updated.forEach(object -> {
            logger.trace("Process updated entity {}", object);
            object.getChannelBuilder().computeEffectiveChannels(userDao, cardTypeDao)
                .forEach(channel -> {
                    addAsUpdated(messagesByChannel, channel, object);
                });
        });

        deleted.forEach(object -> {
            logger.trace("Process deleted entry {}", object);
            object.getChannelBuilder().computeEffectiveChannels(userDao, cardTypeDao)
                .forEach(
                    channel -> {
                        addAsDeleted(messagesByChannel, channel, IndexEntry.build(object));
                    });
        });

        return PrecomputedWsMessages.build(messagesByChannel);
    }

    /**
     * Prepare one message on admin channel
     *
     * @param userDao provide userDao to resolve meta channels
     * @param message the message
     *
     * @return the precomputedMessage
     *
     * @throws EncodeException if json-encoding failed
     */
    public static PrecomputedWsMessages prepareWsMessageForAdmins(
        UserDao userDao,
        WsMessage message
    ) throws EncodeException {
        return prepareWsMessage(userDao, null, new ForAdminChannelBuilder(), message);
    }

    /**
     * Prepare one message for many channels
     *
     * @param userDao        provide userDao to resolve meta channels
     * @param cardTypeDao    provide cardTypeDao to resolve meta channels
     * @param channelBuilder the channel builder that defines which channels must be used
     * @param message        the message
     *
     * @return the precomputedMessage
     *
     * @throws EncodeException if json-encoding failed
     */
    public static PrecomputedWsMessages prepareWsMessage(
        UserDao userDao,
        CardTypeDao cardTypeDao,
        ChannelBuilder channelBuilder,
        WsMessage message
    ) throws EncodeException {
        Map<WebsocketChannel, List<WsMessage>> messagesByChannel = new HashMap<>();

        channelBuilder.computeEffectiveChannels(userDao, cardTypeDao).forEach(channel -> {
            messagesByChannel.put(channel, List.of(message));
        });

        return PrecomputedWsMessages.build(messagesByChannel);
    }

}
