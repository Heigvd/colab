/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import PasswordStrengthBar from 'react-password-strength-bar';
import { updateLocalAccountPassword } from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import PasswordFeedbackDisplay from '../authentication/PasswordFeedbackDisplay';
import Button from '../common/element/Button';
import { PasswordScore } from '../common/element/Form';
import IconButton from '../common/element/IconButton';
import { space_sm } from '../styling/style';

export interface LocalAccountProps {
  accountId: number;
}

export default function LocalAccount(props: LocalAccountProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const [pwState, setPwState] = React.useState<'SET' | 'CHANGE_PASSWORD'>('SET');
  const [newPassword, setNewPassword] = React.useState('');

  const [score, setScore] = React.useState<PasswordScore>({
    score: 0,
    feedback: { warning: '', suggestions: [] },
  });

  const account = useAppSelector(state => state.users.accounts[props.accountId]);

  if (account) {
    return (
      <div>
        <h3>{i18n.user.account}</h3>
        <div>
          <span>{account.email} </span>
        </div>
        <div>
          {pwState === 'SET' ? (
            <Button
              invertedButton
              className={css({ display: 'block', marginTop: space_sm })}
              onClick={() => {
                setPwState('CHANGE_PASSWORD');
              }}
            >
              {i18n.authentication.action.changePassword}
            </Button>
          ) : (
            <div>
              <label>
                {i18n.authentication.action.newPassword}:
                <input
                  type="password"
                  autoComplete="new-password"
                  onChange={e => setNewPassword(e.target.value)}
                  value={newPassword}
                />
                {score != null ? <PasswordFeedbackDisplay feedback={score.feedback} /> : null}
                <PasswordStrengthBar
                  password={newPassword}
                  onChangeScore={(score, feedback) => {
                    setScore({
                      score: score as unknown as PasswordScore['score'],
                      feedback: feedback,
                    });
                  }}
                />
              </label>

              <IconButton
                icon={'close'}
                title={i18n.common.close}
                onClick={() => {
                  setPwState('SET');
                  setNewPassword('');
                }}
              />

              <IconButton
                icon={'save'}
                onClick={() => {
                  dispatch(
                    updateLocalAccountPassword({
                      email: account.email,
                      password: newPassword,
                      passwordScore: score,
                    }),
                  );
                }}
                title={i18n.common.save}
              />
            </div>
          )}
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <i>{i18n.authentication.error.mustBeAuthenticated}</i>
      </div>
    );
  }
}
