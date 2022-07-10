/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { cx } from '@emotion/css';
import { faFileAlt } from '@fortawesome/free-regular-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Document } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import IconButton from '../common/element/IconButton';
import OpenClose from '../common/layout/OpenClose';
import Overlay from '../common/layout/Overlay';
import { defaultRowContainerStyle, iconStyle } from '../styling/style';
import { DocumentOwnership } from './documentCommonType';
import DocumentEditor from './DocumentEditor';

// not used anymore

export interface DocumentMiniDisplayProps {
  document: Document;
  docOwnership: DocumentOwnership;
}

export default function DocumentMiniDisplay({
  document,
  docOwnership,
}: DocumentMiniDisplayProps): JSX.Element {
  const i18n = useTranslations();
  return (
    <>
      <OpenClose
        collapsedChildren={
          <div className={defaultRowContainerStyle}>
            <FontAwesomeIcon icon={faFileAlt} className={cx(iconStyle)} />
          </div>
        }
      >
        {collapse => (
          <Overlay>
            {document.id && (
              <div>
                <DocumentEditor doc={document} allowEdition={false} docOwnership={docOwnership} />
              </div>
            )}
            <IconButton
              icon={faTimes}
              title={i18n.common.close}
              onClick={() => {
                collapse();
              }}
            />
          </Overlay>
        )}
      </OpenClose>
    </>
  );
}
