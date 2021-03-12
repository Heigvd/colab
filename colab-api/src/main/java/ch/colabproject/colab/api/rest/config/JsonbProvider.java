/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.config;

import ch.colabproject.colab.api.rest.utils.ColabDeserializer;
import ch.colabproject.colab.generator.model.annotations.JsonbMapperProvider;
import javax.json.bind.Jsonb;
import javax.json.bind.JsonbBuilder;
import javax.json.bind.JsonbConfig;
import javax.ws.rs.ext.ContextResolver;
import javax.ws.rs.ext.Provider;

/**
 * convenient way to customize the JSON-B mapper
 *
 * @author Maxence
 */
@Provider
public class JsonbProvider implements JsonbMapperProvider, ContextResolver<Jsonb> {

    /**
     * {@inheritDoc}
     */
    @Override
    public Jsonb getContext(Class<?> theClass) {
        return JsonbProvider.getJsonb();
    }

    /**
     * Get a customized mapper
     *
     * @return an Jsonb object
     */
    public static Jsonb getJsonb() {
        JsonbConfig config = new JsonbConfig()
            .withFormatting(false)
            //.withSerializers(new DateSerializer())
            //.withDeserializers(new DateDeserializer())
            .withDeserializers(new ColabDeserializer());

        return JsonbBuilder.create(config);
    }

    @Override
    public Jsonb getJsonbMapper() {
        return JsonbProvider.getJsonb();
    }
}
