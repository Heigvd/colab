/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */


import {expect} from '@jest/globals';

import markdownToDom from "../../src/components/blocks/markdown/parser/markdownToDom";
import domToMarkdown from "../../src/components/blocks/markdown/parser/domToMarkdown";
//
//test("Markdown", () => {
//
//  const md =
//`Super
//Hello
//# Title1
//- Item
//  Item continued
//1. item`;
//
//  console.log("Result: ", markdownToHtml(md));
//});

export function doTest(data: MdToHtmlTuple) {
  const mdAndOffsets = markdownToDom(data.md);

  const div = document.createElement("div");
  mdAndOffsets.nodes.forEach(node => div.append(node));
  const html = div.innerHTML;
//  const html = tree.map(child => {
//    if (child.root.node instanceof Element) {
//      return child.root.node.outerHTML;
//    } else {
//      return child.root.node.textContent;
//    }
//  }).join("")

//  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
//  console.log(`>${data.md}<`)
//  Object.entries(mdAndOffsets.offsets).forEach(([offset, nodes]) => {
//    console.log(`${offset} => ${nodes}`)
//  });

//  console.log("*********************************************************************************");
//  console.log("HTML: ", html);

  expect(html).toBe(data.html);

  const reMd = domToMarkdown(div);
//  console.log("Markdown: ", reMd.data);

//  console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
  expect(reMd.data).toBe(data.expectedMd || data.md);
}

export interface MdToHtmlTuple {
  md: string;
  // if undefined, expected === md
  expectedMd?: string;
  html: string;
  message: string;
}