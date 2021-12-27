/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import { PasswordFeedback } from 'react-password-strength-bar';
import useTranslations from '../../../i18n/I18nContext';
import { useAppDispatch } from '../../../store/hooks';
import { addNotification } from '../../../store/notification';
import Button from '../Button';
import InlineLoading from '../InlineLoading';
import Checkbox from './Checkbox';
import Input from './Input';
import SelectInput from './SelectInput';
import Toggler from './Toggler';

const PasswordStrengthBar = React.lazy(() => import('react-password-strength-bar'));

export interface BaseField<T> {
  type: 'text' | 'textarea' | 'password' | 'boolean' | 'select' | 'selectnumber';
  key: keyof T;
  readonly?: boolean;
  label?: React.ReactNode;
  fieldFooter?: React.ReactNode;
  placeholder?: string;
  isMandatory: boolean;
  isErroneous?: (entity: T) => boolean;
  errorMessage?: React.ReactNode | ((data: T) => React.ReactNode);
}

export interface TextualField<T> extends BaseField<T> {
  type: 'text' | 'textarea';
}

export interface SelectField<T> extends BaseField<T> {
  type: 'select';
  isMulti: boolean;
  canCreateOption?: boolean;
  options: { label: string; value: unknown }[];
}

export function createSelectField<T, IsMulti extends boolean, K extends keyof T>(
  field: SelectField<T> & {
    key: K;
    isMulti: IsMulti;
    options: {
      label: string;
      value: T[K] extends Array<infer Item> ? (IsMulti extends true ? Item : T[K]) : T[K];
    }[];
  },
): Field<T> {
  return field;
}

export interface SelectNumberField<T> extends BaseField<T> {
  type: 'selectnumber';
  options: { label: string; value: number }[];
}

//TODO: unify SelectInputs; something like (hint: this attempt does not work);
//
//export interface UniSelectField<T> extends BaseField<T> {
//  type: 'select';
//  options: {label: string, value: T[BaseField<T>['key']]}[];
//}

export interface PasswordScore {
  score: 0 | 1 | 2 | 3 | 4;
  feedback: PasswordFeedback;
}

export interface PasswordField<T> extends BaseField<T> {
  type: 'password';
  showStrenghBar: boolean;
  strengthProp?: keyof T;
}

export interface BooleanField<T> extends BaseField<T> {
  type: 'boolean';
  showAs: 'toggle' | 'checkbox';
}

//type: 'text' | 'password' | 'password_with_strength_bar' | 'toggle';

export type Field<T> =
  | TextualField<T>
  | PasswordField<T>
  | BooleanField<T>
  | SelectField<T>
  | SelectNumberField<T>;

export interface FormProps<T> {
  fields: Field<T>[];
  value: T;
  autoSubmit?: boolean;
  submitLabel?: string;
  onSubmit: (entity: T) => void;
  children?: React.ReactNode;
}

