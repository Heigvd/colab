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
    onChange: (files: FileList | null) => void;
}>;

export default function FileInput({
                                      accept,
                                      onChange,
                                      'data-test-id': dataTestId,
                                  }: FileInputProps): JSX.Element {
    return (
        <>
            <input
                type="file"
                accept={accept}
                onChange={e => onChange(e.target.files)}
                data-test-id={dataTestId}
            />
        </>
    );
}
