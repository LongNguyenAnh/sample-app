import { gql } from '@apollo/client';

export default gql`
  mutation deleteSavedProduct($saveId: String!) {
    deleteSavedProduct(saveId: $saveId) {
      saveId
    }
  }
`;