/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ExternalDocLink } from 'colab-rest-client';
import * as React from 'react';

export interface ExternalDocLinkProps {
  document: ExternalDocLink;
  allowEdition?: boolean;
}

export function ExternalDocLinkEditor({ document }: ExternalDocLinkProps): JSX.Element {
  return (
    <div>
      <a href={document.url || undefined} target="_blank" rel="noreferrer">
        <FontAwesomeIcon icon={faExternalLinkAlt} />
        {document.url}
      </a>
      <i>ExternalDocLink not yet implemented (url thumbnail, url editor)</i>{' '}
    </div>
  );
}
