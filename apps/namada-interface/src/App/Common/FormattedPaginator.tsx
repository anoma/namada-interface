import clsx from "clsx";
import ReactPaginate, { ReactPaginateProps } from "react-paginate";

type FormattedPaginatorProps = ReactPaginateProps;

export const FormattedPaginator = (
  props: FormattedPaginatorProps
): JSX.Element => {
  return (
    <ReactPaginate
      className={clsx(
        "flex justify-center uppercase items-center gap-2 py-2 select-none",
        "[&_.disabled]:pointer-events-none [&_.disabled]:opacity-50",
        "[&_li:hover]:text-cyan",
        "[&_.previous]:mr-2 [&_.next]:ml-2",
        "[&_li]:px-0.5",
        "[&_.selected]:text-yellow [&_.selected]:border-b [&_.selected]:border-current"
      )}
      breakLabel="..."
      renderOnZeroPageCount={null}
      {...props}
    />
  );
};

export default FormattedPaginator;
