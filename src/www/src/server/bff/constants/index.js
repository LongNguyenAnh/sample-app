import '../../../constants';
import '../../../app/constants/optimizely';
import invariant from 'invariant';

invariant(
  typeof window === 'undefined' || process.env.JEST_WORKER_ID,
  'Server side variables should never be included in client side code',
);

export const WEB_API = process.env.BASE_API || 'http://localhost:20680';
export const MEMCACHED_CONFIGURATION_URL = process.env.MEMCACHED_CONFIGURATION_URL;
export const SERVER_ENDPOINT = 'http://localhost:4000';
export const SERVER_ENDPOINT_FUNCTION = () => { return SERVER_ENDPOINT; };
export const BFF_PATH = `${process.env.BOUNDED_CONTEXT_APP_NAME}/api`;
export const BFF_ENDPOINT = `${SERVER_ENDPOINT}/${BFF_PATH}`;

export const APOLLO_ERROR_TYPES = {
  nonBreaking: 'Non-breaking error: '
}

export const MAX_RESULT = 250;

export const NOT_AVAILABLE = "Not Available";
export const NOT_AVAILABLE_ABBREVIATION = "N/A";
export const STANDARD = "Standard";
export const OPTIONAL = "Optional";
export const NOT_RECOMMENDED = "Not Recommended";

export const domain_BRAND = 'domain';