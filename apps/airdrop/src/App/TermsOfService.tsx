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
            RPGF Drop Program: Terms and Conditions
          </Heading>
          <p>Last Revised on 2023-12-06</p>
        </hgroup>

        <h2>1. Introduction</h2>
        <p>
          The Anoma Foundation, with its registered seat in Zug, Switzerland (
          <strong>“Foundation”</strong>), has the purpose of promoting and
          developing new technologies, solutions, and applications within the
          scope of the Namada protocol (<strong>“Protocol”</strong>), including
          the native token of the Namada network (<strong>“NAM”</strong> or{" "}
          <strong>“Token”</strong>). The Namada Protocol aims to enable a
          blockchain-based, decentralized proof-of-stake network, which provides
          a decentralized coordination mechanism and execution mechanism with
          which participants can interact (<strong>“Network”</strong>).
        </p>
        <p>
          These terms and conditions (<strong>“Terms”</strong>) shall govern the
          participation in the RPGF Drop Program (<strong>“RPGF Drop”</strong>{" "}
          or <strong>“RPGF Drop Program”</strong>) of the Foundation. The RPGF
          Drop Program provides eligible participants the opportunity to receive
          a certain amount of Tokens.
        </p>
        <p>
          These Terms govern the rights and obligations of participants (
          <strong>“Participant(s)”</strong>) when participating in the RPGF Drop
          Program of the Foundation.
        </p>
        <h2>2. Accepting the Terms</h2>
        <p>
          By participating the RPGF Drop Program, the Participant accepts and
          agrees to be bound by these Terms and all the terms incorporated
          herein by reference.
        </p>
        <p>
          The Foundation reserves the right to change or modify these Terms at
          any time in its own and sole discretion. All changes are effective
          immediately when communicated on the website or other channels chose
          by the Foundation.{" "}
        </p>
        <p>
          Participants cannot participate the RPGF Drop Program if they disagree
          with the Terms.
        </p>
        <h2>3. RPGF Drop Program</h2>
        <p>
          The RPGF Drop Program is a program that allows participants who have
          contributed in the past to public goods which are relevant to the
          Namada ecosystem to receive NAM token allocations in the Namada
          genesis block proposal by the Anoma Foundation.
        </p>
        <h2>4. Eligible Participants</h2>
        <p>
          The RPGF Drop Program is a discretionary program provided by the
          Foundation, pursuant to which the Foundation may, in its sole
          discretion, provide the Participants Tokens if the Participants
          satisfy certain criteria designated by the Foundation or its
          affiliates (<strong>“Qualifying Categories”</strong>). The Qualifying
          Categories, with the specifics as communicated from time to time by
          the Foundation, to participate in the RPGF Drop Program of the
          Foundation are:
        </p>
        <ul>
          <li>Zcash R&D & Rust Developer Ecosystem</li>
          <li>
            ZKPs, Cryptography PGs, Privacy Research, & Learning Resources
          </li>
          <li>Interchain PGs, Shielded Ecosystem, PGF Mechanism R&D</li>
          <li>Shielded Community</li>
          <li>Gitcoin Donors of ZK Tech and Crypto Advocacy</li>
          <li>Namada Trusted Setup Participants</li>
        </ul>
        <p>
          The eligibility of a Participant to participate in the RPGF Drop
          Program and receive Tokens is subject to the sole discretion of the
          Foundation. The Foundation may change the Qualifying Categories to
          participate in the RPGF Drop Program at any time. A Participant may
          not receive any Tokens even if the Participant falls in a Qualifying
          Category. This is at the sole discretion of the Foundation.
        </p>
        <h2>5. General Provisions</h2>
        <p>
          <u>No claim against Foundation:</u> Any Tokens received as part of the
          RPGF Drop Program are a donation by the Foundation. However, neither
          do these Terms constitute nor does the participation trigger any kind
          of binding obligation of the Foundation to execute a particular
          donation to the Participant. Participants do not have any right and/or
          claim against the Foundation to receive any Tokens.
        </p>
        <p>
          <u>Cease of the RPGF Drop Program / Ban of Participants:</u> The
          Foundation reserves the right, at is sole discretion, to stop the RPGF
          Drop Program at any time and/or ban a Participant from participating
          in the RPGF Drop Program, in particular (but without limitation), in
          case of any abusive behaviour.
        </p>
        <h2>6. Representation and Warranties of the Participants</h2>
        <p>
          Participants represents and warrants that their receipt of Tokens
          within the RPGF Drop Program is at all times compliant with applicable
          law and regulations in their jurisdiction (in particular, in the
          respective country of citizenship, residency or domicile), and that
          the Foundation will not accept any liability for any illegal or
          unauthorized use of Tokens. In case of any change in legislation in
          the Participants jurisdiction leading to the receipt and/or use of or
          the Tokens becoming illegal, the Participant agrees to cease using the
          Tokens immediately and absorb any possible damages and losses arising
          out of the same.
        </p>
        <p>
          Furthermore, the Participant represents and warrants to the Foundation
          the following, and acknowledges that the Foundation is relying on
          these representations and warranties:
        </p>
        <ul>
          <li>
            Participant has the full right, power and authority to participate
            in the RPGF Drop Program and accept these Terms;
          </li>
          <li>
            Participant owns, or has secured all rights (including intellectual
            property rights), consents, clearances and approvals necessary to be
            able to grant the rights granted hereunder;
          </li>
          <li>
            Participant is not listed, or associated with any person or entity
            listed, on any of the US Department of Commerce&apos;s Denied
            Persons or Entity List, the US Department of Treasury&apos;s
            Specially Designated Nationals or Blocked Persons Lists, the US
            Department of State&apos;s Debarred Parties List, the EU
            Consolidated List of Persons, Groups and Entities Subject to EU
            Financial Sanctions, or the Swiss State Secretariat for Economic
            Affairs (SECO) Overall List of Sanctioned Individuals, Entities and
            Organizations, and neither the Participant nor any of its
            affiliates, officers or directors is a resident of a country or
            territory that has been designated as non-cooperative with
            international anti-money laundering principles or procedures by an
            intergovernmental group or organization, such as the Financial
            Action Task Force on money laundering;
          </li>
          <li>
            Participant confirms not to be resident of, citizen of or located in
            a geographic area that is subject to UN-, US-, EU-, Swiss or any
            other sovereign country sanctions or embargoes and is not
            participating the RPGF Drop Program from one of the countries
            embargoed or restricted by the SECO, including, but not limited to:
            Belarus, Burundi, Central African Republic, Congo, DPRK (North
            Korea), Guinea, Guinea-Bissau, Haiti, Iran, Iraq, Lebanon, Libya,
            Mali, Myanmar (Burma), Nicaragua, Republic of South Sudan, Russia,
            Somalia, Sudan, Syria, Ukraine, Venezuela, Yemen, or Zimbabwe
            (“Prohibited Jurisdictions”);
          </li>
          <li>
            PARTICIPANT HEREBY WAIVES THE RIGHT TO PARTICIPATE IN ANY
            CLASS-ACTION LAWSUIT OR CLASS-WIDE ARBITRATION AGAINST ANY ENTITY OR
            INDIVIDUAL INVOLVED IN THE RPGF Drop PROGRAM OF THE FOUNDATION;
          </li>
          <li>
            Participant understands and accepts that it has not relied on any
            representations or warranties made by the Foundation or any other
            person outside of those made in these Terms, including but not
            limited to, conversations of any kind, whether through oral or
            electronic communication, or any presentation, technical paper,
            whitepaper, social media content or website posting;
          </li>
          <li>
            Participant is of legal age in the jurisdiction applicable to him
            and that he has the right, authority and capacity to enter into
            these Terms;
          </li>
          <li>
            Participant understands and accepts that no public market now exists
            for the Tokens, and the Foundation has not made any assurances that
            a public market will ever exist for the Tokens;
          </li>
          <li>
            Participant is a non-U.S. person as defined in Rule 902 (k)(2) of
            Regulation S under the U.S. Securities Act of 1933 . No directed
            selling efforts (as defined in Rule 902(c) of Regulation S) were
            made in the United States, and the Participant is not receiving the
            Tokens for the account or benefit of any U.S. Person(s);
          </li>
          <li>
            Participant understands that the Tokens have not been, and will not
            be, registered under the U.S. Securities Act of 1933 or any
            applicable state securities laws in the U.S;
          </li>
          <li>
            Participant will not use a VPN or other tool to circumvent any
            geoblock or other restrictions that the Foundation may have
            implemented for participants in the RPGF Drop Program. Any
            circumvention or violation will permanently disqualify the
            respective Participant from participation in the RPGF Drop Program.
          </li>
          <li>
            Participant has not granted any other party any rights that conflict
            with the rights granted herein.
          </li>
        </ul>

        <h2>7. Wallet</h2>
        <p>
          Claiming the Tokens from the RPGF Drop Program may require reliance on
          or an integration with third party products (e.g., a wallet, a
          network, or blockchain) that the Foundation does not control. In
          particular, the Foundation has no control over the private keys of the
          Participant and the use of the wallet is subject to the terms and
          conditions of the respective third-party wallet provider. The
          Foundation has no custody or control of the wallets and Participants
          are solely responsible for the security of their wallet. The
          Foundation is not responsible for managing and maintaining the
          security of Participant&apos;s wallets.
        </p>
        <p>
          Tokens allocated to the Participant&apos;s address can only be
          accessed with the Participant&apos;s access data and/or private key.
          The Participant understands and accepts that if its private key or
          wallet password were lost or stolen, the access to the
          Participant&apos;s Tokens allocated to the Participant&apos;s address
          would be unrecoverable and would be permanently lost. The Foundation
          has no control over the Participant&apos;s Tokens; therefore, the
          Participant shall have no recourse to seek any refunds, recovery or
          replacements from the Foundation in the event that he cannot access
          the wallet and/or Tokens anymore and/or any Tokens are lost or stolen.
        </p>

        <h2>8. Exclusion of Warranties and Liability of the Foundation</h2>
        <p>
          To the extent permitted under applicable law, and except as expressly
          provided to the contrary in writing by the Foundation, the Tokens are
          provided on an &quot;as is&quot; and &quot;as available&quot; basis.
          The Foundation and/or its affiliated parties disclaim any and all
          warranty with regard to any Tokens the Participant may receive.
        </p>
        <p>
          The liability of the Foundation is limited to direct damages arising
          out of acts of intent and gross negligence. Any liability for indirect
          damages or consequential damages, including loss of profit, and/or
          damages arising out of negligent conduct, is excluded.
        </p>
        <p>
          The Participant hereby expressly agrees that the Foundation and/or its
          affiliated parties shall not be liable for any damages, losses,
          including loss of any (future) proﬁts, resulting from the receipt of
          the Token, regardless of the basis upon which the liability is
          claimed.
        </p>
        <h2>9. Indemnification</h2>
        <p>
          Participant agrees to the fullest extent permitted by applicable law,
          to indemnify, defend, and hold harmless the Foundation, and its
          respective past, present, and future employees, officers, directors,
          contractors, consultants, equity holders, suppliers, vendors, service
          providers, parent companies, subsidiaries, affiliates, agents,
          representatives, predecessors, successors, and assigns (individually
          and collectively, the “Foundation Parties”), from and against all
          actual or alleged claims, damages, awards, judgments, losses,
          liabilities, obligations, penalties, interests, fees, expenses
          (including, without limitation, attorneys&apos; fees and expenses),
          and costs (including, without limitation, court costs, costs of
          settlement, and costs of pursuing indemnification and insurance), of
          every kind and nature whatsoever, whether known or unknown, foreseen
          or unforeseen, matured or unmatured, or suspected or unsuspected, in
          law or equity, whether in tort, contract, or otherwise (collectively,
          “Claims”), including, but not limited to, damages to property or
          personal injury, that are caused by, arise out of or are related to
          Participant&apos;s use or misuse of the Tokens or Participant&apos;s
          violation or breach of these Terms or applicable law, and
          Participant&apos;s violation of the rights of or obligations to a
          third-party, including another Participation or third-party, and
          Participant&apos;s negligence or wilful misconduct. Participant agrees
          to promptly notify the Foundation of any Claims and cooperate with the
          Foundation Parties in defending such Claims. Participant further
          agrees that the Foundation Parties shall have control of the defence
          or settlement of any Claims. This indemnity is in addition to, and not
          in lieu of, any other indemnities as set forth in a written agreement
          between the Participant and the Foundation.
        </p>
        <h2>10. Disclaimer</h2>
        <p>
          The Foundation and its officers, employees, directors, shareholders,
          parents, subsidiaries, affiliates, agents and licensors make no
          warranty or representation and disclaim all responsibility for whether
          the program of the Foundation: (a) will meet Participant&apos;s
          requirements; (b) will be available on an uninterrupted, timely,
          secure, or error-free basis; or (c) will be accurate, reliable,
          complete, legal, or safe. The Foundation disclaims all other
          warranties or conditions, express or implied, including, without
          limitation, implied warranties or conditions of merchantability,
          fitness for a particular purpose, title and non-infringement. No
          advice or information, whether oral or obtained from the Foundation
          Parties or through the program, will create any warranty or
          representation not expressly made herein.
        </p>
        <p>
          The Foundation will not be responsible or liable to Participant for
          any loss and take no responsibility for, and will not be liable to
          Participant for any allocated Tokens or any losses, damages, or claims
          arising from: (a) Participant error, incorrectly constructed
          transactions, or mistyped addresses; (b) server failure or data loss;
          (c) unauthorized access or use; (d) any unauthorized third-party
          activities, including without limitation the use of viruses, phishing
          or bruteforcing.
        </p>
        <p>
          The foregoing does not affect any warranties that cannot be excluded
          or limited under applicable law. To the extent the Foundation may not,
          as a matter of applicable law, disclaim any (implied) warranty, the
          scope and duration of such warranty shall be the minimum permitted by
          applicable law.
        </p>
        <h2>11. Tax Considerations</h2>
        <p>
          Participants are solely responsible for determining what, if any,
          taxes apply to the allocated Tokens via the RPGF Drop Program. The
          Foundation is not responsible for determining or paying the taxes that
          apply to such allocation.
        </p>
        <p>
          All taxes (including value added tax, if any), duties, levies,
          assessments and other charges of any kind whatsoever imposed by any
          government or authority upon the Participant in connection with these
          Terms shall be borne by and at the expense of the Participant.{" "}
        </p>
        <h2>12. Relationship of the Parties</h2>
        <p>
          The Foundation and the Participant are independent parties. These
          Terms do not create nor is it intended to create a partnership,
          franchise, joint venture, agency, fiduciary or employment relationship
          between the parties.
        </p>
        <h2>13. Severability</h2>
        <p>
          If any provision of these Terms is invalid, illegal or unenforceable
          in any jurisdiction, such invalidity, illegality or unenforceability
          shall not affect any other provision of the Terms or invalidate or
          render unenforceable such provision in any other jurisdiction. Upon
          such determination that any provision is invalid, illegal or
          unenforceable, the Terms shall be modified to effectuate the original
          intent of the original provision as closely as possible.
        </p>
        <h2>14. Applicable Law and Jurisdiction</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the
          laws of Switzerland without giving effect to any choice or conflict of
          law provision or rule (whether of Switzerland or any other
          jurisdiction). The application of the United Nations Convention on
          Contracts for the International Sale of Goods shall be excluded.
        </p>
        <p>
          Any dispute arising out of or in conjunction with these Terms shall be
          submitted to the exclusive jurisdiction of the courts of the canton of
          Zug, Switzerland, although the Foundation retain the right to bring
          any suit, action, or proceeding against Participant for breach of
          these Terms in its country of residence or any other relevant country.
          Participants waive any and all objections to the exercise of
          jurisdiction by such courts and to the venue in such courts.
        </p>
        <h2>15. Privacy Policy</h2>
        <p>
          By accepting these Terms, the Participant also agrees to accept the
          Foundation Privacy Policy. The current version of the Privacy Policy
          is available at{" "}
          <a
            href="https://anoma.foundation/privacy-notice"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://anoma.foundation/privacy-notice
          </a>
          .
        </p>

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
