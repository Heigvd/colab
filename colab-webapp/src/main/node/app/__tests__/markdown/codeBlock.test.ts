/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import {test} from '@jest/globals';

import {doTest} from "../__utils__/utils";

test("Markdown code block", () => {
  const md = "```js\nconst x = 'test';\n```";
  const expected = "<pre data-lang=\"js\">const x = 'test';</pre>";
  doTest({md: md, html: expected, message: '',});
});

test("Markdown code block", () => {
  const md = "Some paragraph\n```js\nconst x = 'test';\n```\nSomeOtherParagraph";
  const expected = "<p>Some paragraph</p><pre data-lang=\"js\">const x = 'test';</pre><p>SomeOtherParagraph</p>";
  doTest({md: md, html: expected, message: '',});
});