type PageWithSidebar = {
  children: React.ReactNode;
};

export const PageWithSidebar = ({ children }: PageWithSidebar): JSX.Element => {
  return (
    <div className="w-full lg:grid lg:grid-cols-[auto_240px] gap-2">
      {children}
    </div>
  );
};
