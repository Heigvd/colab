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
    md: "A paragraph with **bold**, /italic/, _underlined_ and ~strikethrough~ parts",
    html: "<p>A paragraph with <strong>bold</strong>, <em>italic</em>, <u>underlined</u> and <strike>strikethrough</strike> parts</p>",
    message: 'styled paragraph'
  },
  {
    md: 'some **bold with nested /italic/ inside**',
    html: '<p>some <strong>bold with nested <em>italic</em> inside</strong></p>',
    message: 'nested italic'
  },
  {
    md: 'some **bold with nested /it_a_lic/ inside**',
    html: '<p>some <strong>bold with nested <em>it<u>a</u>lic</em> inside</strong></p>',
    message: 'nested italic partially underlined'
  },
  {
    md: 'some data with /consecutive /~tags~',
    html: '<p>some data with <em>consecutive </em><strike>tags</strike></p>',
    message: ''
  }


])("Markdown2html $message ->$md<- => ->$html<-", (data: MdToHtmlTuple) => {
  doTest(data);
});

