/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { useEffect, useRef } from 'react';
import {
  disabledStyle,
  foregroundStyle,
  space_sm,
} from '../../styling/style';
import Flex from './Flex';
import Icon from './Icon';

export const itemStyle = css({
  padding: '5px 8px',
});

const entryStyle = css({
  display: 'flex',
  gap: space_sm,
  alignItems: 'center',
  textDecoration: 'none',
  color: 'var(--text-primary)',
  ':focus': {
    outlineStyle: 'inset',
  },
  ':hover': {
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
  },
});

const dropDownEntryPadding = css({
  padding: space_sm,
});

const commonStyle = cx(
  foregroundStyle,
  css({
    backgroundColor: 'var(--bg-primary)',
    transition: 'all 0.3s',
    position: 'fixed',
    overflow: 'auto',
    maxHeight: '500px',
    maxWidth: '500px',
    whiteSpace: 'nowrap',
  }),
);

const dashStyle = css({
  width: '26px',
  height: '2px',
  background: '#666',
  display: 'block',
  position: 'relative',
  transition: 'all .3s ease-in-out',
});

const pseudoStyle = css({
  content: '""',
  position: 'absolute',
  visibility: 'visible',
  opacity: '1',
  left: '0',
  display: 'inline-block',
  borderRadius: '1px',
});

const buttonStyle = cx(
  dashStyle,
  css({
    '&:before': cx(dashStyle, pseudoStyle, css({ top: '-8px' })),
    '&:after': cx(dashStyle, pseudoStyle, css({ top: '8px' })),
  }),
);

const openButtonStyle = cx(
  dashStyle,
  css({
    background: '0 0',
    '&:before': cx(dashStyle, pseudoStyle, css({ top: 0, transform: 'rotate(-45deg)' })),
    '&:after': cx(dashStyle, pseudoStyle, css({ top: 0, transform: 'rotate(45deg)' })),
  }),
);
interface ContainerValues {
  left: number;
  width: number;
  top: number;
  height: number;
}

function overflowLeft(values: ContainerValues) {
  return values.left < 0;
}
function overflowRight(values: ContainerValues) {
  return values.left + values.width > window.innerWidth;
}
function ajustHorizontally(values: ContainerValues) {
  const newValues = values;

  // Check left
  if (overflowLeft(newValues)) {
    // Move right
    newValues.left = 0;
  }
  // Check right
  if (overflowRight(newValues)) {
    // Move left
    newValues.left = window.innerWidth - newValues.width - 5;
  }
  // Check left again
  if (overflowLeft(newValues)) {
    // Move right
    newValues.left = 0;
    // Element too big, shrink width
    newValues.width = window.innerWidth;
  }
  return newValues;
}
function overflowTop(values: ContainerValues) {
  return values.top < 0;
}
function overflowBottom(values: ContainerValues) {
  return values.top + values.height > window.innerHeight;
}
function ajustVertically(values: ContainerValues) {
  const newValues = values;

  // Check top
  if (overflowTop(newValues)) {
    // Move bottom
    newValues.top = 0;
  }
  // Check bottom
  if (overflowBottom(newValues)) {
    // Move top
    newValues.top = window.innerHeight - newValues.height;
  }
  // Check top again
  if (overflowTop(newValues)) {
    // Move bottom
    newValues.top = 0;
    // Element too big, shrink height
    newValues.height = window.innerHeight;
  }
  return newValues;
}
function ajustVerticalOverlap(values: ContainerValues, parent: HTMLElement) {
  let newTopUp = parent.getBoundingClientRect().top - values.height;
  const newTopDown = parent.getBoundingClientRect().top + parent.getBoundingClientRect().height;
  let newHeightUp = values.height;
  let newHeightDown = values.height;

  if (newTopUp < 0) {
    newTopUp = 0;
    newHeightUp = parent.getBoundingClientRect().top;
  }
  if (newTopDown + newHeightDown > window.innerHeight) {
    newHeightDown = window.innerHeight - newTopDown;
  }

  if (newHeightUp > newHeightDown) {
    return {
      ...values,
      top: newTopUp,
      height: newHeightUp,
    };
  } else {
    return {
      ...values,
      top: newTopDown,
      height: newHeightDown,
    };
  }
}

function ajustHorizontalOverlap(values: ContainerValues, parent: HTMLElement) {
  let newLeftUp = parent.getBoundingClientRect().left - values.width;
  const newLeftDown = parent.getBoundingClientRect().left + parent.getBoundingClientRect().width;
  let newWidthUp = values.width;
  let newWidthDown = values.width;

  if (newLeftUp < 0) {
    newLeftUp = 0;
    newWidthUp = parent.getBoundingClientRect().left;
  }
  if (newLeftDown + newWidthDown > window.innerWidth) {
    newWidthDown = window.innerWidth - newLeftDown;
  }

  if (newWidthUp > newWidthDown) {
    return {
      ...values,
      left: newLeftUp,
      width: newWidthUp,
    };
  } else {
    return {
      ...values,
      left: newLeftDown,
      width: newWidthDown,
    };
  }
}
interface ParentAndChildrenRectangles {
  childrenTop: number;
  childrenLeft: number;
  childrenBottom: number;
  childrenRight: number;
  parentTop: number;
  parentLeft: number;
  parentBottom: number;
  parentRight: number;
}

