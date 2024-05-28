import styled from "styled-components";
import ReactPaginate from "react-paginate";

export const AllValidatorsSubheadingContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin: 0 0 8px 1px;
`;

export const AllValidatorsSearchBar = styled.div`
  margin-bottom: 8px;
`;

export const Paginator = styled(ReactPaginate)`
  display: flex;
  flex-wrap: nowrap;
  list-style-type: none;

  a {
    display: block;
    padding: 0 6px;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  .active-paginate-link {
    font-weight: bold;
    color: ${(props) => props.theme.colors.primary.main};

    &:hover {
      text-decoration: none;
    }
  }
`;
