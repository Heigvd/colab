/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import {test} from '@jest/globals';
import {doTest, MdToHtmlTuple} from "../__utils__/utils";

test.each([
  {
    md: "- Item 1\n- Item 2\n- Item 3",
    html: "<ul><li data-list-type=\"UL\">Item 1</li><li data-list-type=\"UL\">Item 2</li><li data-list-type=\"UL\">Item 3</li></ul>",
    message: 'one-level UL'
  },
  {md: "- Item 1\n  - Item 1.1\n  - Item 1.2", html: "<ul><li data-list-type=\"UL\">Item 1<ul><li data-list-type=\"UL\">Item 1.1</li><li data-list-type=\"UL\">Item 1.2</li></ul></li></ul>", message: 'two levels UL'},
  {md: "- Item 1\n  - Item 1.1\n    - Item 1.1.1", html: "<ul><li data-list-type=\"UL\">Item 1<ul><li data-list-type=\"UL\">Item 1.1<ul><li data-list-type=\"UL\">Item 1.1.1</li></ul></li></ul></li></ul>", message: 'three levels UL'},
  {md: "- Item 1\n  - Item 1.1\n    - Item 1.1.1\n  - Item 1.2", html: "<ul><li data-list-type=\"UL\">Item 1<ul><li data-list-type=\"UL\">Item 1.1<ul><li data-list-type=\"UL\">Item 1.1.1</li></ul></li><li data-list-type=\"UL\">Item 1.2</li></ul></li></ul>", message: 'three levels UL'},
])("Markdown2html $message ->$md<- => ->$html<-", (data: MdToHtmlTuple) => {
  doTest(data);
});

test.each([
  {md: "- Item 1\n- [ ] Item 2\n- Item 3", html: "<ul><li data-list-type=\"UL\">Item 1</li><li data-list-type=\"TL\" data-checked=\"TODO\">Item 2</li><li data-list-type=\"UL\">Item 3</li></ul>", message: 'one-level UL'},
])("Markdown2html $message ->$md<- => ->$html<-", (data: MdToHtmlTuple) => {
  doTest(data);
});
