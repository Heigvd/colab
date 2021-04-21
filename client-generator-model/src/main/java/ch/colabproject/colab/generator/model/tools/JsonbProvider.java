/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.model.tools;

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
public class JsonbProvider implements ContextResolver<Jsonb> {

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
            .withFormatting(false);
        // DO NEVER DO THAT EVER (sse PolymorphicDeserializer doc):
        //.withDeserializers(new PolymorphicDeserializer());

        return JsonbBuilder.create(config);
    }
}
