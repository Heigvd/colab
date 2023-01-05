/*
 * The coLAB project
 * Copyright (C) 2022-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.card.grid;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Utility class to help resolving cell positioning
 *
 * @author maxence
 */
public final class Grid {

    /** to store cells positions */
    private Map<Integer, Map<Integer, GridCellWithId>> matrix = new HashMap<>();

    /** List of managed cells */
    private Set<GridCellWithId> cells = new HashSet<>();

    /** left of the grid */
    private Integer xMin = null;
    /** top of the grid */
    private Integer yMin = null;

    /** right of the grid */
    private Integer xMax = null;
    /** bottom of the grid */
    private Integer yMax = null;

    /**
     * Is the cell position free?
     *
     * @param x the x coordinate
     * @param y the y coordinate
     *
     * @return true if the targeted cell is free
     */
    public boolean isFree(Integer x, Integer y) {
        var column = matrix.get(x);
        if (column != null) {
            return column.get(y) == null;
        }
        return true;
    }

    /**
     * Get the cell at the position if any
     *
     * @param x the x coordinate
     * @param y the y coordinate
     *
     * @return the cell ou null
     */
    public GridCellWithId getCellAt(Integer x, Integer y) {
        var column = matrix.get(x);
        if (column != null) {
            GridCellWithId cell = column.get(y);
            if (cell != null) {
                return cell;
            }
        }
        return null;
    }

    /**
     * Make sure cell has a size and a position
     *
     * @param cell the cell to initialize
     */
    private void initCell(GridCellWithId cell) {
        if (cell.getX() == null) {
            cell.setX(1);
        }

        if (cell.getY() == null) {
            cell.setY(1);
        }
        // make sure cell has a positive size
        if (cell.getWidth() == null || cell.getWidth() < 1) {
            cell.setWidth(1);
        }
        if (cell.getHeight() == null || cell.getHeight() < 1) {
            cell.setHeight(1);
        }
    }

