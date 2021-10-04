/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.model.interfaces;

import ch.colabproject.colab.generator.model.tools.PolymorphicDeserializer;
import javax.json.bind.annotation.JsonbTypeDeserializer;

/**
 * Simple interface which depict objects having a Long id
 *
 * @author maxence
 */
@JsonbTypeDeserializer(PolymorphicDeserializer.class)
public interface WithId extends WithJsonDiscriminator {

    /**
     *
     * @return if of the entity
     */
    Long getId();
}
