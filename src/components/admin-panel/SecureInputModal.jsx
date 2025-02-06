import { useState } from 'react';
import { Modal, Button, Form, Input } from 'semantic-ui-react';
import { PropTypes } from 'prop-types';

const SecretInputModal = ({ open, onClose, onSubmit, loading }) => {
    const [secret, setSecret] = useState('');

    const handleSubmit = () => {
        onSubmit(secret);
        setSecret('');
    };

    return (
        <Modal size="tiny" open={open} onClose={onClose}>
            <Modal.Header>Enter Secret Key</Modal.Header>
            <Modal.Content>
                <Form>
                    <Form.Field>
                        <label>Secret Key</label>
                        <Input
                            type="password"
                            placeholder="Enter your secret key"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            autoComplete="off"
                        />
                    </Form.Field>
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button primary onClick={handleSubmit} loading={loading} disabled={!secret || loading}>
                    Submit
                </Button>
            </Modal.Actions>
        </Modal>
    );
};

export default SecretInputModal;

SecretInputModal.propTypes = {
    open: PropTypes.func,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
    loading: PropTypes.boolean,
};
