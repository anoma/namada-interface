import { twMerge } from "tailwind-merge";
type FooterProps = React.ComponentPropsWithoutRef<"div">;

export const Footer = ({ className, ...props }: FooterProps): JSX.Element => {
  return (
    <footer
      className={twMerge(
        "flex items-center justify-center w-full h-[50px] bg-black rounded-sm",
        className
      )}
      {...props}
    >
      <a href="https://namada.net" target="_blank" rel="nofollow noreferrer">
        <svg
          className="w-[180px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 179 17"
        >
          <path
            d="M15.993 16.072H11.43V4.95H4.688v11.122H.124V.381h15.869v15.691ZM65.69.389h-4.564V16.07h4.563V.39ZM76.337.389h-4.564V16.07h4.564V.39ZM71.012.389H66.45V16.07h4.563V.39ZM144.672 8.995h-4.564a4.032 4.032 0 0 0-4.028-4.034V.39a8.597 8.597 0 0 1 6.073 2.523 8.62 8.62 0 0 1 2.519 6.081"
            fill="#FF0"
          />
          <path
            d="M144.801 15.648h-15.212V.388h4.564v10.688h10.648v4.572ZM168.233 5.926h-4.564v4.612h4.564V5.926ZM178.876 5.926h-4.564v4.612h4.564V5.926ZM173.553 5.926h-4.563v4.612h4.563V5.926ZM173.553.389h-4.563V5h4.563V.39ZM168.233 11.459h-4.564v4.612h4.564V11.46ZM178.876 11.459h-4.564v4.612h4.564V11.46ZM168.233.389h-4.564V5h4.564V.39ZM178.876.389h-4.564V5h4.564V.39ZM110.488 15.864h-4.564V4.741h-6.742v11.123H94.62V.172h15.869v15.692Z"
            fill="#FF0"
          />
          <path
            d="M104.835 8.023a2.283 2.283 0 0 1-3.895 1.616 2.285 2.285 0 0 1 1.614-3.9 2.28 2.28 0 0 1 2.281 2.284ZM37.619.4l-4.516 7.833h9.032L37.62.4Z"
            fill="#FF0"
          />
          <path
            d="m33.108 8.227-4.515 7.832h9.03l-4.515-7.832ZM42.142 8.227l-4.516 7.832h9.032L42.14 8.227Z"
            fill="#FF0"
          />
        </svg>
      </a>
    </footer>
  );
};