    /**
     * Is the cell position free?
     *
     * @param cell the cell to check
     *
     * @return true if the targeted cell is free
     */
    public boolean isFree(GridCellWithId cell) {
        initCell(cell);
        int cxMin = cell.getX();
        int cxMax = cxMin + cell.getWidth() - 1;

        int cyMin = cell.getY();
        int cyMax = cyMin + cell.getHeight() - 1;

        for (int x = cxMin; x <= cxMax; x++) {
            var column = matrix.get(x);
            if (column != null) {
                for (int y = cyMin; y <= cyMax; y++) {
                    var c = column.get(y);
                    if (c != null && c != cell) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    /**
     * Make cell location within the matrix
     *
     * @param cell the cell to process
     */
    private void markCells(GridCellWithId cell) {
        initCell(cell);
        cells.add(cell);

        int cxMin = cell.getX();
        int cxMax = cxMin + cell.getWidth() - 1;

        int cyMin = cell.getY();
        int cyMax = cyMin + cell.getHeight() - 1;

        if (this.xMin == null) {
            this.xMin = cxMin;
        } else {
            this.xMin = Math.min(this.xMin, cxMin);
        }

        if (this.xMax == null) {
            this.xMax = cxMax;
        } else {
            this.xMax = Math.max(this.xMax, cxMax);
        }

        if (this.yMin == null) {
            this.yMin = cyMin;
        } else {
            this.yMin = Math.min(this.yMin, cyMin);
        }

        if (this.yMax == null) {
            this.yMax = cyMax;
        } else {
            this.yMax = Math.max(this.yMax, cyMax);
        }

        for (int x = cxMin; x <= cxMax; x++) {
            var column = matrix.get(x);

            if (column == null) {
                column = new HashMap<>();
                matrix.put(x, column);
            }

            for (int y = cyMin; y <= cyMax; y++) {
                column.put(y, cell);
            }
        }
    }

    /**
     * Last position, reading the from left to right, top to bottom
     *
     * @return the position of the last used coordinate or null if the grid is empty
     */
    private Coord findLastUsedPosition() {
        for (int y = yMax; y >= yMin; y--) {
            for (int x = this.xMax; x >= xMin; x--) {
                var column = matrix.get(x);
                if (column != null && column.get(y) != null) {
                    return new Coord(x, y);
                }
            }
        }
        return null;
    }

    /**
     * Find a new position for the given cell
     *
     * @param cell
     */
    private void findNewPosition(GridCellWithId cell) {
        Coord lastCoord = findLastUsedPosition();
        initCell(cell);

        if (lastCoord != null) {
            // matrix is empty, use first position
            cell.setX(1);
            cell.setY(1);
        }
        if (cell.getWidth() == 1 && cell.getHeight() == 1) {
            if (lastCoord.x < xMax || xMax - xMin < 2) {
                // enough free space on current row
                cell.setX(lastCoord.x + 1);
                cell.setY(lastCoord.y);
            } else {
                // end of line => append as first cell of a new row
                cell.setX(xMin);
                cell.setY(lastCoord.y + 1);
            }
        } else if (cell.getWidth() > cell.getHeight()) {
            // wide or square cell
            // add to bottom left
            cell.setX(xMin);
            cell.setY(yMax + 1);
        } else {
            // tall cell => add on top right
            cell.setX(xMax + 1);
            cell.setY(yMin);
        }

    }

    /**
     * Add a cell within the matrix. Fix any conflict
     *
     * @param cell the cell to add
     */
    public void addCell(GridCellWithId cell) {
        if (isFree(cell)) {
            markCells(cell);
        } else {
            findNewPosition(cell);
            markCells(cell);
        }
    }

    /**
     * Update all cell coordinates to have (xMin,yMin) = (1,1)
     */
    public void shift() {
        // amount to add to each card
        Integer shiftX = 1 - xMin;
        Integer shiftY = 1 - yMin;

        cells.forEach(cell -> {
            cell.setX(cell.getX() + shiftX);
            cell.setY(cell.getY() + shiftY);
        });

        xMin = 1;
        yMin = 1;
        xMax += shiftX;
        yMax += shiftY;
    }

    /**
     * Process all cells and fix any conflicts
     *
     * @param cells the cells
     *
     * @return the grid
     */
    public static Grid resolveConflicts(Collection<? extends GridCellWithId> cells) {
        ArrayList<GridCellWithId> list = new ArrayList<>();
        list.addAll(cells);

        list.forEach(cell -> {
            // make sure each cell has a size
            if (cell.getWidth() == null) {
                cell.setWidth(1);
            }
            if (cell.getHeight() == null) {
                cell.setHeight(1);
            }
        });

        list.sort((a, b) -> {
            boolean sameWidth = a.getWidth().equals(b.getWidth());
            boolean sameHeight = a.getHeight().equals(b.getHeight());

            Integer aArea = a.getWidth() * a.getHeight();
            Integer bArea = b.getWidth() * b.getHeight();

            if (sameHeight && sameWidth) {
                // same size: sort by id
                if (a.getId() < b.getId()) {
                    return -1;
                } else if (a.getId() < b.getId()) {
                    return 1;
                } else {
                    return 0;
                }
            } else if (sameWidth) {
                // same heigth, sort short to tall
                return a.getHeight() - b.getHeight();
            } else if (sameHeight) {
                // same heigth, sort thin to thick
                return a.getWidth() - b.getWidth();
            } else if (aArea.equals(bArea)) {
                // same area, different shape (eg 3x2 vs 2x3)
                // same heigth, sort short to tall
                return a.getHeight() - b.getHeight();
            } else {
                // differant area, sort smaller first
                return aArea - bArea;
            }
        });

        List<GridCellWithId> conflictual = new ArrayList<>();
        Grid grid = new Grid();

        list.forEach(cell -> {
            if (grid.isFree(cell)) {
                grid.markCells(cell);
            } else {
                conflictual.add(cell);
            }
        });
        conflictual.forEach(cell -> {
            grid.findNewPosition(cell);
            grid.markCells(cell);
        });
        return grid;
    }

    /**
     * Simple class to depict a single coord
     */
    public static class Coord {

        /** x coord */
        private Integer x;

        /** y coord */
        private Integer y;

        /**
         * simple constructor
         * @param x x coordinate
         * @param y y coordinate
         */
        public Coord(Integer x, Integer y) {
            this.x = x;
            this.y = y;
        }

        @Override
        public String toString() {
            return "Coord{" + x + "," + y + '}';
        }
    }
}
