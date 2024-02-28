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
import CreateKeyForm from "./Common/CreateKeyForm";
import { SeedPhraseImport } from "./ImportAccount";
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
  const [currentPageTitle, setCurrentPageTitle] = useState("");

  const seedPhrase =
    accountSecret?.t === "Mnemonic" ? accountSecret.seedPhrase : undefined;

  const setCurrentPage = (pageTitle: string, step: number) => () => {
    setCurrentStep(step);
    setCurrentPageTitle(pageTitle);
  };

  return (
    <Container
      size="base"
      header={
        totalSteps > 0 && (
          <ContainerHeader
            pageTitle={currentPageTitle}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        )
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
                <Wrapper onLoad={() => setTotalSteps(5)}>
                  <Outlet />
                </Wrapper>
              }
            >
              {/* Create New Keys > New Seed Phrase Instructions + Button timeout */}
              <Route
                path={routes.accountCreationWarning()}
                element={
                  <Wrapper onLoad={setCurrentPage("New Seed Phrase", 1)}>
                    <SeedPhraseWarning
                      onComplete={() => {
                        navigate(routes.accountCreationSeed());
                      }}
                    />
                  </Wrapper>
                }
              />

              {/* Create New Keys > List of words */}
              <Route
                path={routes.accountCreationSeed()}
                element={
                  <Wrapper onLoad={setCurrentPage("New Seed Phrase", 2)}>
                    <SeedPhrase
                      defaultSeedPhrase={seedPhrase}
                      onConfirm={(seedPhrase: string[]) => {
                        setAccountSecret({
                          t: "Mnemonic",
                          seedPhrase,
                          passphrase: "",
                        });
                        navigate(routes.accountCreationConfirmKey());
                      }}
                    />
                  </Wrapper>
                }
              />

              {/* Create New Keys > Verify your seed phrase */}
              <Route
                path={routes.accountCreationConfirmKey()}
                element={
                  <Wrapper
                    onLoad={setCurrentPage("Verify your seed phrase", 3)}
                  >
                    <SeedPhraseConfirmation
                      accountCreationDetails={accountCreationDetails}
                      seedPhrase={seedPhrase || []}
                      passwordRequired={!passwordInitialized}
                      onConfirm={() => {
                        if (!seedPhrase?.length) {
                          navigate(routes.accountCreationWarning());
                          return;
                        }
                        navigate(routes.accountCreateKey());
                      }}
                    />
                  </Wrapper>
                }
              />

              {/* Create New Keys > Create account or key name */}
              <Route
                path={routes.accountCreateKey()}
                element={
                  <Wrapper onLoad={setCurrentPage("Create Your Account", 4)}>
                    <CreateKeyForm
                      passwordRequired={!passwordInitialized}
                      accountCreationDetails={accountCreationDetails}
                      onConfirm={(accountCreationDetails: AccountDetails) => {
                        if (!seedPhrase?.length) {
                          navigate(routes.accountCreationWarning());
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

              {/* Create New Keys > Confirmation  */}
              <Route
                path={routes.accountCreationComplete()}
                element={
                  <Wrapper onLoad={setCurrentPage("Namada Keys Created", 5)}>
                    <Completion
                      passwordRequired={!passwordInitialized}
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
              {/* Import Existing Keys > Write / Paste seed phrase */}
              <Route
                path={routes.accountImportSeed()}
                element={
                  <Wrapper onLoad={setCurrentPage("Import Existing Keys", 1)}>
                    <SeedPhraseImport
                      onConfirm={(accountSecret: AccountSecret) => {
                        setAccountSecret(accountSecret);
                        navigate(routes.accountImportCreate());
                      }}
                    />
                  </Wrapper>
                }
              />

              {/* Import Existing Keys > Setup keys name and/or password  */}
              <Route
                path={routes.accountImportCreate()}
                element={
                  <Wrapper
                    onLoad={setCurrentPage("Set Up Your Imported Keys", 2)}
                  >
                    <CreateKeyForm
                      passwordRequired={!passwordInitialized}
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

              {/* Import Existing Keys > Success screen */}
              <Route
                path={routes.accountImportComplete()}
                element={
                  <Wrapper onLoad={setCurrentPage("Namada Keys Imported", 3)}>
                    <Completion
                      passwordRequired={!passwordInitialized}
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
                  <Wrapper
                    onLoad={setCurrentPage("Connect Your Ledger Hardware", 1)}
                  >
                    <LedgerConnect />
                  </Wrapper>
                }
              />
              <Route
                path={routes.ledgerImport()}
                element={
                  <Wrapper
                    onLoad={setCurrentPage(
                      "Import Your Keys From Ledger Hardware",
                      2
                    )}
                  >
                    <LedgerImport passwordRequired={!passwordInitialized} />
                  </Wrapper>
                }
              />
              <Route
                path={routes.ledgerComplete()}
                element={
                  <Wrapper onLoad={setCurrentPage("Namada Keys Imported", 3)}>
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
