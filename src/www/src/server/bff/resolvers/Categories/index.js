import { APOLLO_ERROR_TYPES } from '../../../../app/constants/apolloErrorTypes'
import errorHandler from '../../utils/errorHandler';
import { getProductList } from '../../utils/getProduct'
import { distinctBy } from '../../utils/dataSorting';

export default {
  Query: {
    categories: async (_, params, ctx) => {
      const {name} = params;
      
      try {
        let products = await getProductList({ name, limit: 50 });
        if (!products || products.length === 0) {
          return null;
        }
        return distinctBy(products).map(x => x.style);
      } catch(error) {     
        return errorHandler({
          error,
          ctx,
          params,
          errorType: APOLLO_ERROR_TYPES.nonBreaking
        });
      }
    }
  }
};
