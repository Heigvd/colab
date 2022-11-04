/*
 * The coLAB project
 * Copyright (C) 2021-2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch, useLoadingState } from '../../store/hooks';
import Button from '../common/element/Button';
import Form, { Field } from '../common/element/Form';
import IconButton from '../common/element/IconButton';
import OpenCloseModal from '../common/layout/OpenCloseModal';
import { lightIconButtonStyle, space_M } from '../styling/style';
import { ResourcesCtx } from './ResourcesMainView';

interface ResourceCreationType {
  title: string;
  // category: string;
  atCardContentLevel: boolean;
}

const defaultData: ResourceCreationType = {
  title: '',
  // category: '',
  atCardContentLevel: false,
};

interface ResourceCreatorProps {
  onCreated: (newId: number) => void;
  collapsedClassName?: string;
  customButton?: React.ReactNode;
}

export default function ResourceCreator({
  onCreated,
  customButton,
}: ResourceCreatorProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { resourceOwnership, publishNewResource } = React.useContext(ResourcesCtx);

  const { isLoading, startLoading, stopLoading } = useLoadingState();

  // const { categories: allCategories } = useAndLoadResourceCategories();

  const fields: Field<ResourceCreationType>[] = [
    {
      key: 'title',
      label: i18n.common.title,
      type: 'text',
      isMandatory: true,
    },
    // createSelectField({
    //   key: 'category',
    //   label: i18n.modules.resource.category,
    //   type: 'select',
    //   isMandatory: false,
    //   isMulti: false,
    //   canCreateOption: true,
    //   options: allCategories.map(c => ({ label: c, value: c })),
    //   tip: i18n.modules.resource.categorytip,
    // }),
  ];

  if (resourceOwnership.kind === 'CardOrCardContent' && resourceOwnership.hasSeveralVariants) {
    fields.push({
      key: 'atCardContentLevel',
      label: i18n.modules.resource.onlyForVariant,
      type: 'boolean',
      isMandatory: false,
      showAs: 'checkbox',
    });
  }

  const onSubmit = React.useCallback(
    (resourceToCreate: ResourceCreationType, close: () => void) => {
      startLoading();

      let cardTypeId: number | null | undefined = null;
      let cardId: number | null = null;
      let cardContentId: number | null = null;
      if (resourceOwnership.kind == 'CardType') {
        cardTypeId = resourceOwnership.cardTypeId;
      } else {
        if (resourceToCreate.atCardContentLevel) {
          cardContentId = resourceOwnership.cardContentId || null;
        } else {
          cardId = resourceOwnership.cardId || null;
        }
      }

      dispatch(
        API.createResource({
          abstractCardTypeId: cardTypeId,
          cardId: cardId,
          cardContentId: cardContentId,
          documents: [],
          title: resourceToCreate.title,
          category: null, //resourceToCreate.category,
          published: !!publishNewResource,
        }),
      ).then(action => {
        stopLoading();

        if (onCreated != null) {
          if (action.meta.requestStatus === 'fulfilled') {
            if (typeof action.payload === 'number') {
              onCreated(action.payload);
            }
          }
        }

        close();
      });
    },
    [startLoading, resourceOwnership, dispatch, publishNewResource, stopLoading, onCreated],
  );

  return (
    <OpenCloseModal
      title={i18n.modules.document.createADocument}
      collapsedChildren={
        customButton ? (
          customButton
        ) : (
          <IconButton
            icon={faPlus}
            title={i18n.modules.document.createDocument}
            className={lightIconButtonStyle}
          />
        )
      }
      className={css({ display: 'block', textAlign: 'center', alignSelf: 'center' })}
    >
      {close => (
        <Form
          fields={fields}
          value={defaultData}
          onSubmit={resource => onSubmit(resource, close)}
          submitLabel={i18n.common.create}
          isSubmitInProcess={isLoading}
          className={css({ alignSelf: 'center' })}
          childrenClassName={css({
            flexDirection: 'row-reverse',
            alignItems: 'center',
            justifyContent: 'end',
          })}
        >
          <Button onClick={close} invertedButton className={css({ margin: space_M })}>
            {i18n.common.cancel}
          </Button>
        </Form>
      )}
    </OpenCloseModal>
  );
}
