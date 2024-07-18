import { Heading } from "@namada/components";
import clsx from "clsx";
import { ReactNode } from "react";

type TransactionCardProps = {
  title: ReactNode;
  content: ReactNode;
  icon: ReactNode;
};

export const TransactionCard = ({
  title,
  content,
  icon,
}: TransactionCardProps): JSX.Element => {
  return (
    <article
      className={clsx(
        "grid grid-cols-[max-content_auto] items-center gap-3",
        "px-4 py-3 bg-neutral-900 rounded-md"
      )}
    >
      <i className="text-2xl text-yellow">{icon}</i>
      <div className="leading-[1.2]">
        <Heading level="h2" className="text-base text-white">
          {title}
        </Heading>
        <p className="text-sm text-neutral-400 font-medium">{content}</p>
      </div>
    </article>
  );
};
