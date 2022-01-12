/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import {
  faEllipsisV,
  faExclamationTriangle,
  faPen,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import Button from '../common/Button';
import DropDownMenu from '../common/DropDownMenu';
import OpenCloseModal from '../common/OpenCloseModal';
import { errorColor, flex, space_M, space_S } from '../styling/style';
import CardLayout from './CardLayout';
import ContentSubs from './ContentSubs';

interface Props {
  card: Card;
  variant: CardContent | undefined;
  variants: CardContent[];
  showSubcards?: boolean;
  depth?: number;
}

export default function CardThumb({
  card,
  depth = 1,
  showSubcards = true,
  variant,
  variants,
}: Props): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  if (card.id == null) {
    return <i>Card without id is invalid...</i>;
  } else {
    return (
      <CardLayout card={card} variant={variant} variants={variants}>
        <>
          <div
            className={css({
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              borderBottom: '1px solid lightgray',
              width: '100%',
            })}
          >
            <div
              className={css({
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: space_S + ' ' + space_S + ' ' + space_S + ' ' + space_M,
              })}
            >
              <div className={css({ fontWeight: 'bold' })}>{card.title || i18n.card.untitled}</div>
              <DropDownMenu
                icon={faEllipsisV}
                valueComp={{ value: '', label: '' }}
                buttonClassName={css({ color: 'var(--pictoGrey)', marginLeft: space_S })}
                entries={[
                  {
                    value: 'edit card',
                    label: (
                      <>
                        <FontAwesomeIcon icon={faPen} /> Edit Card
                      </>
                    ),
                    action: () => {
                      const path = `edit/${card.id}/v/${variant?.id}`;
                      if (location.pathname.match(/(edit|card)\/\d+\/v\/\d+/)) {
                        navigate(`../${path}`);
                      } else {
                        navigate(`${path}`);
                      }
                    },
                  },
                  {
                    value: 'Delete card',
                    label: (
                      <>
                        <OpenCloseModal
                          title="Delete card"
                          collapsedChildren={
                            <div className={css({ pointerEvents: 'none' })}>
                              <FontAwesomeIcon icon={faTrash} /> Delete card
                            </div>
                          }
                        >
                          {collapse => (
                            <div>
                              <FontAwesomeIcon icon={faExclamationTriangle} />
                              <FontAwesomeIcon icon={faExclamationTriangle} />
                              <FontAwesomeIcon icon={faExclamationTriangle} />
                              {variants.length > 1 && variant != null ? (
                                <p>
                                  Are you <strong>sure</strong> you want to delete this whole
                                  variant? This will delete all subcards inside.
                                </p>
                              ) : (
                                <p>
                                  Are you <strong>sure</strong> you want to delete this whole card?
                                  This will delete all subcards inside.
                                </p>
                              )}
                              <div className={flex}>
                                {variants.length > 1 && variant != null ? (
                                  // several variants, delete the current one
                                  <Button
                                    title="Confirm delete"
                                    onClick={() => dispatch(API.deleteCardContent(variant))}
                                    className={css({
                                      backgroundColor: errorColor,
                                      marginRight: space_M,
                                    })}
                                  >
                                    Delete variant
                                  </Button>
                                ) : (
                                  // last variant : delete the whole card
                                  <Button
                                    title="Confirm delete"
                                    onClick={() => dispatch(API.deleteCard(card))}
                                    className={css({
                                      backgroundColor: errorColor,
                                      marginRight: space_M,
                                    })}
                                  >
                                    Delete card
                                  </Button>
                                )}
                                <Button title="Cancel delete" onClick={() => collapse()}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </OpenCloseModal>
                      </>
                    ),
                  },
                ]}
                onSelect={val => {
                  val.action != null ? val.action() : navigate(val.value);
                }}
              />
            </div>
            <div>
              {variants.length > 1 ? (
                variant?.title ? (
                  <span>{variant.title}</span>
                ) : (
                  <i>{i18n.content.untitled}</i>
                )
              ) : null}
            </div>
          </div>
          <div
            className={css({
              padding: '10px',
              flexGrow: 1,
            })}
          >
            {showSubcards ? (
              variant != null ? (
                <ContentSubs depth={depth} cardContent={variant} />
              ) : (
                <i>{i18n.content.none}</i>
              )
            ) : null}
          </div>
        </>
      </CardLayout>
    );
  }
}
