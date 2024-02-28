const crypto = require('crypto');

function generateOtp() {
    const OTP = crypto.randomInt(1000,9999);
    return OTP.toString();
}

function orderIdGenerate() {
    return `#${crypto.randomBytes(4).toString('hex').slice(0, 8)}`;
}

module.exports = { generateOtp, orderIdGenerate }