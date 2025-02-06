import { Client, convertHexToString } from 'xrpl';
import { useEffect, useState } from 'react';

import { parseJSON } from '../../utils/app.utils';

// Fetch Account Requests
const getAccountRequests = async () => {
    // eslint-disable-next-line no-undef
    const client = new Client(process.env.XRPL_WSS_CLIENT);
    await client.connect();

    const response = await client.request({
        method: 'account_tx',
        // eslint-disable-next-line no-undef
        account: process.env.ORACLE_ACCOUNT_ADDRESS,
        limit: 100,
    });

    const account_nfts = await client.request({
        method: 'account_nfts',
        // eslint-disable-next-line no-undef
        account: process.env.ORACLE_ACCOUNT_ADDRESS,
    });

    const account_nfts_data = {};

    account_nfts.result.account_nfts.forEach((nft) => {
        account_nfts_data[convertHexToString(nft.URI)] = nft;
    });

    return response.result.transactions.map((tx) => ({
        ...tx.tx,
        Memos: tx.tx.Memos?.[0]?.Memo?.MemoData ? parseJSON(convertHexToString(tx.tx.Memos[0].Memo.MemoData)) : null,
        accepted: account_nfts_data[tx.tx.Account] ? true : false,
    }));
};

// Custom Hook for fetching requests
export const useAccountRequests = () => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        getAccountRequests()
            .then((requests) => setRequests(requests))
            .catch((error) => console.log('Error occurred:', error));
    }, []);

    return [requests, setRequests];
};
