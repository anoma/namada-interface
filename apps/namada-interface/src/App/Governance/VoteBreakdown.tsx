export const VoteBreakdown: React.FC = () => {
  return (
    <div className="grid grid-cols-[1fr_2px_1fr] gap-x-4">
      <div>
        <h3 className="text-[#8A8A8A]">Voted Validators</h3>
        <p className="text-3xl">80/257</p>
      </div>

      <b className="bg-[#151515]" />
      <p>-</p>
    </div>
  );
};
