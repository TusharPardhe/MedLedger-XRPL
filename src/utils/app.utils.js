import CryptoJS, { AES, enc } from 'crypto-js';

export const redirectToUrl = (url, newTab = false) => {
    newTab ? window.open(url, '_blank') : window.open(url);
};

export const encryptJSON = (data) => {
    // eslint-disable-next-line no-undef
    const encrypt = AES.encrypt(JSON.stringify(data), process.env.ENCRYPTION_KEY).toString();
    return encrypt;
};

export const decryptJSON = (data) => {
    // eslint-disable-next-line no-undef
    const decrypt = AES.decrypt(data, process.env.ENCRYPTION_KEY);
    const str = decrypt.toString(enc.Utf8);
    return JSON.parse(str);
};

export const decryptData = (ciphertext, secretCode) => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, secretCode);
        const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        return decryptedData;
    } catch (error) {
        console.error('Decryption failed:', error);
        return null;
    }
};

export const encryptData = (data, secretCode) => {
    // Encrypt the form data using the secret code
    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), secretCode).toString();
    return ciphertext;
};

export const parseJSON = (str) => {
    try {
        const p = JSON.parse(str);
        return p;
    } catch (e) {
        return null;
    }
};

export const setItemInLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

export const getItemFromLocalStorage = (key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
};
