/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import { updateLocalAccountPassword } from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import logger from '../../logger';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import PasswordFeedbackDisplay from '../authentication/PasswordFeedbackDisplay';
import Button from '../common/element/Button';
import Form, { Field, PasswordScore } from '../common/Form/Form';
import { borderRadius, space_M, space_S } from '../styling/style';

export interface LocalAccountProps {
  accountId: number;
}

interface Psw {
  password: string;
  passwordScore: PasswordScore;
}

const defaultPsw: Psw = {
  password: '',
  passwordScore: {
    score: 0,
    feedback: {
      warning: '',
      suggestions: [],
    },
  },
};

export default function LocalAccount(props: LocalAccountProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const [pwState, setPwState] = React.useState<'SET' | 'CHANGE_PASSWORD' | 'CHANGED'>('SET');

  const account = useAppSelector(state => state.users.accounts[props.accountId]);
  const fields: Field<Psw>[] = [
    {
      key: 'password',
      label: 'New password',
      type: 'password',
      isMandatory: true,
      isErroneous: data => data.passwordScore.score < 2,
      errorMessage: data => <PasswordFeedbackDisplay feedback={data.passwordScore.feedback} />,
      showStrengthBar: true,
      strengthProp: 'passwordScore',
    },
  ];
  const handleUpdatePsw = async (pswData: {
    email: string;
    password: string;
    passwordScore: PasswordScore;
  }) => {
    const resultAction = await dispatch(updateLocalAccountPassword(pswData));
    if (updateLocalAccountPassword.fulfilled.match(resultAction)) {
      setPwState('CHANGED');
    } else {
      logger.info('FAIL');
    }
  };
  if (account) {
    return (
      <div>
        <h3>Account</h3>
        <div>
          <span>{account.email} </span>
        </div>
        <div>
          {pwState === 'SET' ? (
            <Button
              invertedButton
              className={css({ display: 'inline-block', marginTop: space_M })}
              onClick={() => {
                setPwState('CHANGE_PASSWORD');
              }}
            >
              Change password
            </Button>
          ) : (
            <div
              className={css({
                padding: space_M,
                backgroundColor: 'var(--hoverBgColor)',
                marginTop: space_M,
                borderRadius: borderRadius,
              })}
            >
              {pwState === 'CHANGE_PASSWORD' ? (
                <Form
                  fields={fields}
                  value={defaultPsw}
                  onSubmit={data => {
                    handleUpdatePsw({
                      email: account.email,
                      password: data.password,
                      passwordScore: data.passwordScore,
                    });
                  }}
                  submitLabel={'Save new password'}
                  buttonClassName={css({ whiteSpace: 'nowrap' })}
                  childrenClassName={css({
                    flexDirection: 'row-reverse',
                    alignItems: 'center',
                    justifyContent: 'center',
                  })}
                  className={css({ alignItems: 'flex-start', width: 'min-content'})}
                >
                  <Button
                    onClick={() => {
                      setPwState('SET');
                    }}
                    invertedButton
                    className={css({ marginRight: space_S })}
                  >
                    {i18n.common.cancel}
                  </Button>
                </Form>
              ) : (
                <>
                  <div>Password successfully changed!</div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <i>You must be authenticated</i>
      </div>
    );
  }
}
