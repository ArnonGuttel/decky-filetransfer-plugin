import { Backend } from "./server";

export interface FileItem {
    name: string;
    isDirectory: boolean;
    path: string;
}

export interface FileExplorerPageProps {
    backend: Backend;
}

export interface Profile {
    name: string;
    ipAddr: string;
    port: string;
    username: string;
    password: string;
}

export function ParseBackendProfiles(backendProfilesData: any) {
    // Parse the backend profiles and convert them to the Profile format
    try {
        console.info(backendProfilesData);
        return Object.keys(backendProfilesData).map((profileName: string) => {
            const backendProfile = backendProfilesData[profileName];
            return {
                name: profileName,
                ipAddr: backendProfile.ipAddr || "",
                port: backendProfile.port || "",
                username: backendProfile.username || "",
                password: backendProfile.password || "",
            };
        });
    }
    catch (error) {
        console.error('Error parsing file list:', error);
        return [];
    }
}

export function ParseFilesList(fileListString: string): FileItem[] {
    try {
        console.info(fileListString);
        if (Array.isArray(fileListString)) {
            return fileListString.map((item: any) => ({
                name: item["name"],
                isDirectory: Boolean(item["isDirectory"]),
                path: item["path"],
            })) as FileItem[];
        } else {
            console.error('Invalid data format received from the server');
            return [];
        }

    } catch (error) {
        console.error('Error parsing file list:', error);
        return [];
    }
};