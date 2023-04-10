import * as React from 'react';
import Flex from '../layout/Flex';
import Icon from '../layout/Icon';

function useDebounce(value: string | undefined, delay: number) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  });

  return debouncedValue;
}
export interface ISearchProps {
  onChangeSearchQuery: (searchQuery: string) => void;
}

export default function SearchInput(props: ISearchProps) {
  const [searchQuery, setSearchQuery] = React.useState<string | undefined>();
  const { onChangeSearchQuery } = props;
  const debouncedSearchQuery = useDebounce(searchQuery, 250);

  React.useEffect(() => {
    if (debouncedSearchQuery !== undefined) {
      onChangeSearchQuery(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, onChangeSearchQuery]);

  return (
    <Flex>
      <Icon icon={'search'} />
      <input
        id="search"
        className="form-control full-width"
        type="search"
        placeholder="Search..."
        aria-label="Search"
        onChange={event => setSearchQuery(event.target.value)}
      />
    </Flex>
  );
}
