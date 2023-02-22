/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadDocuments } from '../../selectors/documentSelector';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import { lightTextStyle, space_lg, space_sm, text_sm } from '../styling/style';
import { DocumentOwnership } from './documentCommonType';
import DocumentEditor from './DocumentEditor';

export interface DocumentListProps {
  docOwnership: DocumentOwnership;
  readOnly?: boolean;
}

export default function DocumentList({ docOwnership, readOnly }: DocumentListProps): JSX.Element {
  const i18n = useTranslations();

  const { documents, status } = useAndLoadDocuments(docOwnership);

  if (status !== 'READY') {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <>
      {documents.length === 0 && !readOnly && (
        <div
          className={cx(
            text_sm,
            lightTextStyle,
            css({
              fontStyle: 'italic',
              marginTop: space_lg,
              padding: space_sm,
            }),
          )}
        >
          {i18n.modules.card.infos.noBlockYet}
          {/* <BlockCreatorButtons selectedBlockId={null} /> */}
        </div>
      )}
      {documents
        .sort((a, b) => (a.index || 0) - (b.index || 0))
        .map(doc => (
          <DocumentEditor key={doc.id} doc={doc} readOnly={readOnly} />
        ))}
    </>
  );
}
