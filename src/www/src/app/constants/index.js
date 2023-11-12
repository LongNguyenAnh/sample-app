
export { default as cookieConstants } from './cookies';
export let BASE_URL = env.CONFIG === 'nonprod' ? 'https://staging.domain.com' : 'https://www.domain.com';