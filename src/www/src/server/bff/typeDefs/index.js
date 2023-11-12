import { mergeTypeDefs } from '@graphql-tools/merge';

import categories from './Categories/index.graphql';
import inventory from './Inventory/index.graphql';

const typesArray = [
  inventory,
  categories,
];

const typeDefs = mergeTypeDefs(typesArray, { all: true });

export default typeDefs;
