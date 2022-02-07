/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css } from '@emotion/css';
import { faPen, faSkullCrossbones, faSync } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { refreshUrlMetadata } from '../../API/api';
import { useUrlMetadata } from '../../selectors/externalDataSelector';
import { useAppDispatch } from '../../store/hooks';
import IconButton from './IconButton';
import InlineLoading from './InlineLoading';

export interface OpenGraphProps {
  url: string;
  editCb?: () => void;
}

const containerStyle = css({
  maxWidth: '200px',
  boxShadow: '0px 0px 1px 1px var(--lightGray)',
  cursor: 'pointer',
});

const siteNameStyle = css({
  display: 'flex',
  alignContent: 'space-between',
  fontWeight: 'bolder',
});
const titleStyle = css({});
const descriptionStyle = css({ fontStyle: 'italic' });

//const imageStyle = (url: string | undefined) => {
//  return cx(illustrationStyle, css({
//    backgroundImage: url ? `url(${url})` : undefined,
//    backgroundSize: 'cover'
//  }));
//}

const legendStyle = css({
  padding: '5px',
});

const imageStyle = css({
  maxWidth: '100%',
  maxHeight: '200px',
});

export default function OpenGraphLink({ url, editCb }: OpenGraphProps): JSX.Element {
  const dispatch = useAppDispatch();
  const metadata = useUrlMetadata(url);

  const refreshCb = React.useCallback(
    (e: React.UIEvent) => {
      e.stopPropagation();
      dispatch(refreshUrlMetadata(url));
    },
    [url, dispatch],
  );

  const onEditCb = React.useMemo(
    () =>
      editCb
        ? (e: React.UIEvent) => {
            e.stopPropagation();
            editCb();
          }
        : undefined,
    [editCb],
  );

  const openUrl = React.useCallback(() => {
    window.open(url);
  }, [url]);

  if (metadata == 'NO_URL') {
    return (
      <div>
        <span>empty link</span>
        {onEditCb && <IconButton title="edit" onClick={onEditCb} icon={faPen} />}
      </div>
    );
  } else if (metadata == 'LOADING') {
    return <InlineLoading />;
  } else {
    // fetch most common open graph property
    const imageUrl = metadata.metadata['og:image'];
    const siteName = metadata.metadata['og:site_name'];
    const title = metadata.metadata['og:title'];
    const description = metadata.metadata['og:description'];
    //const mimeType = metadata.contentType;

    const legend = (
      <div className={legendStyle}>
        <div className={siteNameStyle}>
          <span>{siteName}</span>
          <span>
            {onEditCb && <IconButton title="edit" onClick={onEditCb} icon={faPen} />}
            <IconButton title="refresh" onClick={refreshCb} icon={faSync} />
          </span>
        </div>
        <div className={titleStyle}>{title}</div>
        <div className={descriptionStyle}>{description}</div>
      </div>
    );

    if (metadata.broken) {
      return (
        <div className={containerStyle} title={url}>
          <FontAwesomeIcon icon={faSkullCrossbones} />
          {legend}
        </div>
      );
    } else {
      return (
        <div className={containerStyle} title={url} onClick={openUrl}>
          <img className={imageStyle} src={imageUrl} />
          {legend}
        </div>
      );
    }
  }
}
