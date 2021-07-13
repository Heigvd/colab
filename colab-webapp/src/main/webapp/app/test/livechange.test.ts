/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import {Change, MicroChange} from 'colab-rest-client';
import * as LiveHelper from '../src/LiveHelper';
import {levels} from '../src/logger';

export function createChange(session: string, basedOn: string, newRevision: string, ...mu: MicroChange[]): Change {

  return {
    "@class": 'Change',
    atClass: "@test",
    atId: 1,
    liveSession: session,
    basedOn: basedOn,
    microchanges: mu,
    revision: newRevision
  };
}

export function ins(offset: number, value: string): MicroChange {
  return {
    t: 'I',
    o: offset,
    v: value
  }
}

export function del(offset: number, length: number): MicroChange {
  return {
    t: 'D',
    o: offset,
    l: length
  }
}

//test("Easy changes: insert only", () => {
//  const session1 = "s1";
//  const initialValue = "";
//
//  const changes: Change[] = [
//    createChange(session1, "0", "1", ins(0, "Salut")),
//    createChange(session1, "1", "2", ins(5, " les co")),
//    createChange(session1, "2", "3", ins(12, "pains")),
//  ];
//
//
//  const newValue = LiveHelper.process(initialValue, '0', changes);
//
//  expect(newValue.value).toBe("Salut les copains");
//});
//
//test("Easy changes: testDeletion", () => {
//  const session1 = "s1";
//  const session2 = "s2";
//  const initialValue = "apple apricot banana bean cucumber";
//
//  const changes: Change[] = [
//    createChange(session1, "0", "1-1", del(0, 6)),
//    createChange(session2, "0", "2-1", del(21, 5)),
//  ];
//
//
//  const newValue = LiveHelper.process(initialValue, '0', changes);
//
//  expect(newValue.value).toBe("apricot banana cucumber");
//});
//
//
//test("Easy changes: testDeletionWrap", () => {
//  const session1 = "s1";
//  const session2 = "s2";
//  const initialValue = "apple apricot banana bean cucumber";
//
//  const changes: Change[] = [
//    createChange(session1, "0", "1-1", del(14, 7)),
//    createChange(session2, "0", "2-1", del(5, 20)),
//  ];
//
//
//  const newValue = LiveHelper.process(initialValue, '0', changes);
//
//  expect(newValue.value).toBe("apple cucumber");
//});
//
//test("Easy changes: testDeletionWrapped", () => {
//  const session1 = "s1";
//  const session2 = "s2";
//  const initialValue = "apple apricot banana bean cucumber";
//
//  const changes: Change[] = [
//    createChange(session1, "0", "1-1", del(5, 20)),
//    createChange(session2, "0", "2-1", del(14, 7)),
//  ];
//
//
//  const newValue = LiveHelper.process(initialValue, '0', changes);
//
//  expect(newValue.value).toBe("apple cucumber");
//});
//
//test("Easy changes: testDeletionOverlap", () => {
//  const session1 = "s1";
//  const session2 = "s2";
//  const initialValue = "apple apricot banana bean cucumber";
//
//  const changes: Change[] = [
//    createChange(session1, "0", "1-1", del(5, 15)),
//    createChange(session2, "0", "2-1", del(14, 11)),
//  ];
//
//
//  const newValue = LiveHelper.process(initialValue, '0', changes);
//
//  expect(newValue.value).toBe("apple cucumber");
//});
//
//
//test("Easy changes: testDeletionOverlap2", () => {
//  const session1 = "s1";
//  const session2 = "s2";
//  const initialValue = "apple apricot banana bean cucumber";
//
//  const changes: Change[] = [
//    createChange(session1, "0", "1-1", del(14, 12)),
//    createChange(session2, "0", "2-1", del(6, 15)),
//  ];
//
//
//  const newValue = LiveHelper.process(initialValue, '0', changes);
//
//  expect(newValue.value).toBe("apple cucumber");
//});
//
//
//test("Easy changes: testDeleteAndAddAfter", () => {
//  const session1 = "s1";
//  const session2 = "s2";
//  const initialValue = "apple apricot banana cucumber";
//
//  const changes: Change[] = [
//    createChange(session1, "0", "1-1", del(5, 8)),
//    createChange(session2, "0", "2-1", ins(30, " daikon")),
//  ];
//
//
//  const newValue = LiveHelper.process(initialValue, '0', changes);
//
//  expect(newValue.value).toBe("apple banana cucumber daikon");
//});
//
//
//test("Easy changes: testDeleteAndAddBefore", () => {
//  const session1 = "s1";
//  const session2 = "s2";
//  const initialValue = "apple banana cucumber carrot daikon";
//
//  const changes: Change[] = [
//    createChange(session1, "0", "1-1", del(22, 7)),
//    createChange(session2, "0", "2-1", ins(5, " bean")),
//  ];
//
//
//  const newValue = LiveHelper.process(initialValue, '0', changes);
//
//  expect(newValue.value).toBe("apple bean banana cucumber daikon");
//});

