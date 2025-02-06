import './registration.scss';

import { Button, Container, Form, Image, Input, Message, Segment, Step } from 'semantic-ui-react';
import { createWebSocketConnection, generateAccount, generateQRForPayment } from '../../api/xrpl';
import { useCallback, useState } from 'react';

import QRCode from 'qrcode.react';
import { toast } from 'react-toastify';

const NFTOrderComponent = () => {
    const [loading, setLoading] = useState(false);
    const [account, setAccount] = useState(null);
    const [userDetails, setUserDetails] = useState({
        name: '',
        hospital: '',
    });
    const [qr, setQR] = useState({
        png: null,
        id: null,
    });

    const handleGenerateAccount = useCallback(async () => {
        setLoading(true);
        try {
            const newAccount = await generateAccount();
            setAccount(newAccount);
        } catch (error) {
            throw new Error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleQRGeneration = useCallback(async () => {
        setLoading(true);
        try {
            const payment = await generateQRForPayment({ account: account.address, ...userDetails });
            setQR({ ...qr, png: payment.data.refs.qr_png });
            const response = await createWebSocketConnection(payment);
            if (!response) {
                setQR({
                    png: null,
                    id: null,
                });
                return;
            }
            setQR({ ...qr, id: response.data.txid });
        } catch (error) {
            toast.error('Error Generating Ticket. Please check the details again.');
        } finally {
            setLoading(false);
        }
    }, [account?.address, userDetails]);

    return (
        <Container
            style={{
                marginTop: '2rem',
                marginBottom: '2rem',
            }}
        >
            <Segment raised padded>
                <Step.Group size="small" ordered>
                    <Step completed={Boolean(account)}>
                        <Step.Content>
                            <Step.Title>Generate Account</Step.Title>
                            <Step.Description>Generate a new account</Step.Description>
                        </Step.Content>
                    </Step>
                    <Step completed={!!qr.png}>
                        <Step.Content>
                            <Step.Title>Enter Details</Step.Title>
                            <Step.Description>Fill in your personal information</Step.Description>
                        </Step.Content>
                    </Step>

                    <Step completed={Boolean(qr.id)}>
                        <Step.Content>
                            <Step.Title>Generate Ticket</Step.Title>
                            <Step.Description>Scan and generate a request</Step.Description>
                        </Step.Content>
                    </Step>
                </Step.Group>

                <div className="nft-order-container">
                    <div className="general-information">
                        <h3>Registration Steps:</h3>
                        <ul className="account-detail-list">
                            <li>Download XUMM/XAMAN App</li>
                            <li>Click the Generate New Account button below</li>
                            <li>{"Open XUMM/XAMAN App and click 'Add new account.'"}</li>
                            <li>{"Select 'Import Existing Account'."}</li>
                            <li>{"Select 'Full Access' and then on next screen 'Family Seed'."}</li>
                            <li>Scan the QR code generate in previous steps.</li>
                            <li>Now fill your details and press the button. (To create a request ticket)</li>
                            <li>Tap the middle button in your XUMM app to scan the QR code</li>
                            <li>Slide to approve the request.</li>
                        </ul>
                    </div>

                    {account ? (
                        <div className="account-details">
                            <Message positive>
                                <Message.Header>New Account Details</Message.Header>
                                <p>Account Address: {account.address}</p>
                                <p>**Secret [KEEP IT SAFE]: {account.seed}</p>
                                <p>Scan Me:</p>
                                <QRCode value={account.seed} />
                            </Message>

                            <Form className="user-details">
                                <Form.Field>
                                    <label htmlFor="name">Name</label>
                                    <Input
                                        id="name"
                                        placeholder="Enter your name"
                                        value={userDetails.name}
                                        onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
                                        disabled={!!qr.png}
                                    />
                                </Form.Field>

                                <Form.Field>
                                    <label htmlFor="hospital">Hospital</label>
                                    <Input
                                        id="hospital"
                                        placeholder="Enter your hospital"
                                        value={userDetails.hospital}
                                        onChange={(e) => setUserDetails({ ...userDetails, hospital: e.target.value })}
                                        disabled={!!qr.png}
                                    />
                                </Form.Field>
                            </Form>

                            {qr.png ? (
                                <Message positive>
                                    <Message.Header>Generate Ticket</Message.Header>
                                    <p>Scan Me:</p>
                                    <Image src={qr.png} />
                                </Message>
                            ) : (
                                <Button
                                    primary
                                    inverted
                                    loading={loading}
                                    disabled={loading}
                                    onClick={handleQRGeneration}
                                >
                                    Generate Request QR Code
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Button primary inverted loading={loading} disabled={loading} onClick={handleGenerateAccount}>
                            Generate New Account
                        </Button>
                    )}
                    {qr.id && (
                        <div className="nft-details">
                            <Message positive>
                                <Message.Header>Ticket Details</Message.Header>
                                <p>Ticket ID: {qr.id}</p>
                            </Message>
                        </div>
                    )}
                </div>
            </Segment>
        </Container>
    );
};

export default NFTOrderComponent;
