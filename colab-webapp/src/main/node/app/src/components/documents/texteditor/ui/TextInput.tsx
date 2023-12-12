/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';
import {space_sm} from "../../../../styling/style";
import Flex from "../../../common/layout/Flex";

type Props = Readonly<{
    'data-test-id'?: string;
    label: string;
    onChange: (val: string) => void;
    placeholder?: string;
    value: string;
}>;

export default function TextInput({
                                      label,
                                      value,
                                      onChange,
                                      placeholder = '',
                                      'data-test-id': dataTestId,
                                  }: Props): JSX.Element {
    return (
        <Flex direction="row" gap={space_sm} justify="center">
            <label>{label}</label>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={e => {
                    onChange(e.target.value);
                }}
                data-test-id={dataTestId}
            />
        </Flex>
    );
}
