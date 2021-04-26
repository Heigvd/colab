/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { useAppDispatch, useCurrentUser } from '../../store/hooks';
import { grantAdminRight, revokeAdminRight } from '../../API/api';
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
import IconButton from '../common/IconButton';

const UserComp = ({ user }: { user: User }) => {
  const dispatch = useAppDispatch();
  const { currentUser } = useCurrentUser()!;
  const currentUserId = currentUser && currentUser.id;

  return (
    <div className={css({ display: 'contents' })}>
      <div>
        {user.username} {user.id === currentUserId ? ' (you) ' : null}
      </div>
      <div>{user.firstname}</div>
      <div>{user.lastname}</div>
      <div>{user.commonname}</div>
      <div>
        <IconButton
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

const SortContext = React.createContext<{
  key: keyof User;
  direction: 1 | -1;
  onToggle?: (key: keyof User) => void;
}>({
  key: 'username',
  direction: 1,
});

interface UserListProps {
  users: User[];
}

interface HeaderProps {
  text: string;
  sortKey?: keyof User;
}

const Header = ({ sortKey, text }: HeaderProps) => {
  const sortBy = React.useContext(SortContext);

  const onClickCk = React.useCallback(() => {
    if (sortKey != null && sortBy.onToggle != null) {
      sortBy.onToggle(sortKey);
    }
  }, [sortKey, sortBy]);

  if (sortKey) {
    const colour = sortKey === sortBy.key ? 'black' : 'lightgrey';
    const icon = sortBy.direction > 0 || sortKey != sortBy.key ? faSortAlphaDown : faSortAlphaUp;
    return (
      <IconButton reverseOrder icon={icon} iconColor={colour} onClick={onClickCk}>
        {text}
      </IconButton>
    );
  } else {
    return <div>{text}</div>;
  }
};

const Headers = () => {
  return (
    <div
      className={css({
        display: 'contents',
        fontWeight: 'bold',
      })}
    >
      <Header sortKey="username" text="Username" />
      <Header sortKey="firstname" text="Firstname" />
      <Header sortKey="lastname" text="Lastname" />
      <Header sortKey="commonname" text="CommonName" />
      <Header sortKey="admin" text="Admin" />
      <Header text="Actions " />
    </div>
  );
};

export default ({ users }: UserListProps): JSX.Element => {
  const [search, setSearch] = React.useState('');

  const [sortBy, setSortBy] = React.useState<{ key: keyof User; direction: 1 | -1 }>({
    key: 'username',
    direction: 1,
  });

  const onToggleCb = React.useCallback((key: keyof User) => {
    setSortBy(state => {
      if (key === state.key) {
        return {
          key: key,
          direction: state.direction > 0 ? -1 : 1,
        };
      } else {
        return {
          key: key,
          direction: 1,
        };
      }
    });
  }, []);

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

  const filterSortedList = users.filter(matchSearch).sort(sortFn);

  return (
    <>
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
            <SortContext.Provider value={{ ...sortBy, onToggle: onToggleCb }}>
              <Headers />
            </SortContext.Provider>
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
    </>
  );
};
