/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.document;

import ch.colabproject.colab.api.controller.document.IndexGeneratorHelper;
import ch.colabproject.colab.api.model.WithIndex;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.tests.tests.TestHelper;
import java.util.ArrayList;
import java.util.Collection;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Test of the index generator helper
 *
 * @author sandra
 */
public class IndexGeneratorHelperTest {

    @Test
    public void testMoveToEnd10() {
        int minIndex = 2;
        int maxIndex = 10;
        int increment = 3;

        IndexGeneratorHelper<ObjWithIndex> indexGenerator = new IndexGeneratorHelper<>(minIndex,
            maxIndex, increment);

        Collection<ObjWithIndex> collection = new ArrayList<>();

        // add first item
        ObjWithIndex oA = new ObjWithIndex("A");
        indexGenerator.moveItemToEnd(oA, collection);
        collection.add(oA);
        Assertions.assertEquals(5, oA.index);

        // add at bigger index + increment
        ObjWithIndex oB = new ObjWithIndex("B");
        indexGenerator.moveItemToEnd(oB, collection);
        collection.add(oB);
        Assertions.assertEquals(5, oA.index);
        Assertions.assertEquals(8, oB.index);

        // add between bigger index and max index
        ObjWithIndex oC = new ObjWithIndex("C");
        indexGenerator.moveItemToEnd(oC, collection);
        collection.add(oC);
        Assertions.assertEquals(5, oA.index);
        Assertions.assertEquals(8, oB.index);
        Assertions.assertEquals(9, oC.index);

        // add at max index
        ObjWithIndex oD = new ObjWithIndex("D");
        indexGenerator.moveItemToEnd(oD, collection);
        collection.add(oD);
        Assertions.assertEquals(5, oA.index);
        Assertions.assertEquals(8, oB.index);
        Assertions.assertEquals(9, oC.index);
        Assertions.assertEquals(10, oD.index);

        // no place and not enough space to reorder
        ObjWithIndex oE = new ObjWithIndex("E");
        TestHelper.assertThrows(HttpErrorMessage.MessageCode.DATA_ERROR,
            () -> {
                indexGenerator.moveItemToEnd(oE, collection);
            });
    }

    @Test
    public void testMoveToEnd11() {
        int minIndex = 2;
        int maxIndex = 11;
        int increment = 3;

        IndexGeneratorHelper<ObjWithIndex> indexGenerator = new IndexGeneratorHelper<>(minIndex,
            maxIndex, increment);

        Collection<ObjWithIndex> collection = new ArrayList<>();

        // add first item
        ObjWithIndex oA = new ObjWithIndex("A");
        indexGenerator.moveItemToEnd(oA, collection);
        collection.add(oA);
        Assertions.assertEquals(5, oA.index);

        // add at bigger index + increment
        ObjWithIndex oB = new ObjWithIndex("B");
        indexGenerator.moveItemToEnd(oB, collection);
        collection.add(oB);
        Assertions.assertEquals(5, oA.index);
        Assertions.assertEquals(8, oB.index);

        // add at bigger index + increment
        ObjWithIndex oC = new ObjWithIndex("C");
        indexGenerator.moveItemToEnd(oC, collection);
        collection.add(oC);
        Assertions.assertEquals(5, oA.index);
        Assertions.assertEquals(8, oB.index);
        Assertions.assertEquals(11, oC.index);

        // no place and not enough space to reorder
        ObjWithIndex oE = new ObjWithIndex("E");
        TestHelper.assertThrows(HttpErrorMessage.MessageCode.DATA_ERROR,
            () -> {
                indexGenerator.moveItemToEnd(oE, collection);
            });
    }

