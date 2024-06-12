// AddRecordModal.jsx
import { useState } from 'react';
import { Button, Modal, Form } from 'semantic-ui-react';
import { PropTypes } from 'prop-types';
import { NFTStorage } from 'nft.storage';

const AddRecordModal = ({ open, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        dateOfBirth: '',
        gender: '',
        bloodType: '',
        allergies: '',
        healthRecords: null,
        passcode: '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e, { name, value }) => {
        if (name === 'healthRecords') {
            setFormData({ ...formData, [name]: e.target.files[0] });
            setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
        } else {
            setFormData({ ...formData, [name]: value });
            setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name) {
            newErrors.name = 'Name is required';
        }
        if (!formData.age) {
            newErrors.age = 'Age is required';
        }

        if (formData.age && isNaN(formData.age)) {
            newErrors.age = 'Age must be a number';
        }

        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = 'Date of Birth is required';
        }

        // DOB format validation
        const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (formData.dateOfBirth && !dobRegex.test(formData.dateOfBirth)) {
            newErrors.dateOfBirth = 'Invalid Date of Birth format';
        }

        if (!formData.gender) {
            newErrors.gender = 'Gender is required';
        }
        if (!formData.bloodType) {
            newErrors.bloodType = 'Blood Type is required';
        }
        if (!formData.healthRecords) {
            newErrors.healthRecords = 'Health Records file is required';
        }
        if (!formData.passcode) {
            newErrors.passcode = 'Passcode is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            try {
                // Create a new instance of NFTStorage
                // eslint-disable-next-line no-undef
                const nftStorage = new NFTStorage({ token: process.env.NFT_STORAGE_API_KEY });

                // Generate a random 16-byte salt
                const salt = new Uint8Array(16);
                window.crypto.getRandomValues(salt);

                // Prepare the data to be stored as a Blob
                const data = JSON.stringify({
                    name: formData.name,
                    age: formData.age,
                    dateOfBirth: formData.dateOfBirth,
                    gender: formData.gender,
                    bloodType: formData.bloodType,
                    allergies: formData.allergies,
                    healthRecords: formData.healthRecords,
                    salt: Array.from(salt),
                });

                const blob = new Blob([data], { type: 'application/json' });

                // Store the Blob on NFT Storage
                const storedData = await nftStorage.storeBlob(blob);

                console.log('Data stored on NFT Storage:', storedData);

                // Reset form data
                setFormData({
                    name: '',
                    age: '',
                    dateOfBirth: '',
                    gender: '',
                    bloodType: '',
                    allergies: '',
                    healthRecords: null,
                    passcode: '',
                });

                // Close the modal
                onClose();
            } catch (error) {
                console.error('Error storing data on NFT Storage:', error);
            }
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Modal.Header>Add New Record</Modal.Header>
            <Modal.Content>
                <Form>
                    <Form.Input
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
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
                    <Form.Input label="Allergies" name="allergies" value={formData.allergies} onChange={handleChange} />
                    <Form.Input
                        label="Health Records"
                        name="healthRecords"
                        type="file"
                        onChange={handleChange}
                        error={errors.healthRecords}
                    />
                    <Form.Input
                        label="Passcode"
                        name="passcode"
                        type="password"
                        value={formData.passcode}
                        onChange={handleChange}
                        error={errors.passcode}
                    />
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={onClose}>Close</Button>
                <Button onClick={handleSubmit} primary>
                    Submit
                </Button>
            </Modal.Actions>
        </Modal>
    );
};

export default AddRecordModal;

AddRecordModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};