//
//test("Easy changes: testDeleteAndAddWithin", () => {
//  const session1 = "s1";
//  const session2 = "s2";
//  const initialValue = "apple banana cucumber carrot daikon";
//
//  const changes: Change[] = [
//    createChange(session1, "0", "1-1", del(5, 23)),
//    createChange(session2, "0", "2-1", ins(12, " bean")),
//  ];
//
//
//  const newValue = LiveHelper.process(initialValue, '0', changes);
//
//  expect(newValue.value).toBe("apple bean daikon");
//});
//
//
//
//test("Easy changes: testAddAndDeleteBefore", () => {
//  const session1 = "s1";
//  const session2 = "s2";
//  const initialValue = "apple banana cucumber";
//
//  const changes: Change[] = [
//    createChange(session1, "0", "1-1", ins(21, " daikon")),
//    createChange(session2, "0", "2-1", del(5, 7)),
//  ];
//
//
//  const newValue = LiveHelper.process(initialValue, '0', changes);
//
//  expect(newValue.value).toBe("apple cucumber daikon");
//});
//
//
//test("Easy changes: testAddAndDeleteWrapped", () => {
//  const session1 = "s1";
//  const session2 = "s2";
//  const initialValue = "apple banana daikon eggplant";
//
//  const changes: Change[] = [
//    createChange(session1, "0", "1-1", ins(12, " cucumber")),
//    createChange(session2, "0", "2-1", del(5, 14)),
//  ];
//
//
//  const newValue = LiveHelper.process(initialValue, '0', changes);
//
//  expect(newValue.value).toBe("apple cucumber eggplant");
//});
//
//test("Easy changes: insert and delete", () => {
//  const session1 = "s1";
//  const session2 = "s2";
//  const initialValue = "";
//
//  const changes: Change[] = [
//    createChange(session1, "0", "s1-1", ins(0, "apple")),
//    createChange(session1, "s1-1", "s1-2", ins(5, " banana")),
//    createChange(session2, "s1-2", "s2-1", del(7, 5), ins(12, "roccoli")),
//    createChange(session1, "s1-2", "s1-3", ins(12, " carrot")),
//  ];
//
//
//  const newValue = LiveHelper.process(initialValue, '0', changes);
//
//  expect(newValue.value).toBe("apple broccoli carrot");
//});
//
//test("Easy changes: insert and delete with comma", () => {
//  const session1 = "s1";
//  const session2 = "s2";
//  const initialValue = "";
//
//  const changes: Change[] = [
//    createChange(session1, "0", "s1-1", ins(0, "apple")),
//    createChange(session1, "s1-1", "s1-2", ins(5, " banana")),
//    createChange(session2, "s1-2", "s2-1", del(7, 5), ins(12, "roccoli")),
//    createChange(session2, "s2-1", "s2-2", ins(5, ','), ins(14, ",")),
//    createChange(session1, "s1-2", "s1-3", ins(12, " carrot")),
//  ];
//
//
//  const newValue = LiveHelper.process(initialValue, '0', changes);
//
//  expect(newValue.value).toBe("apple, broccoli carrot,");
//});
//
//
//test("DeepBranches: insert and delete", () => {
//  const session1 = "s1";
//  const session2 = "s2";
//  const initialValue = "apple banana cherry durian\n"
//    + "asparagus broccoli carrot daikon";
//
//  const delta = 27;
//  const changes: Change[] = [
//    createChange(session1, "0", "s1-1", del(1, 4), ins(5, "pricot")),
//    createChange(session1, "s1-1", "s1-2", del(9, 5), ins(14, "lueberry")),
//    createChange(session1, "s1-2", "s1-3", ins(31, " elderberry")),
//
//    createChange(session2, "0", "s2-1", del(delta + 11, 7), ins(delta + 18, "ean")),
//    createChange(session2, "s2-1", "s2-2", del(delta + 16, 5), ins(delta + 21, "ucumber")),
//    createChange(session2, "s2-2", "s2-3", ins(delta + 30, " eggplant")),
//  ];
//
//  const newValue = LiveHelper.process(initialValue, '0', changes);
//
//  expect(newValue.value).toBe("apricot blueberry cherry durian elderberry\n"
//    + "asparagus bean cucumber daikon eggplant");
//});
//
//
//test("TestConflict", () => {
//  const session1 = "s1";
//  const session2 = "s2";
//  const initialValue = "";
//
//  const changes: Change[] = [
//    createChange(session1, "0", "s1-1", ins(0, "apple")),
//    createChange(session1, "s1-1", "s1-2", ins(5, " banana carrot")),
//    createChange(session1, "s1-2", "s1-3", del(7, 5), ins(12, "roccoli")),
//
//    createChange(session2, "s1-2", "s2-1", del(7, 5), ins(12, "lueberry")),
//  ];
//
//  const newValue = LiveHelper.process(initialValue, '0', changes);
//
//  expect(newValue.value).toBe("apple blilueberry carrot");
//});
//


