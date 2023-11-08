import { useEffect, useRef, useState } from "react";
import {
  ActiveIndicator,
  RadioElement,
  RadioElementContainer,
  RadioGroupContainer,
  RadioGroupWrapper,
  RadioLabel,
  RadioText,
} from "./RadioGroup.components";

type RadioElement = {
  text: string;
  value: string;
};

type RadioGroupProps = {
  options: Array<RadioElement>;
  id: string;
  value: string;
  groupLabel: string;
  onChange: (value: string) => void;
};

export const RadioGroup = ({
  options,
  id,
  value,
  groupLabel,
  onChange,
}: RadioGroupProps): JSX.Element => {
  const [activeIndicatorPosition, setActiveIndicatorPosition] = useState("0px");
  const [activeIndicatorWidth, setActiveIndicatorWidth] = useState("0px");

  const panelRef = useRef<HTMLFieldSetElement>(null);
  const initialSelectedRadio = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!initialSelectedRadio.current) return;
    updateIndicatorPosition(initialSelectedRadio.current);
  }, []);

  const updateIndicatorPosition = (radioButton: HTMLInputElement): void => {
    if (!radioButton.parentElement || !panelRef.current) return;

    const labelRect = radioButton.parentElement.getBoundingClientRect();
    const panelRect = panelRef.current.getBoundingClientRect();
    const relativeLeft = labelRect.left - panelRect.left;
    setActiveIndicatorPosition(relativeLeft + "px");
    setActiveIndicatorWidth(labelRect.width + "px");
  };

  const _onChange = (radioButton: HTMLInputElement, value: string): void => {
    updateIndicatorPosition(radioButton);
    onChange(value);
  };

  return (
    <RadioGroupWrapper>
      <RadioGroupContainer
        role="radiogroup"
        aria-labelledby={groupLabel}
        ref={panelRef}
      >
        {options.map((option, idx) => (
          <RadioElementContainer key={`radio-${id}-${option.value}`}>
            <RadioLabel>
              <RadioElement
                name={id}
                value={option.value.toString()}
                defaultChecked={value ? option.value === value : idx === 0}
                ref={(ref) =>
                  option.value === value || (!value && idx === 0)
                    ? (initialSelectedRadio.current = ref)
                    : null
                }
                onChange={(e) =>
                  _onChange(e.currentTarget, option.value.toString())
                }
              />
              <RadioText>{option.text}</RadioText>
            </RadioLabel>
          </RadioElementContainer>
        ))}
        <ActiveIndicator
          left={activeIndicatorPosition}
          width={activeIndicatorWidth}
        />
      </RadioGroupContainer>
    </RadioGroupWrapper>
  );
};