    @Test
    public void testMoveToEnd12() {
        int minIndex = 2;
        int maxIndex = 12;
        int increment = 3;

        IndexGeneratorHelper<ObjWithIndex> indexGenerator = new IndexGeneratorHelper<>(minIndex,
            maxIndex, increment);

        Collection<ObjWithIndex> collection = new ArrayList<>();

        // add first item
        ObjWithIndex oA = new ObjWithIndex("A");
        indexGenerator.moveItemToEnd(oA, collection);
        collection.add(oA);
        Assertions.assertEquals(5, oA.index);

        // add at bigger index + increment
        ObjWithIndex oB = new ObjWithIndex("B");
        indexGenerator.moveItemToEnd(oB, collection);
        collection.add(oB);
        Assertions.assertEquals(5, oA.index);
        Assertions.assertEquals(8, oB.index);

        // add at bigger index + increment
        ObjWithIndex oC = new ObjWithIndex("C");
        indexGenerator.moveItemToEnd(oC, collection);
        collection.add(oC);
        Assertions.assertEquals(5, oA.index);
        Assertions.assertEquals(8, oB.index);
        Assertions.assertEquals(11, oC.index);

        // add at max index
        ObjWithIndex oD = new ObjWithIndex("D");
        indexGenerator.moveItemToEnd(oD, collection);
        collection.add(oD);
        Assertions.assertEquals(5, oA.index);
        Assertions.assertEquals(8, oB.index);
        Assertions.assertEquals(11, oC.index);
        Assertions.assertEquals(12, oD.index);

        // no place and not enough space to reorder
        ObjWithIndex oE = new ObjWithIndex("E");
        TestHelper.assertThrows(HttpErrorMessage.MessageCode.DATA_ERROR,
            () -> {
                indexGenerator.moveItemToEnd(oE, collection);
            });
    }

    @Test
    public void testMoveToBeginning() {
        int minIndex = 2;
        int maxIndex = 19;
        int increment = 3;

        IndexGeneratorHelper<ObjWithIndex> indexGenerator = new IndexGeneratorHelper<>(minIndex,
            maxIndex, increment);

        Collection<ObjWithIndex> collection = new ArrayList<>();

        // add first item
        ObjWithIndex oA = new ObjWithIndex("A");
        indexGenerator.moveItemToBeginning(oA, collection);
        collection.add(oA);
        Assertions.assertEquals(5, oA.index);

        // add between minIndex and smallest index
        ObjWithIndex oB = new ObjWithIndex("B");
        indexGenerator.moveItemToBeginning(oB, collection);
        collection.add(oB);
        Assertions.assertEquals(3, oB.index);
        Assertions.assertEquals(5, oA.index);

        // add between minIndex and smallest index
        ObjWithIndex oC = new ObjWithIndex("C");
        indexGenerator.moveItemToBeginning(oC, collection);
        collection.add(oC);
        Assertions.assertEquals(2, oC.index);
        Assertions.assertEquals(3, oB.index);
        Assertions.assertEquals(5, oA.index);

        // need to reorder
        // then add between minIndex and smallest index
        ObjWithIndex oD = new ObjWithIndex("D");
        indexGenerator.moveItemToBeginning(oD, collection);
        collection.add(oD);
        Assertions.assertEquals(3, oD.index);
        Assertions.assertEquals(5, oC.index);
        Assertions.assertEquals(8, oB.index);
        Assertions.assertEquals(11, oA.index);

        // add between minIndex and smallest index
        ObjWithIndex oE = new ObjWithIndex("E");
        indexGenerator.moveItemToBeginning(oE, collection);
        collection.add(oE);
        Assertions.assertEquals(2, oE.index);
        Assertions.assertEquals(3, oD.index);
        Assertions.assertEquals(5, oC.index);
        Assertions.assertEquals(8, oB.index);
        Assertions.assertEquals(11, oA.index);

        // no place and not enough space to reorder
        ObjWithIndex oF = new ObjWithIndex("F");
        TestHelper.assertThrows(HttpErrorMessage.MessageCode.DATA_ERROR,
            () -> {
                indexGenerator.moveItemToBeginning(oF, collection);
            });
    }

