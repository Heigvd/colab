/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model;

/**
 * An object containing an index
 *
 * @author sandra
 */
public interface WithIndex {

    /**
     * @return the index
     */
    int getIndex();

    /**
     * @param index the index to set
     */
    void setIndex(int index);

}
