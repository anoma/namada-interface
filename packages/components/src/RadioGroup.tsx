import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { tv } from "tailwind-variants";

const radioGroup = tv({
  slots: {
    wrapper:
      "inline-flex bg-black rounded-[60px] p-0.5 overflow-hidden mx-auto",
    fieldset: "flex relative w-full h-full",
    container: "flex text-neutral-600 min-w-30 text-center",
    label:
      "cursor-pointer text-xs font-bold px-6 py-1.5 relative w-full select-none active:top-px",
    input: "unset [&:checked+span]:text-white",
    text: "relative transition-color duration-100 ease-out z-10 select-none",
    indicator: clsx(
      "bg-neutral-800 rounded-[58px] h-full absolute top-0 transition-all",
      "duration-100 ease-out"
    ),
  },
});

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

  const { wrapper, fieldset, container, label, input, text, indicator } =
    radioGroup();

  useEffect(() => {
    if (!initialSelectedRadio.current) return;
    updateIndicatorPosition(initialSelectedRadio.current);
  }, [value]);

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
    <div className={wrapper()}>
      <fieldset
        className={fieldset()}
        role="radiogroup"
        aria-labelledby={groupLabel}
        ref={panelRef}
      >
        {options.map((option, idx) => (
          <div key={`radio-${id}-${option.value}`} className={container()}>
            <label className={label()}>
              <input
                className={input()}
                type="radio"
                name={id}
                value={option.value.toString()}
                checked={value ? option.value === value : idx === 0}
                ref={(ref) =>
                  option.value === value || (!value && idx === 0)
                    ? (initialSelectedRadio.current = ref)
                    : null
                }
                onChange={(e) =>
                  _onChange(e.currentTarget, option.value.toString())
                }
              />
              <span className={text()}>{option.text}</span>
            </label>
          </div>
        ))}
        <span
          className={indicator()}
          style={{
            left: activeIndicatorPosition,
            width: activeIndicatorWidth,
          }}
        />
      </fieldset>
    </div>
  );
};
