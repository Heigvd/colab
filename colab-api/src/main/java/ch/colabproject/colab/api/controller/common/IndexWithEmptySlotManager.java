/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.common;

import ch.colabproject.colab.api.model.WithIndex;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.generator.model.exceptions.MessageI18nKey;
import ch.colabproject.colab.generator.model.interfaces.WithId;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import org.apache.commons.collections4.CollectionUtils;

/**
 * Deal with changing index in a collection. The indexes are from 1 to ..., usually with a step of 1
 * between two items. There can be more than an increment of 1 between two items : it means there is
 * one (or more) empty slot(s) between the items.
 *
 * @author sandra
 *
 * @param <T> Type of the items
 */
// TODO smart deal with empty slots addition / moving
@Stateless
@LocalBean
public class IndexWithEmptySlotManager<T extends WithIndex & WithId> {

    /**
     * The default value of the biggest index that is suitable
     */
    private static final int DEFAULT_MAX_INDEX = Integer.MAX_VALUE;

    /** sort by id */
    private final Comparator<T> idComparator = Comparator
        .comparingLong(entity -> entity.getId());

    /** sort by index - if null or 0, at the end */
    private final Comparator<T> indexComparator = Comparator
        .comparingLong(entity -> entity.getIndex() != 0 ? entity.getIndex() : DEFAULT_MAX_INDEX);

    // *********************************************************************************************
    // change the position of an item
    // *********************************************************************************************

    /**
     * Set the new position of the item. If needed, initialize the indexes of the collection first
     * to ensure that the indexes are unique inside the collection.
     * <p>
     * If we move the item where there is already a card, all cards between the old and the new
     * position are moved to let space.
     * <p>
     * If we move the item to an empty slot, it is just a swap between the card and the empty place.
     * No other card change.
     *
     * @param itemToMove the item to change
     * @param newIndex   the new index to set
     * @param collection the collection of items
     */
    public void changeItemPosition(T itemToMove, int newIndex, Collection<T> collection) {
        if (CollectionUtils.isEmpty(collection)) {
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }

        if (!collection.contains(itemToMove)) {
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }

        List<T> sortedList = sort(collection);

        harmonizeIndexes(sortedList);

        int oldIndex = itemToMove.getIndex();

        if (oldIndex != newIndex) {
            boolean isMovingToEmptySlot = sortedList.stream()
                .filter(anItem -> anItem.getIndex() == newIndex).findAny().isEmpty();

            if (isMovingToEmptySlot) {
                // just a swap between the card and the blank
                // as soon as we have a way to add an empty slot where we want, we can change this
                // behaviour
                itemToMove.setIndex(newIndex);
            } else {
                List<Integer> fixedEmptySlots = listEmptySlots(sortedList);

                boolean isMovingToBiggerIndex = newIndex > oldIndex;

                // move items between old and new index
                if (isMovingToBiggerIndex) {
                    for (T anItem : sortedList) {
                        if (anItem.getIndex() > oldIndex && anItem.getIndex() <= newIndex) {
                            int anItemIndex = anItem.getIndex() - 1;

                            while (fixedEmptySlots.contains(anItemIndex)) {
                                anItemIndex--;
                            }
                            anItem.setIndex(anItemIndex);
                        }
                    }
                } else {
                    for (T anItem : sortedList) {
                        if (anItem.getIndex() >= newIndex && anItem.getIndex() < oldIndex) {
                            int anItemIndex = anItem.getIndex() + 1;

                            while (fixedEmptySlots.contains(anItemIndex)) {
                                anItemIndex++;
                            }
                            anItem.setIndex(anItemIndex);
                        }
                    }
                }

                itemToMove.setIndex(newIndex);
            }
        }
    }

    // *********************************************************************************************
    // sort
    // *********************************************************************************************

    /**
     * Sort by index and id.
     *
     * @param collection the collection to sort
     *
     * @return an ordered by index and id list
     */
    private List<T> sort(Collection<T> collection) {
        List<T> sortedList = new ArrayList<>(collection);

        sortedList.sort(idComparator);

        sortedList.sort(indexComparator);

        return sortedList;
    }

    // *********************************************************************************************
    // prepare
    // *********************************************************************************************

    /**
     * Make sure that
     * <ul>
     * <li>no index is 0</li>
     * <li>each index is unique</li>
     * </ul>
     *
     * @param sortedList
     */
    private void harmonizeIndexes(List<T> sortedList) {
        int lastIndex = 0;

        // a priori, this simple algorithm is functional enough

        for (T item : sortedList) {
            if (item.getIndex() <= lastIndex) {
                item.setIndex(lastIndex + 1);
            }

            lastIndex = item.getIndex();
        }
    }

    // *********************************************************************************************
    // deal with empty slots
    // *********************************************************************************************

    /**
     * List the indexes where there is an empty slot.
     *
     * @param sortedList
     *
     * @return the indexes of the empty slots
     */
    private List<Integer> listEmptySlots(List<T> sortedList) {
        List<Integer> emptySlots = new ArrayList<>();

        int lastIndex = 0;

        for (T item : sortedList) {
            lastIndex++;

            while (lastIndex < item.getIndex()) {
                emptySlots.add(lastIndex);
                lastIndex++;
            }
        }

        return emptySlots;
    }

}
