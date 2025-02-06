import { Button, Dimmer, Image, Loader, Message, Modal } from 'semantic-ui-react';
import { createWebSocketConnection, generateNFTForAccount } from '../../api/xrpl';
import { memo, useState } from 'react';

import { Client } from 'xrpl';
import { PropTypes } from 'prop-types';
import { toast } from 'react-toastify';

// Account Request Approval
const approveAccountRequest = async (setPng, setRequests, request) => {
    setPng(null);
    // eslint-disable-next-line no-undef
    const client = new Client(process.env.XRPL_WSS_CLIENT);
    await client.connect();

    // eslint-disable-next-line no-undef
    const response = await generateNFTForAccount(process.env.ORACLE_ACCOUNT_ADDRESS, request.Account);
    setPng(response.data.refs.qr_png);
    const wsResponse = await createWebSocketConnection(response);

    if (!wsResponse) {
        toast.error('Request rejected');
        return;
    }

    setRequests((prevRequests) =>
        prevRequests.map((prevRequest) => {
            if (prevRequest.hash === request.hash) {
                return {
                    ...prevRequest,
                    accepted: true,
                };
            }
            return prevRequest;
        })
    );
    toast.success('Request accepted');
};

export const RenderRequest = memo(function RenderRequest({ request, setRequests, index }) {
    const [png, setPng] = useState(null);
    const [openModal, setOpenModal] = useState(false);

    if (!request.Memos || typeof request.Memos === 'string') {
        return null;
    }

    const onButtonClick = () => approveAccountRequest(setPng, setRequests, request);

    return (
        <tr key={request.hash} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
            <td>{request.Account}</td>
            <td>{request.Memos?.name}</td>
            <td>{request.Memos?.hospital}</td>
            <td>
                {request.accepted ? (
                    <Button disabled inverted color="green" className="accept-button">
                        Accepted
                    </Button>
                ) : (
                    <Modal
                        basic
                        onClose={() => setOpenModal(false)}
                        onOpen={() => setOpenModal(true)}
                        open={openModal}
                        size="small"
                        trigger={
                            <Button className="accept-button" onClick={onButtonClick}>
                                Accept
                            </Button>
                        }
                        centered={true}
                        style={{
                            background: 'white',
                            borderRadius: '20px',
                            minHeight: '300px',
                        }}
                    >
                        {png ? (
                            <Modal.Content
                                className="modal-container"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    color: 'black',
                                }}
                            >
                                <Message positive>
                                    <Message.Header>Scan the QR Code to approve the request</Message.Header>
                                </Message>
                                <Image
                                    src={png}
                                    style={{
                                        height: '250px',
                                        width: '250px',
                                    }}
                                />
                            </Modal.Content>
                        ) : (
                            <Dimmer active inverted style={{ borderRadius: '20px' }}>
                                <Loader active inline="centered">
                                    Loading
                                </Loader>
                            </Dimmer>
                        )}
                    </Modal>
                )}
            </td>
        </tr>
    );
});

RenderRequest.propTypes = {
    request: PropTypes.object,
    setRequests: PropTypes.func,
    index: PropTypes.number,
};
