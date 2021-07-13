/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.tests;

import ch.colabproject.colab.api.microchanges.live.LiveResult;
import ch.colabproject.colab.api.microchanges.live.LiveUpdates;
import ch.colabproject.colab.api.microchanges.model.Change;
import ch.colabproject.colab.tests.ChangeBuilder;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.slf4j.event.Level;

/**
 *
 * @author maxence
 */
public class LiveUpdatesTest {

//    @BeforeEach
//    public void setLoggerLevel() {
//        TestHelper.setLoggerLevel(LoggerFactory.getLogger(LiveUpdates.class), Level.TRACE);
//    }
//
//    @AfterEach
//    public void resetLoggerLevel() {
//        TestHelper.setLoggerLevel(LoggerFactory.getLogger(LiveUpdates.class), Level.INFO);
//    }

    @Test
    public void testProcess() {
        String session1 = "s1";

        LiveUpdates lu = new LiveUpdates();

        lu.setContent("");
        lu.setRevision("0");
        lu.setTargetClass("@test");
        lu.setTargetId(0l);

        lu.setPendingChanges(new ArrayList<>());
        List<Change> chs = lu.getPendingChanges();

        chs.add(ChangeBuilder.create(session1, "0", "1").ins(0, "Salut").build());

        chs.add(ChangeBuilder.create(session1, session1 + "::1", "2")
            .ins(5, " les co").build());

        chs.add(ChangeBuilder.create(session1, session1 + "::2", "3")
            .ins(12, "pains").build());

        LiveResult result = lu.process(false);
        Assertions.assertEquals("Salut les copains", result.getContent());
        System.out.println("LU: " + result.getContent());

    }

    @Test
    public void testDeletion() {
        String session1 = "s1";
        String session2 = "s2";

        LiveUpdates lu = new LiveUpdates();

        lu.setContent("apple apricot banana bean cucumber");
        lu.setRevision("0");
        lu.setTargetClass("@test");
        lu.setTargetId(0l);

        lu.setPendingChanges(new ArrayList<>());
        List<Change> chs = lu.getPendingChanges();

        // delete "apple "
        chs.add(ChangeBuilder.create(session1, "0", "1")
            .del(0, 6).build());

        // delete " bean"
        chs.add(ChangeBuilder.create(session2, "0", "2")
            .del(21, 5).build());

        LiveResult result = lu.process(false);
        Assertions.assertEquals("apricot banana cucumber", result.getContent());
        System.out.println("LU: " + result.getContent());
    }

    @Test
    public void testDeletionWrap() {
        String session1 = "s1";
        String session2 = "s2";

        LiveUpdates lu = new LiveUpdates();

        lu.setContent("apple apricot banana bean cucumber");
        lu.setRevision("0");
        lu.setTargetClass("@test");
        lu.setTargetId(0l);

        lu.setPendingChanges(new ArrayList<>());
        List<Change> chs = lu.getPendingChanges();

        // delete " banana"
        chs.add(ChangeBuilder.create(session1, "0", "1")
            .del(14, 7).build());

        // delete " apricot banana bean"
        chs.add(ChangeBuilder.create(session2, "0", "2")
            .del(5, 20).build());

        LiveResult result = lu.process(false);
        Assertions.assertEquals("apple cucumber", result.getContent());
        System.out.println("LU: " + result.getContent());
    }

    @Test
    public void testDeletionWrapped() {
        String session1 = "s1";
        String session2 = "s2";

        LiveUpdates lu = new LiveUpdates();

        lu.setContent("apple apricot banana bean cucumber");
        lu.setRevision("0");
        lu.setTargetClass("@test");
        lu.setTargetId(0l);

        lu.setPendingChanges(new ArrayList<>());
        List<Change> chs = lu.getPendingChanges();

        // delete " apricot banana bean"
        chs.add(ChangeBuilder.create(session1, "0", "2")
            .del(5, 20).build());

        // delete " banana"
        chs.add(ChangeBuilder.create(session2, "0", "1")
            .del(14, 7).build());

        LiveResult result = lu.process(false);
        Assertions.assertEquals("apple cucumber", result.getContent());
        System.out.println("LU: " + result.getContent());
    }

    @Test
    public void testDeleteOverlap() {
        String session1 = "s1";
        String session2 = "s2";

        LiveUpdates lu = new LiveUpdates();

        lu.setContent("apple apricot banana bean cucumber");
        lu.setRevision("0");
        lu.setTargetClass("@test");
        lu.setTargetId(0l);

        lu.setPendingChanges(new ArrayList<>());
        List<Change> chs = lu.getPendingChanges();

        // delete " apricot banana"
        chs.add(ChangeBuilder.create(session1, "0", "2")
            .del(5, 15).build());

        // delete " banana bean"
        chs.add(ChangeBuilder.create(session2, "0", "1")
            .del(14, 11).build());

        LiveResult result = lu.process(false);
        Assertions.assertEquals("apple cucumber", result.getContent());
        System.out.println("LU: " + result.getContent());
    }

