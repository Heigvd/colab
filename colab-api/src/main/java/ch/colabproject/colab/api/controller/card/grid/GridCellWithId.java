/*
 * The coLAB project
 * Copyright (C) 2022-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.card.grid;

/**
 * Effective grid cell must provide and id
 * 
 * @author maxence
 */
public interface GridCellWithId extends GridCell {

    /**
     * Get the id of the cell
     *
     * @return if of the cell
     */
    Long getId();
}
