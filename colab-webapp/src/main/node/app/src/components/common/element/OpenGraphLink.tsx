/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import {
  faChainBroken,
  faExternalLinkAlt,
  faLink,
  faPen,
  faSync,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { refreshUrlMetadata } from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import { useUrlMetadata } from '../../../selectors/externalDataSelector';
import { useAppDispatch } from '../../../store/hooks';
import { lightIconButtonStyle, space_M, space_S } from '../../styling/style';
import Flex from '../layout/Flex';
import { emptyLightTextStyle } from './FilePicker';
import IconButton from './IconButton';
import InlineLoading from './InlineLoading';
import { BlockInput } from './Input';

const cardStyle = css({
  flexWrap: 'nowrap',
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

export default function OpenGraphLink({
  url,
  editingStatus,
  setEditingState,
  editCb,
  readOnly,
}: OpenGraphProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const metadata = useUrlMetadata(url);

  const sanitizedUrl = sanitizeUrl(url);

  const refreshCb = React.useCallback(
    (e: React.UIEvent) => {
      e.stopPropagation();
      dispatch(refreshUrlMetadata(url));
    },
    [url, dispatch],
  );
  const openUrl = React.useCallback(() => {
    window.open(sanitizedUrl);
  }, [sanitizedUrl]);

  const saveLink = React.useCallback(
    (newValue: string) => {
      setEditingState(false);
      if (editCb && !readOnly) {
        editCb(newValue);
      }
    },
    [setEditingState, editCb, readOnly],
  );

  const setEditCb = React.useCallback(() => {
    setEditingState(true);
  }, [setEditingState]);

  const editIcon = !readOnly && (
    <IconButton className={lightIconButtonStyle} icon={faPen} onClick={setEditCb} title="" />
  );

  if (metadata == 'LOADING') {
    return <InlineLoading />;
  }

  if (!readOnly && editingStatus) {
    return (
      <Flex className={cardStyle} title={url} align="center">
        <EditLink
          onChange={saveLink}
          url={url}
          onCancel={() => setEditingState(false)}
          refreshCb={refreshCb}
        />
      </Flex>
    );
  }

  if (metadata == 'NO_URL') {
    return (
      <Flex className={cardStyle} title={url} align="center">
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
        <Flex className={cardStyle} title={url} align="center">
          <div title={url} className={css({ padding: space_S })}>
            <FontAwesomeIcon
              icon={faChainBroken}
              size="lg"
              className={css({ marginRight: space_S })}
            />
            {url}
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
        <Flex className={cardStyle} title={url} align="center">
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
                  {url}
                </a>
              </>
            ) : (
              <Flex>
                <a href={sanitizedUrl} target="_blank" rel="noreferrer" className={urlStyle}>
                  {url}
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
  refreshCb?: (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent> | React.KeyboardEvent<HTMLSpanElement>,
  ) => void;
}

function EditLink({ url, onChange, refreshCb, onCancel }: EditLinkProps): JSX.Element {
  return (
    <>
      <BlockInput
        value={url}
        placeholder="Empty link"
        onChange={onChange}
        onCancel={onCancel}
        containerClassName={css({ flexGrow: 1 })}
        saveMode="ON_BLUR"
      />
      {refreshCb && (
        <IconButton
          title="refresh"
          onClick={refreshCb}
          icon={faSync}
          className={lightIconButtonStyle}
        />
      )}
    </>
  );
}
