/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import logger from '../../logger';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { br_md, space_md, space_sm, space_xl } from '../../styling/style';
import PasswordFeedbackDisplay from '../authentication/PasswordFeedbackDisplay';
import Button from '../common/element/Button';
import Form, { Field, PasswordScore } from '../common/element/Form';
import Flex from '../common/layout/Flex';

export interface LocalAccountProps {
  accountId: number;
}

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

export default function LocalAccount(props: LocalAccountProps): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();

  const account = useAppSelector(state => state.users.accounts[props.accountId]);

  const [pwState, setPwState] = React.useState<'SET' | 'CHANGE_PASSWORD' | 'CHANGED'>('SET');

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
          setPwState('CHANGED');
        } else {
          logger.info('FAIL');
        }
      });
    },
    [dispatch],
  );

  if (account) {
    return (
      <Flex direction="column" gap={space_md}>
        <h3>{i18n.authentication.label.account}</h3>
        <div>
          <span>{account.email} </span>
        </div>
        <div>
          {pwState === 'SET' ? (
            <Button
              kind="outline"
              className={css({ display: 'inline-block' })}
              onClick={() => {
                setPwState('CHANGE_PASSWORD');
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
              {pwState === 'CHANGE_PASSWORD' ? (
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
                      setPwState('SET');
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
        </div>
      </Flex>
    );
  } else {
    return (
      <div className={css({ padding: space_xl })}>
        <i>{i18n.common.error.sorryError}</i>
      </div>
    );
  }
}
