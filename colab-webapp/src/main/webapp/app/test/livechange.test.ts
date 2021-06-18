/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import {Change, MicroChange} from 'colab-rest-client';
import * as LiveHelper from '../src/LiveHelper';

function createChange(session: string, basedOn: string, newRevision: string, ...mu: MicroChange[]): Change {

  return {
    atClass: "@test",
    atId: 1,
    liveSession: session,
    basedOn: basedOn,
    microchanges: mu,
    revision: newRevision
  };
}

function ins(offset: number, value: string): MicroChange {
  return {
    t: 'I',
    o: offset,
    v: value
  }
}

function del(offset: number, length: number): MicroChange {
  return {
    t: 'D',
    o: offset,
    l: length
  }
}

test("Easy changes: insert only", () => {
  const session1 = "s1";
  const initialValue = "";

  const changes: Change[] = [
    createChange(session1, "0", "1", ins(0, "Salut")),
    createChange(session1, "1", "2", ins(5, " les co")),
    createChange(session1, "2", "3", ins(12, "pains")),
  ];


  const newValue = LiveHelper.process(initialValue, changes);

  expect(newValue.value).toBe("Salut les copains");
});

test("Easy changes: testDeletion", () => {
  const session1 = "s1";
  const session2 = "s2";
  const initialValue = "apple apricot banana bean cucumber";

  const changes: Change[] = [
    createChange(session1, "0", "1-1", del(0, 6)),
    createChange(session2, "0", "2-1", del(21, 5)),
  ];


  const newValue = LiveHelper.process(initialValue, changes);

  expect(newValue.value).toBe("apricot banana cucumber");
});


test("Easy changes: testDeletionWrap", () => {
  const session1 = "s1";
  const session2 = "s2";
  const initialValue = "apple apricot banana bean cucumber";

  const changes: Change[] = [
    createChange(session1, "0", "1-1", del(14, 7)),
    createChange(session2, "0", "2-1", del(5, 20)),
  ];


  const newValue = LiveHelper.process(initialValue, changes);

  expect(newValue.value).toBe("apple cucumber");
});

test("Easy changes: testDeletionWrapped", () => {
  const session1 = "s1";
  const session2 = "s2";
  const initialValue = "apple apricot banana bean cucumber";

  const changes: Change[] = [
    createChange(session1, "0", "1-1", del(5, 20)),
    createChange(session2, "0", "2-1", del(14, 7)),
  ];


  const newValue = LiveHelper.process(initialValue, changes);

  expect(newValue.value).toBe("apple cucumber");
});

test("Easy changes: testDeletionOverlap", () => {
  const session1 = "s1";
  const session2 = "s2";
  const initialValue = "apple apricot banana bean cucumber";

  const changes: Change[] = [
    createChange(session1, "0", "1-1", del(5, 15)),
    createChange(session2, "0", "2-1", del(14, 11)),
  ];


  const newValue = LiveHelper.process(initialValue, changes);

  expect(newValue.value).toBe("apple cucumber");
});


test("Easy changes: testDeletionOverlap2", () => {
  const session1 = "s1";
  const session2 = "s2";
  const initialValue = "apple apricot banana bean cucumber";

  const changes: Change[] = [
    createChange(session1, "0", "1-1", del(14, 12)),
    createChange(session2, "0", "2-1", del(6, 15)),
  ];


  const newValue = LiveHelper.process(initialValue, changes);

  expect(newValue.value).toBe("apple cucumber");
});


test("Easy changes: testDeleteAndAddAfter", () => {
  const session1 = "s1";
  const session2 = "s2";
  const initialValue = "apple apricot banana cucumber";

  const changes: Change[] = [
    createChange(session1, "0", "1-1", del(5, 8)),
    createChange(session2, "0", "2-1", ins(30, " daikon")),
  ];


  const newValue = LiveHelper.process(initialValue, changes);

  expect(newValue.value).toBe("apple banana cucumber daikon");
});


test("Easy changes: testDeleteAndAddBefore", () => {
  const session1 = "s1";
  const session2 = "s2";
  const initialValue = "apple banana cucumber carrot daikon";

  const changes: Change[] = [
    createChange(session1, "0", "1-1", del(22, 7)),
    createChange(session2, "0", "2-1", ins(5, " bean")),
  ];


  const newValue = LiveHelper.process(initialValue, changes);

  expect(newValue.value).toBe("apple bean banana cucumber daikon");
});


