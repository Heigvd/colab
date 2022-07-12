/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Illustration } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { ConfirmIconButton } from '../common/element/ConfirmIconButton';
import IllustrationDisplay from '../common/element/IllustrationDisplay';
import { BlockInput } from '../common/element/Input';
import Form, { emailFormat } from '../common/Form/Form';
import Flex from '../common/layout/Flex';
import {
  invertedButtonStyle,
  lightIconButtonStyle,
  space_L,
  space_M,
  space_S,
  textSmall,
} from '../styling/style';
import { defaultProjectIllustration } from './ProjectCommon';
import { ProjectCreationData } from './ProjectCreator';

interface ProjectDataInitializationProps {
  data: ProjectCreationData;
  readOnly?: boolean;
  setName: (value: string) => void;
  setDescription: (value: string) => void;
  setIllustration: (value: Illustration) => void;
  addGuest: (emailAddress: string) => void;
  removeGuest: (emailAddress: string) => void;
}

export default function ProjectDataInitialization({
  data,
  readOnly,
  setName,
  setDescription,
  //setIllustration,
  addGuest,
  removeGuest,
}: ProjectDataInitializationProps): JSX.Element {
  const i18n = useTranslations();

  return (
    <Flex className={css({ alignSelf: 'stretch' })}>
      <Flex
        direction="column"
        align="stretch"
        className={css({ width: '50%', minWidth: '50%', marginRight: space_L })}
      >
        <BlockInput
          label="Name"
          value={data.name}
          readOnly={readOnly}
          onChange={name => setName(name)}
        />
        <BlockInput
          label="Description"
          inputType="textarea"
          value={data.description}
          readOnly={readOnly}
          onChange={description => {
            setDescription(description);
          }}
        />

        {/* <IllustrationPicker data={data.illustration} onChange={setIllustration} /> */}

        <Form
          fields={[
            {
              key: 'email',
              label: 'Invite members',
              placeholder: 'email',
              type: 'text',
              isMandatory: false,
              readOnly: readOnly,
              isErroneous: value =>
                value.email.length > 0 && value.email.match(emailFormat) == null,
              errorMessage: i18n.authentication.error.emailAddressNotValid,
            },
          ]}
          value={{ email: '' }}
          onSubmit={fields => {
            if (!readOnly) {
              addGuest(fields.email);
              fields.email = '';
            }
          }}
          submitLabel={i18n.common.add}
          className={css({ flexDirection: 'row', alignItems: 'flex-end' })}
          buttonClassName={cx(css({ alignSelf: 'flex-end', margin: space_S }), invertedButtonStyle)}
        />

        <Flex direction="column">
          {data.guests.map(guest => (
            <Flex align="center" key={guest} className={css({ marginTop: space_S })}>
              <Flex className={textSmall}>{guest}</Flex>
              {!readOnly && (
                <ConfirmIconButton
                  icon={faTrash}
                  title="Remove guest"
                  onConfirm={() => removeGuest(guest)}
                  className={lightIconButtonStyle}
                />
              )}
            </Flex>
          ))}
        </Flex>
      </Flex>
      <Flex direction="column" className={css({ width: '50%' })}>
        <Flex
          className={css({
            minWidth: '100%',
            height: '80px',
            marginBottom: space_M,
          })}
        >
          <IllustrationDisplay
            illustration={
              !data.projectModel
                ? {
                    '@class': 'Illustration',
                    iconLibrary: 'FONT_AWESOME_REGULAR',
                    iconKey: 'file',
                  }
                : data.projectModel.illustration || { ...defaultProjectIllustration }
            }
          />
        </Flex>
        <h2>
          {data.projectModel
            ? data.projectModel.name
              ? data.projectModel.name
              : 'New project'
            : 'Empty project'}
        </h2>
        <Flex className={textSmall}>
          {data.projectModel
            ? data.projectModel.description
              ? data.projectModel.description
              : 'No description'
            : "Use this empty project and you'll be free to create a whole new world"}
        </Flex>
      </Flex>
    </Flex>
  );
}
