import './admin-panel.scss';
import { Dimmer, Loader, Button } from 'semantic-ui-react';
import { useEffect, useMemo, useState } from 'react';
import { RenderRequest } from './RenderRequest';
import { toast } from 'react-toastify';
import { useAccountRequests } from './useAccountRequests';
import { useNavigate } from 'react-router-dom';
import { getItemFromLocalStorage } from '../../utils/app.utils';
import AddRecordModal from './AddRecordModal';

const AdminPanel = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useAccountRequests();
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Auth Check
    useEffect(() => {
        const token = getItemFromLocalStorage('token');
        if (!token) {
            navigate('/');
        } else {
            if (token.type.toLowerCase() !== 'admin') {
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
                        <div className="left">
                            <h2>Registration Requests</h2>
                            <span>All the registration requests will be listed here</span>
                        </div>
                        <div className="right">
                            <Button primary onClick={() => setShowModal(true)}>
                                Add Record
                            </Button>
                        </div>
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
            <AddRecordModal open={showModal} onClose={() => setShowModal(false)} />
        </div>
    );
};

export default AdminPanel;
