import React, { useState } from "react";
import {
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Container,
  LifecycleExecutionWrapper as Wrapper,
} from "@namada/components";
import { AccountSecret } from "background/keyring";
import { AnimatePresence, motion } from "framer-motion";
import { useCloseTabOnExtensionLock } from "hooks/useCloseTabOnExtensionLock";
import { usePasswordInitialized } from "hooks/usePasswordInitialized";
import { SeedPhrase, SeedPhraseConfirmation } from "./AccountCreation";
import { SeedPhraseWarning } from "./AccountCreation/SeedPhraseWarning";
import { Completion, ContainerHeader } from "./Common";
import { SeedPhraseImport, SeedPhraseSetup } from "./ImportAccount";
import { LedgerConfirmation, LedgerConnect, LedgerImport } from "./Ledger";
import { Start } from "./Start";
import routes from "./routes";
import { AccountDetails } from "./types";

type AnimatedTransitionProps = {
  elementKey: string;
  children: JSX.Element;
};

/**
 * This is a utility to animate transitions
 */
const AnimatedTransition: React.FC<AnimatedTransitionProps> = (props) => {
  const { children, elementKey } = props;
  return (
    <motion.div
      className="h-full"
      key={elementKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  );
};

export const Setup: React.FC = () => {
  useCloseTabOnExtensionLock();

  const passwordInitialized = usePasswordInitialized();
  const navigate = useNavigate();
  const location = useLocation();
  const [accountCreationDetails, setAccountCreationDetails] =
    useState<AccountDetails>({
      alias: "",
    });
  const [accountSecret, setAccountSecret] = useState<AccountSecret>();
  const [selectedAccountSecret, setSelectedAccountSecret] =
    useState<AccountSecret>();
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);

  const seedPhrase =
    accountSecret?.t === "Mnemonic" ? accountSecret.seedPhrase : undefined;

  const goToStep = (step: number) => () => setCurrentStep(step);

  return (
    <Container
      size="base"
      header={
        <ContainerHeader currentStep={currentStep} totalSteps={totalSteps} />
      }
    >
      <AnimatePresence>
        <AnimatedTransition elementKey={location.pathname}>
          <Routes>
            {/* Index */}
            <Route
              path={routes.start()}
              element={
                <Wrapper onLoad={() => setTotalSteps(0)}>
                  <Start />
                </Wrapper>
              }
            />

            {/* Create New Keys */}
            <Route
              element={
                <Wrapper onLoad={() => setTotalSteps(4)}>
                  <Outlet />
                </Wrapper>
              }
            >
              <Route
                path={routes.accountCreationWarning()}
                element={
                  <Wrapper onLoad={goToStep(1)}>
                    <SeedPhraseWarning
                      onComplete={() => {
                        navigate(routes.accountCreationSeed());
                      }}
                    />
                  </Wrapper>
                }
              />
              <Route
                path={routes.accountCreationSeed()}
                element={
                  <Wrapper onLoad={goToStep(2)}>
                    <SeedPhrase
                      accountCreationDetails={accountCreationDetails}
                      defaultSeedPhrase={seedPhrase}
                      onConfirm={(seedPhrase: string[]) => {
                        setAccountSecret({
                          t: "Mnemonic",
                          seedPhrase,
                          passphrase: "",
                        });
                        navigate(routes.accountCreationConfirm());
                      }}
                    />
                  </Wrapper>
                }
              />
              <Route
                path={routes.accountCreationConfirm()}
                element={
                  <Wrapper onLoad={goToStep(3)}>
                    <SeedPhraseConfirmation
                      accountCreationDetails={accountCreationDetails}
                      seedPhrase={seedPhrase || []}
                      passwordRequired={!passwordInitialized}
                      onConfirm={(accountCreationDetails: AccountDetails) => {
                        if (!seedPhrase?.length) {
                          navigate(routes.accountCreationConfirm());
                          return;
                        }
                        setAccountCreationDetails(accountCreationDetails);
                        setSelectedAccountSecret({
                          t: "Mnemonic",
                          seedPhrase,
                          passphrase: "",
                        });
                        setAccountSecret(undefined); // this also sets seedPhrase to undefined
                        navigate(routes.accountCreationComplete());
                      }}
                    />
                  </Wrapper>
                }
              />
              <Route
                path={routes.accountCreationComplete()}
                element={
                  <Wrapper onLoad={goToStep(4)}>
                    <Completion
                      passwordRequired={!passwordInitialized}
                      pageTitle="Namada Keys Created"
                      pageSubtitle="Here are the accounts generated from your keys"
                      alias={accountCreationDetails.alias || ""}
                      accountSecret={selectedAccountSecret}
                      password={accountCreationDetails.password || ""}
                      scanAccounts={false}
                    />
                  </Wrapper>
                }
              />
            </Route>

            {/* Import Existing Keys */}
            <Route
              element={
                <Wrapper onLoad={() => setTotalSteps(3)}>
                  <Outlet />
                </Wrapper>
              }
            >
              <Route
                path={routes.accountImportSeed()}
                element={
                  <Wrapper onLoad={goToStep(1)}>
                    <SeedPhraseImport
                      onConfirm={(accountSecret: AccountSecret) => {
                        setAccountSecret(accountSecret);
                        navigate(routes.accountImportPassword());
                      }}
                    />
                  </Wrapper>
                }
              />
              <Route
                path={routes.accountImportPassword()}
                element={
                  <Wrapper onLoad={goToStep(2)}>
                    <SeedPhraseSetup
                      passwordRequired={!passwordInitialized}
                      accountCreationDetails={accountCreationDetails}
                      accountSecret={accountSecret}
                      onConfirm={(accountCreationDetails: AccountDetails) => {
                        if (!accountSecret) {
                          navigate(routes.accountImportSeed());
                          return;
                        }
                        setSelectedAccountSecret(accountSecret);
                        setAccountCreationDetails(accountCreationDetails);
                        navigate(routes.accountImportComplete());
                      }}
                    />
                  </Wrapper>
                }
              />
              <Route
                path={routes.accountImportComplete()}
                element={
                  <Wrapper onLoad={goToStep(3)}>
                    <Completion
                      passwordRequired={!passwordInitialized}
                      pageTitle="Namada Keys Imported"
                      pageSubtitle="Here are the accounts generated from your keys"
                      alias={accountCreationDetails.alias || ""}
                      accountSecret={selectedAccountSecret}
                      password={accountCreationDetails.password || ""}
                      scanAccounts={false}
                    />
                  </Wrapper>
                }
              />
            </Route>

            {/* Connect to Ledger */}
            <Route
              element={
                <Wrapper onLoad={() => setTotalSteps(3)}>
                  <Outlet />
                </Wrapper>
              }
            >
              <Route
                path={routes.ledgerConnect()}
                element={
                  <Wrapper onLoad={() => setCurrentStep(1)}>
                    <LedgerConnect />
                  </Wrapper>
                }
              />
              <Route
                path={routes.ledgerImport()}
                element={
                  <Wrapper onLoad={() => setCurrentStep(2)}>
                    <LedgerImport passwordRequired={!passwordInitialized} />
                  </Wrapper>
                }
              />
              <Route
                path={routes.ledgerComplete()}
                element={
                  <Wrapper onLoad={() => setCurrentStep(3)}>
                    <LedgerConfirmation />
                  </Wrapper>
                }
              />
            </Route>
          </Routes>
        </AnimatedTransition>
      </AnimatePresence>
    </Container>
  );
};
