/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import * as React from 'react';
import { space_L, space_M, space_S } from '../styling/style';
import Clickable from './Clickable';
import Flex from './Flex';

export interface TabProps {
  invisible?: boolean;
  name: string;
  label: string;
  children: React.ReactNode;
}

export function Tab({ children }: TabProps): JSX.Element {
  return <>{children}</>;
}

export interface TabsProps {
  className?: string;
  bodyClassName?: string;
  tabsClassName?: string;
  selectedLabelClassName?: string;
  notselectedLabelClassName?: string;
  children: React.ReactElement<TabProps>[] | React.ReactElement<TabProps>;
  onSelect?: (name: string) => void;
}

const headerStyle = css({
  flexShrink: 0,
});

const buttonStyle = css({
  flexGrow: 1,
  textAlign: 'center',
  transition: '.2s',
  padding: space_M,
  backgroundColor: 'var(--bgColor)',
  cursor: 'pointer',
  borderRadius: '5px 5px 0 0',
  border: '1px solid var(--lightGray)',
  marginRight: space_S,
  fontSize: '0.9em',
  zIndex: 1,
  marginBottom: '-2px',
});

const notSelectedStyle = cx(
  buttonStyle,
  css({
    ':hover': {
      backgroundColor: 'var(--lightGray)',
    },
  }),
);

const selectedStyle = cx(
  buttonStyle,
  css({
    fontWeight: 'bold',
    borderBottom: '2px solid white',
  }),
);

const bodyStyle = css({
  padding: space_L,
  borderRadius: '0 5px 5px 5px',
  backgroundColor: 'var(--bgColor)',
  border: '1px solid var(--lightGray)',
  alignSelf: 'stretch',
});

export default function Tabs({
  className,
  bodyClassName,
  tabsClassName,
  selectedLabelClassName,
  notselectedLabelClassName,
  children,
  onSelect,
}: TabsProps): JSX.Element {
  const mappedChildren: Record<
    string,
    { label: string; child: React.ReactElement<TabProps>; invisible?: boolean }
  > = {};
  const names: string[] = [];

  React.Children.forEach(children, child => {
    mappedChildren[child.props.name] = {
      label: child.props.label,
      child: child,
      invisible: child.props.invisible,
    };
    names.push(child.props.name);
  });

  const [selectedTab, setTab] = React.useState<string>(names[0] || '');

  const onSelectTab = React.useCallback(
    (name: string) => {
      setTab(name);
      if (onSelect) {
        onSelect(name);
      }
    },
    [onSelect],
  );

  const child = mappedChildren[selectedTab]?.child;

  return (
    <Flex
      grow={1}
      direction="column"
      className={cx(css({ alignSelf: 'stretch' }), className)}
      overflow="auto"
    >
      <Flex justify="space-evenly" className={headerStyle}>
        {names.map(name => {
          if (!mappedChildren[name]!.invisible) {
            return (
              <Clickable
                key={name}
                clickableClassName={
                  name === selectedTab
                    ? cx(selectedStyle, tabsClassName, selectedLabelClassName)
                    : cx(notSelectedStyle, tabsClassName, notselectedLabelClassName)
                }
                onClick={() => onSelectTab(name)}
              >
                {mappedChildren[name]!.label}
              </Clickable>
            );
          }
        })}
      </Flex>
      <Flex grow={1} direction="column" overflow="auto" className={cx(bodyStyle, bodyClassName)}>
        {child != null ? child : <i>whoops</i>}
      </Flex>
    </Flex>
  );
}
