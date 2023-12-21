/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { PasswordFeedback } from 'react-password-strength-bar';
import useTranslations from '../../../i18n/I18nContext';
import { space_lg, text_sm } from '../../../styling/style';
import Flex from '../layout/Flex';
import Button from './Button';
import Checkbox from './Checkbox';
import InlineLoading from './InlineLoading';
import { FormInput } from './Input';
import SelectInput from './SelectInput';
import { TipsProps } from './Tips';
import Toggler from './Toggler';

const PasswordStrengthBar = React.lazy(() => import('react-password-strength-bar'));

////////////////////////////////////////////////////////////////////////////////////////////////////
// Fields

interface BaseField<T> {
  key: keyof T;
  label?: React.ReactNode;
  type: 'text' | 'textarea' | 'password' | 'boolean' | 'select' | 'selectnumber';
  isMandatory: boolean;
  readOnly?: boolean;
  tip?: TipsProps['children'];
  footer?: React.ReactNode | ((data: T) => React.ReactNode);
  isErroneous?: (data: T) => boolean;
  errorMessage?: React.ReactNode | ((data: T) => React.ReactNode);
}

interface TextualField<T> extends BaseField<T> {
  type: 'text' | 'textarea';
  placeholder?: string;
  autoComplete?: string;
}

export interface PasswordScore {
  score: 0 | 1 | 2 | 3 | 4;
  feedback: PasswordFeedback;
}

interface PasswordField<T> extends BaseField<T> {
  type: 'password';
  placeholder?: string;
  autoComplete?: string;
  showStrengthBar: boolean;
  strengthProp?: keyof T;
}

interface BooleanField<T> extends BaseField<T> {
  type: 'boolean';
  showAs: 'toggle' | 'checkbox';
}

interface SelectField<T> extends BaseField<T> {
  type: 'select';
  placeholder?: string;
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

// is it really useful ? on August 2022, it is not used
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
  onSubmit: (data: T) => void;
  submitLabel: string;
  resetDataAfterSubmit?: boolean;
  children?: React.ReactNode;
  isSubmitInProcess?: boolean;
  globalErrorMessage?: React.ReactNode;
  className?: string;
  childrenClassName?: string;
  buttonClassName?: string;
}

