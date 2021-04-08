/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { useAppDispatch } from '../../store/hooks';
import { User } from 'colab-rest-client';
import { faSave } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { updateUser } from '../../API/api';

interface UserProfileProps {
  user: User;
}

export default ({ user }: UserProfileProps) => {
  const dispatch = useAppDispatch();

  if (user) {
    const [uUser, setUpdatedUser] = React.useState<User>({ ...user });

    return (
      <div>
        <h3>User Profile</h3>
        <div>
          <div>
            <span>username:</span>
            <span>{user.username} </span>
          </div>

          <div>
            <label>
              Common name:
              <input
                onChange={e => setUpdatedUser({ ...uUser, commonname: e.target.value })}
                value={uUser.commonname || ''}
              />
            </label>
          </div>

          <div>
            <label>
              {' '}
              First name:
              <input
                onChange={e => setUpdatedUser({ ...uUser, firstname: e.target.value })}
                value={uUser.firstname || ''}
              />
            </label>
          </div>

          <div>
            <label>
              Last name:
              <input
                onChange={e => setUpdatedUser({ ...uUser, lastname: e.target.value })}
                value={uUser.lastname || ''}
              />
            </label>
          </div>
        </div>

        <FontAwesomeIcon
          size="2x"
          icon={faSave}
          onClick={() => {
            dispatch(updateUser(uUser));
          }}
        />
      </div>
    );
  } else {
    return (
      <div>
        <i>No user selected</i>
      </div>
    );
  }
};
