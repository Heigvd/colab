/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws;

import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.persistence.user.UserDao;
import ch.colabproject.colab.api.ws.channel.WebsocketEffectiveChannel;
import ch.colabproject.colab.api.ws.channel.WebsocketMetaChannel;
import ch.colabproject.colab.api.ws.message.IndexEntry;
import ch.colabproject.colab.api.ws.message.PrecomputedWsMessages;
import ch.colabproject.colab.api.ws.message.WsMessage;
import ch.colabproject.colab.api.ws.message.WsUpdateMessage;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import javax.websocket.EncodeException;

/**
 * Some convenient methods to help sending data through websockets.
 *
 * @author maxence
 */
public class WebsocketHelper {

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
        if (!byChannels.containsKey(key)) {
            byChannels.put(key, List.of(new WsUpdateMessage()));
            return (WsUpdateMessage) byChannels.get(key).get(0);
        } else {
            List<WsMessage> get = byChannels.get(key);
            Optional<WsMessage> find = get.stream()
                .filter(message -> message instanceof WsUpdateMessage)
                .findFirst();
            if (find.isPresent()) {
                return (WsUpdateMessage) find.get();
            } else {
                WsUpdateMessage wsUpdateMessage = new WsUpdateMessage();
                get.add(wsUpdateMessage);
                return wsUpdateMessage;
            }
        }
    }

    /**
     * Add entity to the set identified by the key.
     *
     * @param byChannels all sets
     * @param key        key to identify correct set
     * @param entity     entity to add
     */
    private static void add(Map<WebsocketEffectiveChannel, List<WsMessage>> byChannels,
        WebsocketEffectiveChannel key,
        ColabEntity entity) {
        WebsocketHelper.getOrCreateWsUpdateMessage(byChannels, key).getUpdated().add(entity);
    }

    /**
     * Add index entry to the set identified by the key.
     *
     * @param byChannels all sets
     * @param key        key to identify correct set
     * @param entry      entry to add
     */
    private static void add(Map<WebsocketEffectiveChannel, List<WsMessage>> byChannels,
        WebsocketEffectiveChannel key,
        IndexEntry entry) {
        WebsocketHelper.getOrCreateWsUpdateMessage(byChannels, key).getDeleted().add(entry);
    }

    /**
     * Prepare all WsUpdateMessage.
     *
     * @param userDao provide userDao to resolve meta channels
     * @param updated set of created/updated entities
     * @param deleted set of just destroyed-entities index entry
     *
     * @return the precomputed messagesByChannels
     *
     * @throws EncodeException if creating JSON messagesByChannels failed
     */
    public static PrecomputedWsMessages prepareWsMessage(
        UserDao userDao,
        Set<ColabEntity> updated,
        Set<IndexEntry> deleted
    ) throws EncodeException {
        Map<WebsocketEffectiveChannel, List<WsMessage>> messagesByChannel = new HashMap<>();

        updated.forEach(entity -> {
            entity.getChannels().forEach(channel -> {
                if (channel instanceof WebsocketEffectiveChannel) {
                    add(messagesByChannel, (WebsocketEffectiveChannel) channel, entity);
                } else if (channel instanceof WebsocketMetaChannel) {
                    ((WebsocketMetaChannel) channel).resolve(userDao).forEach(resolved -> {
                        add(messagesByChannel, resolved, entity);
                    });
                }
            });
        });

        deleted.forEach(entity -> {
            entity.getChannels().forEach(channel -> {
                if (channel instanceof WebsocketEffectiveChannel) {
                    add(messagesByChannel, (WebsocketEffectiveChannel) channel, entity);
                } else if (channel instanceof WebsocketMetaChannel) {
                    ((WebsocketMetaChannel) channel).resolve(userDao).forEach(resolved -> {
                        add(messagesByChannel, resolved, entity);
                    });
                }
            });
        });

        return PrecomputedWsMessages.build(messagesByChannel);
    }

}
