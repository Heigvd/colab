import * as React from 'react';

export interface IFilter<T> {
  property: keyof T;
  isTruthyPicked: boolean;
}

export function genericFilter<T>(object: T, filters: Array<IFilter<T>>) {
  if (filters.length === 0) {
    return true;
  }
  return filters.every(filter => {
    return filter.isTruthyPicked ? object[filter.property] : !object[filter.property];
  });
}

export interface IFiltersProps<T> {
  object?: T;
  filters: Array<IFilter<T>>;
  onChangeFilter: (filterProperty: keyof T, checked: boolean, isTruthyPicked: boolean) => void;
}

export function Filters<T>(props: IFiltersProps<T>) {
  const { object, filters, onChangeFilter } = props;

  const labelTruthy = (
    <>
      is <b>truthy</b>
    </>
  );

  const labelFalsy = (
    <>
      is <b>falsy</b>
    </>
  );

  return (
    <div className="p-1 my-2">
      <label className="mt-3">Filters</label>
      {typeof object === 'object' &&
        !Array.isArray(object) &&
        object !== null &&
        Object.keys(object).map(key => {
          const getRadioButton = (isTruthyPicked: boolean): React.ReactNode => {
            const id = isTruthyPicked ? `radio-defined-${key}` : `radio-not-defined-${key}`;
            const label = isTruthyPicked ? labelTruthy : labelFalsy;

            const getChecked = () => {
              const x = filters.filter(x => x.property === key);
              return x.length === 1 && x[0] && x[0].isTruthyPicked === isTruthyPicked;
            };

            return (
              <>
                <input
                  type="radio"
                  id={id}
                  value={key}
                  checked={getChecked()}
                  onChange={event =>
                    onChangeFilter(key as keyof T, event.target.checked, isTruthyPicked)
                  }
                  className={'m-1 ml-3'}
                />
                <label htmlFor={id}>
                  '{key}' {label}
                </label>
              </>
            );
          };

          return (
            <div key={key} className="input-group my-3">
              {getRadioButton(true)}
              {getRadioButton(false)}
            </div>
          );
        })}
    </div>
  );
}
