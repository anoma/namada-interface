import { Input } from "@namada/components";
import clsx from "clsx";

type ValidatorSearchProps = { onChange: (search: string) => void };

export const ValidatorSearch = ({
  onChange,
}: ValidatorSearchProps): JSX.Element => {
  return (
    <>
      <div className="flex mb-5 max-w-[170px]">
        <Input
          type="search"
          placeholder="Search Validator"
          onChange={(e) => onChange(e.target.value)}
          className={clsx(
            "[&_input]:text-sm [&_input]:border-neutral-600 [&_input]:py-2.5",
            "[&_input]:rounded-xl [&_input]:placeholder:text-center"
          )}
        />
      </div>
    </>
  );
};