    @Test
    public void testMoveAll() {
        int minIndex = 2;
        int maxIndex = 25;
        int increment = 3;

        IndexGeneratorHelper<ObjWithIndex> indexGenerator = new IndexGeneratorHelper<>(minIndex,
            maxIndex, increment);

        Collection<ObjWithIndex> collection = new ArrayList<>();

        // add first item
        ObjWithIndex oA = new ObjWithIndex("A");
        indexGenerator.moveItemToEnd(oA, collection);
        collection.add(oA);
        Assertions.assertEquals(5, oA.index);

        // add at bigger index + increment
        ObjWithIndex oB = new ObjWithIndex("B");
        indexGenerator.moveItemToEnd(oB, collection);
        collection.add(oB);
        Assertions.assertEquals(5, oA.index);
        Assertions.assertEquals(8, oB.index);

        // add between minIndex and smallest index
        ObjWithIndex oC = new ObjWithIndex("C");
        indexGenerator.moveItemToBeginning(oC, collection);
        collection.add(oC);
        Assertions.assertEquals(3, oC.index);
        Assertions.assertEquals(5, oA.index);
        Assertions.assertEquals(8, oB.index);

        // add at bigger index + increment
        ObjWithIndex oD = new ObjWithIndex("D");
        indexGenerator.moveItemToEnd(oD, collection);
        collection.add(oD);
        Assertions.assertEquals(3, oC.index);
        Assertions.assertEquals(5, oA.index);
        Assertions.assertEquals(8, oB.index);
        Assertions.assertEquals(11, oD.index);

        // switch indexes
        indexGenerator.moveOneStepBehind(oD, collection);
        Assertions.assertEquals(3, oC.index);
        Assertions.assertEquals(5, oA.index);
        Assertions.assertEquals(8, oB.index);
        Assertions.assertEquals(11, oD.index);

        // no change, it is already the last item
        indexGenerator.moveOneStepBehind(oD, collection);
        Assertions.assertEquals(3, oC.index);
        Assertions.assertEquals(5, oA.index);
        Assertions.assertEquals(8, oB.index);
        Assertions.assertEquals(11, oD.index);

        // switch indexes
        indexGenerator.moveOneStepAhead(oD, collection);
        Assertions.assertEquals(3, oC.index);
        Assertions.assertEquals(5, oA.index);
        Assertions.assertEquals(8, oD.index);
        Assertions.assertEquals(11, oB.index);

        // switch indexes
        indexGenerator.moveOneStepAhead(oD, collection);
        Assertions.assertEquals(3, oC.index);
        Assertions.assertEquals(5, oD.index);
        Assertions.assertEquals(8, oA.index);
        Assertions.assertEquals(11, oB.index);

        // switch indexes
        indexGenerator.moveOneStepAhead(oD, collection);
        Assertions.assertEquals(3, oD.index);
        Assertions.assertEquals(5, oC.index);
        Assertions.assertEquals(8, oA.index);
        Assertions.assertEquals(11, oB.index);

        // no change, it is already the first item
        indexGenerator.moveOneStepAhead(oD, collection);
        Assertions.assertEquals(3, oD.index);
        Assertions.assertEquals(5, oC.index);
        Assertions.assertEquals(8, oA.index);
        Assertions.assertEquals(11, oB.index);

        // set index between these of two items
        indexGenerator.moveItemBefore(oA, oC, collection);
        Assertions.assertEquals(3, oD.index);
        Assertions.assertEquals(4, oA.index);
        Assertions.assertEquals(5, oC.index);
        Assertions.assertEquals(11, oB.index);

        // need to reorder
        // set index between these of two items
        indexGenerator.moveItemBefore(oC, oA, collection);
        Assertions.assertEquals(5, oD.index);
        Assertions.assertEquals(6, oC.index);
        Assertions.assertEquals(8, oA.index);
        Assertions.assertEquals(14, oB.index);

        // set at the beginning
        indexGenerator.moveItemBefore(oA, oD, collection);
        Assertions.assertEquals(3, oA.index);
        Assertions.assertEquals(5, oD.index);
        Assertions.assertEquals(6, oC.index);
        Assertions.assertEquals(14, oB.index);
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

    private class ObjWithIndex implements WithIndex {
        final String id;
        int index;

        ObjWithIndex(String id) {
            this.id = id;
        }

        @Override
        public int getIndex() {
            return index;
        }

        @Override
        public void setIndex(int index) {
            this.index = index;
        }

        @Override
        public String toString() {
            return id + " at index " + index;
        }
    }

}
