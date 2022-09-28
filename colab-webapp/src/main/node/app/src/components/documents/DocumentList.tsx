/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadDocuments } from '../../selectors/documentSelector';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import { lightText, space_M, space_S, textSmall } from '../styling/style';
import { DocumentOwnership } from './documentCommonType';
import DocumentEditor from './DocumentEditor';
import { BlockCreatorButtons } from './DocumentEditorToolbox';

export interface DocumentListProps {
  docOwnership: DocumentOwnership;
  readOnly?: boolean;
}

export default function DocumentList({ docOwnership, readOnly }: DocumentListProps): JSX.Element {
  const { documents, status } = useAndLoadDocuments(docOwnership);
  const i18n = useTranslations();

  if (status !== 'READY') {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <>
      {documents.length === 0 && !readOnly && (
        <div
          className={cx(
            textSmall,
            lightText,
            css({
              backgroundColor: 'var(--primaryColorContrastShade)',
              border: '1px solid var(--lightGray)',
              marginTop: space_M,
              padding: space_S,
            }),
          )}
        >
          {i18n.modules.card.infos.noBlockYet}
          <BlockCreatorButtons docOwnership={docOwnership} selectedBlockId={null} />
        </div>
      )}
      {documents
        .sort((a, b) => (a.index || 0) - (b.index || 0))
        .map(doc => (
          <DocumentEditor key={doc.id} doc={doc} readOnly={readOnly} docOwnership={docOwnership} />
        ))}
    </>
  );
}