    @Test
    public void testDeleteOverlap2() {
        String session1 = "s1";
        String session2 = "s2";

        LiveUpdates lu = new LiveUpdates();

        lu.setContent("apple apricot banana bean cucumber");
        lu.setRevision("0");
        lu.setTargetClass("@test");
        lu.setTargetId(0l);

        lu.setPendingChanges(new ArrayList<>());
        List<Change> chs = lu.getPendingChanges();

        // delete " banana bean"
        chs.add(ChangeBuilder.create(session1, "0", "2")
            .del(14, 12).build());

        // delete "apricot banana"
        chs.add(ChangeBuilder.create(session2, "0", "1")
            .del(6, 15).build());

        LiveResult result = lu.process(false);
        Assertions.assertEquals("apple cucumber", result.getContent());
        System.out.println("LU: " + result.getContent());
    }

    @Test
    public void testDeleteAndAddAfter() {
        String session1 = "s1";
        String session2 = "s2";

        LiveUpdates lu = new LiveUpdates();

        lu.setContent("apple apricot banana cucumber");
        lu.setRevision("0");
        lu.setTargetClass("@test");
        lu.setTargetId(0l);

        lu.setPendingChanges(new ArrayList<>());
        List<Change> chs = lu.getPendingChanges();

        // delete " apricot"
        chs.add(ChangeBuilder.create(session1, "0", "2")
            .del(5, 8).build());

        // add " daikon"
        chs.add(ChangeBuilder.create(session2, "0", "1")
            .ins(30, " daikon").build());

        LiveResult result = lu.process(false);
        Assertions.assertEquals("apple banana cucumber daikon", result.getContent());
        System.out.println("LU: " + result.getContent());
    }

    @Test
    public void testDeleteAndAddBefore() {
        String session1 = "s1";
        String session2 = "s2";

        LiveUpdates lu = new LiveUpdates();

        lu.setContent("apple banana cucumber carrot daikon");
        lu.setRevision("0");
        lu.setTargetClass("@test");
        lu.setTargetId(0l);

        lu.setPendingChanges(new ArrayList<>());
        List<Change> chs = lu.getPendingChanges();

        // delete " carrot"
        chs.add(ChangeBuilder.create(session1, "0", "2")
            .del(22, 7).build());

        // add " bean"
        chs.add(ChangeBuilder.create(session2, "0", "1")
            .ins(5, " bean").build());

        LiveResult result = lu.process(false);
        Assertions.assertEquals("apple bean banana cucumber daikon", result.getContent());
        System.out.println("LU: " + result.getContent());
    }

    @Test
    public void testDeleteAndAddWithin() {
        String session1 = "s1";
        String session2 = "s2";

        LiveUpdates lu = new LiveUpdates();

        lu.setContent("apple banana cucumber carrot daikon");
        lu.setRevision("0");
        lu.setTargetClass("@test");
        lu.setTargetId(0l);

        lu.setPendingChanges(new ArrayList<>());
        List<Change> chs = lu.getPendingChanges();

        // delete " banana cucumber carrot"
        chs.add(ChangeBuilder.create(session1, "0", "2")
            .del(5, 23).build());

        // add " bean"
        chs.add(ChangeBuilder.create(session2, "0", "1")
            .ins(12, " bean").build());

        LiveResult result = lu.process(false);
        Assertions.assertEquals("apple bean daikon", result.getContent());
        System.out.println("LU: " + result.getContent());
    }

    @Test
    public void testAddAndDeleteBefore() {
        String session1 = "s1";
        String session2 = "s2";

        LiveUpdates lu = new LiveUpdates();

        lu.setContent("apple banana cucumber");
        lu.setRevision("0");
        lu.setTargetClass("@test");
        lu.setTargetId(0l);

        lu.setPendingChanges(new ArrayList<>());
        List<Change> chs = lu.getPendingChanges();

        // add " daikon"
        chs.add(ChangeBuilder.create(session1, "0", "1")
            .ins(21, " daikon").build());

        // del " banana"
        chs.add(ChangeBuilder.create(session2, "0", "1")
            .del(5, 7).build());

        LiveResult result = lu.process(false);
        Assertions.assertEquals("apple cucumber daikon", result.getContent());
        System.out.println("LU: " + result.getContent());
    }

