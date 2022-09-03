/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import IconButton from './common/element/IconButton';
import Flex from './common/layout/Flex';
import Logo from './styling/Logo';
import { paddedContainerStyle, space_M } from './styling/style';

export default function AboutColab(): JSX.Element {
  const navigate = useNavigate();
  return (
    <div className={paddedContainerStyle}>
      <IconButton
        icon={faArrowLeft}
        title={'Back'}
        onClick={() => {
          navigate(-1);
        }}
      />
      <Flex direction="column" align="center">
        <Logo
          className={css({
            width: '25vw',
            minWidth: '200px',
            padding: space_M,
            alignSelf: 'center',
            marginBottom: space_M,
          })}
        />
        <Flex direction="column" gap={space_M} className={css({ maxWidth: '800px' })}>
          <div>
            <h2>What is the co.LAB design platform ?</h2>
            <p>
              The design platform is one of the deliverables of the co.LAB project. Our goal is to
              create an intuitive, friendly and meaningful web platform, that should facilitate the
              collaboration during serious games design. Two main ingredients are at the heart of
              the platform:
              <ul>
                <li>
                  <b>
                    The{' '}
                    <a
                      href="https://games.jmir.org/2021/3/e28674/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      co.LAB framework
                    </a>
                  </b>{' '}
                  that support the co-design serious games.
                </li>
                <li>
                  <b>Friendly and intuitive interfaces</b> for all user profiles.
                </li>
              </ul>
              We want to create a platform for all of you, that let to imagine and design the
              serious game you need !
            </p>
            <p>Do not hesitate to contact us for any recommendation you may have.</p>
          </div>
          <div>
            <h2>What is the co.LAB project ?</h2>
            <p>
              The goal of the co.LAB project is to improve the design, development and uses of
              digital learning games. This goal will be achieved by the development of a
              collaborative methodological framework associated with a ollaborative digital platform
              dedicated to co-design, co-development and co-evaluation of digital learning games.
              The co.LAB project is founded by the Swiss National Science Foundation (SNF) in the
              frame of the NRP 77 program “Digital Transformation”.
            </p>
          </div>
          <div>
            <p>
              <b>
                Do you want to learn more about the{' '}
                <a href="https://www.colab-project.ch/" target="_blank" rel="noreferrer">
                  co.LAB project
                </a>{' '}
                or{' '}
                <a href="https://www.colab-project.ch/about" target="_blank" rel="noreferrer">
                  contact us
                </a>
                ?
              </b>
            </p>
          </div>
        </Flex>
      </Flex>
    </div>
  );
}
