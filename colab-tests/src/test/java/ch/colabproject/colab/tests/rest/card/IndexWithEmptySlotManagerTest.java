package ch.colabproject.colab.tests.rest.card;

import ch.colabproject.colab.api.controller.common.IndexWithEmptySlotManager;
import ch.colabproject.colab.api.model.card.Card;
import java.util.Collection;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import com.google.common.collect.Sets;

/**
 * Test of the index with empty slot manager
 *
 * @author sandra
 */
public class IndexWithEmptySlotManagerTest {

    @SuppressWarnings("static-method")
    @Test
    public void testIt() {

        Card cardD = initCard(20, 0);
        Card cardX = initCard(30, 4);
        Card cardB = initCard(40, 4);
        Card cardA = initCard(50, 2);
        Card cardE = initCard(60, 0);
        Card cardF = initCard(70, 0);
        Card cardC = initCard(80, 4);

        // 1 2 3 4 5 6 7 8 9
        // - A - X B C D E F

        Collection<Card> collection = Sets.newHashSet(cardD, cardX, cardB, cardA, cardE, cardF,
            cardC);

        IndexWithEmptySlotManager<Card> indexManager = new IndexWithEmptySlotManager<>();

        // init the indexes
        indexManager.changeItemPosition(cardX, 8, collection);
        Assertions.assertEquals(8, cardX.getIndex());

        // 1 2 3 4 5 6 7 8 9
        // - A - B C D E X F

        Assertions.assertEquals(2, cardA.getIndex());
        Assertions.assertEquals(4, cardB.getIndex());
        Assertions.assertEquals(5, cardC.getIndex());
        Assertions.assertEquals(6, cardD.getIndex());
        Assertions.assertEquals(7, cardE.getIndex());
        Assertions.assertEquals(8, cardX.getIndex());
        Assertions.assertEquals(9, cardF.getIndex());

        // move down => move the cards in between up
        indexManager.changeItemPosition(cardX, 4, collection);
        Assertions.assertEquals(4, cardX.getIndex());

        // 1 2 3 4 5 6 7 8 9
        // - A - X B C D E F

        Assertions.assertEquals(2, cardA.getIndex());
        Assertions.assertEquals(4, cardX.getIndex());
        Assertions.assertEquals(5, cardB.getIndex());
        Assertions.assertEquals(6, cardC.getIndex());
        Assertions.assertEquals(7, cardD.getIndex());
        Assertions.assertEquals(8, cardE.getIndex());
        Assertions.assertEquals(9, cardF.getIndex());

        // move up => move the cards in between down
        indexManager.changeItemPosition(cardX, 6, collection);
        Assertions.assertEquals(6, cardX.getIndex());

        // 1 2 3 4 5 6 7 8 9
        // - A - B C X D E F

        Assertions.assertEquals(2, cardA.getIndex());
        Assertions.assertEquals(4, cardB.getIndex());
        Assertions.assertEquals(5, cardC.getIndex());
        Assertions.assertEquals(6, cardX.getIndex());
        Assertions.assertEquals(7, cardD.getIndex());
        Assertions.assertEquals(8, cardE.getIndex());
        Assertions.assertEquals(9, cardF.getIndex());

        // move letting empty slot be empty slot
        indexManager.changeItemPosition(cardX, 2, collection);
        Assertions.assertEquals(2, cardX.getIndex());

        // 1 2 3 4 5 6 7 8 9
        // - X - A B C D E F

        Assertions.assertEquals(2, cardX.getIndex());
        Assertions.assertEquals(4, cardA.getIndex());
        Assertions.assertEquals(5, cardB.getIndex());
        Assertions.assertEquals(6, cardC.getIndex());
        Assertions.assertEquals(7, cardD.getIndex());
        Assertions.assertEquals(8, cardE.getIndex());
        Assertions.assertEquals(9, cardF.getIndex());

        // move letting empty slot be empty slot
        indexManager.changeItemPosition(cardX, 7, collection);
        Assertions.assertEquals(7, cardX.getIndex());

        // 1 2 3 4 5 6 7 8 9
        // - A - B C D X E F

        Assertions.assertEquals(2, cardA.getIndex());
        Assertions.assertEquals(4, cardB.getIndex());
        Assertions.assertEquals(5, cardC.getIndex());
        Assertions.assertEquals(6, cardD.getIndex());
        Assertions.assertEquals(7, cardX.getIndex());
        Assertions.assertEquals(8, cardE.getIndex());
        Assertions.assertEquals(9, cardF.getIndex());

        // move to empty slot => just change the index
        indexManager.changeItemPosition(cardX, 3, collection);
        Assertions.assertEquals(3, cardX.getIndex());

        // 1 2 3 4 5 6 7 8 9
        // - A X B C D - E F

        Assertions.assertEquals(2, cardA.getIndex());
        Assertions.assertEquals(3, cardX.getIndex());
        Assertions.assertEquals(4, cardB.getIndex());
        Assertions.assertEquals(5, cardC.getIndex());
        Assertions.assertEquals(6, cardD.getIndex());
        Assertions.assertEquals(8, cardE.getIndex());
        Assertions.assertEquals(9, cardF.getIndex());
    }

    private static Card initCard(long id, int index) {
        Card card = new Card();
        card.setId(id);
        card.setIndex(index);
        return card;
    }

}
