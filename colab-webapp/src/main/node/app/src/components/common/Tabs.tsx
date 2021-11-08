/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import * as React from 'react';
import Clickable from './Clickable';
import Flex from './Flex';

export interface TabProps {
  name: string;
  label: string;
  children: React.ReactNode;
}

export function Tab({ children }: TabProps): JSX.Element {
  return <>{children}</>;
}

export interface TabsProps {
  className?: string;
  children: React.ReactElement<TabProps>[] | React.ReactElement<TabProps>;
  onSelect?: (name: string) => void;
}

const headerStyle = css({
  borderBottom: `1px solid var(--primaryColorContrastShade)`,
  flexShrink: 0,
  height: '48px',
});

const buttonStyle = css({
  borderBottom: `0px solid var(--secondaryColor)`,
  flexGrow: 1,
  textAlign: 'center',
  transition: '.2s',
  paddingTop: '14px',
  cursor: 'pointer',
});

const notSelectedStyle = cx(
  buttonStyle,
  css({
    ':hover': {
      borderBottomWidth: '2px',
    },
  }),
);

const selectedStyle = cx(
  buttonStyle,
  css({
    borderBottomWidth: '4px',
  }),
);

export default function Tabs({ className, children, onSelect }: TabsProps): JSX.Element {
  const mappedChildren: Record<string, { label: string; child: React.ReactElement<TabProps> }> = {};
  const names: string[] = [];

  React.Children.forEach(children, child => {
    mappedChildren[child.props.name] = { label: child.props.label, child: child };
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
    <Flex grow={1} direction="column" className={className} overflow="auto">
      <Flex justify="space-evenly" className={headerStyle}>
        {names.map(name => (
          <Clickable
            key={name}
            clickableClassName={name === selectedTab ? selectedStyle : notSelectedStyle}
            onClick={() => onSelectTab(name)}
          >
            {mappedChildren[name]!.label}
          </Clickable>
        ))}
      </Flex>

      <Flex grow={1} direction="column" overflow="auto">
        {child != null ? child : <i>whoops</i>}
      </Flex>
    </Flex>
  );
}
