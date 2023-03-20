/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
export function isHTMLElement(x: unknown): x is HTMLElement {
  return x instanceof HTMLElement;
}
