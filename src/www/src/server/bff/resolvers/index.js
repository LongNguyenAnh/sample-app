import { mergeResolvers } from '@graphql-tools/merge';

import inventory from './Inventory';
import categories from './Categories';

const resolversArray = [
  categories,
  inventory,
];

const resolvers = mergeResolvers(resolversArray);

export default addResolverExtensions(
  resolvers,
  mocksExtension(resolvers, (path) => require(`../mocks/${path}`)),
  loggingExtension()
); 
