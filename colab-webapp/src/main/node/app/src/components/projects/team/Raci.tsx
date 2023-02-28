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
import { useAndLoadCardACL, useAndLoadSubCards, useProjectRootCard } from '../../../selectors/cardSelector';
import { useAndLoadProjectTeam } from '../../../selectors/teamSelector';
import { useAppSelector } from '../../../store/hooks';
import { MemberACL } from '../../cards/CardACL';
import InlineLoading from '../../common/element/InlineLoading';
import { ellipsisStyle, space_xl, text_sm, th_sm } from '../../styling/style';

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
    <>
      <table
        className={css({
          '& > div': {
            marginLeft: '5px',
            marginRight: '5px',
          },
        })}
      >
        <thead>
        <tr>
          <th className={cx(th_sm)}>{i18n.modules.card.card}</th>
          <th className={cx(th_sm)}>{i18n.team.members}</th>
        </tr>
        </thead>
        <tbody>
        <MembersRow members={members} />
        {rootContent && <CardsWithRACI members={members} rootContent={rootContent} depth={0} />}
        </tbody>
      </table>
    </>
  );
}

export function MembersRow({ members }: { members: TeamMember[] }): JSX.Element {
  //const i18n = useTranslations();
  return (
    <tr>
      <td />
      {members.map(member => (
        <td
          key={member.id}
          className={cx(text_sm, css({ maxWidth: '100px' }))}
          title={member.displayName || undefined}
        >
          <p className={cx(css({ textAlign: 'left' }), ellipsisStyle)}>{member.displayName}</p>
        </td>
      ))}
    </tr>
  );
}

interface RACIRowProps {
  subCard: Card;
  member: TeamMember;
}
function RACIRow({ subCard, member}: RACIRowProps): JSX.Element {
  const acl = useAndLoadCardACL(subCard.id);
  return (
    <td key={member.id}> <MemberACL acl={acl} member={member} /></td>
  );
}

interface CardsWithRACIProps {
  members: TeamMember[];
  rootContent: CardContent;
  depth?: number;
}
function CardsWithRACI({ members, rootContent }: CardsWithRACIProps): JSX.Element {
  const i18n = useTranslations();
  const subCards = useAndLoadSubCards(rootContent.id);
  if (subCards == null) {
    return <InlineLoading />;
  } else {
    if (subCards.length === 0) {
      return (
        <div>
          <p>{i18n.modules.card.infos.noCardYetPleaseCreate}</p>
        </div>
      );
    } else {
      return (
        <>
          {/* ONLY PARENT CARDS FOR NOW */}
          {subCards.map(subCard => (
            <tr key={subCard.id} className={css({height: space_xl})}>
              <td key={subCard.id}>
                  {subCard.title || i18n.modules.card.untitled}
              </td>
              {members.map(member => (
                <RACIRow subCard={subCard} member={member} key={subCard.id + '-' + member.id}/>
              ))}
            </tr>
          ))}
        </>
      );
    }
  }
}
