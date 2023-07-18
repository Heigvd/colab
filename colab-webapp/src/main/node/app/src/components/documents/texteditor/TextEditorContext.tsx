/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';

// For now, there is no need to have isEmpty in the context
// because it is defined in the same place that it is used

/**
 * Context for a text editor
 */

interface TextEditorContext {
  /* isEmpty: boolean; */
  setIsEmpty: (isEmpty: boolean) => void;
}

const defaultContext: TextEditorContext = {
  /* isEmpty: false, */
  setIsEmpty: () => {},
};

export const TextEditorContext = React.createContext<TextEditorContext>(defaultContext);
