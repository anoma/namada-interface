import { Input } from "@namada/components";
import clsx from "clsx";
import debounce from "lodash.debounce";
import { useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";

type ValidatorSearchProps = { onChange: (search: string) => void };

export const ValidatorSearch = ({
  onChange,
}: ValidatorSearchProps): JSX.Element => {
  const [displaySearchIcon, setDisplaySearchIcon] = useState(true);
  const debouncedSearch = useRef(
    debounce((value: string) => onChange(value), 300)
  );

  return (
    <div className="w-full text-neutral-500/50 flex mb-5 relative">
      <i
        className={clsx(
          "absolute text-sm left-3 top-5 z-20 pointer-events-none",
          { "opacity-0": !displaySearchIcon }
        )}
      >
        <FaSearch />
      </i>
      <Input
        type="search"
        placeholder="Search Validator"
        onChange={(e) => debouncedSearch.current(e.target.value)}
        className={clsx(
          "w-full [&_input]:text-sm [&_input]:text-neutral-400 [&_input]:border-neutral-400 [&_input]:py-2.5",
          "[&_input]:pl-4 [&_input]:rounded-sm [&_input]:placeholder:text-center",
          "[&_input]:placeholder:text-neutral-400/50 [&_input]:placeholder:text-left [&_input]:placeholder:pl-6"
        )}
        onFocus={() => setDisplaySearchIcon(false)}
        onBlur={(e) =>
          e.target.value.length === 0 && setDisplaySearchIcon(true)
        }
      />
    </div>
  );
};
