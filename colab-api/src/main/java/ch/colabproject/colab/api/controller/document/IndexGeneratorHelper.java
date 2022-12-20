/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.document;

import ch.colabproject.colab.api.model.WithIndex;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import jakarta.ejb.LocalBean;
import jakarta.ejb.Stateless;

/**
 * Deal with assigning index in a collection. The index is a field of the object and not the
 * built-in index of a list.
 * <p>
 * The indexes are progressive (from small to big) but the size of the room between two neighboring
 * indexes is not minimal nor has to be regular. In other words two neighboring indexes do not need
 * to be two just-following numbers.
 * <p>
 * The purpose is to be able to easily add an object between others without having to adjust other
 * indexes. In order to do that, we set a room between two neighboring indexes.
 *
 * @author sandra
 * @author maxence
 *
 * @param <T> Type of the items
 */
@Stateless
@LocalBean
public class IndexGeneratorHelper<T extends WithIndex> {

    /**
     * The default value of the smallest index that is suitable
     */
    private final int DEFAULT_MIN_INDEX = 0;

    /**
     * The default value of the biggest index that is suitable
     */
    private final int DEFAULT_MAX_INDEX = Integer.MAX_VALUE;

    /**
     * Default room between two neighboring indexes
     */
    private final int DEFAULT_INDEX_INC = 1000;

    /**
     * Value of the smallest index that is suitable
     */
    private final int minIndex;

    /**
     * Value of the biggest index that is suitable
     */
    private final int maxIndex;

    /**
     * Initial room between two neighboring indexes
     */
    private final int indexIncrement;

    /**
     * Index for the first item in the list
     */
    private final int soloIndex;

    /**
     * Default constructor
     */
    public IndexGeneratorHelper() {
        minIndex = DEFAULT_MIN_INDEX;
        maxIndex = DEFAULT_MAX_INDEX;
        indexIncrement = DEFAULT_INDEX_INC;

        soloIndex = minIndex + indexIncrement;
    }

