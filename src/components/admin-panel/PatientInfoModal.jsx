import { Modal, Button, Table } from 'semantic-ui-react';
import { PropTypes } from 'prop-types';

const PatientInfoModal = ({ open, onClose, patientInfo }) => {
    return (
        <Modal open={open} onClose={onClose}>
            <Modal.Header>Patient Information</Modal.Header>
            <Modal.Content>
                {patientInfo ? (
                    <Table celled>
                        <Table.Body>
                            <Table.Row>
                                <Table.Cell width={6}>
                                    <strong>Patient ID</strong>
                                </Table.Cell>
                                <Table.Cell>{patientInfo.patientID}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>
                                    <strong>Name</strong>
                                </Table.Cell>
                                <Table.Cell>{patientInfo.name}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>
                                    <strong>Age</strong>
                                </Table.Cell>
                                <Table.Cell>{patientInfo.age}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>
                                    <strong>Date of Birth</strong>
                                </Table.Cell>
                                <Table.Cell>{patientInfo.dateOfBirth}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>
                                    <strong>Gender</strong>
                                </Table.Cell>
                                <Table.Cell>{patientInfo.gender}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>
                                    <strong>Blood Type</strong>
                                </Table.Cell>
                                <Table.Cell>{patientInfo.bloodType}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>
                                    <strong>Allergies</strong>
                                </Table.Cell>
                                <Table.Cell>{patientInfo.allergies}</Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.Cell>
                                    <strong>Patient Address</strong>
                                </Table.Cell>
                                <Table.Cell>{patientInfo.patientAddress}</Table.Cell>
                            </Table.Row>
                        </Table.Body>
                    </Table>
                ) : (
                    <p>No patient information available</p>
                )}
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={onClose}>Close</Button>
            </Modal.Actions>
        </Modal>
    );
};

export default PatientInfoModal;

PatientInfoModal.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    patientInfo: PropTypes.shape({
        patientID: PropTypes.string,
        name: PropTypes.string,
        age: PropTypes.string,
        dateOfBirth: PropTypes.string,
        gender: PropTypes.string,
        bloodType: PropTypes.string,
        allergies: PropTypes.string,
        patientAddress: PropTypes.string,
    }),
};
