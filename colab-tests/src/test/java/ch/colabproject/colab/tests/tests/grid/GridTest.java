/*
 * The coLAB project
 * Copyright (C) 2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.tests.grid;

import ch.colabproject.colab.api.controller.card.grid.Grid;
import ch.colabproject.colab.api.controller.card.grid.GridCellWithId;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 *
 * @author maxence
 */
public class GridTest {


    /**
     * Expected
     *  |1|2|3|6|
     *  |4|
     */
    @Test
    public void testThreeBytwo() {
        List<GridCellWithId> cells =new ArrayList<>();

        // stack five cells on (1,1)
        cells.add(new GridCellTest(1l, 1, 1, 1, 1));
        cells.add(new GridCellTest(2l, 1, 1, 1, 1));
        cells.add(new GridCellTest(3l, 1, 1, 1, 1));
        cells.add(new GridCellTest(4l, 1, 1, 1, 1));
        cells.add(new GridCellTest(5l, 1, 1, 1, 1));

        Grid grid = Grid.resolveConflicts(cells);


        // 1 row of three, 2d row of 1
        Assertions.assertEquals(grid.getCellAt(1, 1).getId(), 1);
        Assertions.assertEquals(1, cells.get(0).getX(), "1st cell.x not match");
        Assertions.assertEquals(1, cells.get(0).getY(), "1st cell.y not match");

        Assertions.assertEquals(grid.getCellAt(2, 1).getId(), 2);
        Assertions.assertEquals(2, cells.get(1).getX(), "2nd cell.x not match");
        Assertions.assertEquals(1, cells.get(1).getY(), "2nd cell.y not match");

        Assertions.assertEquals(grid.getCellAt(3, 1).getId(), 3);
        Assertions.assertEquals(3, cells.get(2).getX(), "3rd cell.x not match");
        Assertions.assertEquals(1, cells.get(2).getY(), "3rd cell.y not match");

        Assertions.assertEquals(grid.getCellAt(1, 2).getId(), 4);
        Assertions.assertEquals(1, cells.get(3).getX(), "4th cell.x not match");
        Assertions.assertEquals(2, cells.get(3).getY(), "4th cell.y not match");

        Assertions.assertEquals(grid.getCellAt(2, 2).getId(), 5);
        Assertions.assertEquals(2, cells.get(4).getX(), "5th cell.x not match");
        Assertions.assertEquals(2, cells.get(4).getY(), "5th cell.y not match");
    }

    /**
     * Expected
     *  |1|2|3|6|
     *  |4|
     */
    @Test
    public void testThreeBytwoNullCells() {
        List<GridCellWithId> cells =new ArrayList<>();

        // stack five cells on (1,1)
        cells.add(new GridCellTest(1l, null, null, null, null));
        cells.add(new GridCellTest(2l, null, null, null, null));
        cells.add(new GridCellTest(3l, null, null, null, null));
        cells.add(new GridCellTest(4l, null, null, null, null));
        cells.add(new GridCellTest(5l, null, null, null, null));

        Grid grid = Grid.resolveConflicts(cells);

        // 1 row of three, 2d row of 2
        Assertions.assertEquals(grid.getCellAt(1, 1).getId(), 1);
        Assertions.assertEquals(1, cells.get(0).getX(), "1st cell.x not match");
        Assertions.assertEquals(1, cells.get(0).getY(), "1st cell.y not match");

        Assertions.assertEquals(grid.getCellAt(2, 1).getId(), 2);
        Assertions.assertEquals(2, cells.get(1).getX(), "2nd cell.x not match");
        Assertions.assertEquals(1, cells.get(1).getY(), "2nd cell.y not match");

        Assertions.assertEquals(grid.getCellAt(3, 1).getId(), 3);
        Assertions.assertEquals(3, cells.get(2).getX(), "3rd cell.x not match");
        Assertions.assertEquals(1, cells.get(2).getY(), "3rd cell.y not match");

        Assertions.assertEquals(grid.getCellAt(1, 2).getId(), 4);
        Assertions.assertEquals(1, cells.get(3).getX(), "4th cell.x not match");
        Assertions.assertEquals(2, cells.get(3).getY(), "4th cell.y not match");

        Assertions.assertEquals(grid.getCellAt(2, 2).getId(), 5);
        Assertions.assertEquals(2, cells.get(4).getX(), "5th cell.x not match");
        Assertions.assertEquals(2, cells.get(4).getY(), "5th cell.y not match");
    }



