import { useState, useCallback, useEffect } from 'react';
import { Button, Modal, Form, Image } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import pinataSDK from '@pinata/sdk';
import { createWebSocketConnection, generateNFTForAccount } from '../../api/xrpl';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { ApiCall } from '../../api/interceptor';
import { encryptData } from '../../utils/app.utils';

const AddRecordModal = ({ open, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        patientID: '',
        patientAddress: '',
        dateOfBirth: '',
        gender: '',
        bloodType: '',
        allergies: '',
        secretCode: '', // Add secret code field
    });
    const [errors, setErrors] = useState({});
    const [qrCode, setQRCode] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            setFormData({
                name: '',
                age: '',
                dateOfBirth: '',
                gender: '',
                bloodType: '',
                allergies: '',
                secretCode: '', // Reset secret code
                patientID: '',
                patientAddress: '',
            });
            setErrors({});
            setQRCode(null);
            setLoading(false);
        }
    }, [open]);

    const handleChange = (e, { name, value }) => {
        setFormData((prevData) => ({ ...prevData, [name]: value }));
        setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.age) newErrors.age = 'Age is required';
        if (formData.age && isNaN(formData.age)) newErrors.age = 'Age must be a number';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required';

        const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (formData.dateOfBirth && !dobRegex.test(formData.dateOfBirth)) {
            newErrors.dateOfBirth = 'Invalid Date of Birth format';
        }

        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.bloodType) newErrors.bloodType = 'Blood Type is required';

        if (!formData.secretCode) newErrors.secretCode = 'Secret Code is required';

        if (!formData.patientID) newErrors.patientID = 'Patient ID is required';

        if (!formData.patientAddress) newErrors.patientAddress = 'Patient Address is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetQRCode = useCallback(() => {
        setQRCode(null);
        setLoading(false);
    }, []);

    const handleWebSocket = useCallback(
        async (qrData) => {
            try {
                const wsResponse = await createWebSocketConnection(qrData);

                if (!wsResponse) {
                    resetQRCode();
                    toast.error('Transaction signing failed or timed out. Please try again.');
                } else {
                    toast.success('NFToken minted successfully');

                    return wsResponse;
                }
            } catch (error) {
                console.error('Error in WebSocket connection:', error);
                resetQRCode();
                toast.error('Error in transaction signing. Please try again.');
            }
        },
        [onClose, resetQRCode]
    );

    const storeDataOnPinata = async (encryptedData) => {
        try {
            const pinata = new pinataSDK({
                // eslint-disable-next-line no-undef
                pinataApiKey: process.env.PINATA_API_KEY,
                // eslint-disable-next-line no-undef
                pinataSecretApiKey: process.env.PINATA_SECRET,
            });

            const metadata = {
                name: 'Medical Record',
                description: 'Confidential medical record stored as NFT',
                properties: encryptedData,
            };

            const options = {
                pinataMetadata: {
                    name: 'Medical_Record',
                },
                pinataOptions: {
                    cidVersion: 0,
                },
            };

            // Pin the JSON metadata to Pinata
            const result = await pinata.pinJSONToIPFS(metadata, options);

            return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
        } catch (error) {
            console.error('Error storing data on Pinata:', error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            setLoading(true);
            try {
                const tokenData = JSON.parse(localStorage.getItem('token'));
                const decodedToken = jwtDecode(tokenData.token);
                const userAddress = decodedToken.userAddress;

                // Encrypt form data using the Secret Code
                const encryptedData = encryptData(formData, formData.secretCode);

                // Store the encrypted data on Pinata
                const pinataUrl = await storeDataOnPinata(encryptedData);

                // Generate NFTokenMint transaction with the Pinata URL
                const response = await generateNFTForAccount(userAddress, pinataUrl);

                if (response.data && response.data.refs && response.data.refs.qr_png) {
                    setQRCode(response.data.refs.qr_png);
                    const wsResponse = await handleWebSocket(response);
                    // Save some data for reference in DB
                    const dataToSave = {
                        name: formData.name,
                        patientID: formData.patientID,
                        minterAddress: userAddress,
                        txID: wsResponse.data.txid,
                    };

                    const saveResponse = await ApiCall({
                        method: 'POST',
                        url: 'user/account/save/record',
                        data: dataToSave,
                    });

                    if (!saveResponse) {
                        throw new Error('Failed to save record');
                    }
                } else {
                    throw new Error('Failed to generate QR code');
                }

                onClose();
            } catch (error) {
                console.error('Error generating NFTokenMint transaction:', error);
                toast.error('Error generating NFTokenMint transaction. Please try again.');
                resetQRCode();
            }
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Modal.Header>Add New Record</Modal.Header>
            <Modal.Content>
                {qrCode ? (
                    <div className="qr-container">
                        <h3>Scan QR Code with XAMAN App</h3>
                        <Image src={qrCode} />
                        <Button onClick={resetQRCode} style={{ marginTop: '10px' }}>
                            Retry
                        </Button>
                    </div>
                ) : (
                    <Form>
                        <Form.Input
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            error={errors.name}
                        />
                        <Form.Input
                            label="Patient ID"
                            name="patientID"
                            value={formData.patientID}
                            onChange={handleChange}
                            error={errors.patientID}
                        />
                        <Form.Input
                            label="Patient Address"
                            name="patientAddress"
                            value={formData.patientAddress}
                            onChange={handleChange}
                            error={errors.patientAddress}
                        />
                        <Form.Input
                            label="Age"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            error={errors.age}
                        />
                        <Form.Input
                            label="Date of Birth (YYYY-MM-DD)"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            error={errors.dateOfBirth}
                        />
                        <Form.Select
                            label="Gender"
                            name="gender"
                            value={formData.gender}
                            options={[
                                { key: 'm', text: 'Male', value: 'male' },
                                { key: 'f', text: 'Female', value: 'female' },
                                { key: 'o', text: 'Other', value: 'other' },
                            ]}
                            onChange={handleChange}
                            error={errors.gender}
                        />
                        <Form.Input
                            label="Blood Type"
                            name="bloodType"
                            value={formData.bloodType}
                            onChange={handleChange}
                            error={errors.bloodType}
                        />
                        <Form.Input
                            label="Allergies"
                            name="allergies"
                            value={formData.allergies}
                            onChange={handleChange}
                        />
                        <Form.Input
                            label="Secret Code" // Secret code input
                            name="secretCode"
                            value={formData.secretCode}
                            onChange={handleChange}
                            type="password" // Ensure it's a password field
                            error={errors.secretCode}
                        />
                    </Form>
                )}
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={onClose}>Close</Button>
                {!qrCode && (
                    <Button onClick={handleSubmit} primary disabled={loading}>
                        {loading ? 'Generating NFT...' : 'Submit'}
                    </Button>
                )}
            </Modal.Actions>
        </Modal>
    );
};

AddRecordModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default AddRecordModal;
