type SectionProps = {
  title: string;
  children?: React.ReactNode;
};

export const Section = ({ title, children }: SectionProps): JSX.Element => {
  return (
    <section className="mb-10">
      <h2 className="text-neutral-500 mb-4">{title}</h2>
      {children}
    </section>
  );
};