    /**
     * Constructor with parameters
     *
     * @param minIndex       The value of the smallest index that is suitable
     * @param maxIndex       The value of the biggest index that is suitable
     * @param indexIncrement The initial room between two neighboring indexes
     */
    public IndexGeneratorHelper(int minIndex, int maxIndex, int indexIncrement) {
        this.minIndex = minIndex;
        this.maxIndex = maxIndex;
        this.indexIncrement = indexIncrement;

        soloIndex = minIndex + indexIncrement;
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

    /**
     * Move (or set) the given item at the beginning of the collection.
     * <p>
     * That means setting an index to the item so that it is the first when sorting by index.
     *
     * @param item       the item waiting for an index to be set
     * @param collection the collection of items
     *
     * @throws HttpErrorMessage if the collection is too big
     */
    public void moveItemToBeginning(T item, Collection<T> collection) {
        if (collection.isEmpty()) {
            item.setIndex(soloIndex);
        } else {
            List<T> sortedList = sortCollection(collection);

            T baseItem = sortedList.get(0);

            int justTooLow = minIndex - 1;

            if (!hasEnoughSpaceBetween(justTooLow, baseItem.getIndex())) {
                reorderIndexes(sortedList);
            }

            int wantedIndex = computeInBetweenIndex(justTooLow, baseItem.getIndex());

            item.setIndex(wantedIndex);
        }
    }

    /**
     * Move the given item one step ahead from where it is now.
     *
     * @param item       the item waiting for a new index
     * @param collection the collection of items
     *
     * @throws HttpErrorMessage if the item is not in the collection
     */
    public void moveOneStepAhead(T item, Collection<T> collection) {
        if (!collection.contains(item)) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        List<T> sortedList = sortCollection(collection);

        T item1 = getItemBefore(item, sortedList);

        if (item1 == null) {
            // already at the beginning
            return;
        }

        int itemIndex = item.getIndex();
        item.setIndex(item1.getIndex());
        item1.setIndex(itemIndex);
    }

    /**
     * Move (or set) the given item before the baseItem.
     *
     * @param item       the item waiting for a new index
     * @param baseItem   the item of reference
     * @param collection the collection of items
     *
     * @throws HttpErrorMessage if the baseItem is not in the collection or if the collection is too
     *                          big
     */
    public void moveItemBefore(T item, T baseItem, Collection<T> collection) {
        if (!collection.contains(baseItem)) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        List<T> sortedList = sortCollection(collection);

        T item1 = baseItem;
        T item2 = getItemBefore(baseItem, sortedList);

        if (item2 == null) {
            // set before item1 which is the first item
            moveItemToBeginning(item, collection);

        } else {
            // between two items
            if (!hasEnoughSpaceBetween(item1.getIndex(), item2.getIndex())) {
                reorderIndexes(sortedList);
            }

            int wantedIndex = computeInBetweenIndex(item1.getIndex(), item2.getIndex());

            item.setIndex(wantedIndex);
        }
    }

    /**
     * Move an item one step behind from where it is now.
     *
     * @param item       the item waiting for a new index
     * @param collection the collection of items
     *
     * @throws HttpErrorMessage if the item is not in the collection
     */
    public void moveOneStepBehind(T item, Collection<T> collection) {
        if (!collection.contains(item)) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        List<T> sortedList = sortCollection(collection);

        T item1 = getItemAfter(item, sortedList);

        if (item1 == null) {
            // already at the end
            return;
        }

        int itemIndex = item.getIndex();
        item.setIndex(item1.getIndex());
        item1.setIndex(itemIndex);
    }

    /**
     * Move (or set) the given item after the baseItem.
     *
     * @param item       the item waiting for a new index
     * @param baseItem   the item of reference
     * @param collection the collection of items
     *
     * @throws HttpErrorMessage if the baseItem is not in the collection or if the collection is too
     *                          big
     */
    public void moveItemAfter(T item, T baseItem, Collection<T> collection) {
        if (!collection.contains(baseItem)) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        List<T> sortedList = sortCollection(collection);

        T item1 = baseItem;
        T item2 = getItemAfter(baseItem, sortedList);

        if (item2 == null) {
            // set after item1 which is the last item
            moveItemToEnd(item, collection);

        } else {
            if (!hasEnoughSpaceBetween(item1.getIndex(), item2.getIndex())) {
                reorderIndexes(sortedList);
            }

            int wantedIndex = computeInBetweenIndex(item1.getIndex(), item2.getIndex());

            item.setIndex(wantedIndex);
        }
    }

    /**
     * Move (or set) the given item at the end of the collection.
     * <p>
     * That means setting an index to the item so that it is the last when sorting by index.
     *
     * @param item       the item waiting for an index to be set
     * @param collection the collection of items
     *
     * @throws HttpErrorMessage if the collection is too big
     */
    public void moveItemToEnd(T item, Collection<T> collection) {
        if (collection.isEmpty()) {
            item.setIndex(soloIndex);
        } else {
            List<T> sortedList = sortCollection(collection);

            T baseItem = sortedList.get(sortedList.size() - 1);

            int justTooBigIndex = maxIndex + 1;

            if (!hasEnoughSpaceBetween(baseItem.getIndex(), justTooBigIndex)) {
                reorderIndexes(sortedList);
            }

            int wantedIndex;
            if ((justTooBigIndex - baseItem.getIndex()) > indexIncrement) {
                wantedIndex = baseItem.getIndex() + indexIncrement;
            } else {
                wantedIndex = computeInBetweenIndex(baseItem.getIndex(), justTooBigIndex);
            }

            item.setIndex(wantedIndex);
        }
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

    /**
     * Reorder the list so that each neighboring items have items separated by
     * {@link #indexIncrement}.
     * <p>
     * The first item also has a room of {@link #indexIncrement} before it.
     *
     * @param sortedCollection The sorted collection to index again
     *
     * @throws HttpErrorMessage if the collection is too big to be reorder
     */
    private void reorderIndexes(List<T> sortedCollection) {
        if (!canBeReordered(sortedCollection)) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        int index = minIndex + indexIncrement;

        for (WithIndex obj : sortedCollection) {
            obj.setIndex(index);
            index += indexIncrement;
        }
    }

    /**
     * Compute if the collection size fits into items indexes separated by {@link #indexIncrement}
     * between {@link #minIndex} and {@link #maxIndex}
     *
     * @param collection
     *
     * @return True if the collection size fits into
     */
    private boolean canBeReordered(Collection<T> collection) {
        return Math.floor(((float) (maxIndex - minIndex)) / indexIncrement) - 1 >= collection
            .size();
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

    /**
     * Sort the collection by the items index field.
     *
     * @param collection the collection of items to sort
     *
     * @return a list of sorted items by index
     */
    private List<T> sortCollection(Collection<T> collection) {
        List<T> sortedList = new ArrayList<>(collection);

        sortedList.sort(Comparator.comparingInt(obj -> obj.getIndex()));

        // TODO sandra ask Maxence if the old way was more suitable
//      sortedList.sort((a, b) -> {
//      if (a != null) {
//          if (b != null) {
//              return Math.max(a.getIndex(), b.getIndex());
//          } else {
//              // a is not null, b is null
//              return -1;
//          }
//      } else if (b != null) {
//          // a is null, not b
//          return 1;
//      }
//      //both are null
//      return 0;

        return sortedList;
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

    /**
     * Determine if there is enough space between two indexes so that we can insert something new.
     *
     * @param indexA an index
     * @param indexB another index
     *
     * @return True if there is at least 1 room left between the two indexes
     */
    private boolean hasEnoughSpaceBetween(int indexA, int indexB) {
        return Math.abs(indexB - indexA) > 1;
    }

    /**
     * Determine the new index which will take place between the two given indexes.
     *
     * @param indexA an index
     * @param indexB another index
     *
     * @return An index that fits between the two given indexes
     */
    private int computeInBetweenIndex(int indexA, int indexB) {
        int baseIndex = indexA;

        int delta = indexB - baseIndex;
        int increment = (int) Math.floor(delta / 2.0);

        return baseIndex + increment;
    }

    /**
     * Fetch the item which is just before the given baseItem in the sortedList.
     *
     * @param baseItem   the reference item
     * @param sortedList the sorted list of items
     *
     * @return the item just before baseItem
     *
     * @throws HttpErrorMessage if the sorted list does not contain the baseItem
     */
    private T getItemBefore(T baseItem, List<T> sortedList) {
        if (!sortedList.contains(baseItem)) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        int baseIndexInList = sortedList.indexOf(baseItem);

        if (baseIndexInList > 0) {
            return sortedList.get(baseIndexInList - 1);
        } else {
            // nothing before baseItem
            return null;
        }
    }

    /**
     * Fetch the item which is just after the given baseItem in the sortedList.
     *
     * @param baseItem   the reference item
     * @param sortedList the sorted list of items
     *
     * @return the item just after baseItem
     *
     * @throws HttpErrorMessage if the sorted list does not contain the baseItem
     */
    private T getItemAfter(T baseItem, List<T> sortedList) {
        if (!sortedList.contains(baseItem)) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        int baseIndexInList = sortedList.indexOf(baseItem);

        if (baseIndexInList < sortedList.size() - 1) {
            return sortedList.get(baseIndexInList + 1);
        } else {
            // nothing after baseItem
            return null;
        }
    }
}
