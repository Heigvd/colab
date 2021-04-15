/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { useAppSelector, useAppDispatch, useCurrentUser } from '../../store/hooks';
import { getAllUsers, grantAdminRight, revokeAdminRight } from '../../API/api';
import InlineLoading from '../common/InlineLoading';
import { css } from '@emotion/css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faTimes,
  faCheck,
  faSortAlphaUp,
  faSortAlphaDown,
} from '@fortawesome/free-solid-svg-icons';
import { User } from 'colab-rest-client';
import { buttonStyle } from '../styling/style';

const UserComp = ({ user }: { user: User }) => {
  const dispatch = useAppDispatch();
  const currentUser = useCurrentUser()!;

  return (
    <div className={css({ display: 'contents' })}>
      <div>
        {user.username} {user.id === currentUser.id ? ' (you) ' : null}
      </div>
      <div>{user.firstname}</div>
      <div>{user.lastname}</div>
      <div>{user.commonname}</div>
      <div>
        <FontAwesomeIcon
          className={buttonStyle}
          icon={user.admin ? faCheck : faTimes}
          onClick={() => {
            dispatch(user.admin ? revokeAdminRight(user) : grantAdminRight(user));
          }}
        />
      </div>
      <div>
        <span>action....</span>
      </div>
    </div>
  );
};

export default () => {
  const dispatch = useAppDispatch();

  const status = useAppSelector(state => state.admin.userStatus);

  const users = useAppSelector(state => {
    // common sense would use a "filter(u => u != null)"
    // but resulting list will be typed (User | null)[]
    return Object.values(state.users.users).flatMap(user => (user != null ? [user] : []));
  });

  const [search, setSearch] = React.useState('');

  const [sortBy, setSortBy] = React.useState<{ key: keyof User; direction: 1 | -1 }>({
    key: 'username',
    direction: 1,
  });

  const toggleSort = (key: keyof User) => {
    if (key === sortBy.key) {
      setSortBy({
        key: key,
        direction: sortBy.direction > 0 ? -1 : 1,
      });
    } else {
      setSortBy({
        key: key,
        direction: 1,
      });
    }
  };

  const title = <h3>Users</h3>;

  if (status === 'NOT_INITIALIZED') {
    dispatch(getAllUsers());
  }

  const matchSearch = (user: User) => {
    if (search) {
      return (
        (user.username && user.username.match(search) != null) ||
        (user.firstname && user.firstname.match(search) != null) ||
        (user.lastname && user.lastname.match(search) != null) ||
        (user.commonname && user.commonname.match(search) != null)
      );
    } else {
      return true;
    }
  };

  const sortFn = (a: User, b: User): number => {
    const vA = a[sortBy.key] || '';
    const vB = b[sortBy.key] || '';

    if (vA < vB) {
      return -1 * sortBy.direction;
    } else {
      return 1 * sortBy.direction;
    }
  };

  if (status != 'INITIALIZED') {
    return (
      <div>
        {title}
        <div>
          <InlineLoading />
        </div>
      </div>
    );
  } else {
    const filterSortedList = users.filter(matchSearch).sort(sortFn);

    const Header = ({ sortKey, children }: { sortKey?: keyof User; children: React.ReactNode }) => {
      if (sortKey) {
        const colour = sortKey === sortBy.key ? 'black' : 'lightgrey';
        const icon =
          sortBy.direction > 0 || sortKey != sortBy.key ? faSortAlphaDown : faSortAlphaUp;
        const button = <FontAwesomeIcon className={css({ color: colour })} icon={icon} />;

        return (
          <div
            className={buttonStyle}
            onClick={() => {
              toggleSort(sortKey);
            }}
          >
            {children} {button}
          </div>
        );
      } else {
        return <div>{children}</div>;
      }
    };

    const headers = (
      <div
        className={css({
          display: 'contents',
          fontWeight: 'bold',
        })}
      >
        <Header sortKey="username">Username</Header>
        <Header sortKey="firstname">Firstname</Header>
        <Header sortKey="lastname">Lastname</Header>
        <Header sortKey="commonname">CommonName</Header>
        <Header sortKey="admin">Admin</Header>
        <Header>Actions</Header>
      </div>
    );

    return (
      <div>
        {title}
        <div>
          <label>
            <FontAwesomeIcon icon={faSearch} />
            <input type="text" onChange={e => setSearch(e.target.value)} />
          </label>
        </div>
        <div>
          {filterSortedList.length > 0 ? (
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: 'repeat(6, max-content)',
                '& div div': {
                  paddingRight: '10px',
                },
              })}
            >
              {headers}
              {filterSortedList.map(user => (
                <UserComp key={user.id} user={user} />
              ))}
            </div>
          ) : (
            <div>
              <i>no result</i>
            </div>
          )}
        </div>
      </div>
    );
  }
};
