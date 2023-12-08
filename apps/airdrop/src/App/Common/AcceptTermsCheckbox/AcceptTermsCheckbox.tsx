import { Checkbox } from "@namada/components";
import { TOSFullTerms, TOSToggle } from "./AcceptTermsCheckbox.components";

type AcceptTermsCheckboxProps = {
  onChange: () => void;
  checked: boolean;
  disabled?: boolean;
  fullVersion?: boolean;
};

export const AcceptTermsCheckbox = ({
  disabled = false,
  fullVersion = false,
  checked,
  onChange,
}: AcceptTermsCheckboxProps): JSX.Element => {
  return (
    <TOSToggle disabled={disabled}>
      <Checkbox disabled={disabled} checked={checked} onChange={onChange} />

      {!fullVersion && (
        <span>
          You hereby acknowledge and confirm the{" "}
          <a
            href="/terms-and-conditions"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms and Conditions
          </a>{" "}
          and agree to be bound by them.
        </span>
      )}

      {fullVersion && (
        <TOSFullTerms>
          <strong>
            You hereby acknowledge and confirm by clicking the box that:
          </strong>
          <ul>
            <li>
              you are not (i) a citizen or resident of a geographic area in
              which receiving tokens by RPGF Drop is prohibited by applicable
              law, decree, regulation, treaty, or administrative act; (ii) a
              citizen or resident of, or located in, a geographic area that is
              subject to U.S., EU, Switzerland or other sovereign country
              sanctions or embargoes; (iii) a citizen or resident of the United
              States, or any jurisdiction into which RPGF Drops of tokens would
              be unlawful; or (iv) an individual, or an individual employed by
              or associated with an entity, identified on the U.S. Department of
              Commerce’s Denied Persons or Entity List, the U.S. Department of
              Treasury’s Specially Designated Nationals or Blocked Persons
              Lists, the U.S. Department of State’s Debarred Parties List, the
              EU Consolidated List of Persons, Groups and Entities Subject to EU
              Financial Sanctions, or the Swiss State Secretariat for Economic
              Affairs (SECO) Overall List of Sanctioned Individuals.
            </li>
            <li>
              any RPGF Drop of tokens and the number of tokens is in our sole
              discretion and you do not have any right, claim, title or interest
              in any tokens.
            </li>
            <li>
              you have read, understood, and accept the Terms and Conditions
              (T&C) governing the RPGF Drop Program. By checking this box, you
              acknowledge that you are bound by the terms outlined in the T&C
              and agree to comply with all the provisions therein.
            </li>
          </ul>
        </TOSFullTerms>
      )}
    </TOSToggle>
  );
};
