/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../i18n/I18nContext';
import { useVersionDetails } from '../store/selectors/configSelector';
import Logo from '../styling/Logo';
import { space_lg } from '../styling/style';
import Flex from './common/layout/Flex';

/**
 * Some informations about the co.LAB platform and the co.LAB project
 */
export default function AboutColab(): JSX.Element {
  const i18n = useTranslations();

  const version = useVersionDetails();

  return (
    <Flex direction="column" align="stretch">
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
                {i18n.colabPage.furtherInfo}
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
