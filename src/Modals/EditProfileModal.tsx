import { useState } from "react";
import { Backend } from "../server";
import { Profile } from "../utils";
import { ConfirmModal, TextField } from "decky-frontend-lib";

export function EditProfileModal({ closeModal, backend, profile }:
    { closeModal?: () => void, backend: Backend, profile: Profile }) {
    const [ipAddr, setIpAddr] = useState<string>(profile.ipAddr);
    const [port, setPort] = useState<string>(profile.port);
    const [username, setUsername] = useState<string>(profile.username);
    const [password, setPassword] = useState<string>(profile.password);

    return (
        <ConfirmModal
            strTitle="Edit Profile"
            strDescription={`This profile will holds ssh params for scp usage, please be aware that data will be saved localy on the plugin setting dir.`}
            strOKButtonText="Update Profile"
            onCancel={closeModal}
            onOK={async () => {
                await backend.updateProfile(profile.name, ipAddr, username, password, port)
                closeModal?.();
            }}
        >
            <div style={{ marginBottom: "20px" }} />
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