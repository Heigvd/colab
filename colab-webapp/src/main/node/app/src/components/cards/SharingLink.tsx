/*
 * The coLAB project
 * Copyright (C) 2021-2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Card, Project } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import { lightTextStyle, space_lg, space_sm } from '../../styling/style';
import Button from '../common/element/Button';
import IconButton from '../common/element/IconButton';
import { DiscreetTextArea } from '../common/element/Input';
import Tips from '../common/element/Tips';
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
    <>
      {displayMode === 'BUTTON' && (
        <Flex direction="column" align="stretch" grow={1}>
          <Flex>{i18n.modules.card.infos.sharingLink.intro}</Flex>
          <Flex direction="column" align="center" justify="space-evenly" grow={1}>
            <Flex>
              <Button
                onClick={() => {
                  dispatch(
                    API.generateSharingLink({ projectId: project.id!, cardId: card.id! }),
                  ).then(action => {
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
                  });
                }}
              >
                {i18n.modules.card.action.generateASharingLink}
              </Button>
              <Tips>
                <Flex className={css({ marginBottom: space_lg })}>
                  {i18n.modules.card.infos.sharingLink.generateTip1}
                </Flex>
                <Flex className={css({ marginBottom: space_lg })}>
                  {i18n.modules.card.infos.sharingLink.generateTip2}
                </Flex>
                <Flex className={css({ marginBottom: space_lg })}>
                  {i18n.modules.card.infos.sharingLink.generateTip3}
                </Flex>
                <Flex className={css({ marginBottom: space_lg })}>
                  {i18n.modules.card.infos.sharingLink.generateTip4}
                </Flex>
              </Tips>
            </Flex>
            <Flex>
              <Button
                onClick={() => {
                  dispatch(API.deleteSharingLinkByCard({ cardId: card.id! })).then(() => {
                    setDisplayMode('SHOW_DELETION_MSG');
                  });
                }}
              >
                {i18n.modules.card.action.removeAllSharingLink}
              </Button>
              <Tips>
                <Flex>{i18n.modules.card.infos.sharingLink.revokeTip}</Flex>
              </Tips>
            </Flex>
          </Flex>
        </Flex>
      )}

      {displayMode === 'SHOW_GENERATED_LINK' && (
        <Flex direction="column" align="stretch" justify="center" grow={1}>
          <Flex align="center" gap={space_sm}>
            <DiscreetTextArea
              value={url}
              onChange={() => {}}
              readOnly
              rows={4}
              containerClassName={css({ flexGrow: 1, width: '30em' })}
            />
            <IconButton
              icon="content_copy"
              title={i18n.common.copyToClipboard}
              onClick={() => {
                navigator.clipboard.writeText(url ?? '');
              }}
            />
          </Flex>
          <Flex className={lightTextStyle}>{i18n.modules.card.infos.sharingLink.copyToShare}</Flex>
        </Flex>
      )}

      {displayMode === 'SHOW_DELETION_MSG' && (
        <Flex direction="column" align="center" justify="center" grow={1}>
          {i18n.modules.card.infos.sharingLink.revoked}
        </Flex>
      )}
    </>
  );
}

export default function SharingLinkPanelModalOnClick(
  props: SharingLinkPanelProps,
): React.ReactElement {
  const i18n = useTranslations();

  return (
    <OpenModalOnClick
      title={i18n.modules.card.label.sharingLink}
      showCloseButton
      size="md"
      collapsedChildren={
        <>
          <Icon icon={'share'} /> {i18n.modules.card.label.sharingLink}
        </>
      }
      footer={collapse => (
        <Flex justify="flex-end" grow={1} className={css({ padding: space_lg })}>
          <Button onClick={collapse}> {i18n.common.close}</Button>
        </Flex>
      )}
      modalBodyClassName={css({ justifyContent: 'stretch', alignItems: 'stretch' })}
      className={css({ display: 'flex', alignItems: 'center', gap: space_sm })}
    >
      {() => <SharingLinkPanel {...props} />}
    </OpenModalOnClick>
  );
}
