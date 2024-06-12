import { AES, enc } from 'crypto-js';

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
