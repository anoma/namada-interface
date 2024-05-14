import { Stack } from "@namada/components";

const Section: React.FC<{
  header: string;
  children?: React.ReactNode;
}> = ({ header, children }) => (
  <Stack as="section" className="text-sm" gap={4}>
    <h3 className="text-base">{header}</h3>
    {children}
  </Stack>
);

export const VoteHelpText: React.FC = () => (
  <Stack className="p-4" gap={8}>
    <Section header="Governance Votes:">
      <p>
        The following items summarize the voting options and what they mean for
        this proposal:
      </p>
      <p>
        YES - This person is your preferred candidate for AADAO’s Oversight Co
        mmittee.
      </p>
      <p>
        ABSTAIN - This person is not your preferred candidate (please remember
        to vote Yes on your preferred candidate’s proposal), or you wish to
        contribute to the quorum but you formally decline to vote either for or
        against the proposal.
      </p>
      <p>
        NO - No votes on this proposal will not have any impact on the election.
      </p>
    </Section>

    <Section header="Election results:">
      <p>
        While we understand that the three proposals may not “pass” or meet the
        quorum, we plan to tally the final “Yes” votes for each candidate,
        considering the number of ATOMs (not the number of wallets
        voting).Results will be deemed final for this election cycle, at the end
        of the voting period of all three proposals.
      </p>
    </Section>
  </Stack>
);
