/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import { space_lg } from '../../../styling/style';
import Modal, { ModalProps } from './Modal';
import ShowOnClick from './ShowOnClick';

type OpenModalOnClickProps = Omit<ModalProps, 'onClose'> & {
  className?: string;
  collapsedChildren: React.ReactNode;
  status?: 'COLLAPSED' | 'EXPANDED';
};

export const defaultIconClassName = css({
  width: '28px',
  display: 'inline-block',
  textAlign: 'center',
});

export const modalPadding = space_lg;

export default function OpenModalOnClick({
  title,
  showCloseButton = false,
  onPressEnterKey,
  size,
  modalBodyClassName,
  footer,
  children,
  className,
  collapsedChildren,
  status = 'COLLAPSED',
}: OpenModalOnClickProps): JSX.Element {
  return (
    <ShowOnClick
      status={status}
      showCollapsedChildrenWhenOpened
      collapsedChildren={collapsedChildren}
      className={className}
    >
      {onClose => (
        <Modal
          title={title}
          showCloseButton={showCloseButton}
          onClose={onClose}
          onPressEnterKey={onPressEnterKey}
          size={size}
          modalBodyClassName={modalBodyClassName}
          footer={footer}
        >
          {onCloseModal => children(onCloseModal)}
        </Modal>
      )}
    </ShowOnClick>
  );
}
