import './admin-panel.scss';
import { Dimmer, Loader, Button, Pagination } from 'semantic-ui-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { decryptData, getItemFromLocalStorage } from '../../utils/app.utils';
import AddRecordModal from './AddRecordModal';
import PatientInfoModal from './PatientInfoModal';
import { ApiCall } from '../../api/interceptor';
import { jwtDecode } from 'jwt-decode';
import SecretInputModal from './SecureInputModal';

const AdminPanel = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSecretModal, setShowSecretModal] = useState(false);
    const [showPatientInfoModal, setShowPatientInfoModal] = useState(false);
    const [selectedTxId, setSelectedTxId] = useState(null);
    const [decryptLoading, setDecryptLoading] = useState(false);
    const [patientInfo, setPatientInfo] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
        recordsPerPage: 10,
        hasNextPage: false,
        hasPreviousPage: false,
    });

    useEffect(() => {
        const token = getItemFromLocalStorage('token');
        if (!token) {
            navigate('/');
        } else {
            fetchRecords(1);
        }
    }, []);

    const fetchRecords = async (page) => {
        try {
            setLoading(true);
            const tokenData = JSON.parse(localStorage.getItem('token'));
            const decodedToken = jwtDecode(tokenData.token);
            const userAddress = decodedToken.userAddress;

            const result = await ApiCall({
                method: 'GET',
                url: 'user/account/records',
                params: {
                    account: userAddress,
                    page: page,
                    limit: pagination.recordsPerPage,
                },
            });

            if (result.data.success) {
                setRequests(result.data.data);
                setPagination(result.data.pagination);
            } else {
                toast.error('Failed to fetch records');
            }
        } catch (error) {
            console.error('Error fetching records:', error);
            toast.error('Error fetching records');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (_, data) => {
        const { activePage } = data;
        fetchRecords(activePage);
    };

    const handleRecordAdded = () => {
        fetchRecords(1);
        setShowAddModal(false);
        toast.success('Record added successfully');
    };

    const handleViewClick = (txId) => {
        setSelectedTxId(txId);
        setShowSecretModal(true);
    };

    const handleSecretSubmit = async (secret) => {
        if (!selectedTxId) {
            toast.error('No transaction ID selected');
            return;
        }

        try {
            setDecryptLoading(true);
            const result = await ApiCall({
                method: 'GET',
                url: 'user/patient/data',
                params: {
                    txID: selectedTxId,
                },
            });
            if (result.data.properties) {
                const decryptedData = decryptData(result.data.properties, secret);
                setPatientInfo(decryptedData);
                setShowSecretModal(false);
                setShowPatientInfoModal(true);
            } else {
                toast.error('Failed to decrypt information');
            }
        } catch (error) {
            console.error('Error decrypting data:', error);
            toast.error('Invalid secret key or error decrypting data');
        } finally {
            setDecryptLoading(false);
        }
    };

    const handleClosePatientInfo = () => {
        setShowPatientInfoModal(false);
        setPatientInfo(null);
        setSelectedTxId(null);
    };

    const handleCloseSecretModal = () => {
        setShowSecretModal(false);
        setSelectedTxId(null);
        setDecryptLoading(false);
    };

    const tableRows = useMemo(
        () =>
            requests.map((request, index) => (
                <tr key={request._id + index}>
                    <td>{request.minterAddress}</td>
                    <td>{request.name}</td>
                    <td>{request.patientID}</td>
                    <td>
                        <Button
                            basic
                            color="black"
                            icon="eye"
                            content="View"
                            onClick={() => handleViewClick(request.txID)}
                        />
                    </td>
                </tr>
            )),
        [requests]
    );

    return (
        <div className="admin-panel">
            <h1>Dashboard</h1>
            {loading ? (
                <Dimmer active inverted>
                    <Loader>Please wait...</Loader>
                </Dimmer>
            ) : (
                <div className="card">
                    <div className="card-header">
                        <div className="left">
                            <h2>Your Patient Data</h2>
                            <span>Total Records: {pagination.totalRecords}</span>
                        </div>
                        <div className="right">
                            <Button primary onClick={() => setShowAddModal(true)}>
                                Add Record
                            </Button>
                        </div>
                    </div>
                    <div className="table-container">
                        <table className="requests-table">
                            <thead>
                                <tr>
                                    <th>Account</th>
                                    <th>Name</th>
                                    <th>Patient ID</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>{tableRows}</tbody>
                        </table>
                    </div>
                    {pagination.totalPages > 1 && (
                        <div className="pagination-container">
                            <Pagination
                                activePage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                onPageChange={handlePageChange}
                                boundaryRange={1}
                                siblingRange={1}
                                ellipsisItem={null}
                                disabled={loading}
                            />
                        </div>
                    )}
                </div>
            )}

            <AddRecordModal open={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={handleRecordAdded} />

            <SecretInputModal
                open={showSecretModal}
                onClose={handleCloseSecretModal}
                onSubmit={handleSecretSubmit}
                loading={decryptLoading}
            />

            <PatientInfoModal open={showPatientInfoModal} onClose={handleClosePatientInfo} patientInfo={patientInfo} />
        </div>
    );
};

export default AdminPanel;
