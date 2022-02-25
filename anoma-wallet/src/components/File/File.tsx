import React, { useRef } from "react";
import { StyledDiv, StyledButton, StyledSpan } from "./file.component";

type InputProps = {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  file: File | null;
  prompt: string;
  styleOverrides?: {
    container?: React.CSSProperties;
    button?: React.CSSProperties;
    span?: React.CSSProperties;
  };
};

const File = (props: InputProps): JSX.Element => {
  const { onChange, file, prompt = "Select file", styleOverrides = {} } = props;
  const { container, span, button } = styleOverrides;
  const name = file?.name || prompt;
  const ref = useRef<HTMLInputElement>(null);

  const handleClick = (): void => {
    ref.current?.click();
  };

  return (
    <StyledDiv style={container}>
      <input
        type="file"
        ref={ref}
        onChange={onChange}
        style={{ display: "none" }}
      />
      <StyledSpan onClick={handleClick} style={span}>
        {name}
      </StyledSpan>
      <StyledButton onClick={handleClick} style={button}>
        Browse
      </StyledButton>
    </StyledDiv>
  );
};

export default File;
