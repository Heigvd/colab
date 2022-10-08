/*
 * The coLAB project
 * Copyright (C) 2022 maxence
 *
 * Licensed under the MIT License
 */

import * as React from 'react';

import * as fas from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function isIconDef(icon: unknown): icon is fas.IconDefinition {
  if (icon != null && typeof icon === 'object' && 'icon' in icon) {
    return true;
  }
  return false;
}

function convertToSvg(iconName: string): string {
  const icon = fas[iconName as keyof typeof fas];
  if (isIconDef(icon)) {
    const [width, height, _tags, _unicode, path] = icon.icon;
    return `<svg style="height:1em" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" color="red">
    <path fill="blue" d="${path}"></path></svg>`;
  } else {
    return '';
  }
}

function convertToImageSource(iconName: string): string {
  const svg = convertToSvg(iconName);
  if (svg) {
    const base64 = window.btoa(svg);
    return `data:image/svg+xml;base64,${base64}`;
  } else {
    return '';
  }
}

export default function IconAsImage(): JSX.Element {
  const [iconName, setIconName] = React.useState('faUser');
  const imgSrc = convertToImageSource(iconName);
  const svg = convertToSvg(iconName);

  return (
    <div>
      <input value={iconName} onChange={e => setIconName(e.target.value)} />
      {imgSrc ? (
        <img height="24" data-icon={iconName} src={imgSrc} />
      ) : (
        <FontAwesomeIcon icon={fas.faSkull} color="red" />
      )}
      {imgSrc ? (
        <div
          dangerouslySetInnerHTML={{
            __html: svg,
          }}
        />
      ) : (
        <FontAwesomeIcon icon={fas.faSkull} color="red" />
      )}
    </div>
  );
}