test("Easy changes: testDeleteAndAddWithin", () => {
  const session1 = "s1";
  const session2 = "s2";
  const initialValue = "apple banana cucumber carrot daikon";

  const changes: Change[] = [
    createChange(session1, "0", "1-1", del(5, 23)),
    createChange(session2, "0", "2-1", ins(12, " bean")),
  ];


  const newValue = LiveHelper.process(initialValue, changes);

  expect(newValue.value).toBe("apple bean daikon");
});



test("Easy changes: testAddAndDeleteBefore", () => {
  const session1 = "s1";
  const session2 = "s2";
  const initialValue = "apple banana cucumber";

  const changes: Change[] = [
    createChange(session1, "0", "1-1", ins(21, " daikon")),
    createChange(session2, "0", "2-1", del(5, 7)),
  ];


  const newValue = LiveHelper.process(initialValue, changes);

  expect(newValue.value).toBe("apple cucumber daikon");
});


test("Easy changes: testAddAndDeleteWrapped", () => {
  const session1 = "s1";
  const session2 = "s2";
  const initialValue = "apple banana daikon eggplant";

  const changes: Change[] = [
    createChange(session1, "0", "1-1", ins(12, " cucumber")),
    createChange(session2, "0", "2-1", del(5, 14)),
  ];


  const newValue = LiveHelper.process(initialValue, changes);

  expect(newValue.value).toBe("apple cucumber eggplant");
});

test("Easy changes: insert and delete", () => {
  const session1 = "s1";
  const session2 = "s2";
  const initialValue = "";

  const changes: Change[] = [
    createChange(session1, "0", "s1-1", ins(0, "apple")),
    createChange(session1, "s1-1", "s1-2", ins(5, " banana")),
    createChange(session2, "s1-2", "s2-1", del(7, 5), ins(12, "roccoli")),
    createChange(session1, "s1-2", "s1-3", ins(12, " carrot")),
  ];


  const newValue = LiveHelper.process(initialValue, changes);

  expect(newValue.value).toBe("apple broccoli carrot");
});

test("Easy changes: insert and delete with comma", () => {
  const session1 = "s1";
  const session2 = "s2";
  const initialValue = "";

  const changes: Change[] = [
    createChange(session1, "0", "s1-1", ins(0, "apple")),
    createChange(session1, "s1-1", "s1-2", ins(5, " banana")),
    createChange(session2, "s1-2", "s2-1", del(7, 5), ins(12, "roccoli")),
    createChange(session2, "s2-1", "s2-2", ins(5, ','), ins(14, ",")),
    createChange(session1, "s1-2", "s1-3", ins(12, " carrot")),
  ];


  const newValue = LiveHelper.process(initialValue, changes);

  expect(newValue.value).toBe("apple, broccoli carrot,");
});


test("DeepBranches: insert and delete", () => {
  const session1 = "s1";
  const session2 = "s2";
  const initialValue = "apple banana cherry durian\n"
            + "asparagus broccoli carrot daikon";

  const delta = 27;
  const changes: Change[] = [
    createChange(session1, "0", "s1-1", del(1, 4), ins(5, "pricot")),
    createChange(session1, "s1-1", "s1-2", del(9, 5), ins(14, "lueberry")),
    createChange(session1, "s1-2", "s1-3", ins(31, " elderberry")),

    createChange(session2, "0", "s2-1", del(delta + 11, 7), ins(delta + 18, "ean")),
    createChange(session2, "s2-1", "s2-2", del(delta + 16, 5), ins(delta +21, "ucumber")),
    createChange(session2, "s2-2", "s2-3", ins(delta + 30, " eggplant")),
  ];

  const newValue = LiveHelper.process(initialValue, changes);

  expect(newValue.value).toBe("apricot blueberry cherry durian elderberry\n"
            + "asparagus bean cucumber daikon eggplant");
});


test("TestConflict", () => {
  const session1 = "s1";
  const session2 = "s2";
  const initialValue = "";

  const changes: Change[] = [
    createChange(session1, "0", "s1-1", ins(0, "apple")),
    createChange(session1, "s1-1", "s1-2", ins(5, " banana carrot")),
    createChange(session1, "s1-2", "s1-3", del(7, 5), ins(12, "roccoli")),

    createChange(session2, "s1-2", "s2-1", del(7, 5), ins(12, "lueberry")),
  ];

  const newValue = LiveHelper.process(initialValue, changes);

  expect(newValue.value).toBe("apple blilueberry carrot");
});