//test("TestWeekdays", () => {
//  levels.trace = true;
//
//  const initialValue = "ligne1: \nligne2: ";
//
//
//  const serverChanges: Change[] = [{"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "s1::3", "id": 3, "liveSession": "s1", "microchanges": [{"o": 8, "t": "I", "v": "u"}], "revision": "s1::4"}, {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "s1::4", "id": 3, "liveSession": "s1", "microchanges": [{"o": 9, "t": "I", "v": "n d"}], "revision": "s1::5"}, {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "s1::5", "id": 3, "liveSession": "s1", "microchanges": [{"o": 12, "t": "I", "v": "eux "}], "revision": "s1::6"}, {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "s1::5", "id": 3, "liveSession": "s2", "microchanges": [{"o": 21, "t": "I", "v": "c"}], "revision": "s2::21"}, {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "s2::21", "id": 3, "liveSession": "s2", "microchanges": [{"o": 26, "t": "I", "v": "e s"}], "revision": "s2::22"}, {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "s2::22", "id": 3, "liveSession": "s2", "microchanges": [{"o": 29, "t": "I", "v": "ame"}], "revision": "s2::23"}, {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "s2::23", "id": 3, "liveSession": "s2", "microchanges": [{"o": 32, "t": "I", "v": "di"}], "revision": "s2::24"}];
//
//  const locaChanges: Change[] = [{"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "microchanges": [{"t": "I", "o": 16, "v": "troi"}], "basedOn": "s2::21", "liveSession": "s1", "revision": "s1::7"}, {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "microchanges": [{"t": "I", "o": 20, "v": "s "}], "basedOn": "s1::7", "liveSession": "s1", "revision": "s1::8"}, {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "microchanges": [{"t": "I", "o": 22, "v": "qua"}], "basedOn": "s1::8", "liveSession": "s1", "revision": "s1::9"}, {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "microchanges": [{"t": "I", "o": 25, "v": "t"}], "basedOn": "s1::9", "liveSession": "s1", "revision": "s1::10"}, {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "microchanges": [{"t": "I", "o": 26, "v": "re "}], "basedOn": "s1::10", "liveSession": "s1", "revision": "s1::11"}, {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "microchanges": [{"t": "I", "o": 29, "v": "cun"}], "basedOn": "s1::11", "liveSession": "s1", "revision": "s1::12"}, {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "microchanges": [{"t": "I", "o": 32, "v": "q"}], "basedOn": "s1::12", "liveSession": "s1", "revision": "s1::13"}];
//
//  const changes = [...serverChanges, ...locaChanges];
//
//  const newValue = LiveHelper.process(initialValue, 's1::3', changes);
//
//  expect(newValue.value).toBe("ligne1: un deux trois quatre cunq\nligne2: ce samedi");
//});


