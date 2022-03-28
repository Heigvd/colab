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
import { errorColor, space_M } from '../styling/style';
import Button from './Button';
import Flex from './Flex';
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
        <Flex direction="column" align="stretch" grow={1}>
          <Flex grow={1} direction="column">
            <div>
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </div>
            {message}
          </Flex>
          <Flex justify="flex-end">
            <Button
              title={confirmButtonLabel ? confirmButtonLabel : 'Delete'}
              onClick={() => {
                onConfirm();
                collapse();
              }}
              invertedButton
              className={css({
                borderColor: errorColor,
                color: errorColor,
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
          </Flex>
        </Flex>
      )}
    </OpenCloseModal>
  );
}