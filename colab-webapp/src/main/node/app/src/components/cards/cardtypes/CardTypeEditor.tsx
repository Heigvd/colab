/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import {
  faArrowLeft,
  faCog,
  faEllipsisV,
  faFileAlt,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import * as API from '../../../API/api';
//import logger from '../../../logger';
import { useCardType } from '../../../selectors/cardTypeSelector';
import { dispatch } from '../../../store/store';
import Button from '../../common/Button';
import ConfirmDeleteModal from '../../common/ConfirmDeleteModal';
import DropDownMenu from '../../common/DropDownMenu';
import Flex from '../../common/Flex';
import IconButton from '../../common/IconButton';
import InlineInput from '../../common/InlineInput';
import Modal from '../../common/Modal';
import Tips from '../../common/Tips';
import { cardStyle, cardTitle, lightIconButtonStyle, space_M, space_S } from '../../styling/style';
import SideCollapsiblePanel from './../SideCollapsiblePanel';

interface Props {
  className?: string;
}

export default function CardTypeEditor({ className }: Props): JSX.Element {
  const id = useParams<'id'>();
  const typeId = +id.id!;
  const completeCardType = useCardType(typeId);
  const cardType = completeCardType.cardType;
  //const dispatch = useAppDispatch();
  const navigate = useNavigate();

  //logger.info(id.id);
  if (!cardType) {
    return <i>Card type without id is invalid...</i>;
  } else {
    return (
      <Flex
        direction="column"
        grow={1}
        align="stretch"
        className={cx(css({ alignSelf: 'stretch' }), className)}
      >
        <IconButton
          icon={faArrowLeft}
          title={'Back to card types'}
          iconColor="var(--darkGray)"
          onClick={() => navigate('../')}
          className={css({ display: 'block', marginBottom: space_M })}
        />
        <Flex
          grow={1}
          direction="row"
          justify="space-between"
          align="stretch"
          className={cx(
            cardStyle,
            css({
              backgroundColor: 'white',
            }),
          )}
        >
          <Flex direction="column" grow={1} align="stretch">
            <Flex
              direction="column"
              grow={1}
              className={css({
                padding: '10px',
                overflow: 'auto',
              })}
              align="stretch"
            >
              <Flex direction="column" align="stretch">
                <Flex
                  justify="space-between"
                  className={css({
                    paddingBottom: space_S,
                  })}
                >
                  <InlineInput
                    placeholder="Untitled type"
                    value={cardType.title || ''}
                    onChange={newValue =>
                      dispatch(API.updateCardType({ ...cardType, title: newValue }))
                    }
                    autosave={false}
                    className={cardTitle}
                  />
                  <Flex>
                    {/* handle modal routes*/}
                    <Routes>
                      <Route
                        path="settings"
                        element={
                          <Modal
                            title="Type Settings"
                            onClose={() => navigate('./')}
                            showCloseButton
                          >
                            {closeModal => (
                              <Button onClick={closeModal}>
                                CLOSE MODAL TODO
                                {/* <CardSettings onClose={closeModal} card={card} /> */}
                              </Button>
                            )}
                          </Modal>
                        }
                      />
                    </Routes>
                    <DropDownMenu
                      icon={faEllipsisV}
                      valueComp={{ value: '', label: '' }}
                      buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: space_S }))}
                      entries={[
                        {
                          value: 'Delete type',
                          label: (
                            <ConfirmDeleteModal
                              buttonLabel={
                                <>
                                  <FontAwesomeIcon icon={faTrash} /> Delete type
                                </>
                              }
                              message={
                                <p>
                                  <Tips tipsType="TODO">
                                    Make test if type is used in card(s). Disable or hide this
                                    delete option if used.
                                  </Tips>
                                  Are you <strong>sure</strong> you want to delete this card type?
                                </p>
                              }
                              onConfirm={() => {
                                dispatch(API.deleteCardType(cardType));
                                navigate('../');
                              }}
                              confirmButtonLabel={'Delete card'}
                            />
                          ),
                        },
                        {
                          value: 'settings',
                          label: (
                            <>
                              <FontAwesomeIcon icon={faCog} title="Card settings" /> Card Settings
                            </>
                          ),
                        },
                      ]}
                      onSelect={val => {
                        navigate(val.value);
                      }}
                    />
                  </Flex>
                </Flex>
                <div>
                  <p>
                    <b>Card type</b>:
                  </p>
                  <p>
                    <b>Purpose</b>:
                  </p>
                </div>
              </Flex>
              <Flex direction="column" grow={1} align="stretch">
                {/*                   {userAcl.read ? (
                    variant.id ? (
                      <DocumentEditorWrapper
                        context={{ kind: 'DeliverableOfCardContent', cardContentId: variant.id }}
                        allowEdition={!readOnly}
                      />
                    ) : (
                      <span>no deliverable available</span>
                    )
                  ) : (
                    <span>Access Denied</span>
                  )} */}
              </Flex>
            </Flex>
          </Flex>
          <SideCollapsiblePanel
            direction="RIGHT"
            items={{
              resources: {
                children: (
                  <>
                    <div>HERE PUT RESOURCES</div>
                    {/*  <ResourcesWrapper
                      kind={ResourceContextScope.CardOrCardContent}
                      accessLevel={
                        !card.readOnly && userAcl.write ? 'WRITE' : userAcl.read ? 'READ' : 'DENIED'
                      }
                      cardId={card.id}
                      cardContentId={card.id}
                    /> */}
                  </>
                ),
                icon: faFileAlt,
                title: 'Toggle resources panel',
              },
            }}
          />
        </Flex>
      </Flex>
    );
  }
}
