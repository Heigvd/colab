/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import * as React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import useTranslations from '../../../i18n/I18nContext';
import { space_L, space_M, space_S } from '../../styling/style';
import Clickable from './Clickable';
import Flex from './Flex';

interface TabProps {
  invisible?: boolean;
  name: string;
  label: string;
  children: React.ReactNode;
}

export function Tab({ children }: TabProps): JSX.Element {
  return <>{children}</>;
}

interface TabsProps {
  className?: string;
  tabsClassName?: string;
  selectedLabelClassName?: string;
  notselectedLabelClassName?: string;
  bodyClassName?: string;
  children: React.ReactElement<TabProps>[] | React.ReactElement<TabProps>;
  onSelect?: (name: string) => void;
  defaultTab?: string;
  routed?: boolean;
}

const headerStyle = css({
  flexShrink: 0,
});

const defaultTabStyle = css({
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

const defaultNotSelectedStyle = cx(
  defaultTabStyle,
  css({
    ':hover': {
      backgroundColor: 'var(--lightGray)',
    },
  }),
);

const defaultSelectedStyle = cx(
  defaultTabStyle,
  css({
    fontWeight: 'bold',
    borderBottom: '2px solid white',
  }),
);

const defaultBodyStyle = css({
  padding: space_L,
  borderRadius: '0 5px 5px 5px',
  backgroundColor: 'var(--bgColor)',
  border: '1px solid var(--lightGray)',
  alignSelf: 'stretch',
});

export default function Tabs({
  className,
  tabsClassName,
  selectedLabelClassName,
  notselectedLabelClassName,
  bodyClassName,
  children,
  onSelect,
  defaultTab,
  routed,
}: TabsProps): JSX.Element {
  const i18n = useTranslations();
  const navigate = useNavigate();
  //const location = useLocation();
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

  const [selectedTab, setTab] = React.useState<string>(defaultTab || names[0] || '');

  const onSelectTab = React.useCallback(
    (name: string) => {
      setTab(name);
      if (routed) {
        navigate(name);
      }
      if (onSelect) {
        onSelect(name);
      }
    },
    [navigate, onSelect, routed],
  );

  const child = mappedChildren[selectedTab]?.child;
 /*  React.useEffect(() => {
    if (routed) {
      const path = location.pathname.split('/');
      const tabName = path[path.length - 1] || '';
      if (names.includes(tabName)) {
        logger.info(path[path.length - 1]);
        setTab(tabName);
      }
    }
  }, [names, routed]); */

  return (
    <Flex
      direction="column"
      grow={1}
      overflow="auto"
      className={cx(css({ alignSelf: 'stretch' }), className)}
    >
      <Flex justify="space-evenly" className={headerStyle}>
        {names.map(name => {
          if (!mappedChildren[name]!.invisible) {
            return (
              <Clickable
                key={name}
                clickableClassName={
                  name === selectedTab
                    ? cx(defaultSelectedStyle, tabsClassName, selectedLabelClassName)
                    : cx(defaultNotSelectedStyle, tabsClassName, notselectedLabelClassName)
                }
                onClick={() => onSelectTab(name)}
              >
                {mappedChildren[name]!.label}
              </Clickable>
            );
          }
        })}
      </Flex>
      <Flex
        direction="column"
        grow={1}
        overflow="auto"
        className={cx(defaultBodyStyle, bodyClassName)}
      >
        {routed ? (
          <Routes>
            <Route path={`/`} element={child} />
            {mappedChildren &&
              Object.entries(mappedChildren).map(([key, value]) => {
                return <Route key={key} path={`${key}`} element={value.child} />;
              })}
          </Routes>
        ) : child != null ? (
          child
        ) : (
          <i>{i18n.common.error.missingContent}</i>
        )}
      </Flex>
    </Flex>
  );
}
