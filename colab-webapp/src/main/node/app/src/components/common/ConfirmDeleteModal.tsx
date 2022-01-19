/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { errorColor, flex, space_M } from '../styling/style';
import Button from './Button';
import OpenCloseModal from './OpenCloseModal';

interface ConfirmDeleteModalProps {
  buttonLabel: React.ReactNode;
  confirmButtonLabel?: string;
  cancelButtonLabel?: string;
  message: string | React.ReactNode;
  onConfirm: () => void;
  title?: string;
  className?: string;
}

export default function ConfirmDeleteModal({
  buttonLabel,
  confirmButtonLabel,
  cancelButtonLabel,
  message,
  onConfirm,
  title,
  className,
}: ConfirmDeleteModalProps): JSX.Element {
  return (
    <OpenCloseModal
      title={title ? title : ''}
      collapsedChildren={<>{buttonLabel}</>}
      className={cx(css({ '&:hover': { textDecoration: 'none' } }), className)}
    >
      {collapse => (
        <div>
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <FontAwesomeIcon icon={faExclamationTriangle} />
          {message}
          <div className={flex}>
            <Button
              title={confirmButtonLabel ? confirmButtonLabel : 'Delete'}
              onClick={() => {
                onConfirm();
                collapse();
              }}
              className={css({
                backgroundColor: errorColor,
                marginRight: space_M,
              })}
            >
              {confirmButtonLabel ? confirmButtonLabel : 'Delete'}
            </Button>
            <Button
              title={cancelButtonLabel ? cancelButtonLabel : 'Cancel delete'}
              onClick={() => collapse()}
            >
              {cancelButtonLabel ? cancelButtonLabel : 'Cancel'}
            </Button>
          </div>
        </div>
      )}
    </OpenCloseModal>
  );
}
