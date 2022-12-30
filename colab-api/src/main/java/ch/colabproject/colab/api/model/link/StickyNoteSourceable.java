/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.link;

import ch.colabproject.colab.api.model.ColabEntity;
import java.util.List;

/**
 * Something that can be the source of a sticky note
 *
 * @author sandra
 */
public interface StickyNoteSourceable extends ColabEntity {

    /**
     * @return the list of sticky note links of which the card is the source
     */
    List<StickyNoteLink> getStickyNoteLinksAsSrc();

}
