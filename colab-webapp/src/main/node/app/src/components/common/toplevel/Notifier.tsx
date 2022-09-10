/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import {
  faInfoCircle,
  faTimes,
  faWarning,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { entityIs, HttpErrorMessage, HttpException } from 'colab-rest-client';
import * as React from 'react';
import useTranslations, { ColabTranslations } from '../../../i18n/I18nContext';
import { shallowEqual, useAppDispatch, useAppSelector } from '../../../store/hooks';
import { closeNotification, ColabNotification } from '../../../store/notification';
import { space_M, space_S } from '../../styling/style';
import Flex from '../layout/Flex';

function prettyPrint(error: HttpException | Error | string, i18n: ColabTranslations): string {
  if (entityIs<'HttpErrorMessage'>(error, 'HttpErrorMessage')) {
    return translateHttpErrorMessage(error.messageCode, error.messageI18nKey, i18n);
  } else if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  } else {
    return error;
  }
}

function translateHttpErrorMessage(
  code: HttpErrorMessage['messageCode'],
  i18nKey: HttpErrorMessage['messageI18nKey'],
  i18n: ColabTranslations,
): string {
  if (i18nKey != null) {
    return i18n.keyFromServer(i18nKey);
  }

  switch (code) {
    case 'AUTHENTICATION_FAILED':
      return i18n.httpErrorMessage.AUTHENTICATION_FAILED;
    case 'AUTHENTICATION_REQUIRED':
      return i18n.httpErrorMessage.AUTHENTICATION_REQUIRED;
    case 'ACCESS_DENIED':
      return i18n.httpErrorMessage.ACCESS_DENIED;
    case 'NOT_FOUND':
      return i18n.httpErrorMessage.NOT_FOUND;
    case 'SMTP_ERROR':
      return i18n.httpErrorMessage.SMTP_ERROR;
    case 'EMAIL_MESSAGE_ERROR':
      return i18n.httpErrorMessage.EMAIL_MESSAGE_ERROR;
    case 'TOO_MANY_ATTEMPTS':
      return i18n.httpErrorMessage.TOO_MANY_ATTEMPTS;
    case 'BAD_REQUEST':
    default:
      return i18n.httpErrorMessage.BAD_REQUEST;
  }
}

function getBgColor(notification: ColabNotification): string {
  switch (notification.type) {
    case 'INFO':
      return 'var(--successColor)';
    case 'WARN':
      return 'var(--warningColor)';
    case 'ERROR':
    default:
      return 'var(--errorColor)';
  }
}

function getTitle(notification: ColabNotification, i18n: ColabTranslations): React.ReactNode {
  switch (notification.type) {
    case 'INFO':
      return <>{i18n.activity.notifications.information}</>;
    case 'WARN':
      return <>{i18n.activity.notifications.warning}</>;
    case 'ERROR':
    default:
      return <>{i18n.activity.notifications.error}</>;
  }
}

function getIcon(notification: ColabNotification): IconDefinition {
  switch (notification.type) {
    case 'INFO':
      return faInfoCircle;
    case 'WARN':
      return faWarning;
    case 'ERROR':
    default:
      return faTimes;
  }
}

interface NotificationProps {
  notification: ColabNotification;
  index: number;
}

function Notification({ notification, index }: NotificationProps) {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const closeCb = React.useCallback(() => {
    dispatch(closeNotification(index));
  }, [index, dispatch]);

  React.useEffect(() => {
    let abort = false;
    globalThis.setTimeout(() => {
      if (!abort) {
        closeCb();
      }
    }, 10000);
    return () => {
      abort = true;
    };
  }, [closeCb]);

  return (
    <Flex
      className={css({
        backgroundColor: 'white',
        borderRadius: '5px',
        overflow: 'hidden',
        margin: space_S,
        minWidth: '30vw',
        maxWidth: '70vw',
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)',
        ':hover': {
          boxShadow: '0 3px 6px rgba(0,0,0,.16)',
          cursor: 'pointer',
        },
      })}
      onClick={() => closeCb()}
      align={'stretch'}
    >
      <Flex
        justify="center"
        align="center"
        className={css({
          backgroundColor: getBgColor(notification),
          color: 'white',
          padding: space_M,
        })}
      >
        <FontAwesomeIcon icon={getIcon(notification)} size={'2x'} />
      </Flex>
      <div className={css({ padding: space_M })}>
        <h3>{getTitle(notification, i18n)}</h3>
        {prettyPrint(notification.message, i18n)}
      </div>
    </Flex>
  );
}

export default function Notifier(): JSX.Element {
  const notifications = useAppSelector(state => state.notifications, shallowEqual);

  return (
    <div
      className={css({
        position: 'fixed',
        zIndex: 999,
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      })}
    >
      {notifications.map(
        (notification, index) =>
          notification.status === 'OPEN' && (
            <Notification key={index} notification={notification} index={index} />
          ),
      )}
    </div>
  );
}
