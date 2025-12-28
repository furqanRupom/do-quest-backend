export default () => ({
    port: parseInt(process.env.PORT!, 10) || 3000,
    mongodbUri: process.env.MONGODB_URI,
    secretAccessToken: process.env.SECRET_ACCESS_TOKEN,
    accessTokenExpiry: parseInt(process.env.ACCESS_TOKEN_EXPIRY!, 10) || 900,
    secretRefreshToken: process.env.SECRET_REFRESH_TOKEN,
    refreshTokenExpiry: parseInt(process.env.REFRESH_TOKEN_EXPIRY!, 10) || 604800,
    saltRounds: parseInt(process.env.SALT_ROUNDS!, 10) || 12,
    mail: {
        host: process.env.MAIL_HOST,
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
    resetSecret: process.env.RESET_SECRET,
    resetTokenExpiry: parseInt(process.env.RESET_TOKEN_EXPIRY!, 10) || 3600,
});
