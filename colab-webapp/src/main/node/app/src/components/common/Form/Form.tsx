/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { PasswordFeedback } from 'react-password-strength-bar';
import useTranslations from '../../../i18n/I18nContext';
import { space_M } from '../../styling/style';
import ButtonWithLoader from '../element/ButtonWithLoader';
import InlineLoading from '../element/InlineLoading';
import { BlockInput } from '../element/Input';
import { TipsProps } from '../element/Tips';
import Flex from '../layout/Flex';
import Checkbox from './Checkbox';
import SelectInput from './SelectInput';
import Toggler from './Toggler';

const PasswordStrengthBar = React.lazy(() => import('react-password-strength-bar'));

export const emailFormat = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Fields

interface BaseField<T> {
  key: keyof T;
  label?: React.ReactNode;
  placeholder?: string;
  type: 'text' | 'textarea' | 'password' | 'boolean' | 'select' | 'selectnumber';
  isMandatory: boolean;
  readOnly?: boolean;
  tip?: TipsProps['children'];
  fieldFooter?: React.ReactNode | ((data: T) => React.ReactNode);
  isErroneous?: (data: T) => boolean;
  errorMessage?: React.ReactNode | ((data: T) => React.ReactNode);
}

interface TextualField<T> extends BaseField<T> {
  type: 'text' | 'textarea';
}

export interface PasswordScore {
  score: 0 | 1 | 2 | 3 | 4;
  feedback: PasswordFeedback;
}

interface PasswordField<T> extends BaseField<T> {
  type: 'password';
  showStrengthBar: boolean;
  strengthProp?: keyof T;
}

interface BooleanField<T> extends BaseField<T> {
  type: 'boolean';
  showAs: 'toggle' | 'checkbox';
}

