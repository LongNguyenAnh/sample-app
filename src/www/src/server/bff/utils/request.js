import axios from '@domainsdk/global-sdk/utils/cachingAxios';

const request = async (endpoint, options) => {
  try {
    const response = await axios({
      url: endpoint,
      ...options
    });
  
    return response.data;  
  } catch(err) {
    if (err.response.status === 404) {
      return null;
    }

    throw err;
  }
};

export default request;
