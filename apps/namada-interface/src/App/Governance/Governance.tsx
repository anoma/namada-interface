import {
  GovernanceContainer,
  ProposalCard,
  ProposalCardId,
  ProposalCardInfoContainer,
  ProposalCardStatusContainer,
  ProposalCardStatusInfo,
  ProposalCardText,
  ProposalCardVoteButton,
  ProposalCardVotes,
  ProposalDetails,
  ProposalDetailsAddresses,
  ProposalDetailsAddressesHeader,
  ProposalDetailsButtons,
  ProposalDetailsContent,
  ProposalsContainer,
} from "./Governance.components";
import { chains } from "@namada/chains";
import { SettingsState } from "slices/settings";
import { useAppSelector } from "store";
import { useCallback, useEffect, useState } from "react";
import { Query } from "@namada/shared";
import BigNumber from "bignumber.js";
import { getIntegration } from "@namada/hooks";
import { AccountType, Signer, Tokens } from "@namada/types";
import { Option, shortenAddress } from "@namada/utils";
import { Select } from "@namada/components";
import { AccountsState } from "slices/accounts";

const getStatus = (status: string, result?: string): string => {
  return result || status;
};

const ProposalCardVotes2 = ({
  yes,
  total,
}: {
  yes: string;
  total: string;
}): JSX.Element => {
  const yesNo = new BigNumber(yes);
  const totalNo = new BigNumber(total);

  const yesPercentage = yesNo.div(totalNo).times(100).toNumber();
  const noPercentage = 100 - yesPercentage;

  return (
    <ProposalCardVotes
      title={`Yes: ${yes}, Total: ${total} (${yesPercentage.toFixed(2)})%`}
      yes={yesPercentage}
      no={noPercentage}
    />
  );
};

