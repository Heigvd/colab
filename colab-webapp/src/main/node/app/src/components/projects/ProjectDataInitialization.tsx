/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Illustration } from 'colab-rest-client';
import * as React from 'react';
import { emailFormat } from '../../helper';
import useTranslations from '../../i18n/I18nContext';
import Button from '../common/element/Button';
import { ConfirmIconButton } from '../common/element/ConfirmIconButton';
import Form from '../common/element/Form';
import IllustrationDisplay from '../common/element/IllustrationDisplay';
import { FormInput } from '../common/element/Input';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import {
  invertedButtonStyle,
  labelStyle,
  lightIconButtonStyle,
  space_lg,
  space_sm,
  text_sm,
} from '../styling/style';
import { defaultProjectIllustration } from './ProjectCommon';
import { ProjectCreationData } from './ProjectCreator';
import { ProjectIllustrationMaker } from './ProjectIllustrationMaker';

const projectIllustrationOverlay = css({
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  opacity: 0,
  padding: space_sm,
  '&:hover': {
    backgroundColor: 'rgba(256, 256, 256, 0.4)',
    opacity: 1,
    cursor: 'pointer',
  },
});

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
  setIllustration,
  addGuest,
  removeGuest,
}: ProjectDataInitializationProps): JSX.Element {
  const i18n = useTranslations();

  const [editIllustration, setEditIllustration] = React.useState<boolean>(false);
  const [currentIllustration, setCurrentIllustration] = React.useState<Illustration>(
    data.projectModel?.illustration || defaultProjectIllustration,
  );

  return (
    <Flex align="stretch" className={css({ alignSelf: 'stretch' })} direction="column">
      <div className={labelStyle}>{i18n.modules.project.settings.icon}</div>
      {editIllustration ? (
        <Flex
          direction="column"
          align="stretch"
          className={css({
            padding: space_lg,
            border: '1px solid var(--primary-main)',
            marginBottom: space_lg,
          })}
        >
          <ProjectIllustrationMaker
            illustration={
              currentIllustration || data.projectModel?.illustration || defaultProjectIllustration
            }
            setIllustration={setCurrentIllustration}
            iconContainerClassName={css({ marginBottom: space_sm, maxHeight: '100px' })}
          />
          <Flex justify="flex-end" className={css({ gap: space_sm })}>
            <Button onClick={() => setEditIllustration(false)} invertedButton>
              {i18n.common.cancel}
            </Button>
            <Button
              onClick={() => {
                setIllustration(currentIllustration);
                setEditIllustration(false);
              }}
            >
              {i18n.common.ok}
            </Button>
          </Flex>
        </Flex>
      ) : (
        <Flex
          className={css({
            minWidth: '100%',
            height: '80px',
            marginBottom: space_sm,
            position: 'relative',
          })}
          onClick={() => setEditIllustration(true)}
        >
          <IllustrationDisplay illustration={currentIllustration} />
          <Flex
            align="flex-end"
            justify="flex-end"
            className={projectIllustrationOverlay}
            title={i18n.modules.project.actions.editIllustration}
          >
            <Icon icon={'edit'} color={'var(--bg-primary)'} />
          </Flex>
        </Flex>
      )}
      <FormInput
        label={i18n.common.name}
        value={data.name}
        readOnly={readOnly}
        onChange={name => setName(name)}
      />
      <FormInput
        label={i18n.common.description}
        inputType="textarea"
        value={data.description}
        readOnly={readOnly}
        onChange={description => {
          setDescription(description);
        }}
      />

      {/* <IllustrationPicker data={data.illustration} onChange={setIllustration} /> */}

      <Flex
        direction="column"
        className={css({
          paddingTop: space_lg,
          marginTop: space_lg,
          borderTop: '1px solid var(--divider-main)',
        })}
      >
        <Form
          fields={[
            {
              key: 'email',
              label: i18n.team.inviteMembers,
              placeholder: i18n.authentication.field.emailAddress,
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
          buttonClassName={cx(css({ alignSelf: 'flex-end', margin: space_sm }), invertedButtonStyle)}
        />

        <Flex direction="column">
          {data.guests.map(guest => (
            <Flex align="center" key={guest} className={css({ marginTop: space_sm })}>
              <Flex className={text_sm}>{guest}</Flex>
              {!readOnly && (
                <ConfirmIconButton
                  icon={'delete'}
                  title={i18n.team.removeGuest}
                  onConfirm={() => removeGuest(guest)}
                  className={lightIconButtonStyle}
                />
              )}
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
}
