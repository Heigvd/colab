/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import {test} from '@jest/globals';
import {doTest, MdToHtmlTuple} from "../__utils__/utils";

test.each([
  {md: "Some \\_escaped character", html: "<p>Some <span></span>_escaped character</p>", message: '1st-level header'},
])("Markdown2html $message ->$md<- => ->$html<-", (data: MdToHtmlTuple) => {
  doTest(data);
});