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
import { useAppDispatch } from '../../../store/hooks';
import { addNotification } from '../../../store/notification';
import { space_M, textSmall } from '../../styling/style';
import ButtonWithLoader from '../ButtonWithLoader';
import Flex from '../Flex';
import InlineLoading from '../InlineLoading';
import { TipsProps } from '../Tips';
import Checkbox from './Checkbox';
import Input from './Input';
import SelectInput from './SelectInput';
import Toggler from './Toggler';

const PasswordStrengthBar = React.lazy(() => import('react-password-strength-bar'));

export const mailformat = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Fields

interface BaseField<T> {
  key: keyof T;
  label?: React.ReactNode;
  placeholder?: string;
  type: 'text' | 'textarea' | 'password' | 'boolean' | 'select' | 'selectnumber';
  isMandatory: boolean;
  readonly?: boolean;
  tip?: TipsProps['children'];
  fieldFooter?: React.ReactNode;
  isErroneous?: (entity: T) => boolean;
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
  showStrenghBar: boolean;
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
  autoSubmit?: boolean;
  onSubmit: (entity: T) => void;
  submitLabel?: string;
  children?: React.ReactNode;
  className?: string;
  childrenClassName?: string;
  buttonClassName?: string;
}

export default function Form<T>({
  fields,
  value,
  autoSubmit = false,
  onSubmit,
  submitLabel,
  children,
  className,
  childrenClassName,
  buttonClassName,
}: FormProps<T>): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const [state, setState] = React.useState<T>(value);
  const [showErrors, setShowErrors] = React.useState(false);

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

  const submit = React.useCallback(() => {
    if (!globalErroneous) {
      onSubmit(state);
    } else {
      setShowErrors(true);
      dispatch(addNotification({ status: 'OPEN', type: 'WARN', message: i18n.pleaseProvideData }));
    }
  }, [globalErroneous, onSubmit, state, dispatch, i18n.pleaseProvideData]);

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

    if (field.type === 'text' || field.type === 'textarea') {
      return (
        <div key={fieldKey}>
          <Input
            label={field.label}
            value={String(state[field.key] || '')}
            placeholder={field.placeholder}
            type="text"
            inputType={field.type === 'text' ? 'input' : 'textarea'}
            mandatory={field.isMandatory}
            readonly={field.readonly}
            onChange={value => setFormValue(field.key, value)}
            tip={field.tip}
            error={errorMessage}
          />
          {field.fieldFooter != null && field.fieldFooter}
        </div>
      );
    } else if (field.type === 'select') {
      return (
        <div key={fieldKey}>
          <SelectInput
            value={String(state[field.key])}
            label={field.label}
            placeholder={field.placeholder}
            tip={field.tip}
            options={field.options}
            warning={errorMessage}
            mandatory={field.isMandatory}
            isMulti={field.isMulti}
            onChange={value => setFormValue(field.key, value)}
            readonly={field.readonly}
            canCreateOption={field.canCreateOption}
            className={textSmall}
          />
          {field.fieldFooter != null && field.fieldFooter}
        </div>
      );
    } else if (field.type === 'selectnumber') {
      return (
        <div key={fieldKey}>
          <SelectInput
            value={Number(state[field.key])}
            label={field.label}
            placeholder={field.placeholder}
            tip={field.tip}
            options={field.options}
            warning={errorMessage}
            mandatory={field.isMandatory}
            isMulti={false}
            onChange={value => setFormValue(field.key, value)}
            readonly={field.readonly}
          />
          {field.fieldFooter != null && field.fieldFooter}
        </div>
      );
    } else if (field.type === 'password') {
      return (
        <div key={fieldKey}>
          <Input
            label={field.label}
            value={String(state[field.key] || '')}
            placeholder={field.placeholder}
            type="password"
            mandatory={field.isMandatory}
            readonly={field.readonly}
            onChange={value => setFormValue(field.key, value)}
            tip={field.tip}
            error={errorMessage}
          />
          {field.fieldFooter != null && field.fieldFooter}
          {field.strengthProp != null && (
            <div className={cx({ [css({ display: 'none' })]: !field.showStrenghBar })}>
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
              disabled={field.readonly}
              onChange={value => setFormValue(field.key, value)}
              tip={field.tip}
              error={errorMessage}
            />
          ) : (
            <Checkbox
              label={field.label}
              value={blnValue}
              disabled={field.readonly}
              onChange={value => setFormValue(field.key, value)}
              tip={field.tip}
              error={errorMessage}
            />
          )}
          {field.fieldFooter != null && field.fieldFooter}
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
        }),
        className,
      )}
    >
      {fieldComps}
      <Flex direction="column" justify="center" align="center" className={childrenClassName}>
        {!autoSubmit && (
          <ButtonWithLoader
            key="submit"
            onClick={submit}
            isLoading={globalErroneous ? false : true}
            className={cx(
              css({ margin: space_M + ' 0', alignSelf: 'flex-start' }),
              buttonClassName,
            )}
          >
            {submitLabel || i18n.form.submit}
          </ButtonWithLoader>
        )}
        {children}
      </Flex>
    </div>
  );
}
