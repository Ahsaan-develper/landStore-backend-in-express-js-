
const blacklistedTokens = new Set();

export const blacklistHeaderTokens = (accessToken, refreshToken) => {
    if (accessToken) blacklistedTokens.add(accessToken);
    if (refreshToken) blacklistedTokens.add(refreshToken);
};


export const isTokenBlacklisted = (token) => {
    return blacklistedTokens.has(token);
};