    @Test
    public void testAddAndDeleteWrapped() {
        String session1 = "s1";
        String session2 = "s2";

        LiveUpdates lu = new LiveUpdates();

        lu.setContent("apple banana daikon eggplant");
        lu.setRevision("0");
        lu.setTargetClass("@test");
        lu.setTargetId(0l);

        lu.setPendingChanges(new ArrayList<>());
        List<Change> chs = lu.getPendingChanges();

        // add " cucumber"
        chs.add(ChangeBuilder.create(session1, "0", "1")
            .ins(12, " cucumber").build());

        // del " banana daikon"
        chs.add(ChangeBuilder.create(session2, "0", "1")
            .del(5, 14).build());

        LiveResult result = lu.process(false);
        Assertions.assertEquals("apple cucumber eggplant", result.getContent());
        System.out.println("LU: " + result.getContent());
    }

    @Test
    public void testProcessInsertAndDelete() {
        String session1 = "s1";
        String session2 = "s2";

        LiveUpdates lu = new LiveUpdates();

        lu.setContent("");
        lu.setRevision("0");
        lu.setTargetClass("@test");
        lu.setTargetId(0l);

        lu.setPendingChanges(new ArrayList<>());
        List<Change> chs = lu.getPendingChanges();

        // "" -> "apple"
        chs.add(ChangeBuilder.create(session1, "0", "1")
            .ins(0, "apple").build());

        // "apple" -> "apple banana"
        chs.add(ChangeBuilder.create(session1, session1 + "::1", "2")
            .ins(5, " banana").build());

        // "apple banana" -> "apple broccoli"
        chs.add(ChangeBuilder.create(session2, session1 + "::2", "1")
            .del(7, 5)
            .ins(12, "roccoli").build());

        // "apple banana" -> "apple banana carrot"
        chs.add(ChangeBuilder.create(session1, session1 + "::2", "3")
            .ins(12, " carrot").build());

        LiveResult result = lu.process(false);

        Assertions.assertEquals("apple broccoli carrot", result.getContent());
    }

    @Test
    public void testProcessInsertAndDeleteWithComma() {
        String session1 = "sjkhds3432-3423432-ed";
        String session2 = "834kjhds-dsfwezh-ddd7";

        LiveUpdates lu = new LiveUpdates();

        lu.setContent("");
        lu.setRevision("0");
        lu.setTargetClass("@test");
        lu.setTargetId(0l);

        lu.setPendingChanges(new ArrayList<>());
        List<Change> chs = lu.getPendingChanges();

        // "" -> "apple"
        chs.add(ChangeBuilder.create(session1, "0", "1")
            .ins(0, "apple").build());

        // "apple" -> "apple banana"
        chs.add(ChangeBuilder.create(session1, session1 + "::1", "2")
            .ins(5, " banana").build());

        // "apple banana" -> "apple broccoli"
        chs.add(ChangeBuilder.create(session2, session1 + "::2", "1")
            .del(7, 5)
            .ins(12, "roccoli").build());

        // "apple broccoli" -> "apple, broccoli, "
        chs.add(ChangeBuilder.create(session2, session2 + "::1", "2")
            .ins(5, ",")
            .ins(14, ",").build());

        // "apple banana" -> "apple banana carrot"
        chs.add(ChangeBuilder.create(session1, session1 + "::2", "3")
            .ins(12, " carrot").build());

        LiveResult result = lu.process(false);

        Assertions.assertEquals("apple, broccoli carrot,", result.getContent());
    }

    @Test
    public void testDeepBranch() {
        String session1 = "s1";
        String session2 = "s2";

        LiveUpdates lu = new LiveUpdates();

        lu.setContent("apple banana cherry durian\n"
            + "asparagus broccoli carrot daikon");
        lu.setRevision("0");
        lu.setTargetClass("@test");
        lu.setTargetId(0l);

        lu.setPendingChanges(new ArrayList<>());
        List<Change> chs = lu.getPendingChanges();

        // session 1 -> three commit branch
        // "apple ..."+ -> "apricots ..."
        chs.add(ChangeBuilder.create(session1, "0", "1")
            .del(1, 4).ins(5, "pricot").build());

        // "apricot banana -> "apricot blueberry"
        chs.add(ChangeBuilder.create(session1, session1 + "::1", "2")
            .del(9, 5).ins(14, "lueberry").build());

        // "apricot blueberry cherry durian" -> "apricot blueberry cherry durian elderberry"
        chs.add(ChangeBuilder.create(session1, session1 + "::2", "3")
            .ins(31, " elderberry").build());

        // session 2 -> three commit branch
        // "[...]asparagus broccoli"+ -> "[...]bean"
        int delta = 27;
        chs.add(ChangeBuilder.create(session2, "0", "1")
            .del(delta + 11, 7).ins(delta + 18, "ean").build());

        // "asparagus bean carrot-> "asparagus bean cucumber"
        chs.add(ChangeBuilder.create(session2, session2 + "::1", "2")
            .del(delta + 16, 5).ins(delta + 21, "ucumber").build());

        // "asparagus bean cucumber daikon" -> "asparagus bean cucumber daikon eggplant"
        chs.add(ChangeBuilder.create(session2, session2 + "::2", "3")
            .ins(delta + 30, " eggplant").build());

        LiveResult result = lu.process(false);

        Assertions.assertEquals("apricot blueberry cherry durian elderberry\n"
            + "asparagus bean cucumber daikon eggplant", result.getContent());
    }

