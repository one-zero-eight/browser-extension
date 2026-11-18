export const INNOHASSLE_ACCOUNTS_URL = 'https://api.innohassle.ru/accounts/v0'
export const INNOHASSLE_ACCOUNTS_TOKEN_URL = `${INNOHASSLE_ACCOUNTS_URL}/tokens/generate-my-token`
// Can be pointed at a local backend with VITE_INNOHASSLE_SEARCH_URL / VITE_INNOHASSLE_EVENTS_URL (see README)
export const INNOHASSLE_SEARCH_URL = import.meta.env.VITE_INNOHASSLE_SEARCH_URL || 'https://api.innohassle.ru/catix/v0'
export const INNOHASSLE_EVENTS_URL = import.meta.env.VITE_INNOHASSLE_EVENTS_URL || 'https://api.innohassle.ru/schedule/v0'
