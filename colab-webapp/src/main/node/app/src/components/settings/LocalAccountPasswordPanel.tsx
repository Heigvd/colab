/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { LocalAccount } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import logger from '../../logger';
import { useAppDispatch } from '../../store/hooks';
import { useCurrentUser } from '../../store/selectors/userSelector';
import { br_md, space_sm } from '../../styling/style';
import PasswordFeedbackDisplay from '../authentication/PasswordFeedbackDisplay';
import AccessDenied from '../common/element/AccessDenied';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import Button from '../common/element/Button';
import Form, { Field, PasswordScore } from '../common/element/Form';

interface FormDataType {
  password: string;
  passwordScore: PasswordScore;
}

const defaultFormData: FormDataType = {
  password: '',
  passwordScore: {
    score: 0,
    feedback: {
      warning: '',
      suggestions: [],
    },
  },
};

interface ChangePasswordPanelProps {
  account: LocalAccount;
}

export default function ChangePasswordPanel({ account }: ChangePasswordPanelProps) {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();

  const currentUser = useCurrentUser();
  const accountUserId = account.userId;

  const [state, setState] = React.useState<'SET' | 'CHANGE_PASSWORD' | 'CHANGED'>('SET');

  const fields: Field<FormDataType>[] = [
    {
      key: 'password',
      label: i18n.authentication.label.newPassword,
      placeholder: i18n.authentication.info.min7Char,
      type: 'password',
      isMandatory: true,
      autoComplete: 'new-password',
      isErroneous: data => data.passwordScore.score < 2,
      errorMessage: data => <PasswordFeedbackDisplay feedback={data.passwordScore.feedback} />,
      showStrengthBar: true,
      strengthProp: 'passwordScore',
    },
  ];

  const handleUpdatePassword = React.useCallback(
    ({
      email,
      password,
      passwordScore,
    }: {
      email: string;
      password: string;
      passwordScore: PasswordScore;
    }) => {
      dispatch(API.updateLocalAccountPassword({ email, password, passwordScore })).then(action => {
        if (action.meta.requestStatus === 'fulfilled') {
          setState('CHANGED');
        } else {
          logger.info('FAIL');
        }
      });
    },
    [dispatch],
  );

  if (currentUser.status === 'NOT_AUTHENTICATED') {
    return <AccessDenied />;
  }

  if (currentUser.status != 'AUTHENTICATED') {
    return <AvailabilityStatusIndicator status={currentUser.status} />;
  }

  if (
    currentUser.currentUser != null &&
    (currentUser.currentUser.admin || currentUser.currentUser.id === accountUserId)
  ) {
    return (
      <>
        {state === 'SET' ? (
          <Button
            kind="outline"
            className={css({ display: 'inline-block' })}
            onClick={() => {
              setState('CHANGE_PASSWORD');
            }}
          >
            {i18n.authentication.action.changePassword}
          </Button>
        ) : (
          <div
            className={css({
              backgroundColor: 'var(--hoverBgColor)',
              br_md,
            })}
          >
            {state === 'CHANGE_PASSWORD' ? (
              <Form
                fields={fields}
                value={defaultFormData}
                onSubmit={data => {
                  handleUpdatePassword({
                    email: account.email,
                    password: data.password,
                    passwordScore: data.passwordScore,
                  });
                }}
                submitLabel={i18n.common.save}
                buttonClassName={css({ whiteSpace: 'nowrap' })}
                childrenClassName={css({
                  flexDirection: 'row-reverse',
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
                className={css({ alignItems: 'flex-start', width: 'min-content' })}
              >
                <Button
                  onClick={() => {
                    setState('SET');
                  }}
                  kind="outline"
                  className={css({ marginRight: space_sm })}
                >
                  {i18n.common.cancel}
                </Button>
              </Form>
            ) : (
              <div>{i18n.authentication.info.passwordSuccessfullyChanged}</div>
            )}
          </div>
        )}
      </>
    );
  } else {
    return <AccessDenied />;
  }
}