    @Test
    public void testConflict() {
        String session1 = "s1";
        String session2 = "s2";

        LiveUpdates lu = new LiveUpdates();

        lu.setContent("");
        lu.setRevision("0");
        lu.setTargetClass("@test");
        lu.setTargetId(0l);

        lu.setPendingChanges(new ArrayList<>());
        List<Change> chs = lu.getPendingChanges();

        // "" -> "apple"
        chs.add(ChangeBuilder.create(session1, "0", "1")
            .ins(0, "apple").build());

        // "apple" -> "apple banana carrot"
        chs.add(ChangeBuilder.create(session1, session1 + "::1", "2")
            .ins(5, " banana carrot").build());

        // "apple banana carrot" -> "apple broccoli carrot"
        chs.add(ChangeBuilder.create(session1, session1 + "::2", "3")
            .del(7, 5)
            .ins(12, "roccoli").build());

        // "apple banana carrot" -> "apple broccoli carrot"
        chs.add(ChangeBuilder.create(session2, session1 + "::2", "1")
            .del(7, 5)
            .ins(12, "lueberry").build());

        LiveResult result = lu.process(false);

        Assertions.assertEquals("apple blilueberry carrot", result.getContent());
    }

    /**
     * TODO : decide what to do with conflicts
     */
    @Test
    public void testStrictConflict() {
        String session1 = "s1";
        String session2 = "s2";

        LiveUpdates lu = new LiveUpdates();

        lu.setContent("");
        lu.setRevision("0");
        lu.setTargetClass("@test");
        lu.setTargetId(0l);

        lu.setPendingChanges(new ArrayList<>());
        List<Change> chs = lu.getPendingChanges();

        // "" -> "apple"
        chs.add(ChangeBuilder.create(session1, "0", "1")
            .ins(0, "apple").build());

        // "apple" -> "apple banana carrot"
        chs.add(ChangeBuilder.create(session1, session1 + "::1", "2")
            .ins(5, " banana carrot").build());

        // "apple banana carrot" -> "apple broccoli carrot"
        chs.add(ChangeBuilder.create(session1, session1 + "::2", "3")
            .del(7, 5)
            .ins(12, "roccoli").build());

        // "apple banana carrot" -> "apple blueberry carrot"
        chs.add(ChangeBuilder.create(session2, session1 + "::2", "1")
            .del(7, 5)
            .ins(12, "lueberry").build());

        LiveResult result = lu.process(true);

        Assertions.assertEquals("apple blilueberry carrot", result.getContent());
    }

    @Test
    public void testBadChanges() {
        String session1 = "s1";

        LiveUpdates lu = new LiveUpdates();

        lu.setContent("");
        lu.setRevision("0");
        lu.setTargetClass("@test");
        lu.setTargetId(0l);

        lu.setPendingChanges(new ArrayList<>());
        List<Change> chs = lu.getPendingChanges();

        // "" -> "apple"
        chs.add(ChangeBuilder.create(session1, "0", "1")
            .ins(0, "apple").build());

        // "apple" -> "apple banana carrot"
        chs.add(ChangeBuilder.create(session1, session1 + "::1", "2")
            .ins(15, " banana").build());

        LiveResult result = lu.process(true);

        Assertions.assertEquals("apple banana", result.getContent());
    }

    @Test
    public void testConflictuaDeletion() {
        TestHelper.setLoggerLevel(LoggerFactory.getLogger(LiveUpdates.class), Level.TRACE);
        String session1 = "s1";
        String session2 = "s1";

        LiveUpdates lu = new LiveUpdates();

        lu.setContent("apple bean banana");
        lu.setRevision("0");
        lu.setTargetClass("@test");
        lu.setTargetId(0l);

        lu.setPendingChanges(new ArrayList<>());
        List<Change> chs = lu.getPendingChanges();

        // "apple bean banana" -> "apple banana"
        chs.add(ChangeBuilder.create(session1, "0", "1")
            .del(5, 5).build());

        // "apple bean banana" -> "apple banana"
        chs.add(ChangeBuilder.create(session2, "0", "1")
            .del(5, 5).build());

        LiveResult result = lu.process(true);

        Assertions.assertEquals("apple banana", result.getContent());
    }
}
