/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { entityIs, HttpErrorMessage, HttpException } from 'colab-rest-client';
import * as React from 'react';
import useTranslations, { ColabTranslations } from '../../i18n/I18nContext';
import { shallowEqual, useAppDispatch, useAppSelector } from '../../store/hooks';
import { closeNotification, ColabNotification } from '../../store/notification';

function prettyPrint(error: HttpException | string, i18n: ColabTranslations): string {
  if (entityIs<'HttpErrorMessage'>(error, 'HttpErrorMessage')) {
    return translateErrorCode(error.messageCode, i18n);
  } else {
    return error;
  }
}

function translateErrorCode(
  code: HttpErrorMessage['messageCode'],
  i18n: ColabTranslations,
): string {
  switch (code) {
    case 'AUTHENTICATION_FAILED':
      return i18n.errors.AUTHENTICATION_FAILED;
    case 'AUTHENTICATION_REQUIRED':
      return i18n.errors.AUTHENTICATION_REQUIRED;
    case 'ACCESS_DENIED':
      return i18n.errors.ACCESS_DENIED;
    case 'NOT_FOUND':
      return i18n.errors.NOT_FOUND;
    case 'IDENTIFIER_ALREADY_TAKEN':
      return i18n.errors.IDENTIFIER_ALREADY_TAKEN;
    case 'EMAIL_ADDRESS_INVALID':
      return i18n.errors.EMAIL_ADDRESS_INVALID;
    case 'SMTP_ERROR':
      return i18n.errors.SMTP_ERROR;
    case 'EMAIL_MESSAGE_ERROR':
      return i18n.errors.EMAIL_MESSAGE_ERROR;
    case 'TOO_MANY_REQUESTS':
      return i18n.errors.TOO_MANY_REQUEST;
    case 'BAD_REQUEST':
    default:
      return i18n.errors.BAD_REQUEST;
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

interface NotifProps {
  notification: ColabNotification;
  index: number;
}

function Notification({ notification, index }: NotifProps) {
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
    <div
      className={css({
        backgroundColor: getBgColor(notification),
        borderRadius: '5px',
        color: 'white',
        padding: '10px 100px',
        margin: '10px',
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)',
        fontSize: '1.3em',
        fontWeight: 300,
        ':hover': {
          boxShadow: '0 3px 6px rgba(0,0,0,.16)',
        },
      })}
      onClick={() => closeCb()}
    >
      {prettyPrint(notification.message, i18n)}
    </div>
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
