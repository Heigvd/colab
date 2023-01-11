import * as React from 'react';
import Flex from '../layout/Flex';

export interface ISortersProps<T> {
  object?: T;
  onChangeSorter: (sortProperty: keyof T, isDescending: boolean) => void;
}

export default function Sorters<T>({ object, onChangeSorter }: ISortersProps<T>) {
  return (
    <Flex>
      <span>
        Sort:
      </span>
      <select
        id="sorters"
        className="custom-select"
        onChange={event =>
          onChangeSorter(
            event.target.value.split(',')[0] as keyof T,
            event.target.value.split(',')[1] === 'true',
          )
        }
        defaultValue={['title', 'true']}
      >
        {typeof object === 'object' &&
          !Array.isArray(object) &&
          object !== null &&
          Object.keys(object).map(key => {
            if (!key) {
              return <></>;
            }
            return (
              <>
                <option key={`${key}-true`} value={[key, 'true']}>
                  {key} desc
                </option>
                <option key={`${key}-false`} value={[key, 'false']}>
                  {key} asc
                </option>
              </>
            );
          })}
      </select>
    </ Flex>
  );
}
