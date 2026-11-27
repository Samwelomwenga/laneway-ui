import "server-only"

/** laneway-api names every cookie it sets with this prefix, and the relay copies only these. */
export const API_COOKIE_PREFIX = "__Host-Http-lnw_"

export const ACCESS_COOKIE = `${API_COOKIE_PREFIX}access`

export const REFRESH_COOKIE = `${API_COOKIE_PREFIX}refresh`
