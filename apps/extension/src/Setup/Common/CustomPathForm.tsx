import React from "react";

import { Alert, LinkButton, Stack } from "@namada/components";
import { Bip44Path, Zip32Path } from "@namada/types";
import Bip44Form from "./Bip44Form";
import Zip32Form from "./Zip32Form";

type Props = {
  bip44Path: Bip44Path;
  zip32Path: Zip32Path;
  setBip44Path: (path: Bip44Path) => void;
  setZip32Path: (path: Zip32Path) => void;
};

const CustomPathForm: React.FC<Props> = ({
  bip44Path,
  zip32Path,
  setBip44Path,
  setZip32Path,
}) => {
  const handleReset = (): void => {
    setBip44Path({ account: 0, change: 0, index: 0 });
    setZip32Path({ account: 0 });
  };

  return (
    <div className="flex flex-col w-full">
      <div className="my-3">
        <Alert
          type="info"
          title="Please note"
          className="[&_strong]:normal-case"
        >
          <Stack gap={6}>
            <ul className="text-white list-disc mx-6 [&_button]:text-white">
              <li>
                You can create multiple addresses from one recovery phrase
              </li>
              <li>A lost path cannot be recovered</li>
              <li>
                If you&apos;re unfamiliar with this feature, skip or undo this
                step -{" "}
                <LinkButton
                  className="underline bold"
                  role="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleReset();
                  }}
                >
                  Reset
                </LinkButton>
              </li>
            </ul>
            <Bip44Form path={bip44Path} setPath={setBip44Path} />
            <Zip32Form path={zip32Path} setPath={setZip32Path} />
          </Stack>
        </Alert>
      </div>
    </div>
  );
};

export default CustomPathForm;
