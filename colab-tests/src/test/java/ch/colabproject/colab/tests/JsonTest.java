/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests;

import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.generator.model.tools.JsonbProvider;
import ch.colabproject.colab.api.ws.message.IndexEntry;
import ch.colabproject.colab.api.ws.message.WsUpdateMessage;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;
import javax.json.bind.Jsonb;
import org.junit.jupiter.api.Test;
import ch.colabproject.colab.generator.model.interfaces.WithJsonDiscriminator;

/**
 *
 * @author maxence
 */
public class JsonTest {

    /**
     * used to fetch a GenericReturnType
     *
     * @return empty list
     */
    public List<ColabEntity> getListOfColabEntities() {
        return new ArrayList<>();
    }

    public Type getColabEntityListType() throws NoSuchMethodException {
        return this.getClass().getDeclaredMethod("getListOfColabEntities").getGenericReturnType();
    }

    @Test
    public void testWsMessage() {
        WsUpdateMessage wsUpdateMessage = new WsUpdateMessage();
        wsUpdateMessage.getUpdated().add(new User());
        wsUpdateMessage.getDeleted().add(new IndexEntry());

        Jsonb jsonb = JsonbProvider.getJsonb();
        String json = jsonb.toJson(wsUpdateMessage);
        jsonb.fromJson(json, WithJsonDiscriminator.class);
    }

    @Test
    public void testDeser() throws NoSuchMethodException {
        ColabEntity entity = new User();
        List<ColabEntity> list = new ArrayList<>();
        list.add(entity);

        Jsonb jsonb = JsonbProvider.getJsonb();
        String json = jsonb.toJson(list);

        List<Object> fromJson = jsonb.fromJson(json, getColabEntityListType());

        User get = (User) fromJson.get(0);
        get.getUsername();
    }
}
