/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Flex from '../common/Flex';
import FormContainer from '../common/FormContainer';

export default function NewPasswordSent(): JSX.Element {
  const navigate = useNavigate();

  return (
    <FormContainer>
      <Flex direction="column">
        <h3>Check your mailbox!</h3>
        <p>
          {' '}
          We sent you a link to change your password. Change it, make it safe, and back to login to
          continue colabbing!
        </p>
        <Button onClick={() => navigate('/SignIn')}>Back to login</Button>
      </Flex>
    </FormContainer>
  );
}
