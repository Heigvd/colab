/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { User } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { regexFilter } from '../../helper';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import { useCurrentUser } from '../../store/selectors/userSelector';
import { ConfirmIconButton } from '../common/element/ConfirmIconButton';
import Icon from '../common/layout/Icon';

const UserComp = ({ user }: { user: User }) => {
  const i18n = useTranslations();
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
      <div>{i18n.common.ago(user.activityDate)}</div>
      <div>
        <ConfirmIconButton
          icon={user.admin ? 'check' : 'close'}
          onConfirm={() => {
            dispatch(user.admin ? API.revokeAdminRight(user) : API.grantAdminRight(user));
          }}
          title={user.admin ? 'Grant right' : 'Revoke right'}
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

const headerStyle = css({
  fontWeight: 'bold',
  borderBottom: '1px solid',
});

const sortableHeaderStyle = cx(
  headerStyle,
  css({
    cursor: 'pointer',
  }),
);

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
    const icon = sortBy.direction > 0 || sortKey != sortBy.key ? 'sort_by_alpha' : 'sort_by_alpha';
    return (
      <div className={sortableHeaderStyle} onClick={onClickCk}>
        {text}
        <Icon icon={icon} color={colour} />
      </div>
    );
  } else {
    return <div className={headerStyle}>{text}</div>;
  }
};

const Headers = () => {
  return (
    <div
      className={css({
        display: 'contents',
      })}
    >
      <Header sortKey="username" text="Username" />
      <Header sortKey="firstname" text="Firstname" />
      <Header sortKey="lastname" text="Lastname" />
      <Header sortKey="commonname" text="CommonName" />
      <Header sortKey="activityDate" text="Last seen" />
      <Header sortKey="admin" text="Admin" />
      <Header text="Actions " />
    </div>
  );
};

function matchFn(regex: RegExp, user: User): boolean {
  return !!(
    (user.username && user.username.match(regex) != null) ||
    (user.firstname && user.firstname.match(regex) != null) ||
    (user.lastname && user.lastname.match(regex) != null) ||
    (user.commonname && user.commonname.match(regex) != null)
  );
}

export default function UserList({ users }: UserListProps): JSX.Element {
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

  const sortFn = (a: User, b: User): number => {
    const vA = a[sortBy.key] || '';
    const vB = b[sortBy.key] || '';

    if (vA < vB) {
      return -1 * sortBy.direction;
    } else {
      return 1 * sortBy.direction;
    }
  };

  const filterSortedList = (search ? regexFilter(users, search, matchFn) : users).sort(sortFn);

  return (
    <>
      <div>
        <label>
          <Icon icon={'search'} />
          <input type="text" onChange={e => setSearch(e.target.value)} />
        </label>
      </div>
      <div>
        {filterSortedList.length > 0 ? (
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: 'repeat(7, max-content)',
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
}
