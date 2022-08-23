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
import Button from './common/element/Button';
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
          navigate('/');
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
            <h2>What is the co.LAB digital plateform ?</h2>
            <p>
              The development of this digital co-design platform was one of the goal of the co.LAB
              project. The goal is to create an intuitive, friendly and meaningful web plateform to
              create together new serious games. Two main ingredients create to heart of this web
              app:
              <ul>
                <li>
                  <b>The co.LAB framework</b>, made to easily and more efficiently co-design serious
                  games.
                </li>
                <li>
                  <b>Friendly and intuitive interfaces</b> for all types of user profiles.
                </li>
              </ul>
              We tried to create a platform for all of you to imagine the serious game you need!
              This is part of a research project. Do not hesitate to contact us for any
              recommendation you would have.
            </p>
          </div>
          <div>
            <h2>What is the co.LAB project ?</h2>
            <p>
              The goal of the co.LAB project is to improve the design, development and uses of
              Digital Learning Games. This goal will be achieved by the development of a
              collaborative methodological framework associated with a collaborative digital
              platform dedicated to co-design, co-development and co-evaluation of digital learning
              games. The co.LAB project has been elected for a four-year grant by the Swiss National
              Science Foundation (SNF) in the frame of the NRP 77 program “Digital Transformation”
            </p>
          </div>
          <div>
            <p>
              <b>Do you want to visit the official co.LAB project website?</b>
            </p>
            <Button
              onClick={() => window.open('https://www.colab-project.ch/', '_blank')}
              className={css({ marginTop: space_M })}
            >
              Here it is!
            </Button>
          </div>
        </Flex>
      </Flex>
    </div>
  );
}
