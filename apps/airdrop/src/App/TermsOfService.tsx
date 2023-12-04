import { ActionButton, Heading, Stack } from "@namada/components";
import {
  MainContainer,
  TermsOfServiceContainer,
  TermsOfServiceFooter,
  TermsOfServiceGlobalStyles,
} from "./App.components";
import { ExternalPageIcon } from "./Icons/ExternalPageIcon";
import { useNavigate } from "react-router-dom";

export const TermsOfService = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <MainContainer blurred={false}>
      <TermsOfServiceGlobalStyles />
      <TermsOfServiceContainer>
        <hgroup>
          <Heading themeColor="utility1" textAlign="left" level="h1" size="2xl">
            Terms of Service (This is a Placeholder!)
          </Heading>
          <p>Last Revised on 2023-09-07</p>
        </hgroup>
        <p>
          Welcome to the Supplemental Terms (these &quot;Airdrop Program
          Terms&quot; or &quot;Terms&quot;) for the Airdrop Program (the
          “Airdrop Program&quot; or the &quot;Program&quot;) as operated on
          behalf of Strange Loop Labs AG (&quot;Company&quot;, &quot;we&quot; or
          &quot;us&quot;). The Airdrop Program provides eligible users the
          opportunity to earn rewards, which may include Celestia tokens. These
          Terms are supplemental to, and incorporate by reference, the broader
          Celestia Terms of Service (&quot;Services Terms&quot;) available at{" "}
          <a
            href="https://celestia.org/tos/"
            target="_blank"
            rel="nofollow noreferrer"
          >
            https://celestia.org/tos/
          </a>
          . Defined terms used but not defined herein have the meaning set forth
          in the Services Terms. The Program and your participation in it is a
          Service as defined under the Services Terms. These Terms govern your
          ability to participate in the Program and any awards you receive from
          that participation, which may include Celestia tokens (&quot;Airdrop
          Rewards&quot;).
        </p>
        <p>
          Please read these Terms carefully, as they include important
          information about your legal rights. By participating in the Program
          or claiming Airdrop Rewards, you are agreeing to these Terms. If you
          do not understand or agree to these Terms, please do not participate
          in the Program or claim Airdrop Rewards.
        </p>
        <p>
          Terms of ServiceIn order to participate in the Program, you must
          provide certain information about you. Our collection of such
          information, your rights with respect to such collection, and other
          relevant information is described in the Celestia Privacy Policy
          available at{" "}
          <a
            href="https://celestia.org/privacy/"
            target="_blank"
            rel="nofollow noreferrer"
          >
            https://celestia.org/privacy/
          </a>
          , and is supplemented by Section 3 of these Terms.
        </p>
        <p>
          The Program is a discretionary Service provided by the Company,
          pursuant to which the Company may, in its sole discretion, provide you
          Airdrop Rewards if you satisfy certain criteria designated by the
          Company or its affiliates (the “Qualifying Criteria”). Please note
          that the Qualifying Criteria may involve activities on third-party
          websites, services, or blockchain networks. No such websites,
          services, or blockchain networks are a Service or constitute an
          element of the Services. We do not control the Celestia Protocol and
          accept no liability for its operation or its deployment in any testnet
          or mainnet environment.
        </p>
        <Heading themeColor="utility1" textAlign="left" level="h2" size="xl">
          1. General terms
        </Heading>
        <ol>
          <li>
            <p>
              1.1 You must be eighteen (18) years of age or older and capable of
              forming a binding contract with the Company in order to
              participate in the Program or receive Airdrop Rewards.
            </p>
          </li>
          <li>
            <p>
              1.2 You agree and acknowledge that you (a) may receive Airdrop
              Rewards for free (other than applicable taxes, if any) from your
              participation in the Program, (b) were not previously promised
              Airdrop Rewards, unless pursuant to a separate written agreement,
              and (c) took no action in anticipation of or in reliance Terms of
              Serviceon receiving any Airdrop Rewards, unless pursuant to a
              separate written agreement.
            </p>
          </li>

          <li>
            <p>
              1.3 Your eligibility to participate in or receive Airdrop Rewards
              from the Program is subject to our sole discretion. The complete
              list of Qualifying Criteria you must satisfy to earn Airdrop
              Rewards may not have been described in the documentation released
              by us from time to time; you may not receive Airdrop Rewards even
              if you satisfy such Qualifying Criteria or were previously
              informed that you were entitled to receive Airdrop Rewards; and no
              documentation related to the Program entitles you to any Airdrop
              Rewards or to participate in the Program.
            </p>
          </li>
          <li>
            <p>
              1.4 You agree and acknowledge that (a) you are not a Prohibited
              Person, (b) you are not a U.S. Person as defined in Rule 902(k) of
              Regulation S under the U.S. Securities Act of 1933, as amended
              (the &quot;1933 Act&quot; or &quot;Act&quot;), (c) you will not
              use a VPN or other tool to circumvent any geoblock or other
              restrictions that we may have implemented for participants in the
              Program, and (d) you are not participating in, and have not become
              eligible to participate in, the Program by receiving credentials
              from any other person or entity. Any circumvention or violation of
              the above will permanently disqualify you from participation in
              the Program.
            </p>
          </li>
          <li>
            <p>
              1.5 You agree and acknowledge that if you are unable to claim
              Airdrop Rewards due to technical bugs, gas fees, loss of access to
              a Wallet or the keys thereto, or for any other reason, you will
              have no recourse or claim against us or any other Company Entity
              and that neither we nor any other Company Entity will bear any
              liability.
            </p>
          </li>
          <li>
            <p>
              1.6 You agree and acknowledge that claiming Airdrop Rewards may
              require reliance on or an integration with third party products
              (e.g., a Wallet, a network, or blockchain) that we do not control.
              In the event that you are unable to access such Terms of
              Serviceproducts or integrations, or if they fail for any reason,
              and you are unable to participate in the Program or claim Airdrop
              Rewards, you will have no recourse or claim against us or any
              other Company Entity and neither we nor any other Company Entity
              will bear any liability.
            </p>
          </li>
          <li>
            <p>
              1.7 The Company may share information with certain vendors or
              third-party providers who provide sanctions and watchlist
              screening services or sybil detection services (the
              &quot;Third-Party Services&quot;). You agree that the Company is
              not responsible or liable for, and makes no representations as to
              any aspect of such Third-Party Services, including, without
              limitation, their content or the manner in which they handle,
              protect, manage or process data or any interaction between you and
              the provider of such Third-Party Services. You irrevocably waive
              any claim against the Company with respect to such Third-Party
              Services. We are not liable for any damage or loss caused or
              alleged to be caused by or in connection with your enablement,
              access or use of any such Third-Party Services, or your reliance
              on the privacy practices, data security processes or other
              policies of such Third-Party Services.
            </p>
          </li>
        </ol>
        <Heading themeColor="utility1" textAlign="left" level="h2" size="xl">
          2. Taxes
        </Heading>
        <ol>
          <li>
            <p>
              2.1 You are responsible for the payment of all taxes associated
              with your participation in the Program and your receipt of Airdrop
              Rewards. You agree to provide the Company with any additional
              information and complete any required tax or other forms relating
              to your receipt of Airdrop Rewards. You may suffer adverse tax
              consequences as a result of your participation in the Program or
              your receipt of Airdrop Rewards. You hereby represent that (a) you
              have consulted with a tax adviser that you deem advisable in
              connection with your participation, or that you have had the
              opportunity to obtain tax advice but have chosen not to do so, (b)
              the Company has not provided you with any tax advice with respect
              to your participation, and (c) you are not relying on the Company
              for any tax advice.
            </p>
          </li>
        </ol>
        <Heading themeColor="utility1" textAlign="left" level="h2" size="xl">
          3. Supplemental Privacy Information
        </Heading>
        <ol>
          <li>
            <p>
              We may collect information to help us determine your satisfaction
              of the Qualifying Criteria.
            </p>
          </li>
          <li>
            <p>
              Additionally, we may collect certain information about you from
              Third-Party Services and may combine information we receive from
              you with information we obtain from Third-Party Services.
            </p>
          </li>
          <li>
            <p>
              The information we collect from you and/or from Third-Party
              Services includes but is not limited to:
            </p>
            <ul>
              <li>
                <p>
                  Transaction information. Information related to transactions
                  in your Wallet, your Wallet address, activities performed
                  using your Wallet, tokens received by your Wallet, or
                  transactions initiated or completed.
                </p>
              </li>
              <li>
                <p>
                  Information about your use of third-party websites or
                  services. Information related to your use of or activity on
                  third-party websites or services.
                </p>
              </li>
              <li>
                <p>
                  IP address. The IP address you use to access the Airdrop
                  Program.
                </p>
              </li>
            </ul>
          </li>
          <li>
            <p>
              We collect this information to confirm your eligibility to
              participate in the Program and receive Airdrop Rewards, comply
              with our legal obligations, detect and prevent fraud, and to
              provide you with the Program.
            </p>
          </li>
          <li>
            <p>
              Any information we receive from third-party sources will be
              treated in accordance with the Celestia Privacy Policy, available
              at{" "}
              <a href="https://celestia.org/privacy" rel="nofollow">
                https://celestia.org/privacy
              </a>
              . We are not responsible or liable for the accuracy of the
              information provided to us by third parties and are not
              responsible for any third party’s policies or practices. See
              Section 9 of the Celestia Privacy Policy for more information.
            </p>
          </li>
        </ol>
        <Heading themeColor="utility1" textAlign="left" level="h2" size="xl">
          4. Certain Additional Representations
        </Heading>
        <ol>
          <li>
            <p>
              4.1 Receipt of Rewards Entirely for Own Account. Your eligibility
              to receive Airdrop Rewards is made in reliance upon your
              representation to the Company, which by your agreement to these
              Terms you hereby confirm, that you are the owner of the Wallet
              being used to claim any Airdrop Rewards, that any Airdrop Rewards
              you receive will be for your own account, not as a nominee or
              agent, and not with a view to the resale or distribution of any
              part thereof, and that you have no present intention of selling,
              granting any participation in, or otherwise distributing the same.
              By agreeing to these Terms, you further represent that you do not
              presently have any contract, undertaking, agreement or arrangement
              with any person to sell, transfer or grant participations to such
              person or to any third person, with respect to any Airdrop
              Rewards. If you are agreeing to these terms on behalf of an
              entity, that entity has not been formed for the specific purpose
              of obtaining the Airdrop Rewards.
            </p>
          </li>
          <li>
            <p>
              4.2 Disclosure of Information. Your eligibility to receive Airdrop
              Rewards is made in reliance upon your representation to the
              Company, which by your agreement to these Terms you hereby
              confirm, that you have sufficient knowledge of and experience in
              business and financial matters to be able to evaluate the risks
              and merits of your participation in the Program and of any Airdrop
              Rewards and are able to bear the risks thereof. You hereby affirm
              that you have not relied on any representations or warranties made
              by the Company related to the Program, including, but not limited
              to, conversations of any kind, whether through oral or electronic
              communication, or any white paper.
            </p>
          </li>
          <li>
            <p>
              4.3 Compliance with United States Securities Laws. You understand
              that the Airdrop Rewards have not been, and will not be,
              registered under the 1933 Act or any applicable state securities
              laws. You acknowledge that the availability of an exemption from
              the registration provisions of the Securities Act and other
              applicable state securities laws depends upon, among other things,
              the bona fide nature of your intent as described in Section 4.1
              above and with respect to the accuracy of your representations as
              expressed throughout these Terms. You understand that the Airdrop
              Rewards may be deemed &quot;restricted securities&quot; under
              applicable United States federal and state securities laws and
              that, pursuant to these laws, you may be restricted from
              transferring any Airdrop Rewards unless they are registered with
              the Securities and Exchange Commission and qualified by state
              authorities, or an exemption from such registration and
              qualification requirements is available. You acknowledge that the
              Company does not undertake any obligation to register or qualify
              the Airdrop Rewards for resale, and exemptions from registration
              and qualification may not be available or may not permit you to
              transfer all or any of the Airdrop Rewards in the amounts or at
              the times proposed by you. You further acknowledge that if an
              exemption from registration or qualification is available, such
              exemption may be conditioned on various requirements including,
              but not limited to, the time and manner of sale, the holding
              period for the Airdrop Rewards, and on other factors outside of
              your control, for which the Company makes no assurances and may
              not be able to satisfy.
            </p>
          </li>
          <li>
            <p>
              4.4 Compliance with Liechtenstein Securities Laws. You understand
              that nothing in these Terms will be deemed to constitute a
              prospectus of any sort in Liechtenstein or in any jurisdiction in
              the EU; nor does it in any way pertain to a public offering or a
              solicitation of an offer to buy any securities in Liechtenstein or
              in any jurisdiction in the EU.
            </p>
          </li>
          <li>
            <p>
              4.5 No Public Market. You understand that no public market now
              exists for the Airdrop Rewards, and that the Company has not made
              any assurances that a public market will ever exist for the
              Airdrop Rewards.
            </p>
          </li>
          <li>
            <p>
              4.6 No Solicitation. At no time were you presented with or
              solicited by any publicly issued or circulated newspaper, mail,
              radio, television or other form of general advertising or
              solicitation in connection with any invitation to participate in
              the Program or offer of the Airdrop Rewards.
            </p>
          </li>
          <li>
            <p>
              4.7 Other Applicable Laws. You hereby represent that you have
              satisfied yourself as to the full observance of the laws of your
              jurisdiction in connection with any invitation to participate in
              the Program, receipt of Airdrop Awards, and other use of these
              Terms, including (a) the legal requirements within your
              jurisdiction for participating in the Program and receiving
              Airdrop Rewards, (b) any foreign exchange restrictions applicable
              to such participation or receipt, (c) any governmental or other
              consents that may need to be obtained, and (d) the income tax and
              other tax consequences, if any, that may be relevant to the
              receipt, holding, sale, or transfer of the Airdrop Rewards. Your
              participation in the Program and continued beneficial ownership of
              Airdrop Rewards will not violate any applicable securities or
              other laws of your jurisdiction.
            </p>
          </li>
          <li>
            <p>
              4.8 Non-US Transaction. You are not a U.S. Person as defined in
              Rule 902(k) of Regulation S under the 1933 Act. The offer of the
              Airdrop Rewards to you was made in an offshore transaction (as
              defined in Rule 902(h) of Regulation S), no directed selling
              efforts (as defined in Rule 902(c) of Regulation S) were made in
              the United States, and you are not obtaining the Airdrop Rewards
              for the account or benefit of any U.S. Person.
            </p>
          </li>
          <li>
            <p>
              4.9 Transfer Restrictions. You will not, during the Restricted
              Period (as defined below) offer or sell any of the Airdrop Rewards
              (or create or maintain any derivative position equivalent thereto)
              in the United States, to or for the account or benefit of a U.S.
              Person or other than in accordance with Regulation S. The Company
              reserves the right to impose additional transfer restrictions with
              respect to Airdrop Rewards in its sole discretion.
            </p>
          </li>
          <li>
            <p>
              4.10 Subsequent Sales. You will, after the expiration of the
              applicable Restricted Period, only offer, sell, pledge or
              otherwise transfer the Airdrop Rewards (or create or maintain any
              derivative position equivalent thereto) pursuant to registration
              under the 1933 Act or any available exemption therefrom and, in
              any case, in accordance with applicable state securities laws.
            </p>
          </li>
          <li>
            <p>
              4.11 Legends. You acknowledge and agree that the Airdrop Rewards
              will be deemed to bear the following legends: (a) any legend
              required by the securities laws of any state or country to the
              extent such laws are applicable to the Airdrop Rewards represented
              by the certificate so legended, and (b): the following legend (and
              even without such legend the following restrictions apply):
            </p>
          </li>
          <li>
            <p>
              <small>
                THE AIRDROP REWARDS HAVE NOT BEEN REGISTERED UNDER THE ACT WITH
                THE UNITED STATES SECURITIES AND EXCHANGE COMMISSION, AND THE
                COMPANY DOES NOT INTEND TO REGISTER THEM. THE AIRDROP REWARDS
                HAVE BEEN OBTAINED TO HOLD FOR THE LONG TERM AND NOT WITH A VIEW
                TO, OR IN CONNECTION WITH, THE SALE OR DISTRIBUTION THEREFOR.
                PRIOR TO THE ONE YEAR ANNIVERSARY FROM THE DATE ON WHICH THE
                AIRDROP REWARDS ARE RECEIVED (THE &ldquo;RECEIPT DATE&rdquo; AND
                SUCH ONE YEAR PERIOD, THE &ldquo;RESTRICTED PERIOD&rdquo;), THE
                AIRDROP REWARDS MAY NOT BE OFFERED OR SOLD (INCLUDING OPENING A
                SHORT POSITION IN SUCH AIRDROP REWARDS) IN THE UNITED STATES OR
                TO U.S. PERSONS AS DEFINED BY RULE 902(K) ADOPTED UNDER THE ACT,
                OTHER THAN TO DISTRIBUTORS, UNLESS THE AIRDROP REWARDS ARE
                REGISTERED UNDER THE ACT, OR AN EXEMPTION FROM THE REGISTRATION
                REQUIREMENTS OF THE ACT IS AVAILABLE. RECIPIENTS OF AIRDROP
                REWARDS PRIOR TO THE ONE YEAR ANNIVERSARY OF THE RECEIPT DATE
                MAY SELL SUCH AIRDROP REWARDS ONLY PURSUANT TO AN EXEMPTION FROM
                REGISTRATION UNDER THE ACT OR OTHERWISE IN ACCORDANCE WITH THE
                PROVISIONS OF REGULATION S OF THE ACT, OR IN TRANSACTIONS
                EFFECTED OUTSIDE OF THE UNITED STATES PROVIDED THEY DO NOT
                SOLICIT (AND NO ONE ACTING ON THEIR BEHALF SOLICITS) PURCHASERS
                IN THE UNITED STATES OR OTHERWISE ENGAGE(S) IN SELLING EFFORTS
                IN THE UNITED STATES AND PROVIDED THAT HEDGING TRANSACTIONS
                INVOLVING THESE AIRDROP REWARDS MAY NOT BE CONDUCTED UNLESS IN
                COMPLIANCE WITH THE ACT. A HOLDER OF THE AIRDROP REWARDS WHO IS
                A DISTRIBUTOR, DEALER, SUB-UNDERWRITER OR OTHER SECURITIES
                PROFESSIONAL, IN ADDITION, CANNOT PRIOR TO THE ONE YEAR
                ANNIVERSARY OF THE RECEIPT DATE SELL THE AIRDROP REWARDS TO A
                U.S. PERSON AS DEFINED BY RULE 902(K) OF REGULATIONS UNLESS THE
                AIRDROP REWARDS ARE REGISTERED UNDER THE ACT OR AN EXEMPTION
                FROM REGISTRATION UNDER THE ACT IS AVAILABLE.
              </small>
            </p>
          </li>
        </ol>
        <footer style={{ textAlign: "center" }}>
          <TermsOfServiceFooter>
            <ActionButton
              size="xs"
              outlined
              variant="utility1"
              hoverColor="utility1"
              onClick={() => navigate("/")}
              borderRadius="sm"
            >
              <Stack direction="horizontal" as="span" gap={2}>
                Back to Claim{" "}
                <i>
                  <ExternalPageIcon />
                </i>
              </Stack>
            </ActionButton>
          </TermsOfServiceFooter>
        </footer>
      </TermsOfServiceContainer>
    </MainContainer>
  );
};