    /**
     * Expected
     *  |1|2|3|6|
     *  |4|   |6|
     *  |5|5|5|6|
     */
    @Test
    public void testWithTallAndWide() {
        List<GridCellWithId> cells =new ArrayList<>();

        // stack five cells on (1,1)
        cells.add(new GridCellTest(1l, 1, 1, 1, 1));
        cells.add(new GridCellTest(2l, 1, 1, 1, 1));
        cells.add(new GridCellTest(3l, 1, 1, 1, 1));
        cells.add(new GridCellTest(4l, 1, 1, 1, 1));
        cells.add(new GridCellTest(5l, 1, 1, 3, 1));
        cells.add(new GridCellTest(6l, 1, 1, 1, 3));

        Grid grid = Grid.resolveConflicts(cells);

        Assertions.assertEquals(1, cells.get(0).getX(), "1st cell.x not match");
        Assertions.assertEquals(1, cells.get(0).getY(), "1st cell.y not match");
        Assertions.assertEquals(1, grid.getCellAt(1, 1).getId());

        Assertions.assertEquals(2, cells.get(1).getX(), "2nd cell.x not match");
        Assertions.assertEquals(1, cells.get(1).getY(), "2nd cell.y not match");
        Assertions.assertEquals(2, grid.getCellAt(2, 1).getId());

        Assertions.assertEquals(3, cells.get(2).getX(), "3rd cell.x not match");
        Assertions.assertEquals(1, cells.get(2).getY(), "3rd cell.y not match");
        Assertions.assertEquals(3, grid.getCellAt(3, 1).getId());

        Assertions.assertEquals(1, cells.get(3).getX(), "4th cell.x not match");
        Assertions.assertEquals(2, cells.get(3).getY(), "4th cell.y not match");
        Assertions.assertEquals(4, grid.getCellAt(1, 2).getId());

        Assertions.assertEquals(1, cells.get(4).getX(), "5th cell.x not match");
        Assertions.assertEquals(3, cells.get(4).getY(), "5th cell.y not match");
        Assertions.assertEquals(5, grid.getCellAt(1, 3).getId());
        Assertions.assertEquals(5, grid.getCellAt(2, 3).getId());
        Assertions.assertEquals(5, grid.getCellAt(3, 3).getId());

        Assertions.assertEquals(4, cells.get(5).getX(), "6th cell.x not match");
        Assertions.assertEquals(1, cells.get(5).getY(), "6th cell.y not match");
        Assertions.assertEquals(6, grid.getCellAt(4, 1).getId());
        Assertions.assertEquals(6, grid.getCellAt(4, 2).getId());
        Assertions.assertEquals(6, grid.getCellAt(4, 3).getId());
    }


/**
     * Expected
     *  |1|2|3|7|8|
     *  |4|   |7|8|
     *  |5|5|5|7|8|
     *  |6|6|6|6|8|
     */
    @Test
    public void testWithMoreTallAndWide() {
        List<GridCellWithId> cells =new ArrayList<>();

        // stack five cells on (1,1)
        cells.add(new GridCellTest(1l, 1, 1, 1, 1));
        cells.add(new GridCellTest(2l, 1, 1, 1, 1));
        cells.add(new GridCellTest(3l, 1, 1, 1, 1));
        cells.add(new GridCellTest(4l, 1, 1, 1, 1));
        cells.add(new GridCellTest(5l, 1, 1, 3, 1));
        cells.add(new GridCellTest(6l, 1, 1, 4, 1));
        cells.add(new GridCellTest(7l, 1, 1, 1, 3));
        cells.add(new GridCellTest(8l, 1, 1, 1, 4));

        Grid grid = Grid.resolveConflicts(cells);

        Assertions.assertEquals(1, cells.get(0).getX(), "1st cell.x not match");
        Assertions.assertEquals(1, cells.get(0).getY(), "1st cell.y not match");
        Assertions.assertEquals(1, grid.getCellAt(1, 1).getId());

        Assertions.assertEquals(2, cells.get(1).getX(), "2nd cell.x not match");
        Assertions.assertEquals(1, cells.get(1).getY(), "2nd cell.y not match");
        Assertions.assertEquals(2, grid.getCellAt(2, 1).getId());

        Assertions.assertEquals(3, cells.get(2).getX(), "3rd cell.x not match");
        Assertions.assertEquals(1, cells.get(2).getY(), "3rd cell.y not match");
        Assertions.assertEquals(3, grid.getCellAt(3, 1).getId());

        Assertions.assertEquals(1, cells.get(3).getX(), "4th cell.x not match");
        Assertions.assertEquals(2, cells.get(3).getY(), "4th cell.y not match");
        Assertions.assertEquals(4, grid.getCellAt(1, 2).getId());

        Assertions.assertEquals(1, cells.get(4).getX(), "5th cell.x not match");
        Assertions.assertEquals(3, cells.get(4).getY(), "5th cell.y not match");
        Assertions.assertEquals(5, grid.getCellAt(1, 3).getId());
        Assertions.assertEquals(5, grid.getCellAt(2, 3).getId());
        Assertions.assertEquals(5, grid.getCellAt(3, 3).getId());

        Assertions.assertEquals(1, cells.get(5).getX(), "6th cell.x not match");
        Assertions.assertEquals(4, cells.get(5).getY(), "6th cell.y not match");
        Assertions.assertEquals(6, grid.getCellAt(1, 4).getId());
        Assertions.assertEquals(6, grid.getCellAt(2, 4).getId());
        Assertions.assertEquals(6, grid.getCellAt(3, 4).getId());
        Assertions.assertEquals(6, grid.getCellAt(4, 4).getId());


        Assertions.assertEquals(4, cells.get(6).getX(), "7th cell.x not match");
        Assertions.assertEquals(1, cells.get(6).getY(), "7th cell.y not match");
        Assertions.assertEquals(7, grid.getCellAt(4, 1).getId());
        Assertions.assertEquals(7, grid.getCellAt(4, 2).getId());
        Assertions.assertEquals(7, grid.getCellAt(4, 3).getId());

        Assertions.assertEquals(5, cells.get(7).getX(), "8th cell.x not match");
        Assertions.assertEquals(1, cells.get(7).getY(), "8th cell.y not match");
        Assertions.assertEquals(8, grid.getCellAt(5, 1).getId());
        Assertions.assertEquals(8, grid.getCellAt(5, 2).getId());
        Assertions.assertEquals(8, grid.getCellAt(5, 3).getId());
        Assertions.assertEquals(8, grid.getCellAt(5, 4).getId());
    }
}