export default function Form<T>({
  fields,
  value,
  onSubmit,
  submitLabel,
  resetDataAfterSubmit,
  children,
  isSubmitInProcess,
  globalErrorMessage,
  className,
  childrenClassName,
  buttonClassName,
}: FormProps<T>): JSX.Element {
  const i18n = useTranslations();

  const [state, setState] = React.useState<T>(value);
  const [showErrors, setShowErrors] = React.useState(false);
  let isFormErroneous = false;

  const setFormValue = React.useCallback((key: keyof T, value: unknown) => {
    // genuine hack inside: use setState as getter
    setState(s => {
      const newState = { ...s, [key]: value };
      return newState;
    });
  }, []);

  const submit = React.useCallback(() => {
    if (!isFormErroneous) {
      onSubmit(state);

      if (resetDataAfterSubmit) {
        setState(value);
      }
    } else {
      setShowErrors(true);
    }
  }, [isFormErroneous, onSubmit, state, resetDataAfterSubmit, value]);

  const onEnter = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter') {
        submit();
      }
    },
    [submit],
  );

  const doNotPropagateEnter = React.useCallback((event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter') {
      event.stopPropagation();
    }
  }, []);

  const fieldComps = fields.map(field => {
    const isFieldErroneous = field.isErroneous != null ? field.isErroneous(state) : false;
    const isFieldEmptyError = field.isMandatory
      ? String(state[field.key]).length === 0 || state[field.key] === null
      : false;
    isFormErroneous = isFormErroneous || isFieldErroneous || isFieldEmptyError;

    const fieldKey = `field-${String(field.key)}`;

    const errorMessage =
      showErrors && isFieldEmptyError
        ? i18n.basicComponent.form.missingMandatory
        : showErrors && isFieldErroneous
        ? field.errorMessage != null
          ? typeof field.errorMessage === 'function'
            ? field.errorMessage(state)
            : field.errorMessage
          : i18n.basicComponent.form.defaultFieldError
        : null;

    const effectiveFieldFooter =
      typeof field.footer === 'function' ? field.footer(state) : field.footer;

    if (field.type === 'text' || field.type === 'textarea') {
      return (
        <div key={fieldKey} onKeyDown={field.type === 'textarea' ? doNotPropagateEnter : undefined}>
          <FormInput
            label={field.label}
            value={String(state[field.key] || '')}
            placeholder={field.placeholder}
            type="text"
            inputType={field.type === 'text' ? 'input' : 'textarea'}
            mandatory={field.isMandatory}
            readOnly={field.readOnly}
            autoComplete={field.autoComplete}
            onChange={value => setFormValue(field.key, value)}
            tip={field.tip}
            footer={effectiveFieldFooter}
            errorMessage={errorMessage}
          />
        </div>
      );
    } else if (field.type === 'password') {
      return (
        <div key={fieldKey}>
          <FormInput
            label={field.label}
            value={String(state[field.key] || '')}
            placeholder={field.placeholder}
            type="password"
            mandatory={field.isMandatory}
            readOnly={field.readOnly}
            autoComplete={field.autoComplete}
            onChange={value => setFormValue(field.key, value)}
            tip={field.tip}
            footer={effectiveFieldFooter}
            errorMessage={errorMessage}
          />
          {field.strengthProp != null && (
            <div className={cx({ [css({ display: 'none' })]: !field.showStrengthBar })}>
              <React.Suspense fallback={<InlineLoading />}>
                <PasswordStrengthBar
                  barColors={['#ddd', '#ef4836', 'rgb(118, 176, 232)', '#2b90ef', '#01f590']}
                  scoreWordStyle={{ color: 'var(--text-primary)' }}
                  onChangeScore={(value: number, feedback: PasswordFeedback) => {
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
              footer={effectiveFieldFooter}
              errorMessage={errorMessage}
            />
          ) : (
            <Checkbox
              label={field.label}
              value={blnValue}
              readOnly={field.readOnly}
              onChange={value => setFormValue(field.key, value)}
              tip={field.tip}
              footer={effectiveFieldFooter}
              errorMessage={errorMessage}
            />
          )}
        </div>
      );
    } else if (field.type === 'select') {
      return (
        <div key={fieldKey} onKeyDown={doNotPropagateEnter}>
          <SelectInput
            label={field.label}
            value={String(state[field.key])}
            placeholder={field.placeholder}
            mandatory={field.isMandatory}
            readOnly={field.readOnly}
            isClearable={field.isMandatory}
            isMulti={field.isMulti}
            canCreateOption={field.canCreateOption}
            options={field.options}
            onChange={value => setFormValue(field.key, value)}
            tip={field.tip}
            footer={effectiveFieldFooter}
            errorMessage={errorMessage}
          />
        </div>
      );
    } else if (field.type === 'selectnumber') {
      // TODO see if really useful to have a selection of a number
      return (
        <div key={fieldKey} onKeyDown={doNotPropagateEnter}>
          <SelectInput
            label={field.label}
            value={Number(state[field.key])}
            mandatory={field.isMandatory}
            readOnly={field.readOnly}
            isClearable={field.isMandatory}
            isMulti={false}
            options={field.options}
            onChange={value => setFormValue(field.key, value)}
            tip={field.tip}
            footer={effectiveFieldFooter}
            errorMessage={errorMessage}
          />
        </div>
      );
    }
  });

  return (
    <>
      {globalErrorMessage != null && (
        <Flex
          className={cx(
            css({ color: 'var(--error-main)', textAlign: 'left', marginBottom: space_lg }),
            text_sm,
          )}
        >
          {globalErrorMessage}
        </Flex>
      )}
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
          <Button
            key="submit"
            onClick={submit}
            isLoading={isSubmitInProcess}
            className={cx(
              css({ margin: space_lg + ' 0', alignSelf: 'flex-start' }),
              buttonClassName,
            )}
          >
            {submitLabel}
          </Button>
          {children}
        </Flex>
      </div>
    </>
  );
}
