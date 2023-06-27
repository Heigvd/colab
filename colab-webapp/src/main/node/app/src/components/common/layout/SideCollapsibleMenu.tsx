/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import {
  activeIconButtonStyle,
  ghostIconButtonStyle,
  iconButtonStyle,
} from '../../../styling/style';
import Button from '../element/Button';
import Flex from './Flex';
import { SideCollapsibleCtx } from './SideCollapsibleContext';

export interface SideCollapsibleMenuProps {
  defaultOpenKey?: string;
  className?: string;
  itemClassName?: string;
}

export default function SideCollapsibleMenu({
  defaultOpenKey,
  className,
  itemClassName,
}: SideCollapsibleMenuProps): JSX.Element {
  const { items, openKey, setOpenKey } = React.useContext(SideCollapsibleCtx);

  React.useEffect(() => {
    if (defaultOpenKey && setOpenKey) {
      setOpenKey(defaultOpenKey);
    }
  }, [defaultOpenKey, setOpenKey]);

  return (
    <Flex
      direction="column"
      justify="flex-start"
      align="stretch"
      className={cx(
        className /* {
        [css({ width: '0px', overflow: 'hidden', transition: '0.5s' })]: openKey !== undefined,
      } */,
      )}
    >
      {Object.entries(items).map(([key, item]) => (
        <>
          <Button
            kind="unstyled"
            key={key}
            icon={item.icon}
            title={item.title}
            size="xs"
            onClick={() => {
              if (setOpenKey) {
                setOpenKey(itemKey => (itemKey === key ? undefined : key));
              }
            }}
            className={cx(
              iconButtonStyle,
              ghostIconButtonStyle,
              {
                [activeIconButtonStyle]: openKey === key,
              },
              css({ borderRadius: 0 }),
              itemClassName,
              item.className,
            )}
          >
            {item.nextToIconElement}
          </Button>
        </>
      ))}
    </Flex>
  );
}
