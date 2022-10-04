/*
 * The coLAB project
 * Copyright (C) 2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.card.grid;

import javax.validation.constraints.NotNull;

/**
 * Simple grid cell implementation
 *
 * @author maxence
 */
public class GridPosition implements GridCell {

    /**
     * The x coordinate of the card within its parent
     */
    @NotNull
    private Integer x;

    /**
     * The y coordinate of the card within its parent
     */
    @NotNull
    private Integer y;

    /**
     * The width of the card within its parent
     */
    @NotNull
    private Integer width;

    /**
     * The height of the card within its parent
     */
    @NotNull
    private Integer height;

    /**
     * Build a default grid position,
     * Cell size is 1x1 and position is (1,1).
     */
    public GridPosition() {
        this.x = 1;
        this.y = 1;
        this.width = 1;
        this.height = 1;
    }

    /**
     * Build a cell
     *
     * @param x      x coord
     * @param y      y coord
     * @param width  width
     * @param height height
     */
    public GridPosition(Integer x, Integer y, Integer width, Integer height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    @Override
    public Integer getX() {
        return x;
    }

    @Override
    public void setX(Integer x) {
        this.x = x;
    }

    @Override
    public Integer getY() {
        return y;
    }

    @Override
    public void setY(Integer y) {
        this.y = y;
    }

    @Override
    public Integer getWidth() {
        return width;
    }

    @Override
    public void setWidth(Integer width) {
        this.width = width;
    }

    @Override
    public Integer getHeight() {
        return height;
    }

    @Override
    public void setHeight(Integer height) {
        this.height = height;
    }
}
