import { Client, Wallet, convertStringToHex, xrpToDrops } from 'xrpl';

import { ApiCall } from './interceptor';
import { toast } from 'react-toastify';

export const generateAccount = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const newAccount = await Wallet.generate();
            toast.info('Generating account...', {
                autoClose: 6000,
            });
            // eslint-disable-next-line no-undef
            const client = new Client(process.env.XRPL_WSS_CLIENT);

            // eslint-disable-next-line no-undef
            if (process.env.NODE_ENV === 'development') {
                // Connect to XRPL
                await client.connect();
                console.log('Connected to XRPL');
                let x = await client.fundWallet(newAccount.classicAddress);
                await client.disconnect();
                resolve(x.wallet);
            } else {
                resolve(newAccount);
            }

        } catch (error) {
            console.log('Error generating account:', error);
            reject(null);
        }
    });
};

export const generateNFTForAccount = async (account, requester) => {
    return new Promise(async (resolve, reject) => {
        try {
            // eslint-disable-next-line no-undef
            const client = new Client(process.env.XRPL_WSS_CLIENT);

            // Connect to XRPL
            await client.connect();
            console.log('Connected to XRPL');

            const transaction = {
                TransactionType: 'NFTokenMint',
                Account: account,
                NFTokenTaxon: 0,
                Flags: 1,
                URI: convertStringToHex(requester),
                Memos: [
                    {
                        Memo: {
                            MemoData: convertStringToHex('Registration'),
                        },
                    },
                ],
            };

            // Send transaction to Backend
            const response = await ApiCall({
                method: 'POST',
                url: 'generateQR',
                data: transaction,
            });

            await client.disconnect();

            resolve(response);
        } catch (error) {
            console.log('Error minting NFT:', error);
            reject(null);
        }
    });
};

export const checkXummUUID = async (uuid) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await ApiCall({
                method: 'GET',
                url: `checkXummUUID/${uuid}`,
            });

            resolve(response);
        } catch (error) {
            console.log('Error checking Xumm UUID:', error);
            reject(null);
        }
    });
};

export const generateQRForPayment = async ({ account, name, hospital }) => {
    if (!account) {
        throw new Error('Account to pay is required');
    }

    if (!name) {
        throw new Error('Name is required');
    }

    if (!hospital) {
        throw new Error('Hospital is required');
    }

    return new Promise(async (resolve, reject) => {
        try {
            // eslint-disable-next-line no-undef
            const client = new Client(process.env.XRPL_WSS_CLIENT);

            // Connect to XRPL
            await client.connect();
            console.log('Connected to XRPL');

            const transaction = {
                TransactionType: 'Payment',
                Account: account,
                // eslint-disable-next-line no-undef
                Destination: process.env.ORACLE_ACCOUNT_ADDRESS,
                Amount: xrpToDrops(1),
                Memos: [
                    {
                        Memo: {
                            MemoData: convertStringToHex(JSON.stringify({
                                type: 'Registration',
                                name,
                                hospital,

                            })),
                        },
                    },
                ],
            };

            // Send transaction to Backend
            const response = await ApiCall({
                method: 'POST',
                url: 'generateQR',
                data: transaction,
            });
            await client.disconnect();

            resolve(response);
        } catch (error) {
            console.log('Error creating sell offer:', error);
            reject(null);
        }
    });
};

export function createWebSocketConnection(data) {
    const ws = new WebSocket(data.data.refs.websocket_status);

    return new Promise((resolve, reject) => {
        ws.onmessage = async function (event) {
            const json = JSON.parse(event.data);
            try {
                if (json.payload_uuidv4) {
                    const response = await ApiCall({
                        method: 'GET',
                        url: 'verifyUUID',
                        params: {
                            uuid: json.payload_uuidv4,
                        },
                    });

                    if (response.data.signed) {
                        toast.success("QR Code Scanned successfully ✅");
                        resolve(response);
                    } else {
                        toast.error("You've cancelled the request. Please try again.");
                    }
                    ws.close();
                    resolve(null);
                }

                if (json.opened) {
                    toast.info('Please swipe to approve.');
                }
            } catch (err) {
                console.log(err);
                toast.error('An error occurred. Please try again.');
                ws.close();
                reject(null);
            }
        };
    });
}

export const generateXummLoginQR = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            // eslint-disable-next-line no-undef
            const client = new Client(process.env.XRPL_WSS_CLIENT);

            // Connect to XRPL
            client.connect();
            console.log('Connected to XRPL');

            const transaction = {
                TransactionType: 'SignIn',
                Memos: [
                    {
                        Memo: {
                            MemoData: convertStringToHex('Login'),
                        },
                    },
                ],
            };

            // Send transaction to Backend
            const response = await ApiCall({
                method: 'POST',
                url: 'generateQR',
                data: transaction,
            });

            resolve(response);
        } catch (error) {
            console.log('Error generating Xumm Login QR:', error);
            reject(null);
        }
    });
};
