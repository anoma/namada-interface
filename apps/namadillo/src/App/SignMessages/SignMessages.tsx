import { ActionButton, Input, Modal, Stack } from "@namada/components";
import { ModalContainer } from "App/Common/ModalContainer";
import { routes } from "App/routes";
import { arbitraryMessagesAtom } from "atoms/arbitraryMessages";
import { signArbitraryEnabledAtom } from "atoms/settings";
import { useModalCloseEvent } from "hooks/useModalCloseEvent";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const SignMessages = (): JSX.Element => {
  const navigate = useNavigate();
  const signArbitraryEnabled = useAtomValue(signArbitraryEnabledAtom);
  const [message, setMessage] = useState<string>("");
  const { onCloseModal } = useModalCloseEvent();
  const { mutate, isPending, isSuccess, data } = useAtomValue(
    arbitraryMessagesAtom
  );

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    mutate(message);
  };

  useEffect(() => {
    if (!signArbitraryEnabled) {
      navigate(routes.root, { replace: true });
    }
  }, [signArbitraryEnabled]);

  return (
    <Modal onClose={onCloseModal}>
      <ModalContainer
        onClose={onCloseModal}
        header="Sign Arbitrary Message"
        containerProps={{
          className: "!w-[540px] !h-[420px] max-w-[90vw] max-h-[90vh]",
        }}
        contentProps={{
          className: "mt-4",
        }}
      >
        {/** Message form */}
        {!isSuccess && (
          <form className="flex flex-col gap-4 h-full" onSubmit={onSubmit}>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              variant="Textarea"
              placeholder="Type the message you want to sign"
              className="h-full [&>div]:h-full [&_textarea]:resize-none"
              readOnly={isPending}
              required
            />
            <ActionButton className="shrink-0" disabled={isPending}>
              {isPending ? "Signing..." : "Sign Message"}
            </ActionButton>
          </form>
        )}

        {/** Signed message */}
        {isSuccess && (
          <div className="flex flex-col items-center justify-center w-full h-full gap-4">
            <Stack gap={4} className="w-full h-full flex-1">
              <Input variant="ReadOnlyCopy" label="Hash" value={data?.hash} />
              <Input
                variant="ReadOnlyCopy"
                label="Signature"
                value={data?.signature}
              />
            </Stack>
            <ActionButton onClick={onCloseModal}>Close</ActionButton>
          </div>
        )}
      </ModalContainer>
    </Modal>
  );
};
