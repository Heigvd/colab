import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { useEffect, useState } from "react";
import Flex from "../layout/Flex";

function useDebounce(value: string | undefined, delay: number) {

    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(
        () => {
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);

            return () => {
                clearTimeout(handler);
            };
        }
    );

    return debouncedValue;
}
export interface ISearchProps {
  onChangeSearchQuery: (searchQuery: string) => void;
}

export default function SearchInput(props: ISearchProps) {
    const [searchQuery, setSearchQuery] = useState<string | undefined>();
    const { onChangeSearchQuery } = props;
    const debouncedSearchQuery = useDebounce(searchQuery, 250);
  
    useEffect(() => {
      if (debouncedSearchQuery !== undefined) {
        onChangeSearchQuery(debouncedSearchQuery);
      }
    }, [debouncedSearchQuery, onChangeSearchQuery]);
  
    return (
      <Flex>
        <FontAwesomeIcon icon={faSearch}/>
        <input
          id="search"
          className="form-control full-width"
          type="search"
          placeholder="Search..."
          aria-label="Search"
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </ Flex>
    );
  }