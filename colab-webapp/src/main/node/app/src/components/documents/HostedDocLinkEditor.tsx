/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { HostedDocLink } from 'colab-rest-client';
import * as React from 'react';

export interface HostedDocLinkProps {
  document: HostedDocLink;
  allowEdition?: boolean;
}

export function HostedDocLinkEditor({ document }: HostedDocLinkProps): JSX.Element {
  return (
    <div>
      <FontAwesomeIcon icon={faDownload} />
      {document.filePath}
    </div>
  );
}
