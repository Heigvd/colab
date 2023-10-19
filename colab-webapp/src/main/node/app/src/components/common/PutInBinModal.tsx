/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import Modal, { ModalProps } from './layout/Modal';
import useTranslations from '../../i18n/I18nContext';
import Flex from './layout/Flex';
import Button from './element/Button';
import { space_lg, space_sm } from '../../styling/style';
import { Link } from './element/Link';
import ShowOnClick from './layout/ShowOnClick';

interface PutInBinModalProps {
  title: ModalProps['title'];
  message: React.ReactNode;
  onClose: () => void;
  binPath: string;
}

export function PutInBinModal({
  title,
  message,
  onClose,
  binPath,
}: PutInBinModalProps): React.JSX.Element {
  const i18n = useTranslations();
  return (
    <Modal
      title={title}
      showCloseButton
      onClose={onClose}
      onPressEnterKey={onClose}
      size={'sm'}
      footer={onClose => (
        <Flex
          justify={'flex-end'}
          align="center"
          grow={1}
          className={css({ padding: space_lg, columnGap: space_sm })}
        >
          <Button kind="outline">
            <Link to={binPath}>{i18n.common.bin.action.seeBin}</Link>
          </Button>
          <Button onClick={() => onClose()}>{i18n.common.ok}</Button>
        </Flex>
      )}
    >
      {() => <Flex>{message}</Flex>}
    </Modal>
  );
}

type PutInBinShowOnClickModalProps = Omit<PutInBinModalProps, 'onClose' | 'children'> & {
  collapsedChildren: React.ReactNode;
  onCloseModal?: () => void;
};

export function PutInBinShowOnClickModal({
  collapsedChildren,
  onCloseModal,
  ...modalProps
}: PutInBinShowOnClickModalProps) {
  return (
    <ShowOnClick showCollapsedChildrenWhenOpened collapsedChildren={collapsedChildren}>
      {collapse => (
        <PutInBinModal
          {...modalProps}
          onClose={() => {
            if (onCloseModal != null) {
              onCloseModal();
            }
            collapse();
          }}
        />
      )}
    </ShowOnClick>
  );
}

export const globalLinkTarget = './bin'; // TODO link target

export const currentProjectLinkTarget = '../bin'; // TODO link target
