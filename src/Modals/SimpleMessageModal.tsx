import { ButtonItem, ModalRoot } from "decky-frontend-lib";

export function SimpleMessageModal({ closeModal, title_message }: {title_message:string, closeModal?: () => void }) {
    return (
        <>
            <style>
                {`
                    .center{
                        text-align: center;
                    }
                `}
            </style>
            <ModalRoot onCancel={closeModal}>

                <h2 className="center"> {title_message} </h2>
                <div style={{ padding: '20px' }} />

                <ButtonItem
                    layout="below"
                    highlightOnFocus={true}
                    onClick={closeModal}>
                    Return
                </ButtonItem>

            </ModalRoot></>
    );
}

export default SimpleMessageModal