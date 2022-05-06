/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { ConfirmIconButton } from '../common/ConfirmIconButton';
import Flex from '../common/Flex';
import Form from '../common/Form/Form';
import Input from '../common/Form/Input';
import { ProjectBasisData } from './ProjectCreator';

// TODO UI

interface ProjectDataInitializationProps {
  data: ProjectBasisData;
  setName: (value: string) => void;
  setDescription: (value: string) => void;
  addGuest: (emailAddress: string) => void;
  removeGuest: (emailAddress: string) => void;
}

export default function ProjectDataInitialization({
  data,
  setName,
  setDescription,
  addGuest,
  removeGuest,
}: ProjectDataInitializationProps): JSX.Element {
  const i18n = useTranslations();

  return (
    <Flex>
      <Flex direction="column">
        <Input label="Project name" value={data.name} onChange={name => setName(name)} mandatory />
        <Input
          label="Project description"
          inputType="textarea"
          value={data.description}
          onChange={description => {
            setDescription(description);
          }}
        />
        <Form
          fields={[
            {
              key: 'email',
              type: 'text',
              label: 'Invite members',
              isMandatory: false,
              placeholder: 'email',
              isErroneous: value => value.email.match('.*@.*') == null,
              errorMessage: i18n.emailAddressNotValid,
            },
          ]}
          value={{ email: '' }}
          submitLabel="Add"
          className={css({ flexDirection: 'row' })}
          onSubmit={fields => {
            addGuest(fields.email);
            fields.email = '';
          }}
        />
        <Flex direction="column">
          {data.guests.map(guest => (
            <Flex key={guest}>
              <Flex>{guest}</Flex>
              <ConfirmIconButton
                icon={faTrash}
                title="Remove guest"
                onConfirm={() => removeGuest(guest)}
              />
            </Flex>
          ))}
        </Flex>
      </Flex>
      {data.projectModel && (
        <Flex direction="column">
          <Flex>{data.projectModel.name}</Flex>
          <Flex>{data.projectModel.description}</Flex>
        </Flex>
      )}
    </Flex>
  );
}

// another way to handle guest list :

//const [waitingGuest, setWaitingGuest] = React.useState<string | null>();

/* 
        <Flex>
          <Input
            label="Invite members"
            placeholder="email"
            value={waitingGuest || undefined}
            onChange={value => {
              setWaitingGuest(value);
            }}
          />
          {
            // TODO check that it is an email
            }
          <Button
            onClick={() => {
              if (waitingGuest) {
                addGuest(waitingGuest);
              }
              setWaitingGuest(null);
            }}
          >
            Add
          </Button>
        </Flex>
         */
