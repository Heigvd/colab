/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import { useCurrentProjectId } from '../../../selectors/projectSelector';
import { useAppDispatch } from '../../../store/hooks';
import { CardTypeAllInOne as CardType } from '../../../types/cardTypeDefinition';
import { ConfirmDeleteModal } from '../../common/layout/ConfirmDeleteModal';
import DropDownMenu from '../../common/layout/DropDownMenu';
import Flex from '../../common/layout/Flex';
import Icon from '../../common/layout/Icon';
import { DocTextDisplay } from '../../documents/DocTextItem';
import {
  lightIconButtonStyle,
  space_lg,
  space_sm,
} from '../../styling/style';
import CardTypeRelativesSummary from './summary/CardTypeRelativesSummary';
import { TagsDisplay } from './tags/TagsDisplay';

const style = css({
  width: '280px',
  padding: space_lg,
  background: 'var(--bg-primary)',
});

const tagStyle = css({
  borderRadius: '13px',
  padding: space_sm + ' ' + space_lg,
  marginRight: space_sm,
  backgroundColor: 'var(--divider-main)',
  fontSize: '0.8em',
});

interface CardTypeItemProps {
  cardType: CardType;
  usage: 'currentProject' | 'available' | 'global';
}

export default function CardTypeItem({ cardType, usage }: CardTypeItemProps): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const i18n = useTranslations();

  const currentProjectId = useCurrentProjectId();

  const [showDelete, setShowDelete] = React.useState(false);

  return (
    <Flex direction="column" align="stretch" className={style}>
      <Flex justify="space-between">
        <h3>{cardType.title || i18n.modules.cardType.titlePlaceholder}</h3>
        <DropDownMenu
          icon={'more_vert'}
          valueComp={{ value: '', label: '' }}
          buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: '40px' }))}
          entries={[
            ...((usage === 'currentProject' &&
              currentProjectId != null &&
              cardType.projectId === currentProjectId) ||
            usage === 'global'
              ? [
                  {
                    value: 'edit',
                    label: (
                      <>
                        <Icon icon={'edit'} /> {i18n.common.edit}
                      </>
                    ),
                    action: () => navigate(`./edit/${cardType.ownId}`),
                  },
                ]
              : []),
            ...(usage === 'available' && currentProjectId && cardType.projectId !== currentProjectId
              ? [
                  {
                    value: 'useInProject',
                    label: (
                      <>
                         <Icon icon={'location_on'} />
                        {i18n.modules.cardType.action.useInProject}
                      </>
                    ),
                    action: () =>
                      dispatch(API.addCardTypeToProject({ cardType, projectId: currentProjectId })),
                  },
                ]
              : []),
            .../*!readOnly &&*/
            (usage === 'currentProject' &&
            currentProjectId != null &&
            cardType.projectId === currentProjectId &&
            cardType.kind === 'referenced'
              ? [
                  {
                    value: 'removeFromProject',
                    label: (
                      <>
                         <Icon icon={'remove'} />{' '}
                        {i18n.modules.cardType.action.removeFromProject}
                      </>
                    ),
                    action: () =>
                      dispatch(
                        API.removeCardTypeRefFromProject({ cardType, projectId: currentProjectId }),
                      ),
                  },
                ]
              : []),
            .../*!readOnly &&*/
            (cardType.kind === 'own' &&
            ((usage === 'currentProject' &&
              currentProjectId != null &&
              cardType.projectId === currentProjectId) ||
              usage === 'global')
              ? [
                  {
                    value: 'delete',
                    label: (
                      <>
                         <Icon icon={'delete'} color={'var(--error-main)'} /> {i18n.common.delete}
                      </>
                    ),
                    action: () => setShowDelete(true),
                  },
                ]
              : []),
          ]}
        />
      </Flex>
      {showDelete && cardType.kind === 'own' && (
        <>
          <ConfirmDeleteModal
            title={i18n.modules.cardType.action.deleteType}
            message={<p>{i18n.modules.cardType.action.confirmDeleteType}</p>}
            onCancel={() => setShowDelete(false)}
            onConfirm={() => dispatch(API.deleteCardType(cardType))}
            confirmButtonLabel={i18n.modules.cardType.action.deleteType}
          />
        </>
      )}
      <Flex grow={1}>
        <p>
          <DocTextDisplay id={cardType.purposeId} />
        </p>
      </Flex>
      <Flex>
        <CardTypeRelativesSummary cardType={cardType} />
      </Flex>
      <Flex>
        <TagsDisplay tags={cardType.tags} className={tagStyle} />
      </Flex>
    </Flex>
  );
}
