import { Heading, Panel, Stack } from "@namada/components";
import {
  GoArrowLeft,
  GoCheckCircle,
  GoCheckCircleFill,
  GoCopy,
  GoEye,
  GoEyeClosed,
  GoGear,
  GoUnlock,
} from "react-icons/go";
import { Color } from "./Color";
import { Section } from "./Section";

export const CheatSheet = (): JSX.Element => {
  return (
    <div className="bg-neutral-800 px-12 py-8 text-white">
      <Section title="Text">
        <Stack gap={3}>
          <Heading className="text-xl">Main Titles - 20px</Heading>
          <Heading className="text-base">Body Text - 16px</Heading>
          <Heading className="text-sm">
            Warning & Descriptor text - 14px
          </Heading>
        </Stack>
      </Section>
      <Section title="Main colours">
        <Stack as="ul" gap={8} direction="horizontal">
          <Color className="bg-black" rgb="#141414" />
          <Color className="bg-yellow" rgb="#FFFF00" textDark />
          <Color className="bg-gray border border-white" rgb="#292929" />
          <Color className="bg-white" rgb="#FFFFFF" textDark />
        </Stack>
      </Section>
      <Section title="Secondary">
        <Stack as="ul" gap={8} direction="horizontal">
          <Color
            className="bg-cyan"
            rgb="#00FFFF"
            textDark
            description="Shielded features"
          />
          <Color className="bg-success" rgb="#15DD89" description="Success" />
          <Color
            className="bg-intermediate"
            rgb="#F48708"
            description="Intermediate"
          />
          <Color className="bg-fail" rgb="#DD1539" description="Fail" />
        </Stack>
      </Section>
      <Section title="Icons">
        <Stack
          className="text-white text-2xl"
          as="ul"
          direction="horizontal"
          gap={3}
        >
          <li>
            <GoArrowLeft />
          </li>
          <li>
            <GoUnlock />
          </li>
          <li>
            <GoGear />
          </li>
          <li>
            <GoCopy />
          </li>
          <li>
            <GoEye />
          </li>
          <li>
            <GoEyeClosed />
          </li>
          <li>
            <GoCheckCircle />
          </li>
          <li>
            <GoCheckCircleFill />
          </li>
        </Stack>
        <a
          href="https://react-icons.github.io/react-icons/icons/go/"
          target="_blank"
          className="block mt-4"
          rel="nofollow noreferrer"
        >
          https://react-icons.github.io/react-icons/icons/go/
        </a>
      </Section>
      <div className="inline-flex bg-black rounded-lg py-12 px-20">
        <Section title="Module size">
          <Panel>
            <span className="absolute top-20 w-full bg-white h-px">
              <span className="relative text-xs text-center -top-6 w-full block">
                540px (fixed)
              </span>
            </span>
            <span className="flex items-center absolute top-0 left-20 h-full w-px bg-white">
              <span className="relative left-4 text-xs text-nowrap">
                600px base (variable +)
              </span>
            </span>
          </Panel>
        </Section>
      </div>
    </div>
  );
};
