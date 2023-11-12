import { gql } from '@apollo/client';

export default gql`
  query appQuery() {
    navigation {
      headerLinks {
        name
        id
        url
        target
        partnerLink
        dropdownItems {
          name
          id
          url
          target
          partnerLink
        }
      }
      footerLinks {
        name
        id
        url
        target
        partnerLink
      }
    }
  }
`;
