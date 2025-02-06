import './login.scss';

import { createWebSocketConnection, generateXummLoginQR } from '../../api/xrpl';
import { useCallback, useEffect, useState } from 'react';

import { ApiCall } from '../../api/interceptor';
import { FaRedo } from 'react-icons/fa';
import { Image } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { setItemInLocalStorage } from '../../utils/app.utils';

const Login = () => {
    const [qrCode, setQRCode] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleWebSocket = useCallback(
        async (qrData) => {
            try {
                const wsResponse = await createWebSocketConnection(qrData);

                if (!wsResponse) {
                    setQRCode(null);
                } else {
                    const response = await ApiCall({
                        url: 'user/signIn',
                        method: 'POST',
                        data: {
                            userAddress: wsResponse.data.signer,
                        },
                    });

                    if (response.data.error) {
                        toast.error('You are not authorized to access this page. Please try again.');
                        return;
                    }

                    setItemInLocalStorage('token', response.data);
                    navigate(response.data.type.toLowerCase() === 'admin' ? '/admin-panel' : '/user-dashboard');
                }
            } catch (error) {
                console.log('Error in WebSocket connection:', error);
            }
        },
        [navigate]
    );

    const getXummQR = useCallback(async () => {
        setLoading(true);
        try {
            const qr = await generateXummLoginQR();
            setQRCode(qr.data.refs.qr_png);
            handleWebSocket(qr);
        } catch (error) {
            localStorage.removeItem('token');
            toast.error('Error generating Xumm Login QR');
        } finally {
            setLoading(false);
        }
    }, [handleWebSocket]);

    useEffect(() => {
        getXummQR();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="login-container">
            <h2>Login using XUMM</h2>
            {loading ? (
                <p>Loading QR code...</p>
            ) : (
                <div className="img-container">{qrCode && <Image src={qrCode} />}</div>
            )}
            <button className={`refresh-button ${loading ? 'rotating' : ''}`} onClick={getXummQR} disabled={loading}>
                <FaRedo size={20} />
            </button>
        </div>
    );
};

export default Login;
