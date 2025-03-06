const { decode } = require("jsonwebtoken");

const utils = {
    generateRandomCode: (length = 5) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let code = '';
    
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            code += characters[randomIndex];
        }
    
        return code;
    },
    decodeToken: (authHeader) => {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return false
        }
        const token = authHeader.split(' ')[1];
        return decode(token);
    }
}

module.exports = utils;