export const Governance = (): JSX.Element => {
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const addresses = Object.keys(derived[chainId]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activeProposal, setActiveProposal] = useState<Option<Proposal>>(
    Option.none()
  );
  const [activeDelegator, setActiveDelegator] = useState<Option<string>>(
    Option.none()
  );
  const [delegators, setDelegators] = useState<
    Option<Record<string, BigNumber>>
  >(Option.none());
  const [activeProposalVotes, setActiveProposalVotes] = useState<
    Map<string, boolean>
  >(new Map());

  const { rpc } = chains[chainId];
  const query = new Query(rpc);

  const vote = useCallback(
    async (vote: boolean) => {
      const voteStr = vote ? "yay" : "nay";
      const integration = getIntegration(chainId);
      const signer = integration.signer() as Signer;

      const address = Option.match(
        activeDelegator,
        (address) => address,
        () => {
          throw new Error("No address selected");
        }
      );

      const proposalId = Option.match(
        activeProposal,
        (proposal) => proposal.id,
        () => {
          throw new Error("No proposal selected");
        }
      );

      await signer.submitVoteProposal(
        {
          tx: {
            token: Tokens.NAM.address || "",
            feeAmount: new BigNumber(0),
            gasLimit: new BigNumber(0),
            chainId,
          },
          signer: address,
          vote: voteStr,
          proposalId: BigInt(proposalId),
        },

        AccountType.Mnemonic
      );
    },
    [activeDelegator, activeProposal]
  );

  useEffect(() => {
    const fetchProposals = async (): Promise<void> => {
      try {
        const proposals = await query.query_proposals();
        const p = proposals.map((proposal: any) => ({
          ...proposal,
          start_epoch: BigInt(proposal.start_epoch),
          end_epoch: BigInt(proposal.end_epoch),
          grace_epoch: BigInt(proposal.grace_epoch),
        }));
        setProposals(p);
      } catch (e) {
        console.error(e);
        setProposals([]);
      }
    };
    fetchProposals();
  }, []);

  const onProposalClick = useCallback(async (proposal: Proposal) => {
    try {
      setActiveProposal(Option.some(proposal));

      const votes = await query.get_proposal_votes(BigInt(proposal.id));
      setActiveProposalVotes(new Map(votes));

      const totalDelegations = await query.get_total_delegations(
        addresses,
        //TODO: start_epoch should be BigInt
        proposal.start_epoch - BigInt(1)
      );
      setDelegators(Option.some(totalDelegations));
      setActiveDelegator(Option.some(Object.keys(totalDelegations)[0]));
    } catch (e) {
      // TODO: handle rpc error
    }
  }, []);

  return (
    <GovernanceContainer>
      <h1>Proposals</h1>
      <ProposalsContainer>
        {proposals.map((proposal, i) => (
          <ProposalCard key={i} onClick={() => onProposalClick(proposal)}>
            <ProposalCardStatusContainer>
              <ProposalCardStatusInfo
                className={getStatus(proposal.status, proposal.result)}
              >
                {getStatus(proposal.status, proposal.result)}
              </ProposalCardStatusInfo>
            </ProposalCardStatusContainer>
            <ProposalCardInfoContainer>
              <ProposalCardText>
                <ProposalCardId>{"#" + proposal.id}</ProposalCardId>
                {proposal.content.title}: {proposal.content.details}
              </ProposalCardText>
              {proposal.yes_votes && proposal.total_voting_power && (
                <ProposalCardVotes2
                  yes={proposal.yes_votes}
                  total={proposal.total_voting_power}
                />
              )}
            </ProposalCardInfoContainer>
          </ProposalCard>
        ))}
      </ProposalsContainer>
      {activeProposal.some && activeDelegator.some && delegators.some && (
        <ProposalDetails open onClick={() => setActiveProposal(Option.none())}>
          <ProposalDetailsContent onClick={(e) => e.stopPropagation()}>
            <h1>
              #{activeProposal.value.id} {activeProposal.value.content.title}
            </h1>
            <p>by: {activeProposal.value.content.authors}</p>
            <h3>Details:</h3>
            <p>{activeProposal.value.content.details}</p>
            <h3>Motivation:</h3>
            <p>{activeProposal.value.content.motivation}</p>
            <h3>License:</h3>
            <p>{activeProposal.value.content.license}</p>

            {activeProposal.value.status === "on-going" &&
              !activeProposal.value.result && (
                <>
                  <ProposalDetailsAddresses>
                    <ProposalDetailsAddressesHeader>
                      Vote with address:
                    </ProposalDetailsAddressesHeader>
                    <Select
                      value={activeDelegator.value}
                      data={Object.keys(delegators.value).map((a) => ({
                        value: a,
                        label: shortenAddress(a, 32, 32),
                      }))}
                      onChange={(e) => {
                        setActiveDelegator(Option.some(e.target.value));
                      }}
                    />
                    Power: {delegators.value[activeDelegator.value]}
                  </ProposalDetailsAddresses>
                  <ProposalDetailsButtons>
                    <ProposalCardVoteButton
                      onClick={() => vote(true)}
                      disabled={
                        activeProposalVotes.get(activeDelegator.value) === true
                      }
                      title={
                        activeProposalVotes.get(activeDelegator.value)
                          ? "You have already voted YAY"
                          : ""
                      }
                    >
                      Vote YAY
                    </ProposalCardVoteButton>
                    <ProposalCardVoteButton
                      onClick={() => vote(false)}
                      disabled={
                        activeProposalVotes.get(activeDelegator.value) === false
                      }
                      title={
                        !activeProposalVotes.get(activeDelegator.value)
                          ? "You have already voted NAY"
                          : ""
                      }
                      className="inverse"
                    >
                      Vote NAY
                    </ProposalCardVoteButton>
                  </ProposalDetailsButtons>
                </>
              )}
          </ProposalDetailsContent>
        </ProposalDetails>
      )}
    </GovernanceContainer>
  );
};

type Content = {
  abstract: string;
  authors: string;
  created: string;
  details: string;
  "discussions-to": string;
  license: string;
  motivation: string;
  requires: string;
  title: string;
};

type Proposal = {
  id: string;
  proposal_type: string;
  author: string;
  start_epoch: bigint;
  end_epoch: bigint;
  grace_epoch: bigint;
  content: Content;
  status: string;
  yes_votes?: string;
  total_voting_power?: string;
  result?: string;
};

const status = ["pending", "on-going"];
const result = [undefined, "passed", "rejected"];
const fakeProposals: Proposal[] = [...Array(9).keys()].map((i) => ({
  id: i + "",
  proposal_type: "Fake",
  author: "Author " + i,
  start_epoch: BigInt(i),
  end_epoch: BigInt(i + 10),
  grace_epoch: BigInt(i + 15),
  content: {
    abstract: "Abstract " + i,
    authors: "Authors " + i,
    created: "Created " + i,
    details:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "discussions-to": "Discussions-to " + i,
    license: "License " + i,
    motivation: "Motivation " + i,
    requires: "Requires " + i,
    title: "Title " + i,
  },
  status: status[Math.floor(Math.random() * status.length)],
  yes_votes: "400",
  total_voting_power: "6000",
  result: result[Math.floor(Math.random() * result.length)],
}));