interface SelectField<T> extends BaseField<T> {
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

interface SelectNumberField<T> extends BaseField<T> {
  type: 'selectnumber';
  options: { label: string; value: number }[];
}

//TODO: unify SelectInputs; something like (hint: this attempt does not work);
//
//export interface UniSelectField<T> extends BaseField<T> {
//  type: 'select';
//  options: {label: string, value: T[BaseField<T>['key']]}[];
//}

export type Field<T> =
  | TextualField<T>
  | PasswordField<T>
  | BooleanField<T>
  | SelectField<T>
  | SelectNumberField<T>;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Form

export interface FormProps<T> {
  fields: Field<T>[];
  value: T;
  onSubmit: (entity: T) => void;
  submitLabel?: string;
  autoComplete?: string;
  children?: React.ReactNode;
  submitFailed?: boolean;
  className?: string;
  childrenClassName?: string;
  buttonClassName?: string;
}

export default function Form<T>({
  fields,
  value,
  onSubmit,
  submitLabel,
  autoComplete,
  children,
  submitFailed,
  className,
  childrenClassName,
  buttonClassName,
}: FormProps<T>): JSX.Element {
  const i18n = useTranslations();

  const [state, setState] = React.useState<T>(value);
  const [showErrors, setShowErrors] = React.useState(false);
  let globalErroneous = false;

  const setFormValue = React.useCallback((key: keyof T, value: unknown) => {
    // genuine hack inside: use setState as getter
    setState(s => {
      const newState = { ...s, [key]: value };
      return newState;
    });
  }, []);

  const submit = React.useCallback(() => {
    if (!globalErroneous) {
      onSubmit(state);
    } else {
      setShowErrors(true);
    }
  }, [globalErroneous, onSubmit, state]);

  const onEnter = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter') {
        submit();
      }
    },
    [submit],
  );

  const fieldComps = fields.map(field => {
    const isErroneous = field.isErroneous != null ? field.isErroneous(state) : false;
    const isEmptyError = field.isMandatory
      ? String(state[field.key]).length === 0 || state[field.key] === null
      : false;
    globalErroneous = globalErroneous || isErroneous || isEmptyError;

    const fieldKey = `field-${String(field.key)}`;

    const errorMessage =
      showErrors && isEmptyError
        ? i18n.form.missingMandatory
        : showErrors && isErroneous
        ? field.errorMessage != null
          ? typeof field.errorMessage === 'function'
            ? field.errorMessage(state)
            : field.errorMessage
          : i18n.form.defaultFieldError
        : null;

    const effectiveFieldFooter =
      typeof field.fieldFooter === 'function' ? field.fieldFooter(state) : field.fieldFooter;

    if (field.type === 'text' || field.type === 'textarea') {
      return (
        <div key={fieldKey}>
          <BlockInput
            label={field.label}
            value={String(state[field.key] || '')}
            placeholder={field.placeholder}
            type="text"
            inputType={field.type === 'text' ? 'input' : 'textarea'}
            mandatory={field.isMandatory}
            readOnly={field.readOnly}
            autoComplete={autoComplete}
            saveMode="FLOWING"
            onChange={value => setFormValue(field.key, value)}
            tip={field.tip}
            footer={effectiveFieldFooter}
            error={errorMessage}
          />
        </div>
      );
    } else if (field.type === 'password') {
      return (
        <div key={fieldKey}>
          <BlockInput
            label={field.label}
            value={String(state[field.key] || '')}
            placeholder={field.placeholder}
            type="password"
            mandatory={field.isMandatory}
            readOnly={field.readOnly}
            autoComplete={autoComplete}
            saveMode="FLOWING"
            onChange={value => setFormValue(field.key, value)}
            tip={field.tip}
            footer={effectiveFieldFooter}
            error={errorMessage}
          />
          {field.strengthProp != null && (
            <div className={cx({ [css({ display: 'none' })]: !field.showStrengthBar })}>
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
          )}
        </div>
      );
    } else if (field.type === 'boolean') {
      const blnValue = state[field.key] as unknown as boolean;
      return (
        <div key={fieldKey}>
          {field.showAs === 'toggle' ? (
            <Toggler
              label={field.label}
              value={blnValue}
              readOnly={field.readOnly}
              onChange={value => setFormValue(field.key, value)}
              tip={field.tip}
              fieldFooter={effectiveFieldFooter}
              error={errorMessage}
            />
          ) : (
            <Checkbox
              label={field.label}
              value={blnValue}
              readOnly={field.readOnly}
              onChange={value => setFormValue(field.key, value)}
              tip={field.tip}
              fieldFooter={effectiveFieldFooter}
              error={errorMessage}
            />
          )}
        </div>
      );
    } else if (field.type === 'select') {
      return (
        <div key={fieldKey}>
          <SelectInput
            label={field.label}
            value={String(state[field.key])}
            placeholder={field.placeholder}
            mandatory={field.isMandatory}
            readOnly={field.readOnly}
            isMulti={field.isMulti}
            canCreateOption={field.canCreateOption}
            options={field.options}
            onChange={value => setFormValue(field.key, value)}
            tip={field.tip}
            fieldFooter={effectiveFieldFooter}
            warning={errorMessage}
          />
        </div>
      );
    } else if (field.type === 'selectnumber') {
      return (
        <div key={fieldKey}>
          <SelectInput
            label={field.label}
            value={Number(state[field.key])}
            placeholder={field.placeholder}
            mandatory={field.isMandatory}
            readOnly={field.readOnly}
            isMulti={false}
            options={field.options}
            onChange={value => setFormValue(field.key, value)}
            tip={field.tip}
            fieldFooter={effectiveFieldFooter}
            warning={errorMessage}
          />
        </div>
      );
    }
  });

  return (
    <div
      onKeyDown={onEnter}
      className={cx(
        css({
          display: 'flex',
          flexDirection: 'column',
          width: 'min-content',
        }),
        className,
      )}
    >
      {fieldComps}
      <Flex direction="column" justify="center" align="center" className={childrenClassName}>
        <ButtonWithLoader
          key="submit"
          onClick={submit}
          isLoading={submitFailed || globalErroneous ? false : true}
          className={cx(css({ margin: space_M + ' 0', alignSelf: 'flex-start' }), buttonClassName)}
        >
          {submitLabel || i18n.form.submit}
        </ButtonWithLoader>
        {children}
      </Flex>
    </div>
  );
}
