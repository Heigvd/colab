/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faChainBroken, faExternalLinkAlt, faLink, faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { useUrlMetadata } from '../../../selectors/externalDataSelector';
import { lightIconButtonStyle, space_M, space_S } from '../../styling/style';
import Flex from '../layout/Flex';
import { emptyLightTextStyle } from './FilePicker';
import IconButton from './IconButton';
import InlineLoading from './InlineLoading';
import { BlockInput } from './Input';

const cardStyle = css({
  flexWrap: 'nowrap',
  flexGrow: 1,
  boxShadow: '0px 0px 5px 2px var(--lightGray)',
  backgroundColor: 'var(--bgColor)',
  padding: space_S,
  margin: space_S,
  cursor: 'initial',
});

const urlStyle = css({
  fontStyle: 'italic',
  textDecoration: 'underline',
  color: 'var(--darkGray)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const legendStyle = css({
  padding: space_M,
  fontSize: '0.8em',
  minWidth: 0,
});

const imageStyle = css({
  display: 'block',
  height: '80px',
  width: '120px',
  objectFit: 'cover',
  minWidth: 0,
  flexShrink: 0,
});

export interface OpenGraphProps {
  url: string;
  editCb?: (newUrl: string) => void;
  editingStatus: boolean;
  setEditingState: (editMode: boolean) => void;
  readOnly: boolean;
}

function sanitizeUrl(rawUrl: string, defaultProtocol?: string): string {
  if (!rawUrl.match(/[a-zA-Z0-9]*:\/\/.*/)) {
    return `${defaultProtocol || 'http'}://${rawUrl}`;
  }
  return rawUrl;
}

/**
 * Escape uri component + escape parenthesis too.
 *
 */
function encodeSegment(seg: string | undefined): string {
  if (!seg) {
    return '';
  }
  let x = seg;
  let y = seg;
  do {
    x = y;
    y = decodeURIComponent(x);
  } while (x != y);

  return encodeURIComponent(x).replace(/\(/g, '%28').replace(/\)/g, '%29');
}

function encodePath(path: string | undefined) {
  return (path || '').split('/').map(encodeSegment).join('/');
}

export function encode(rawUrl: string) {
  const split = rawUrl.split('://');
  if (split.length === 2) {
    return `${split[0]}://${encodePath(split[1])}`;
  } else if (split.length === 1) {
    return encodePath(split[0]);
  } else {
    return '';
  }
}

export default function OpenGraphLink({
  url,
  editingStatus,
  setEditingState,
  editCb,
  readOnly,
}: OpenGraphProps): JSX.Element {
  const i18n = useTranslations();

  const metadata = useUrlMetadata(url);

  const sanitizedUrl = sanitizeUrl(url);
  const decodedUrl = decodeURIComponent(url);

  const openUrl = React.useCallback(() => {
    window.open(sanitizedUrl);
  }, [sanitizedUrl]);

  const saveLink = React.useCallback(
    (newValue: string) => {
      setEditingState(false);
      if (editCb && !readOnly) {
        editCb(encode(newValue));
      }
    },
    [setEditingState, editCb, readOnly],
  );

  const setEditCb = React.useCallback(() => {
    setEditingState(true);
  }, [setEditingState]);

  const editIcon = !readOnly && editCb && (
    <IconButton className={lightIconButtonStyle} icon={faPen} onClick={setEditCb} title="" />
  );

  if (metadata == 'LOADING') {
    return <InlineLoading />;
  }

  if (!readOnly && editingStatus && editCb) {
    return (
      <Flex className={cardStyle} title={decodedUrl} align="center">
        <EditLink onChange={saveLink} url={decodedUrl} onCancel={() => setEditingState(false)} />
      </Flex>
    );
  }

  if (metadata == 'NO_URL') {
    return (
      <Flex className={cardStyle} title={decodedUrl} align="center">
        <FontAwesomeIcon icon={faLink} size="lg" color="var(--lightGray)" />
        <span className={cx(emptyLightTextStyle, css({ marginLeft: space_S }))}>Empty link</span>
        {editIcon}
      </Flex>
    );
  } else {
    // fetch most common open graph property
    const imageUrl = metadata.metadata['og:image'];
    const siteName = metadata.metadata['og:site_name'];
    const title = metadata.metadata['og:title'];

    if (metadata.broken) {
      return (
        <Flex className={cardStyle} title={decodedUrl} align="center">
          <div title={decodedUrl} className={css({ padding: space_S })}>
            <FontAwesomeIcon
              icon={faChainBroken}
              size="lg"
              className={css({ marginRight: space_S })}
            />
            {decodedUrl}
            {editIcon}
          </div>
        </Flex>
      );
    } else {
      const toolbar = (
        <Flex>
          <IconButton
            icon={faExternalLinkAlt}
            title={i18n.modules.document.openInNewTab}
            className={cx(lightIconButtonStyle, css({ marginLeft: space_M, cursor: 'pointer' }))}
            onClick={openUrl}
          />
          {editIcon}
        </Flex>
      );

      return (
        <Flex className={cardStyle} title={decodedUrl} align="center">
          {imageUrl && <img className={imageStyle} src={imageUrl} />}
          <div className={legendStyle}>
            {siteName ? (
              <>
                <Flex
                  className={css({ fontWeight: 'bold' })}
                  justify="space-between"
                  align="flex-start"
                >
                  {siteName}
                  {toolbar}
                </Flex>
                {title && <p>{title}</p>}
                <a href={sanitizedUrl} target="_blank" rel="noreferrer" className={urlStyle}>
                  {decodedUrl}
                </a>
              </>
            ) : (
              <Flex>
                <a href={sanitizedUrl} target="_blank" rel="noreferrer" className={urlStyle}>
                  {decodedUrl}
                </a>
                {toolbar}
              </Flex>
            )}
          </div>
        </Flex>
      );
    }
  }
}

interface EditLinkProps {
  url: string;
  onChange: (newValue: string) => void;
  onCancel: () => void;
}

function EditLink({ url, onChange, onCancel }: EditLinkProps): JSX.Element {
  const i18n = useTranslations();
  return (
    <BlockInput
      value={url}
      placeholder={i18n.modules.content.emptyLink}
      onChange={onChange}
      onCancel={onCancel}
      containerClassName={css({ flexGrow: 1 })}
      saveMode="ON_BLUR"
    />
  );
}
