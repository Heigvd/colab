/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import {useAppSelector, useAppDispatch} from '../../store/hooks';
import {faSave} from '@fortawesome/free-regular-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PasswordStrengthBar from 'react-password-strength-bar';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {updateLocalAccountPassword} from '../../API/api';

export interface Props {
  accountId: number;
};

export default (props: Props) => {
  const dispatch = useAppDispatch();
  const [pwState, setPwState] = React.useState<'SET' | 'CHANGE_PASSWORD'>('SET');
  const [newPassword, setNewPassword] = React.useState('');

  const account = useAppSelector(state =>
    state.users.accounts[props.accountId]
  );

  if (account) {
    return (
      <div>
        <h3>Edit account</h3>
        <div>
          <div>
            <span>email:</span>
            <span>{account.email} </span>
          </div>
          <FontAwesomeIcon
            size="2x"
            icon={faSave}
            onClick={() => {
            }}
          />
        </div>
        <div>
          {pwState === 'SET' ?
            <span onClick={() => {setPwState('CHANGE_PASSWORD')}}>
              Change password
          </span>
            : <div>
              <label>New password:
                <input
                  type='password'
                  autoComplete='new-password'
                  onChange={e => setNewPassword(e.target.value)}
                  value={newPassword}
                />
                <PasswordStrengthBar
                  password={newPassword}
                />
              </label>

              <FontAwesomeIcon
                size="2x"
                icon={faTimes}
                onClick={() => {
                  setPwState('SET');
                  setNewPassword('');
                }}
              />

              <FontAwesomeIcon
                size="2x"
                icon={faSave}
                onClick={() => {
                  dispatch(updateLocalAccountPassword({email: account.email, password: newPassword}));
                }}
              />

            </div>
          }
        </div>
      </div >
    );
  } else {
    return (
      <div>
        <i>You must be authenticated</i>
      </div>
    );
  }
};

