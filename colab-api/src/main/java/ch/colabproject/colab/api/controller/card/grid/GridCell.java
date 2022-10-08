/*
 * The coLAB project
 * Copyright (C) 2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.card.grid;

/**
 * Basic grid cell interface
 *
 * @author maxence
 */
public interface GridCell {

    /**
     * get the x coordinate
     *
     * @return x coordinate
     */
    Integer getX();

    /**
     * set the x coordinate
     *
     * @param x new x coordinate
     */
    void setX(Integer x);

    /**
     * get the y coordinate
     *
     * @return y coordinate
     */
    Integer getY();

    /**
     * set the y coordinate
     *
     * @param y new y coordinate
     */
     void setY(Integer y);

    /**
     * get cell width
     *
     * @return cell width
     */
    Integer getWidth();

    /**
     * Set the width
     *
     * @param width new width
     */
    void setWidth(Integer width);

    /**
     * Get the height
     *
     * @return the height
     */
     Integer getHeight();

    /**
     * set height
     *
     * @param height new height
     */
     void setHeight(Integer height);
}
