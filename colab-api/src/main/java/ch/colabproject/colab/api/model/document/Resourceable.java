/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.document;

import ch.colabproject.colab.api.model.ColabEntity;
import java.util.List;

/**
 * Something that can be the owner of a resource.
 *
 * @author sandra
 */
// Note : it would be very nice if someone could find a better name
public interface Resourceable extends ColabEntity {

    /**
     * @return the list of abstract resources directly linked to the resourceable
     */
    List<AbstractResource> getDirectAbstractResources();

}
