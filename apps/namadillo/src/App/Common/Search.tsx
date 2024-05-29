import { Input } from "@namada/components";
import clsx from "clsx";
import debounce from "lodash.debounce";
import { useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { twMerge } from "tailwind-merge";

type SearchProps = Omit<
  React.ComponentProps<typeof Input>,
  "onChange" | "onFocus" | "onBlur" | "type"
> & {
  onChange?: (search: string) => void;
};

export const Search = ({
  onChange,
  className,
  ...rest
}: SearchProps): JSX.Element => {
  const [displaySearchIcon, setDisplaySearchIcon] = useState(true);
  const debouncedSearch = useRef(
    debounce((value: string) => onChange?.(value), 300)
  );

  return (
    <div className="w-full text-neutral-500/50 flex relative">
      <i
        className={clsx(
          "absolute text-sm flex items-center left-3 top-0 h-full z-20 pointer-events-none",
          { "opacity-0": !displaySearchIcon }
        )}
      >
        <FaSearch />
      </i>
      <Input
        type="search"
        onChange={(e) => debouncedSearch.current(e.target.value)}
        className={twMerge(
          "w-full [&_input]:text-sm [&_input]:text-neutral-400 [&_input]:border-neutral-400 [&_input]:py-[11px]",
          "[&_input]:pl-4 [&_input]:rounded-sm [&_input]:placeholder:text-center",
          "[&_input]:placeholder:text-neutral-400/50 [&_input]:placeholder:text-left [&_input]:placeholder:pl-6",
          className
        )}
        onFocus={() => setDisplaySearchIcon(false)}
        onBlur={(e) =>
          e.target.value.length === 0 && setDisplaySearchIcon(true)
        }
        {...rest}
      />
    </div>
  );
};