test("TestWeekdays", () => {
  levels.trace = true;

  const initialValue = "ligne1: \nligne2: ";

  const revision = "ws-s1::17";

  const changes: Change[] = [
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::17", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 8, "t": "I", "v": "d"}], "revision": "ws-s1::18"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::18", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 9, "t": "I", "v": "'ac"}], "revision": "ws-s1::19"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::19", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 12, "t": "I", "v": "cord "}], "revision": "ws-s1::20"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::20", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 17, "t": "I", "v": "aklo"}], "revision": "ws-s1::21"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::21", "id": 3, "liveSession": "ws-s1", "microchanges": [{"l": 2, "o": 19, "t": "D"}], "revision": "ws-s1::22"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::22", "id": 3, "liveSession": "ws-s1", "microchanges": [{"l": 1, "o": 18, "t": "D"}], "revision": "ws-s1::23"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::23", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 27, "t": "I", "v": "c"}], "revision": "ws-s2::34"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::34", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 18, "t": "I", "v": "l"}], "revision": "ws-s1::24"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::24", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 29, "t": "I", "v": "'est"}], "revision": "ws-s2::35"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::24", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 19, "t": "I", "v": "ors "}], "revision": "ws-s1::25"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::25", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 23, "t": "I", "v": "j"}], "revision": "ws-s1::26"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::26", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 38, "t": "I", "v": " "}], "revision": "ws-s2::36"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::36", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 24, "t": "I", "v": "e "}], "revision": "ws-s1::27"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::27", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 26, "t": "I", "v": "pren"}], "revision": "ws-s1::28"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::28", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 30, "t": "I", "v": "ds la "}], "revision": "ws-s1::29"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::29", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 51, "t": "I", "v": "gen"}], "revision": "ws-s2::37"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::37", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 54, "t": "I", "v": "til"}], "revision": "ws-s2::38"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::38", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 36, "t": "I", "v": "lugn"}], "revision": "ws-s1::30"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::30", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 61, "t": "I", "v": "."}], "revision": "ws-s2::39"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::39", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 40, "t": "I", "v": "e "}], "revision": "ws-s1::31"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::31", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 64, "t": "I", "v": " "}], "revision": "ws-s2::40"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::40", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 65, "t": "I", "v": "j'a"}], "revision": "ws-s2::41"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::41", "id": 3, "liveSession": "ws-s1", "microchanges": [{"l": 2, "o": 40, "t": "D"}], "revision": "ws-s1::32"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::32", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 66, "t": "I", "v": "i"}], "revision": "ws-s2::42"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::42", "id": 3, "liveSession": "ws-s1", "microchanges": [{"l": 1, "o": 39, "t": "D"}], "revision": "ws-s1::33"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::33", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 66, "t": "I", "v": "me"}], "revision": "ws-s2::43"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::43", "id": 3, "liveSession": "ws-s1", "microchanges": [{"l": 2, "o": 37, "t": "D"}], "revision": "ws-s1::34"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::34", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 66, "t": "I", "v": " "}], "revision": "ws-s2::44"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::44", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 37, "t": "I", "v": "ui"}], "revision": "ws-s1::35"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::35", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 69, "t": "I", "v": "b"}], "revision": "ws-s2::45"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::45", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 70, "t": "I", "v": "ien "}], "revision": "ws-s2::46"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::46", "id": 3, "liveSession": "ws-s1", "microchanges": [{"l": 1, "o": 38, "t": "D"}], "revision": "ws-s1::36"},
  { "@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::36", "id": 3, "liveSession": "ws-s1", "microchanges": [{"l": 1, "o": 37, "t": "D"}, {"o": 38, "t": "I", "v": "ig"}], "revision": "ws-s1::37" },
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::36", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 73, "t": "I", "v": "auss"}], "revision": "ws-s2::47"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::47", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 39, "t": "I", "v": "ne"}], "revision": "ws-s1::38"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::38", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 80, "t": "I", "v": "i "}], "revision": "ws-s2::48"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::48", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 41, "t": "I", "v": " "}], "revision": "ws-s1::39"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::39", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 83, "t": "I", "v": "é"}], "revision": "ws-s2::49"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::49", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 42, "t": "I", "v": "num"}], "revision": "ws-s1::40"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::40", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 87, "t": "I", "v": "c"}], "revision": "ws-s2::50"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::50", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 45, "t": "I", "v": "é"}], "revision": "ws-s1::41"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::41", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 89, "t": "I", "v": "rir"}], "revision": "ws-s2::51"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::51", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 46, "t": "I", "v": "ro "}], "revision": "ws-s1::42"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::42", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 95, "t": "I", "v": "e "}], "revision": "ws-s2::52"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::52", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 49, "t": "I", "v": "u"}], "revision": "ws-s1::43"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::43", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 98, "t": "I", "v": "en "}], "revision": "ws-s2::53"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::53", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 50, "t": "I", "v": "n c"}], "revision": "ws-s1::44"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::44", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 53, "t": "I", "v": "ar "}], "revision": "ws-s1::45"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::44", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 104, "t": "I", "v": "des"}], "revision": "ws-s2::54"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::54", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 110, "t": "I", "v": "sous"}], "revision": "ws-s2::55"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::55", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 114, "t": "I", "v": ". "}], "revision": "ws-s2::56"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::56", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 116, "t": "I", "v": "C"}], "revision": "ws-s2::57"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::57", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 61, "t": "I", "v": " "}], "revision": "ws-s1::47"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::55", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 56, "t": "I", "v": "mince"}], "revision": "ws-s1::46"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::47", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 118, "t": "I", "v": "o"}], "revision": "ws-s2::58"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::58", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 62, "t": "I", "v": "tu"}], "revision": "ws-s1::48"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::48", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 126, "t": "I", "v": "mme "}], "revision": "ws-s2::59"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::59", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 64, "t": "I", "v": " me "}], "revision": "ws-s1::49"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::49", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 68, "t": "I", "v": "ra"}], "revision": "ws-s1::50"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::50", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 70, "t": "I", "v": "ttrap"}], "revision": "ws-s1::51"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::51", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 75, "t": "I", "v": "e"}], "revision": "ws-s1::52"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::52", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 76, "t": "I", "v": " "}], "revision": "ws-s1::53"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::53", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 77, "t": "I", "v": "je "}], "revision": "ws-s1::54"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::53", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 143, "t": "I", "v": "R"}], "revision": "ws-s2::60"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::60", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 80, "t": "I", "v": "ne "}], "revision": "ws-s1::55"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::55", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 83, "t": "I", "v": "suis "}], "revision": "ws-s1::56"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::56", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 88, "t": "I", "v": "pas d"}], "revision": "ws-s1::57"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::57", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 93, "t": "I", "v": "'ac"}], "revision": "ws-s1::58"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::58", "id": 3, "liveSession": "ws-s1", "microchanges": [{"o": 96, "t": "I", "v": "cord"}], "revision": "ws-s1::59"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s1::58", "id": 3, "liveSession": "ws-s2", "microchanges": [{"l": 1, "o": 162, "t": "D"}], "revision": "ws-s2::61"},
  {"@class": "Change", "atClass": "TextDataBlock", "atId": 3, "basedOn": "ws-s2::61", "id": 3, "liveSession": "ws-s2", "microchanges": [{"o": 166, "t": "I", "v": "je "}], "revision": "ws-s2::62"}];
  const newValue = LiveHelper.process(initialValue, revision, changes);

  expect(newValue.value).toBe("ligne1: un deux trois quatre cunq\nligne2: ce samedi");
});

