import { gql } from '@apollo/client';

export default gql`
  query samplePageQuery($year: String, $search: String) {
    categories(name: $name)
  }
`