/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { space_lg } from '../../styling/style';
import Button from '../element/Button';
import Flex from './Flex';
import Modal from './Modal';
import OpenCloseModal from './OpenCloseModal';

interface ConfirmDeleteProps {
  message: string | React.ReactNode;
  onCancel: () => void;
  cancelButtonLabel?: string;
  onConfirm: () => void;
  confirmButtonLabel?: string;
  isConfirmButtonLoading?: boolean;
}

export function ConfirmDelete({
  onCancel,
  cancelButtonLabel,
  onConfirm,
  confirmButtonLabel,
  message,
  isConfirmButtonLoading,
}: ConfirmDeleteProps): JSX.Element {
  const i18n = useTranslations();

  const mainButtonRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    mainButtonRef.current?.focus();
  }, []);

  return (
    <Flex direction="column" align="stretch" grow={1}>
      {message}
      <Flex justify="flex-end">
        <Button onClick={() => onCancel()} variant="outline">
          {cancelButtonLabel ? cancelButtonLabel : i18n.common.cancel}
        </Button>
        <Button
          ref={mainButtonRef}
          title={confirmButtonLabel ? confirmButtonLabel : i18n.common.delete}
          onClick={onConfirm}
          className={css({
            backgroundColor: 'var(--error-main)',
            marginLeft: space_lg,
          })}
          isLoading={isConfirmButtonLoading}
        >
          {confirmButtonLabel ? confirmButtonLabel : i18n.common.delete}
        </Button>
      </Flex>
    </Flex>
  );
}

interface ConfirmDeleteModalProps extends ConfirmDeleteProps {
  title?: string;
}

export function ConfirmDeleteModal({ title, onCancel, ...restProps }: ConfirmDeleteModalProps) {
  const onClose = React.useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <Modal title={title} onClose={onClose}>
      {collapse => <ConfirmDelete {...restProps} onCancel={collapse} />}
    </Modal>
  );
}

interface ConfirmDeleteOpenCloseModalProps {
  buttonLabel: React.ReactNode;
  confirmButtonLabel?: string;
  cancelButtonLabel?: string;
  message: string | React.ReactNode;
  onConfirm: () => void;
  title?: string;
  className?: string;
  isConfirmButtonLoading?: boolean;
}

export default function ConfirmDeleteOpenCloseModal({
  buttonLabel,
  confirmButtonLabel,
  cancelButtonLabel,
  message,
  onConfirm,
  title,
  className,
  isConfirmButtonLoading,
}: ConfirmDeleteOpenCloseModalProps): JSX.Element {
  const onInternalConfirm = React.useCallback(
    (close: () => void) => {
      onConfirm();
      close();
    },
    [onConfirm],
  );

  return (
    <OpenCloseModal
      title={title ? title : ''}
      collapsedChildren={<>{buttonLabel}</>}
      className={cx(css({ '&:hover': { textDecoration: 'none' } }), className)}
    >
      {closeModal => (
        <ConfirmDelete
          message={message}
          cancelButtonLabel={cancelButtonLabel}
          onCancel={closeModal}
          onConfirm={() => onInternalConfirm(closeModal)}
          confirmButtonLabel={confirmButtonLabel}
          isConfirmButtonLoading={isConfirmButtonLoading}
        />
      )}
    </OpenCloseModal>
  );
}
