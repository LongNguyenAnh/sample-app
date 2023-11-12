// TODO: Figure out how to move this into a library
export const addMocks = (resolvers) => {
  const newResolvers = {}

  Object.keys(resolvers).forEach(type => {
    newResolvers[type] = {};

    Object.keys(resolvers[type]).forEach(field => {
      let mocks = null;
      try {
        mocks = require(`./${type}/${field}`); // eslint-disable-line
      } catch (e) {
        // Failed to find mocks!
      }

      if (mocks) {
        console.log(`Adding Mock Wrapper to: ${type}.${field}`);  // eslint-disable-line

        newResolvers[type][field] = (...args) => {
          const [parent, params, ctx] = args;

          if (ctx.request && ctx.request.headers.mocks) {
            // Return the mock object instead of the normal method
            const match = ctx.request.headers.mocks.match(new RegExp(`(^|\\|)${type}\\.${field}(\\.(.+?))?(\\||$)`))

            if (match) {
              console.log(`Mocking: ${type}.${field}`);  // eslint-disable-line
              const mock = mocks[match[3] || 'default'];
              if (mocks.resolver) {
                return mocks.resolver(parent, params, ctx, { mock });
              }

              return mock;
            }
          }

          return resolvers[type][field](...args);
        }
      } else {
        newResolvers[type][field] = resolvers[type][field];
      }
    });
  });

  return newResolvers;
}
