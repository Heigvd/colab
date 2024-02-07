/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Card, Project } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import { space_lg, space_sm } from '../../styling/style';
import Button from '../common/element/Button';
import { DiscreetTextArea } from '../common/element/Input';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import OpenModalOnClick from '../common/layout/OpenModalOnClick';

interface SharingLinkPanelProps {
  project: Project;
  card: Card;
}

type DisplayMode = 'BUTTON' | 'SHOW_GENERATED_LINK' | 'SHOW_DELETION_MSG';

function SharingLinkPanel({ project, card }: SharingLinkPanelProps): React.ReactElement {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();

  const [displayMode, setDisplayMode] = React.useState<DisplayMode>('BUTTON');
  const [url, setURL] = React.useState<string | undefined>();

  if (!project.id) {
    return <>no project</>;
  }

  if (!card.id) {
    return <>no card defined</>;
  }

  return (
    <Flex direction="column" grow={1}>
      <Flex direction="column" grow={0}>
        <Flex wrap="wrap" className={css({ marginBottom: space_lg })}>
          <span>{i18n.modules.card.infos.sharingLink1}</span>
        </Flex>
        <Flex className={css({ marginBottom: space_lg })}>
          {i18n.modules.card.infos.sharingLink2}
        </Flex>
        <Flex className={css({ marginBottom: space_lg })}>
          {i18n.modules.card.infos.sharingLink3}
        </Flex>
        <Flex className={css({ marginBottom: space_lg })}>
          {i18n.modules.card.infos.sharingLink4}
        </Flex>
      </Flex>
      <Flex
        direction="column"
        align="center"
        justify="space-evenly"
        className={css({ alignSelf: 'stretch' })}
        grow={1}
      >
        {displayMode === 'BUTTON' && (
          <Button
            onClick={() => {
              dispatch(API.generateSharingLink({ projectId: project.id!, cardId: card.id! })).then(
                action => {
                  const urlPayload = action.payload;
                  if (
                    action.meta.requestStatus === 'fulfilled' &&
                    urlPayload != null &&
                    typeof urlPayload === 'object' &&
                    'value' in urlPayload &&
                    urlPayload.value != null &&
                    typeof urlPayload.value === 'string'
                  ) {
                    setURL(urlPayload.value as string);
                    setDisplayMode('SHOW_GENERATED_LINK');
                  }
                },
              );
            }}
          >
            {i18n.modules.card.action.generateASharingLink}
          </Button>
        )}

        {displayMode === 'SHOW_GENERATED_LINK' && (
          <Flex direction="column" align="stretch" className={css({ width: '30em' })}>
            <DiscreetTextArea
              value={url}
              onChange={() => {}}
              rows={4}
              containerClassName={css({ flexGrow: 1 })}
            />
            <Flex>{i18n.modules.card.infos.sharingLinkReady}</Flex>
          </Flex>
        )}

        {displayMode === 'BUTTON' && (
          <Button
            onClick={() => {
              dispatch(API.deleteSharingLinkByCard({ cardId: card.id! })).then(() => {
                setDisplayMode('SHOW_DELETION_MSG');
              });
            }}
          >
            {i18n.modules.card.action.removeSharingLink}
          </Button>
        )}

        {displayMode === 'SHOW_DELETION_MSG' && (
          <Flex>{i18n.modules.card.infos.sharingLinkDeleted}</Flex>
        )}
      </Flex>
    </Flex>
  );
}

export default function SharingLinkPanelModalOnClick(
  props: SharingLinkPanelProps,
): React.ReactElement {
  const i18n = useTranslations();

  return (
    <OpenModalOnClick
      title={i18n.modules.card.label.sharingLink}
      size="md"
      collapsedChildren={
        <>
          <Icon icon={'add_link'} /> {i18n.modules.card.label.sharingLink}
        </>
      }
      modalBodyClassName={css({ justifyContent: 'center', alignItems: 'center' })}
      className={css({ display: 'flex', alignItems: 'center', gap: space_sm })}
    >
      {() => <SharingLinkPanel {...props} />}
    </OpenModalOnClick>
  );
}
