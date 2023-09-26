/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { test } from '@jest/globals';
import { doTest, MdToHtmlTuple } from '../__utils__/utils';

test.each([
  { md: '# Header 1', html: '<h1>Header 1</h1>', message: '1st-level header' },
  { md: '## Header 2', html: '<h2>Header 2</h2>', message: '2nd-level header' },
  { md: '### Header 3', html: '<h3>Header 3</h3>', message: '3rd-level header' },
  { md: '#### Header 4', html: '<h4>Header 4</h4>', message: '4th-level header' },
  { md: '##### Header 5', html: '<h5>Header 5</h5>', message: '5th-level header' },
])('Markdown2html $message ->$md<- => ->$html<-', (data: MdToHtmlTuple) => {
  doTest(data);
});
