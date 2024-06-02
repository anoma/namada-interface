type TooltipStoryProps = {
  children: React.ReactNode;
};

export const TooltipStory = ({ children }: TooltipStoryProps): JSX.Element => {
  return (
    <>
      <div className="group/tooltip my-12 px-6 bg-neutral-200 text-center mx-auto relative">
        <button>Hover this button</button>
        {children}
      </div>
    </>
  );
};
