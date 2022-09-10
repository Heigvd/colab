/*
 * The coLAB project
 * Copyright (C) 2022 maxence
 *
 * Licensed under the MIT License
 */

import { test } from '@jest/globals';
import { doTest, MdToHtmlTuple } from '../__utils__/utils';

test.each([
  {
    md: 'Please [follow](http://perdu.com) the link',
    html: '<p>Please <span data-type="link" data-link-href="http://perdu.com">follow</span> the link</p>',
    message: 'some link with url and label',
  },
])('Markdown2html $message ->$md<- => ->$html<-', (data: MdToHtmlTuple) => {
  doTest(data);
});
