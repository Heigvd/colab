/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Illustration } from 'colab-rest-client';
import * as React from 'react';
import { emailFormat } from '../../helper';
import useTranslations from '../../i18n/I18nContext';
import Button from '../common/element/Button';
import { ConfirmIconButton } from '../common/element/ConfirmIconButton';
import IllustrationDisplay from '../common/element/IllustrationDisplay';
import { FormInput } from '../common/element/Input';
import Form from '../common/Form/Form';
import Flex from '../common/layout/Flex';
import {
  borderRadius,
  invertedButtonStyle,
  lightIconButtonStyle,
  space_L,
  space_M,
  space_S,
  textSmall,
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
  padding: space_S,
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
    <Flex className={css({ alignSelf: 'stretch' })}>
      <Flex
        direction="column"
        align="stretch"
        className={css({ width: '45%', minWidth: '45%', marginRight: space_L })}
      >
        <FormInput
          label="Name"
          value={data.name}
          readOnly={readOnly}
          onChange={name => setName(name)}
        />
        <FormInput
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
      <Flex direction="column" align="stretch" className={css({ width: '55%' })}>
        <Flex
          className={css({
            minWidth: '100%',
            height: '80px',
            marginBottom: space_M,
            position: 'relative',
          })}
          onClick={() => setEditIllustration(true)}
        >
          <IllustrationDisplay illustration={currentIllustration} />
          <Flex
            align="flex-end"
            justify="flex-end"
            className={projectIllustrationOverlay}
            title="Edit project illustration"
          >
            <FontAwesomeIcon icon={faPen} color={'var(--bgColor)'} />
          </Flex>
        </Flex>
        {editIllustration && (
          <Flex
            direction="column"
            align="stretch"
            className={css({
              padding: space_M,
              border: '1px solid var(--lightGray)',
              borderRadius: borderRadius,
              marginBottom: space_M,
            })}
          >
            <ProjectIllustrationMaker
              illustration={
                currentIllustration || data.projectModel?.illustration || defaultProjectIllustration
              }
              setIllustration={setCurrentIllustration}
              iconContainerClassName={css({ marginBottom: space_S, maxHeight: '100px' })}
            />
            <Flex justify="flex-end" className={css({ gap: space_S })}>
              <Button onClick={() => setEditIllustration(false)} invertedButton>
                cancel
              </Button>
              <Button
                onClick={() => {
                  setIllustration(currentIllustration);
                  setEditIllustration(false);
                }}
              >
                OK
              </Button>
            </Flex>
          </Flex>
        )}
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
