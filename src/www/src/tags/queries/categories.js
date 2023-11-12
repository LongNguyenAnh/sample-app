import { gql } from '@apollo/client';

export default gql`
  query categoriesQuery($year: String , $name: String!) {
    categories(year: $year, name: $name)
  }
`
