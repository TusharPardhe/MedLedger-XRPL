import './admin-panel.scss';

import { Dimmer, Loader } from 'semantic-ui-react';
import { useEffect, useMemo, useState } from 'react';

import { RenderRequest } from './RenderRequest';
import { decryptJSON } from '../../utils/app.utils';
import { toast } from 'react-toastify';
import { useAccountRequests } from './useAccountRequests';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useAccountRequests();
    const [loading, setLoading] = useState(true);

    // Auth Check
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
        } else {
            const decrypted = decryptJSON(token);

            if (decrypted.type.toLowerCase() !== 'admin') {
                toast.error('You are not authorized to access this page');
                navigate('/');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Check if requests are loaded
    useEffect(() => {
        if (requests.length > 0) {
            setLoading(false);
        }
    }, [requests]);

    const tableRows = useMemo(
        () => requests.map((request, index) => <RenderRequest key={index} {...{ request, setRequests, index }} />),
        [requests, setRequests]
    );

    return (
        <div className="admin-panel">
            <h1>Admin Panel</h1>
            {loading ? (
                <Dimmer active inverted>
                    <Loader>Please wait...</Loader>
                </Dimmer>
            ) : (
                <div className="card">
                    <div className="card-header">
                        <h2>Registration Requests</h2>
                        <span>All the registration requests will be listed here</span>
                    </div>
                    <table className="requests-table">
                        <thead>
                            <tr>
                                <th>Account</th>
                                <th>Name</th>
                                <th>Hospital</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>{tableRows}</tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
