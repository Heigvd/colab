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

interface PutInTrashModalProps {
  title: ModalProps['title'];
  message: React.ReactNode;
  onClose: () => void;
  trashPath: string;
}

export function PutInTrashModal({
  title,
  message,
  onClose,
  trashPath,
}: PutInTrashModalProps): React.JSX.Element {
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
            <Link to={trashPath}>{i18n.common.trash.seeTrash}</Link>
          </Button>
          <Button onClick={() => onClose()}>{i18n.common.trash.ok}</Button>
        </Flex>
      )}
    >
      {() => <Flex>{message}</Flex>}
    </Modal>
  );
}

export function getGlobalLinkTarget(): string {
  return '.'; // TODO link target
}

// TODO link target
export function getCurrentProjectLinkTarget(): string {
  return '.'; // TODO link target
}
