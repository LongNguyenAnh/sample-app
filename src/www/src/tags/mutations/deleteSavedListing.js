import { gql } from '@apollo/client';

export default gql`
  mutation deleteSavedListingMutation($bookmarkId: String!) {
    deleteSavedListing(bookmarkId: $bookmarkId)
  }
`;