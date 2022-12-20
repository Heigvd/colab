/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.model.tools;

import jakarta.json.bind.Jsonb;
import jakarta.json.bind.JsonbBuilder;
import jakarta.json.bind.JsonbConfig;
import jakarta.ws.rs.ext.ContextResolver;
import jakarta.ws.rs.ext.Provider;

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
        //DateSerDe dateSerDe = new DateSerDe();
        JsonbConfig config = new JsonbConfig()
            .withFormatting(false);
            //.withDeserializers(dateSerDe)
            //.withSerializers(dateSerDe);

        // DO NEVER DO THAT EVER (see PolymorphicDeserializer doc):
        //.withDeserializers(new PolymorphicDeserializer());

        return JsonbBuilder.create(config);
    }
}
