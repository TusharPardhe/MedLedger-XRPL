import './AllRecordsPanel.scss';
import { Dimmer, Loader, Button, Pagination, Input, Dropdown } from 'semantic-ui-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { decryptData, getItemFromLocalStorage } from '../../utils/app.utils';
import { ApiCall } from '../../api/interceptor';
import SecretInputModal from '../admin-panel/SecureInputModal';
import PatientInfoModal from '../admin-panel/PatientInfoModal';

const filterOptions = [
    { key: 'all', text: 'All Fields', value: 'all' },
    { key: 'minterAddress', text: 'Account', value: 'minterAddress' },
    { key: 'name', text: 'Name', value: 'name' },
    { key: 'patientID', text: 'Patient ID', value: 'patientID' },
];

const AllRecordsPanel = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSecretModal, setShowSecretModal] = useState(false);
    const [showPatientInfoModal, setShowPatientInfoModal] = useState(false);
    const [selectedTxId, setSelectedTxId] = useState(null);
    const [decryptLoading, setDecryptLoading] = useState(false);
    const [patientInfo, setPatientInfo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterField, setFilterField] = useState('all');
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
            if (token.type !== 'admin') {
                toast.error('Unauthorized access');
                navigate('/');
                return;
            }

            fetchAllRecords(1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAllRecords = async (page, search = '', filter = 'all') => {
        try {
            setLoading(true);
            const result = await ApiCall({
                method: 'GET',
                url: 'user/records',
                params: {
                    page,
                    limit: pagination.recordsPerPage,
                    search,
                    filterField: filter,
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
        fetchAllRecords(activePage, searchTerm, filterField);
    };

    const handleSearch = () => {
        fetchAllRecords(1, searchTerm, filterField);
    };

    const handleFilterChange = (_, { value }) => {
        setFilterField(value);
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
        <div className="system-records-panel">
            <h1>All System Records</h1>
            <div className="search-container">
                <Input
                    placeholder="Search records"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    action={{
                        icon: 'search',
                        onClick: handleSearch,
                    }}
                    labelPosition="right"
                >
                    <input />
                    <Dropdown
                        className="filter-dropdown"
                        options={filterOptions}
                        value={filterField}
                        onChange={handleFilterChange}
                        selection
                    />
                    <Button icon="search" onClick={handleSearch} />
                </Input>
            </div>
            {loading ? (
                <Dimmer active inverted>
                    <Loader>Please wait...</Loader>
                </Dimmer>
            ) : (
                <div className="system-card">
                    <div className="system-card-header">
                        <div className="system-header-left">
                            <h2>System Patient Records</h2>
                            <span>Total Records: {pagination.totalRecords}</span>
                        </div>
                    </div>
                    <div className="system-table-container">
                        <table className="system-records-table">
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
                        <div className="system-pagination-container">
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

export default AllRecordsPanel;
