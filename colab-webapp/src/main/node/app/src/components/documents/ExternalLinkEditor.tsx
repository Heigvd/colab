/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ExternalLink } from 'colab-rest-client';
import * as React from 'react';

export interface ExternalLinkProps {
  document: ExternalLink;
  allowEdition?: boolean;
}

export function ExternalLinkEditor({ document }: ExternalLinkProps): JSX.Element {
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
