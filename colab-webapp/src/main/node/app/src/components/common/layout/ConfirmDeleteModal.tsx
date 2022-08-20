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
import useTranslations from '../../../i18n/I18nContext';
import { errorColor, space_M } from '../../styling/style';
import Button from '../element/Button';
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
  const mainButtonRef = React.useRef<HTMLSpanElement>(null);
  React.useEffect(() => {
    mainButtonRef.current?.focus();
  }, []);

  const i18n = useTranslations();

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
            <Button onClick={() => collapse()} invertedButton>
              {cancelButtonLabel ? cancelButtonLabel : i18n.common.cancel}
            </Button>
            <Button
              ref={mainButtonRef}
              onClick={() => {
                onConfirm();
                collapse();
              }}
              className={css({
                backgroundColor: errorColor,
                marginLeft: space_M,
              })}
            >
              {confirmButtonLabel ? confirmButtonLabel : 'Delete'}
            </Button>
          </Flex>
        </Flex>
      )}
    </OpenCloseModal>
  );
}
