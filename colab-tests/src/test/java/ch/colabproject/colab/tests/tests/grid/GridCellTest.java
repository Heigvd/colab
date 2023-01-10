/*
 * The coLAB project
 * Copyright (C) 2022-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.tests.grid;

import ch.colabproject.colab.api.controller.card.grid.GridCellWithId;

/**
 *
 * @author maxence
 */
public class GridCellTest implements GridCellWithId {

    /** Cell id */
    private Long id;

    /**
     * Card x position on the grid
     */
    private Integer x;
    /**
     * Card y position on the grid
     */
    private Integer y;

    /**
     * cell width on the grid
     */
    private Integer width;

    /**
     * cell height on the grid
     */
    private Integer height;

    /**
     * Get a cell
     *
     * @param id     cell id
     * @param x      x coord
     * @param y      y coord
     * @param width  width
     * @param height height
     */
    public GridCellTest(Long id, Integer x, Integer y, Integer width, Integer height) {
        this.id = id;
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

    @Override
    public Long getId() {
        return this.id;
    }

    @Override
    public String toString() {
        return "GridCellTest{" + "id=" + id + ", (" + x + "," + y + ") " + width + "x" + height + '}';
    }
}
