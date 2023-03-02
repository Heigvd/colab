/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card, CardContent, entityIs, Project, TeamMember } from 'colab-rest-client';
import React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import {
  useAndLoadCardACL,
  useAndLoadSubCards,
  useProjectRootCard,
} from '../../../selectors/cardSelector';
import { useAndLoadProjectTeam } from '../../../selectors/teamSelector';
import { useCurrentUser } from '../../../selectors/userSelector';
import { useAppSelector } from '../../../store/hooks';
import InlineLoading from '../../common/element/InlineLoading';
import Flex from '../../common/layout/Flex';
import Icon from '../../common/layout/Icon';
import {
  ellipsisStyle,
  p_sm,
  p_xs,
  space_xl,
  space_xs,
  text_semibold,
  text_xs,
  th_sm,
} from '../../styling/style';
import MemberACLDropDown from './MemberRACIDropDown';

export default function TeamRACI({ project }: { project: Project }): JSX.Element {
  const i18n = useTranslations();
  const projectId = project.id;
  const { members } = useAndLoadProjectTeam(projectId);
  const root = useProjectRootCard(project.id);
  const rootContent = useAppSelector(state => {
    if (entityIs(root, 'Card') && root.id != null) {
      const card = state.cards.cards[root.id];
      if (card != null) {
        if (card.contents === undefined) {
          return undefined;
        } else if (card.contents === null) {
          return null;
        } else {
          const contents = Object.values(card.contents);
          if (contents.length === 0) {
            return null;
          } else {
            return state.cards.contents[contents[0]!]!.content;
          }
        }
      }
    }
  });
  return (
    <div className={css({overflow: 'auto'})}>
      <table
        className={css({
          borderCollapse: 'collapse',
          td: {
            border: '1px solid var(--divider-main)',
          },
        })}
      >
        <thead className={css({position: 'sticky', top: 0, backgroundColor: 'var(--bg-primary)', boxShadow: '0px 1px var(--divider-main)'})}>
          <tr>
            <th className={cx(th_sm, css({boxShadow: '0px 1px var(--divider-main)'}))}>{i18n.modules.card.card}</th>
            <th colSpan={members.length} className={cx(th_sm, css({boxShadow: '0px 1px var(--divider-main)'}))}>
              {i18n.team.members}
            </th>
          </tr>
          <MembersRow members={members} />
        </thead>
        <tbody>
          {rootContent && <CardsWithRACI members={members} rootContent={rootContent} depth={0} />}
        </tbody>
      </table>
    </ div>
  );
}

function MembersRow({ members }: { members: TeamMember[] }): JSX.Element {
  return (
    <tr>
      <td />
      {members.map(member => (
        <td
          key={member.id}
          className={cx(text_xs, p_xs, css({ maxWidth: '70px', textAlign: 'center' }))}
          title={member.displayName || undefined}
        >
          <Member member={member} />
        </td>
      ))}
    </tr>
  );
}
function Member({ member }: { member: TeamMember }): JSX.Element {
  const { currentUser } = useCurrentUser();
  const user = useAppSelector(state => {
    if (member.userId != null) {
      return state.users.users[member.userId];
    } else {
      // no user id looks like a pending invitation
      return null;
    }
  });
  return (
    <p className={cx({ [text_semibold]: member.userId === currentUser?.id }, ellipsisStyle)}>
      <>
        {member.displayName && member.userId == null ? (
          member.displayName
        ) : (
          <>
            {user === 'LOADING' || user == null || user === 'ERROR' ? (
              <InlineLoading />
            ) : (
              <>{user.commonname ? user.commonname : user.username}</>
            )}
          </>
        )}
      </>
    </p>
  );
}

interface RACIRowProps {
  subCard: Card;
  member: TeamMember;
}
function RACIRow({ subCard, member }: RACIRowProps): JSX.Element {
  const acl = useAndLoadCardACL(subCard.id);
  return (
    <td key={member.id} className={css({ width: '70px', padding: '0 ' + space_xs, })}>
      <MemberACLDropDown acl={acl} member={member} />
    </td>
  );
}

interface SubCardsWithRACIProps {
  members: TeamMember[];
  subCard: Card;
  depth?: number;
}
function SubCardsWithRACI({ members, subCard, depth }: SubCardsWithRACIProps): JSX.Element {
  const subCardContent = useAppSelector(state => {
    if (subCard.id != null) {
      const card = state.cards.cards[subCard.id];
      if (card != null) {
        if (card.contents === undefined) {
          return undefined;
        } else if (card.contents === null) {
          return null;
        } else {
          const contents = Object.values(card.contents);
          if (contents.length === 0) {
            return null;
          } else {
            return state.cards.contents[contents[0]!]!.content;
          }
        }
      }
    }
  });
  if (subCardContent) {
    return <CardsWithRACI members={members} rootContent={subCardContent} depth={depth} />;
  } else {
    return <InlineLoading />;
  }
}

interface CardsWithRACIProps {
  members: TeamMember[];
  rootContent: CardContent;
  depth?: number;
}
function CardsWithRACI({ members, rootContent, depth = 0 }: CardsWithRACIProps): JSX.Element {
  const i18n = useTranslations();
  const subCards = useAndLoadSubCards(rootContent.id);
  if (subCards == null) {
    return <InlineLoading />;
  } else {
    if (depth === 0 && subCards.length === 0) {
      return <>{i18n.modules.card.infos.noCardYetPleaseCreate}</>;
    } else if (subCards.length === 0) {
      return <></>;
    } else {
      return (
        <>
          {subCards.map(subCard => (
            <>
              <tr key={subCard.id} className={css({ height: space_xl })}>
                <td key={subCard.id} className={cx(text_xs, p_sm, css({color: 'var(--text-secondary)'}), { [css({color: 'var(--text-primary)'})]: depth === 0 })}>
                  <Flex align='center'>
                    {(() => {
                      const arr = [];
                      for (let i = 0; i < depth; i++) {
                        arr.push(<Icon icon="remove" color="var(--text-disabled)" opsz={'xs'} />);
                      }
                      return arr;
                    })()}
                  {subCard.title || i18n.modules.card.untitled}
                  </Flex>
                </td>
                {members.map(member => (
                  <RACIRow subCard={subCard} member={member} key={subCard.id + '-' + member.id} />
                ))}
              </tr>
              <SubCardsWithRACI
                subCard={subCard}
                members={members}
                key={subCard.id}
                depth={depth + 1}
              />
            </>
          ))}
        </>
      );
    }
  }
}
