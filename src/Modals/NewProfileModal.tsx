import { useState } from "react";
import { Backend } from "../server";
import { ConfirmModal, TextField } from "decky-frontend-lib";

export function CreateProfileModal({ closeModal, backend}:
    { closeModal?: () => void, backend: Backend }) {
    const [profileName, setProfileName] = useState<string>("Profile Name");
    const [ipAddr, setIpAddr] = useState<string>("0000.0000.0000.0000");
    const [port, setPort] = useState<string>("22");
    const [username, setUsername] = useState<string>("username");
    const [password, setPassword] = useState<string>("password");

    return (
        <ConfirmModal
            strTitle="Create New Profile"
            strDescription={`This profile will holds ssh params for scp usage, please be aware that data will be saved localy on the plugin setting dir.`}
            strOKButtonText="Create"
            onCancel={closeModal}
            onOK={async () => {
                await backend.createProfile(profileName, ipAddr, username, password, port)
                await backend.setTargetProfile(profileName)
                closeModal?.();
            }}
        >
            <div style={{ marginBottom: "20px" }} />
            <TextField
                label="Profile Name"
                value={profileName}
                onChange={(e) => {
                    setProfileName(e.target.value);
                }}
            />
            <TextField
                label="IP"
                value={ipAddr}
                onChange={(e) => {
                    setIpAddr(e.target.value);
                }}
            />
            <TextField
                label="Username"
                value={username}
                onChange={(e) => {
                    setUsername(e.target.value);
                }}
            />
            <TextField
                label="Password"
                value={password}
                bIsPassword={true}
                onChange={(e) => {
                    setPassword(e.target.value);
                }}
            />
            <TextField
                label="Port"
                value={port}
                onChange={(e) => {
                    setPort(e.target.value);
                }}
            />
        </ConfirmModal>
    );
}