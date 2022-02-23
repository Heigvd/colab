/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faFile,
  faFileArchive,
  faFileAudio,
  faFileCode,
  faFileExcel,
  faFileImage,
  faFilePdf,
  faFilePowerpoint,
  faFileVideo,
  faFileWord,
} from '@fortawesome/free-regular-svg-icons';
import {
  faDownload,
  faFileCsv,
  faSkullCrossbones,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { EditState } from '../live/LiveEditor';
import { lightIconButtonStyle, space_M, space_S } from '../styling/style';
import Button from './Button';
import Flex from './Flex';
import IconButton from './IconButton';

const contains = (value: string, ...values: string[]): boolean => {
  return !!values.find(needle => value.includes(needle));
};

const clickableStyle = css({
  cursor: 'pointer',
});

const draggingStyle = css({
  backgroundColor: 'var(--lightGray)',
});

const layerPadding = css({
  paddingTop: '15px',
});

const inputStyle = css({
  display: 'none',
});

const emptyLightTextStyle = css({
  color: 'var(--lightGray)',
  fontStyle: 'italice',
});

const getMimeTypeIcon = (mimeType: string | undefined | null, hasNoFile: boolean): JSX.Element => {
  let icon: IconProp | undefined = undefined;

  if (mimeType) {
    if (mimeType.startsWith('image/')) {
      icon = faFileImage;
    } else if (mimeType.startsWith('video/')) {
      icon = faFileVideo;
    } else if (mimeType.startsWith('audio/')) {
      icon = faFileAudio;
    } else if (mimeType.startsWith('text/csv')) {
      icon = faFileCsv;
    } else if (mimeType.startsWith('application/pdf')) {
      icon = faFilePdf;
    } else if (
      contains(
        mimeType,
        'application/zip',
        'application/vnd.rar',
        'application/x-tar',
        'application/gzip',
      )
    ) {
      icon = faFileArchive;
    } else if (contains(mimeType, 'application/msword', 'officedocument.wordprocessingml')) {
      icon = faFileWord;
    } else if (
      contains(
        mimeType,
        'application/vnd.ms-excel',
        'application/vnd.m-xcel',
        'officedocument.spreadsheetml',
      )
    ) {
      icon = faFileExcel;
    } else if (
      contains(mimeType, 'application/vnd.ms-powerpoint', 'officedocument.presentationml')
    ) {
      icon = faFilePowerpoint;
    } else if (
      contains(
        mimeType,
        'json',
        'x-java',
        'x-bibtex',
        'x-c',
        'text/xml',
        'text/html',
        'x-perl',
        'x-python',
        'x-sh',
      )
    ) {
      icon = faFileCode;
    } else {
      icon = faFile;
    }
    return (
      <FontAwesomeIcon icon={icon} size="lg" color={hasNoFile ? 'var(--lightGray)' : undefined} />
    );
  } else {
    return (
      <span className={'fa-layers fa-fw ' + layerPadding}>
        <FontAwesomeIcon icon={faFile} size="lg" />
        <FontAwesomeIcon icon={faSkullCrossbones} transform="right-2 down-4" />
      </span>
    );
  }
};

function overlayStyle(coord: [number, number]) {
  return css({
    position: 'fixed',
    left: coord[0],
    top: coord[1],
    padding: 0,
    margin: 0,
    border: '1px solid  white',
    boxShadow: '0 0 5px 0 rgba(0, 0, 0, 0.5)',
    backgroundColor: 'var(--bgColor)',
    zIndex: 1,
    display: 'flex',
  });
}
const previewImageStyle = css({
  maxWidth: '200px',
  maxHeight: '200px',
});

const displayImageStyle = css({
  maxWidth: '100%',
  maxHeight: '300px',
});

export interface FilePickerProps {
  accept?: string;
  onChange?: (file: File) => void;
  onDownload?: () => void;
  currentFilename?: React.ReactNode;
  currentMimetype?: string;
  currentPreviewImgUrl?: string;
  editingStatus: EditState;
}

export default function FilePicker({
  accept,
  currentFilename,
  currentMimetype,
  currentPreviewImgUrl,
  onChange,
  onDownload,
  editingStatus,
}: FilePickerProps): JSX.Element {
  const [dragging, setDragging] = React.useState(false);

  const onInputCb = React.useMemo(
    () =>
      onChange != null
        ? (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files != null && e.target.files.length > 0) {
              const file = e.target.files[0];
              if (file != null) {
                onChange(file);
              }
            }
          }
        : undefined,
    [onChange],
  );

  const onDragOverCb = React.useMemo(
    () =>
      onChange != null
        ? (e: React.DragEvent) => {
            e.dataTransfer.dropEffect = 'copy';
            setDragging(true);
          }
        : undefined,
    [onChange],
  );

  const onDragLeaveCb = React.useMemo(
    () =>
      onChange != null
        ? (e: React.DragEvent) => {
            e.dataTransfer.dropEffect = 'none';
            setDragging(false);
          }
        : undefined,
    [onChange],
  );

  const onDropCb = React.useMemo(
    () =>
      onChange != null
        ? (e: React.DragEvent) => {
            if (e.dataTransfer.files.length === 1) {
              const file = e.dataTransfer.files[0];
              if (file != null) {
                onChange(file);
              }
            }
            setDragging(false);
          }
        : undefined,
    [onChange],
  );

  // PREVIEW HOVER TOOLTIP
  const hasPreview = !!currentPreviewImgUrl;
  const [coord, setCoord] = React.useState<[number, number] | undefined>(undefined);
  const [displayed, setDisplayed] = React.useState(false);
  const timerRef = React.useRef<number>();
  const hasNoFile = currentFilename === null || currentFilename === undefined;
  const isImageToDisplay =
    currentMimetype && (currentMimetype === 'image/png' || currentMimetype === 'image/jpeg');

  const onMoveCb = React.useMemo(() => {
    if (hasPreview && !displayed) {
      return (event: React.MouseEvent<HTMLSpanElement>) => {
        setCoord([event.clientX, event.clientY]);
      };
    } else {
      return undefined;
    }
  }, [hasPreview, displayed]);

  const onEnterCb = React.useMemo(() => {
    if (hasPreview) {
      return () => {
        if (timerRef.current == null) {
          timerRef.current = window.setTimeout(() => {
            setDisplayed(true);
          }, 750);
        }
      };
    } else {
      return undefined;
    }
  }, [hasPreview]);

  const onLeaveCb = React.useMemo(() => {
    if (hasPreview) {
      return () => {
        if (timerRef.current != null) {
          window.clearTimeout(timerRef.current);
          timerRef.current = undefined;
        }
        setCoord(undefined);
        setDisplayed(false);
      };
    } else {
      return undefined;
    }
  }, [hasPreview]);

  return (
    <Flex className={css({ padding: space_S })} align="center">
      <Flex
        className={cx({
          [clickableStyle]: !!onDownload,
          [draggingStyle]: !!dragging,
        })}
        align="center"
        onDragOver={onDragOverCb}
        onDragLeave={onDragLeaveCb}
        onDrop={onDropCb}
        onMouseLeave={onLeaveCb}
        onMouseEnter={onEnterCb}
        onMouseMove={onMoveCb}
      >
        {isImageToDisplay && editingStatus === 'VIEW' ? (
          <img className={displayImageStyle} src={currentPreviewImgUrl} />
        ) : (
          <>
            {getMimeTypeIcon(currentMimetype, hasNoFile)}
            <div
              className={cx(css({ paddingLeft: space_S, userSelect: 'none' }), {
                [emptyLightTextStyle]: hasNoFile,
              })}
            >
              {currentFilename || 'No file uploaded'}
            </div>
          </>
        )}
        {onChange && editingStatus === 'EDIT' && (
          <div className={css({ paddingLeft: space_M })} onClick={e => e.stopPropagation()}>
            <label>
              <Button onClick={() => {}}>
                <FontAwesomeIcon icon={faUpload} /> Upload file
              </Button>
              <input className={inputStyle} type="file" accept={accept} onChange={onInputCb} />
            </label>
          </div>
        )}
        {coord && displayed && !isImageToDisplay ? (
          <div className={overlayStyle(coord)}>
            <img className={previewImageStyle} src={currentPreviewImgUrl} />{' '}
          </div>
        ) : null}
      </Flex>
      {editingStatus === 'VIEW' && !hasNoFile && !isImageToDisplay && (
        <IconButton
          icon={faDownload}
          iconSize={'sm'}
          title="Download file"
          className={cx(
            lightIconButtonStyle,
            css({ color: 'var(--lightGray)', marginLeft: space_S }),
          )}
          onClick={onDownload}
        />
      )}
    </Flex>
  );
  return <input type="file" accept={accept} />;
}
