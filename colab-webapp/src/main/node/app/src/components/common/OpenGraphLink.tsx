/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import { faExternalLinkAlt, faLink, faSync } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ExternalLink } from 'colab-rest-client';
import * as React from 'react';
import { refreshUrlMetadata, updateDocument } from '../../API/api';
import { useUrlMetadata } from '../../selectors/externalDataSelector';
import { useAppDispatch } from '../../store/hooks';
import { lightIconButtonStyle, space_M, space_S } from '../styling/style';
import { emptyLightTextStyle } from './FilePicker';
import Flex from './Flex';
import IconButton from './IconButton';
import InlineLoading from './InlineLoading';
import OnConfirmInput from './OnConfirmInput';

export interface OpenGraphProps {
  url: string;
  editCb?: () => void;
  editingStatus: boolean;
  setEditingState: (editMode: boolean)=> void;
  document: ExternalLink;
}

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
  //whiteSpace: 'nowrap',
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

export default function OpenGraphLink({
  url,
  editingStatus,
  setEditingState,
  document,
}: OpenGraphProps): JSX.Element {
  const dispatch = useAppDispatch();
  const metadata = useUrlMetadata(url);

  const refreshCb = React.useCallback(
    (e: React.UIEvent) => {
      e.stopPropagation();
      dispatch(refreshUrlMetadata(url));
    },
    [url, dispatch],
  );
  const openUrl = React.useCallback(() => {
    window.open(url);
  }, [url]);
  const updateDocCb = React.useCallback(
    (newValue: string) => {
      dispatch(updateDocument({ ...document, url: newValue }));
    },
    [dispatch, document],
  );
  const saveLink = React.useCallback(
    (newValue: string) => {
      setEditingState(false);
      updateDocCb(newValue);
    },
    [setEditingState, updateDocCb],
  );

  if (metadata == 'LOADING') {
    return <InlineLoading />;
  } else if (metadata == 'NO_URL') {
    return (
      <Flex grow={1} className={css({ padding: space_S })}>
        {editingStatus ? (
          <OnConfirmInput
            value={url}
            placeholder="Empty link"
            onChange={saveLink}
            onCancel={() => setEditingState(false)}
            directEdit
            containerClassName={css({ flexGrow: 1, alignItems: 'stretch' })}
            className={css({ input: { flexGrow: 1 } })}
          />
        ) : (
          <>
            <FontAwesomeIcon icon={faLink} size="lg" color="var(--lightGray)" />
            <span className={cx(emptyLightTextStyle, css({ marginLeft: space_S }))}>
              Empty link
            </span>
          </>
        )}
      </Flex>
    );
  } else {
    // fetch most common open graph property
    const imageUrl = metadata.metadata['og:image'];
    const siteName = metadata.metadata['og:site_name'];
    const title = metadata.metadata['og:title'];

    if (metadata.broken) {
      return (
        <>
          {editingStatus ? (
            <Flex grow={1} className={css({ padding: space_S })}>
              <OnConfirmInput
                value={url}
                placeholder="Empty link"
                onChange={saveLink}
                onCancel={() => setEditingState(false)}
                directEdit
                containerClassName={css({ flexGrow: 1, alignItems: 'stretch' })}
                className={css({ input: { flexGrow: 1 } })}
              />
              <IconButton
                title="refresh"
                onClick={refreshCb}
                icon={faSync}
                className={lightIconButtonStyle}
              />
            </Flex>
          ) : (
            <div title={url} className={css({ padding: space_S })}>
              <FontAwesomeIcon icon={faLink} size="lg" className={css({ marginRight: space_S })} />
              {url}
              <FontAwesomeIcon
                icon={faExternalLinkAlt}
                className={cx(
                  lightIconButtonStyle,
                  css({ marginLeft: space_S, color: 'var(--lightGray)' }),
                )}
              />
            </div>
          )}
        </>
      );
    } else {
      return (
        <>
          {editingStatus ? (
            <Flex grow={1} className={css({ padding: space_S })}>
              <OnConfirmInput
                value={url}
                placeholder="Empty link"
                onChange={saveLink}
                onCancel={() => setEditingState(false)}
                directEdit
                containerClassName={css({ flexGrow: 1, alignItems: 'stretch' })}
                className={css({ input: { flexGrow: 1 } })}
              />
              <IconButton
                title="refresh"
                onClick={refreshCb}
                icon={faSync}
                className={lightIconButtonStyle}
              />
            </Flex>
          ) : (
            <Flex className={cardStyle} title={url} align="center">
              {imageUrl && <img className={imageStyle} src={imageUrl} />}
              <div className={legendStyle}>
                <Flex
                  className={css({ fontWeight: 'bold' })}
                  justify="space-between"
                  align="flex-start"
                >
                  {siteName || 'Untitled site'}
                  <IconButton
                    icon={faExternalLinkAlt}
                    title="Open site in new tab"
                    className={cx(
                      lightIconButtonStyle,
                      css({ marginLeft: space_M, cursor: 'pointer' }),
                    )}
                    onClick={openUrl}
                  />
                </Flex>
                {title && <p>{title}</p>}
                <a href={url} target="_blank" rel="noreferrer" className={urlStyle}>
                  {url}
                </a>
              </div>
            </Flex>
          )}
        </>
      );
    }
  }
}
