import { Panel } from "@namada/components";
import clsx from "clsx";
export const SmallScreenBlocking = ({}): JSX.Element => {
  return (
    <main className="px-2 pb-1">
      <header
        className={clsx(
          "flex flex-col gap-2 items-center uppercase text-xl font-medium",
          "py-6 text-yellow"
        )}
      >
        <i className="w-12 rounded-full border-[5px] border-yellow aspect-square" />
        Namadillo
      </header>
      <Panel className="py-12 overflow-hidden flex justify-center items-center">
        <i className="h-[80vh] min-h-[380px] aspect-square border-yellow border-[24px] rounded-full"></i>
        <div className="absolute flex flex-col text-yellow items-center text-xl sm:text-3xl gap-8">
          <p className="max-w-[360px] mx-auto text-center leading-tight font-medium">
            Namada Dashboard is currently optimized for desktop only
          </p>
          <svg
            className="w-16"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 62 53"
          >
            <rect
              width="53"
              height="32.381"
              x="4.30469"
              y="4.21655"
              stroke="currentColor"
              strokeWidth="8"
            />
            <path
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth="8"
              d="M18.9746 48.2166h23.6606"
            />
          </svg>
        </div>
      </Panel>
    </main>
  );
};
