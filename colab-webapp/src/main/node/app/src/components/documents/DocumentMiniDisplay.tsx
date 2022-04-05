/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { cx } from '@emotion/css';
import { faFileAlt } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Document } from 'colab-rest-client';
import * as React from 'react';
import IconButton from '../common/IconButton';
import OpenClose from '../common/OpenClose';
import Overlay from '../common/Overlay';
import { closeIcon } from '../styling/defaultIcons';
import { defaultRowContainerStyle, iconStyle } from '../styling/style';
import DocumentEditor from './DocumentEditor';

export interface DocumentMiniDisplayProps {
  document: Document;
}

export default function DocumentMiniDisplay({ document }: DocumentMiniDisplayProps): JSX.Element {
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
                <DocumentEditor doc={document} allowEdition={true} />
              </div>
            )}
            <IconButton
              icon={closeIcon}
              title="close"
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