export default function Form<T>({
  fields,
  value,
  submitLabel,
  onSubmit,
  children,
  autoSubmit = false,
}: FormProps<T>): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();

  const [state, setState] = React.useState<T>(value);
  const [erroneous, setErroneous] = React.useState(false);

  let globalErroneous = false;

  const setFormValue = React.useCallback(
    (key: keyof T, value: unknown) => {
      // genuine hack inside: use setState as getter
      setState(s => {
        const newState = { ...s, [key]: value };
        if (autoSubmit) {
          onSubmit(newState);
        }
        return newState;
      });
    },
    [autoSubmit, onSubmit],
  );

  const submitCb = React.useCallback(() => {
    if (!globalErroneous) {
      onSubmit(state);
    } else {
      setErroneous(true);
      dispatch(addNotification({ status: 'OPEN', type: 'WARN', message: i18n.pleaseProvideData }));
    }
  }, [state, onSubmit, dispatch, i18n.pleaseProvideData, globalErroneous]);

  const onEnterCb = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter') {
        submitCb();
      }
    },
    [submitCb],
  );

  const fieldComps = fields.map(field => {
    const isErroneous = field.isErroneous != null ? field.isErroneous(state) : false;
    globalErroneous = globalErroneous || isErroneous;
    const fieldKey = `field-${field.key}`;

    const errorMessage =
      erroneous && isErroneous && field.errorMessage != null
        ? typeof field.errorMessage === 'function'
          ? field.errorMessage(state)
          : field.errorMessage
        : undefined;

    if (field.type == 'text' || field.type === 'textarea') {
      return (
        <div key={fieldKey}>
          <Input
            type="text"
            inputType={field.type === 'text' ? 'input' : 'textarea'}
            value={String(state[field.key] || '')}
            label={field.label}
            placeholder={field.placeholder}
            warning={errorMessage}
            mandatory={field.isMandatory}
            onChange={value => setFormValue(field.key, value)}
            readonly={field.readonly}
          />
          {field.fieldFooter != null ? field.fieldFooter : null}
        </div>
      );
    } else if (field.type === 'select') {
      return (
        <div key={fieldKey}>
          <SelectInput
            value={String(state[field.key])}
            label={field.label}
            placeholder={field.placeholder}
            options={field.options}
            warning={errorMessage}
            mandatory={field.isMandatory}
            isMulti={field.isMulti}
            onChange={value => setFormValue(field.key, value)}
            readonly={field.readonly}
            canCreateOption={field.canCreateOption}
          />
          {field.fieldFooter != null ? field.fieldFooter : null}
        </div>
      );
    } else if (field.type === 'selectnumber') {
      return (
        <div key={fieldKey}>
          <SelectInput
            value={Number(state[field.key])}
            label={field.label}
            placeholder={field.placeholder}
            options={field.options}
            warning={errorMessage}
            mandatory={field.isMandatory}
            isMulti={false}
            onChange={value => setFormValue(field.key, value)}
            readonly={field.readonly}
          />
          {field.fieldFooter != null ? field.fieldFooter : null}
        </div>
      );
    } else if (field.type === 'password') {
      return (
        <div key={fieldKey}>
          <Input
            type="password"
            value={String(state[field.key] || '')}
            label={field.label}
            placeholder={field.placeholder}
            warning={errorMessage}
            mandatory={field.isMandatory}
            onChange={value => setFormValue(field.key, value)}
            readonly={field.readonly}
          />
          {field.fieldFooter != null ? field.fieldFooter : null}
          {field.strengthProp != null ? (
            <div className={field.showStrenghBar ? css({ display: 'none' }) : undefined}>
              <React.Suspense fallback={<InlineLoading />}>
                <PasswordStrengthBar
                  barColors={['#ddd', '#ef4836', 'rgb(118, 176, 232)', '#2b90ef', '#01f590']}
                  scoreWordStyle={{ color: 'var(--fgColor)' }}
                  onChangeScore={(value, feedback) => {
                    if (field.strengthProp != null) {
                      setFormValue(field.strengthProp, { score: value, feedback: feedback });
                    }
                  }}
                  password={String(state[field.key] || '')}
                />
              </React.Suspense>
            </div>
          ) : null}
        </div>
      );
    } else if (field.type === 'boolean') {
      const blnValue = state[field.key] as unknown as boolean;
      return (
        <div key={fieldKey}>
          {field.showAs === 'toggle' ? (
            <Toggler
              value={blnValue}
              label={field.label}
              warning={erroneous && isErroneous ? field.errorMessage : undefined}
              onChange={value => setFormValue(field.key, value)}
              disabled={field.readonly}
            />
          ) : (
            <Checkbox
              value={blnValue}
              label={field.label}
              warning={erroneous && isErroneous ? field.errorMessage : undefined}
              onChange={value => setFormValue(field.key, value)}
              disabled={field.readonly}
            />
          )}
          {field.fieldFooter != null ? field.fieldFooter : null}
        </div>
      );
    }
  });

  return (
    <div
      className={css({
        display: 'flex',
        //        overflow: 'auto',
        flexDirection: 'column',
        '& > *': {
          padding: '8px 0',
        },
      })}
      onKeyDown={onEnterCb}
    >
      {fieldComps}
      {autoSubmit ? null : (
        <Button
          key="submit"
          label={submitLabel || i18n.submit}
          className={css({ alignSelf: 'flex-end' })}
          onClick={submitCb}
        />
      )}
      {children}
    </div>
  );
}
