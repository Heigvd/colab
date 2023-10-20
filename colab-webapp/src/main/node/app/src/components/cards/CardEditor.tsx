/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import { useCardACLForCurrentUser } from '../../store/selectors/aclSelector';
import { useAndLoadSubCards } from '../../store/selectors/cardSelector';
import { space_md, space_sm } from '../../styling/style';
import { cardColors } from '../../styling/theme';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import { Item, SideCollapsibleCtx } from '../common/layout/SideCollapsibleContext';
import { TextEditorContext } from '../documents/texteditor/TextEditorContext';
import { ResourcesMainViewHeader, ResourcesMainViewPanel } from '../resources/ResourcesMainView';
import CardAssignmentsPanel from '../team/CardAssignments';
import CardEditorDeliverable from './CardEditorDeliverable';
import CardEditorHeader from './CardEditorHeader';
import CardEditorSideMenu from './CardEditorSideMenu';
import CardEditorSidePanel from './CardEditorSidePanel';
import CardEditorSubCards from './CardEditorSubCards';
import Dndwrapper from './dnd/Dndwrapper';
import { useIsCardReadOnly } from './cardRightsHooks';
import { ColorPicker } from '../common/element/ColorPicker';

interface CardEditorProps {
  card: Card;
  cardContent: CardContent;
}

export default function CardEditor({ card, cardContent }: CardEditorProps): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();

  const subCards = useAndLoadSubCards(cardContent.id);

  const { canRead } = useCardACLForCurrentUser(card.id);
  const readOnly = useIsCardReadOnly({ card, cardContent });

  const [openKey, setOpenKey] = React.useState<string | undefined>(undefined);

  const [isTextEditorEmpty, setIsTextEditorEmpty] = React.useState(false);

  const hasNoSubCard = !subCards || subCards.length < 1;

  const [splitterPlace, setSplitterPlace] = React.useState<'TOP' | 'MIDDLE' | 'BOTTOM' | undefined>(
    undefined,
  );

  React.useEffect(() => {
    if (hasNoSubCard) {
      setSplitterPlace('BOTTOM');
    } else if (isTextEditorEmpty) {
      setSplitterPlace('TOP');
    } else {
      setSplitterPlace('MIDDLE');
    }
  }, [setSplitterPlace, hasNoSubCard, isTextEditorEmpty]);

  const sideBarItems: Item[] = [
    {
      key: 'resources',
      icon: 'menu_book',
      title: i18n.modules.resource.documentation,
      header: (
        <ResourcesMainViewHeader
          title={<h3>{i18n.modules.resource.documentation}</h3>}
          helpTip={i18n.modules.resource.help.documentationExplanation}
        />
      ),
      children: (
        <ResourcesMainViewPanel
          accessLevel={!readOnly ? 'WRITE' : canRead ? 'READ' : 'DENIED'}
          showLevels
        />
      ),
      className: css({ overflow: 'auto' }),
    },
    {
      key: 'team',
      icon: 'group',
      title: i18n.team.assignment.labels.assignments,
      children: (
        <div className={css({ overflow: 'auto' })}>
          <CardAssignmentsPanel cardId={card.id!} readOnly={readOnly} />
        </div>
      ),
      className: css({ overflow: 'auto' }),
    },
    {
      key: 'colors',
      icon: 'palette',
      title: i18n.modules.card.settings.color,
      children: (
        <ColorPicker
          colors={Object.values(cardColors)}
          onChange={newColor => {
            dispatch(API.updateCard({ ...card, color: newColor.hex }));
          }}
          color={card.color}
          width="auto"
          className={css({ marginTop: space_sm, padding: space_sm })}
        />
      ),
    },
  ];

  if (card.id == null) {
    return <i>{i18n.modules.card.error.withoutId}</i>;
  } else {
    return (
      <Flex direction="column" align="stretch" className={css({ height: '100%' })}>
        <Dndwrapper cards={subCards}>
          <CardEditorHeader card={card} cardContent={cardContent} readOnly={readOnly} />
          <Flex direction="row" grow={1} align="stretch" className={css({ overflow: 'auto' })}>
            <SideCollapsibleCtx.Provider
              value={{
                items: sideBarItems,
                openKey,
                setOpenKey,
              }}
            >
              <ReflexContainer orientation={'vertical'}>
                <ReflexElement
                  className={'left-panel ' + css({ display: 'flex' })}
                  resizeHeight={false}
                  minSize={20}
                >
                  <TextEditorContext.Provider
                    value={{
                      /* isEmpty: isTextEditorEmpty, */
                      setIsEmpty: setIsTextEditorEmpty,
                    }}
                  >
                    <ReflexContainer orientation={'horizontal'}>
                      <ReflexElement
                        className={'top-panel ' + css({ display: 'flex' })}
                        resizeWidth={false}
                        minSize={65}
                        flex={splitterPlace === 'BOTTOM' ? 1 : splitterPlace === 'TOP' ? 0 : 0.5}
                      >
                        {/* ******************************** DELIVERABLE ******************************** */}
                        <CardEditorDeliverable
                          card={card}
                          cardContent={cardContent}
                          readOnly={readOnly}
                        />
                        {/* ***************************************************************************** */}
                      </ReflexElement>
                      <ReflexSplitter
                        className={css({
                          zIndex: 0,
                          margin: space_md + ' 0',
                        })}
                      >
                      </ReflexSplitter>
                      <ReflexElement
                        className={'bottom-panel ' + css({ display: 'flex' })}
                        resizeWidth={false}
                        minSize={42}
                      >
                        {/* ******************************** SUB CARDS ******************************** */}
                        <CardEditorSubCards
                          card={card}
                          cardContent={cardContent} /* readOnly={readOnly} */
                        />
                        {/* *************************************************************************** */}
                      </ReflexElement>
                    </ReflexContainer>
                  </TextEditorContext.Provider>
                </ReflexElement>
                {openKey && (
                  <ReflexSplitter className={css({ zIndex: 0, margin: '0 ' + space_md })}>
                  </ReflexSplitter>
                )}
                <ReflexElement
                  className={'right-pane ' + css({ display: 'flex' })}
                  resizeHeight={false}
                  maxSize={openKey ? undefined : 0.1}
                  minSize={20}
                  flex={0.4}
                >
                  {/* ******************************** SIDE PANEL ******************************** */}
                  <CardEditorSidePanel
                    card={card}
                    cardContent={cardContent} /* readOnly={readOnly} */
                  />
                  {/* **************************************************************************** */}
                </ReflexElement>
              </ReflexContainer>

              {/* ******************************** SIDE MENU ******************************** */}
              <CardEditorSideMenu card={card} cardContent={cardContent} /* readOnly={readOnly} */ />
              {/* *************************************************************************** */}
            </SideCollapsibleCtx.Provider>
          </Flex>
        </Dndwrapper>
      </Flex>
    );
  }
}
