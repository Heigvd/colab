/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';

type FileInputProps = Readonly<{
  'data-test-id'?: string;
  accept?: string;
  label: string;
  onChange: (files: FileList | null) => void;
}>;

export default function FileInput({
  accept,
  label,
  onChange,
  'data-test-id': dataTestId,
}: FileInputProps): JSX.Element {
  return (
    <div className="Input__wrapper">
      <div>
        <label className="Input__label">{label}</label>
      </div>
      <input
        type="file"
        accept={accept}
        className="Input__input"
        onChange={e => onChange(e.target.files)}
        data-test-id={dataTestId}
      />
    </div>
  );
}
