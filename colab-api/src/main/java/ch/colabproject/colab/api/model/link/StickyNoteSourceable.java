/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.link;

import ch.colabproject.colab.api.model.WithPermission;
import java.util.List;

/**
 * Something that can be the source of a sticky note
 *
 * @author sandra
 */
public interface StickyNoteSourceable extends WithPermission {

    /**
     * @return the list of sticky note links of which the card is the source
     */
    List<StickyNoteLink> getStickyNoteLinksAsSrc();

}
