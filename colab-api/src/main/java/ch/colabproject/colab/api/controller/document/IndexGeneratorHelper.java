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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author sandra
 */
public final class IndexGeneratorHelper {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(IndexGeneratorHelper.class);

    /**
     * The value of the first index
     */
    public static final int MIN_INDEX = 0;

    /**
     * The value of the bigger index that is compatible with the model
     */
    public static final int MAX_INDEX = Integer.MAX_VALUE;

    /**
     * Default room between indexes
     */
    public static final int DEFAULT_INDEX_INC = 1000;

    /**
     * never-called private constructor
     */
    private IndexGeneratorHelper() {
        throw new UnsupportedOperationException(
            "This is a utility class and cannot be instantiated");
    }

    // TODO unit test

    /**
     * Compute the next index to use for this collection.
     * <p>
     * The index will be between {@link #MIN_INDEX} and {@link #MAX_INDEX} and two indexes are
     * separated between {@link #DEFAULT_INDEX_INC}.
     *
     * @param collection A collection of indexed objects
     *
     * @return the next index to use for the collection
     */
    public static int nextIndex(Collection<? extends WithIndex> collection) {
        List<WithIndex> workData = new ArrayList<>(collection);

        if (workData.isEmpty()) {
            return MIN_INDEX + DEFAULT_INDEX_INC;
        } else {
            workData.sort(Comparator.comparingInt(obj -> obj.getIndex()));

            WithIndex lastOne = workData.get(workData.size() - 1);

            if (lastOne.getIndex() < MAX_INDEX - DEFAULT_INDEX_INC) {
                return lastOne.getIndex() + DEFAULT_INDEX_INC;

            } else if ((workData.size() + 1) > (MAX_INDEX - MIN_INDEX) / DEFAULT_INDEX_INC) {
                // current behaviour is not that robust...
                // it will crash when there is more than (MAX_INTEGER / 1000) objects
                // it is big enough for our needs
                throw HttpErrorMessage.dataIntegrityFailure();

            } else {
                logger.warn("needed to reindex (last: {})", lastOne);

                // MAX INDEX reached -> reset all indexes
                reorderIndexes(workData);

                return lastOne.getIndex() + DEFAULT_INDEX_INC;
            }
        }
    }

    /**
     * Reorder the list beginning with {@link #MIN_INDEX} incrementing of {@link #DEFAULT_INDEX_INC}
     * for each one.
     *
     * @param sortedCollection The sorted collection to reindex
     */
    private static void reorderIndexes(List<WithIndex> sortedCollection) {
        int index = MIN_INDEX + DEFAULT_INDEX_INC;

        for (WithIndex obj : sortedCollection) {
            obj.setIndex(index);
            index += DEFAULT_INDEX_INC;
        }
    }

}
