export default{
    port: parseInt(process.env.PORT!, 10) || 3000,
    mongodbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    saltRounds: parseInt(process.env.SALT_ROUNDS!, 10) || 12,

    mail: {
        host: process.env.MAIL_HOST,
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    }
};
