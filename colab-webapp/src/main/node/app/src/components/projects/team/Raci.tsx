/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { CardContent, entityIs, Project, TeamMember } from 'colab-rest-client';
import React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { useAndLoadSubCards, useProjectRootCard } from '../../../selectors/cardSelector';
import { useAndLoadProjectTeam } from '../../../selectors/teamSelector';
import { useAppSelector } from '../../../store/hooks';
import InlineLoading from '../../common/element/InlineLoading';
import { space_lg, space_sm, space_xl, text_sm } from '../../styling/style';
import { gridNewLine, titleCellStyle } from './Team';

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

  //const projectOwners = members.filter(m => m.position === 'OWNER');
  return (
    <>
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: `repeat(${members.length + 1}, max-content)`,
          justifyItems: 'center',
          alignItems: 'center',
          '& > div': {
            marginLeft: '5px',
            marginRight: '5px',
          },
          marginBottom: space_xl,
          paddingBottom: space_lg,
          borderBottom: '1px solid var(--divider-main)',
          gap: space_sm,
        })}
      >
        <div className={cx(titleCellStyle, css({ gridColumnStart: 1, gridColumnEnd: 2 }))}>
          {i18n.modules.card.card}
        </div>
        <div className={cx(titleCellStyle, css({ gridColumnStart: 2, gridColumnEnd: 'end' }))}>
          {i18n.team.members}
        </div>
        <div />
        <Columns members={members} />
        {rootContent && <CardWithRACI members={members} rootContent={rootContent} depth={0} />}
      </div>
    </>
  );
}

export function Columns({ members }: { members: TeamMember[] }): JSX.Element {
  //const i18n = useTranslations();
  return (
    <>
      {members.map(member => (
        <div
          key={member.id}
          className={cx(text_sm, css({ maxWidth: '130px' }))}
          title={member.displayName || undefined}
        >
          <p className={css({ textAlign: 'left', textOverflow: 'ellipsis', overflow: 'hidden' })}>
            {member.displayName}
          </p>
        </div>
      ))}
    </>
  );
}
interface CardWithRACIProps {
  members: TeamMember[];
  rootContent: CardContent;
  depth?: number;
}
function CardWithRACI({ members, rootContent, depth = 1 }: CardWithRACIProps): JSX.Element {
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
            <>
              <div key={subCard.id} className={gridNewLine}>
                <p>
                  {subCard.title}
                  {depth}
                </p>
              </div>
              {members.map(member => (
                <>
                  <div key={member.id}> {member.position}</div>
                </>
              ))}
            </>
          ))}
        </>
      );
    }
  }
}