export type DropDownDirection = 'left' | 'down' | 'right' | 'up';
function valuesToSides(values: ContainerValues, parent: HTMLElement): ParentAndChildrenRectangles {
  const { top: childrenTop, left: childrenLeft } = values;
  const childrenBottom = childrenTop + values.height;
  const childrenRight = childrenLeft + values.width;

  const { top: parentTop, left: parentLeft } = parent.getBoundingClientRect();
  const parentBottom = parentTop + parent.getBoundingClientRect().height;
  const parentRight = parentLeft + parent.getBoundingClientRect().width;

  return {
    childrenTop,
    childrenLeft,
    childrenBottom,
    childrenRight,
    parentTop,
    parentLeft,
    parentBottom,
    parentRight,
  };
}
function isOverlappingHorizontally(values: ContainerValues, parent: HTMLElement) {
  const { childrenRight, parentLeft, childrenLeft, parentRight } = valuesToSides(values, parent);
  if (childrenRight <= parentLeft || childrenLeft >= parentRight) {
    return false;
  }

  return true;
}

function isOverlappingVertically(values: ContainerValues, parent: HTMLElement) {
  const { childrenBottom, parentTop, childrenTop, parentBottom } = valuesToSides(values, parent);
  if (childrenBottom <= parentTop || childrenTop >= parentBottom) {
    return false;
  }

  return true;
}

export function justifyDropMenu(
  menu: HTMLElement | null,
  selector: HTMLElement | undefined | null,
  direction: DropDownDirection,
) {
  const vertical = direction === 'down' || direction === 'up';

  if (menu != null && selector != null) {
    const { width: containerWidth, height: containerHeight } = menu.getBoundingClientRect();

    let values: ContainerValues = {
      left: vertical
        ? selector.getBoundingClientRect().left
        : direction === 'left'
        ? selector.getBoundingClientRect().left - containerWidth
        : selector.getBoundingClientRect().left + selector.getBoundingClientRect().width,
      width: containerWidth,
      top: !vertical
        ? selector.getBoundingClientRect().top
        : direction === 'up'
        ? selector.getBoundingClientRect().top - containerHeight
        : selector.getBoundingClientRect().top + selector.getBoundingClientRect().height,
      height: containerHeight,
    };

    // moving menu list into the visible window
    values = ajustHorizontally(values);
    values = ajustVertically(values);

    if (vertical && isOverlappingVertically(values, selector)) {
      values = ajustVerticalOverlap(values, selector);
    } else if (!vertical && isOverlappingHorizontally(values, selector)) {
      values = ajustHorizontalOverlap(values, selector);
    }

    menu.style.setProperty('left', values.left + 'px');
    if (values.width !== containerWidth) {
      menu.style.setProperty('width', values.width + 'px');
    }
    menu.style.setProperty('top', values.top + 'px');
    menu.style.setProperty('height', values.height + 'px');
    menu.style.setProperty('position', 'fixed');
  }
}

export interface Entry<T> {
  value: T;
  label: React.ReactNode;
  action?: () => void;
  disabled?: boolean;
}

export interface DropDownMenuProps<T> {
  icon?: string;
  title?: string;
  menuIcon?: 'BURGER' | 'CARET';
  idleHoverStyle?: 'BACKGROUND' | 'FOREGROUND';
  entries: Entry<T>[];
  value?: T;
  direction?: DropDownDirection;
  height?: string;
  valueComp?: Entry<T>;
  onSelect?: (value: Entry<T>) => void;
  buttonClassName?: string;
  dropClassName?: string;
}
export default function DropDownMenu<T extends string | number | symbol>({
  icon,
  title,
  entries,
  value,
  valueComp,
  onSelect,
  direction = 'down',
  menuIcon,
  buttonClassName,
  dropClassName,
}: DropDownMenuProps<T>): JSX.Element {
  const [open, setOpen] = React.useState<boolean>(false);

  const dropRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: Event) => {
    if (dropRef.current && !dropRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  });

  const toggle = React.useCallback(() => {
    setOpen(open => !open);
  }, []);

  const clickIn = React.useCallback((event: React.MouseEvent<HTMLDivElement> | undefined) => {
    if (event != null) {
      event.stopPropagation();
    }
  }, []);

  if (entries.length > 0) {
    const current =
      valueComp != null ? valueComp : entries.find(entry => entry.value === value) || entries[0]!;

    return (
      <div ref={dropRef} onClick={clickIn} className={css({ cursor: 'pointer' })}>
        <Flex direction="column" className={css({ overflow: 'visible' })}>
          <Flex
            align="center"
            title={title}
            onClick={toggle}
            className={
              cx(buttonClassName) +
              ' dropDownButton'
            }
          >
            {menuIcon === 'BURGER' && (
              <span className={open ? openButtonStyle : buttonStyle}></span>
            )}
            {icon &&
                <Icon icon={icon} />
              }
            {current.label && current.label}
            {menuIcon === 'CARET' && (
               <Icon icon={'expand_more'} className={css({ marginLeft: space_sm })} />
            )}
          </Flex>
          {open && (
            <div
              className={commonStyle + (dropClassName || '')}
              ref={n => {
                justifyDropMenu(n, n?.parentElement?.querySelector('.dropDownButton'), direction);
              }}
            >
              {entries.map(entry => (
                <div
                  className={cx(
                    entryStyle,
                    {
                      [disabledStyle]: entry.disabled,
                    },
                    dropDownEntryPadding,
                  )}
                  key={String(entry.value)}
                  onClick={() => {
                    if (entry.action) {
                      entry.action();
                    }
                    if (onSelect != null) {
                      onSelect(entry);
                    }
                    setOpen(false);
                  }}
                >
                  {entry.label}
                </div>
              ))}
            </div>
          )}
        </Flex>
      </div>
    );
  } else {
    return <></>;
  }
}
