import { twMerge } from "tailwind-merge";

const InfoCard: React.FC<
  {
    title: string;
    content: string;
  } & React.ComponentProps<"div">
> = ({ title, content, className, ...rest }) => (
  <div className={twMerge("bg-[#1B1B1B] rounded-sm p-2", className)} {...rest}>
    <div className="text-sm text-[#8A8A8A]">{title}</div>
    <div className="text-base">{content}</div>
  </div>
);

export const VoteInfoCards: React.FC = () => {
  return (
    <div className="grid grid-cols-3 gap-2 m-4">
      <InfoCard title="Voting Start" content="Dec 16th 2023, 19:21" />
      <InfoCard title="Voting End" content="Dec 16th 2023, 19:21" />
      <InfoCard title="Submit Time" content="Dec 16th 2023, 19:21" />
      <InfoCard title="Deposit End" content="Dec 16th 2023, 19:21" />
      <InfoCard title="Initial Deposit" content="250.000000 NAM" />
      <InfoCard title="Initial Deposit" content="250.000000 NAM" />
      <InfoCard
        title="Proposer"
        content="tknam13jfi53tgjefji3rh45hgehhgfhjejrhgfj45gej45gj"
        className="col-span-full"
      />
    </div>
  );
};
