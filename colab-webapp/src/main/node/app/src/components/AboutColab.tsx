/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslations from '../i18n/I18nContext';
import { useVersionDetails } from '../selectors/configSelector';
import IconButton from './common/element/IconButton';
import Flex from './common/layout/Flex';
import Logo from './styling/Logo';
import { space_lg } from './styling/style';

export default function AboutColab(): JSX.Element {
  const i18n = useTranslations();
  const navigate = useNavigate();

  const version = useVersionDetails();

  return (
    <Flex direction="column" align="stretch">
      <IconButton
        icon={'arrow_back'}
        title={i18n.common.back}
        onClick={() => {
          navigate(-1);
        }}
      />
      <Flex direction="column" align="center">
        <Logo
          className={css({
            width: '25vw',
            minWidth: '200px',
            padding: space_lg,
            alignSelf: 'center',
            marginBottom: space_lg,
          })}
        />
        <Flex direction="column" gap={space_lg} className={css({ maxWidth: '800px' })}>
          <div>
            <h2>{i18n.colabPage.whatColab}</h2>
            <p>{i18n.colabPage.colabDescription}</p>
            <ul>
              <li>
                <b>
                  <a href="https://games.jmir.org/2021/3/e28674/" target="_blank" rel="noreferrer">
                    {i18n.colabPage.colabFramework}
                  </a>
                </b>{' '}
                {i18n.colabPage.supportsCoDesign}
              </li>
              <li>
                <b>{i18n.colabPage.friendlyInterfaces}</b>
                {i18n.colabPage.forAll}
              </li>
            </ul>
            <p>{i18n.colabPage.slogan}</p>
            <p>{i18n.colabPage.contactUs}</p>
          </div>
          <div>
            <h2>{i18n.colabPage.whatColabProject}</h2>
            <p>{i18n.colabPage.colabProjectDescription}</p>
          </div>
          <div>
            <p>
              <b>
                {i18n.colabPage.futherInfo}
                <a href="https://www.colab-project.ch/" target="_blank" rel="noreferrer">
                  {i18n.colabPage.colabProject}
                </a>
              </b>
            </p>
          </div>
        </Flex>
      </Flex>
      <div className={css({ flexGrow: 1 })}></div>
      {version != 'LOADING' && (
        <div
          className={css({
            fontStyle: 'italic',
            alignSelf: 'center',
            color: 'var(--text-secondary)',
          })}
        >
          {i18n.colabPage.version} {version.dockerImages ? version.dockerImages : 'dev'} (build #
          {version.buildNumber ? version.buildNumber : 'ninja'})
        </div>
      )}
    </Flex>
  );
}
