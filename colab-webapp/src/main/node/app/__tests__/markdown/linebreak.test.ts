/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { test } from '@jest/globals';
import { doTest, MdToHtmlTuple } from '../__utils__/utils';

test.each([
  { md: '# Header\n TwoLine', html: '<h1>Header<br>TwoLine</h1>', message: '1st-level header' },
  {
    md: '# Header\n     TwoLine',
    expectedMd: '# Header\n TwoLine',
    html: '<h1>Header<br>TwoLine</h1>',
    message: '1st-level header',
  },
])('Markdown2html $message ->$md<- => ->$html<-', (data: MdToHtmlTuple) => {
  doTest(data);
});
