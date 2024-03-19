import React from "react";

type PanelProps = {
  children: React.ReactNode;
  hierarchy?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  title?: React.ReactNode;
};

export const Panel = ({
  children,
  hierarchy = "h3",
  title,
}: PanelProps): JSX.Element => {
  return (
    <div className="rounded-sm bg-black px-4 py-4 text-white font-medium">
      {title &&
        React.createElement(
          hierarchy,
          { className: "relative z-20 pl-3 mb-4" },
          title
        )}
      <div>{children}</div>
    </div>
  );
};
