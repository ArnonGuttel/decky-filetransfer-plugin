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
            const fileItems: FileItem[] = fileListString.map((item: any) => ({
                name: item["name"],
                isDirectory: Boolean(item["isDirectory"]),
                path: item["path"],
            })) as FileItem[];

            fileItems.sort((a, b) => {
                if (a.isDirectory && b.isDirectory) {
                    // Both are directories, sort by name
                    return a.name.localeCompare(b.name);
                } else if (a.isDirectory && !b.isDirectory) {
                    return -1; // a is a directory, b is not, so a comes first
                } else if (!a.isDirectory && b.isDirectory) {
                    return 1; // b is a directory, a is not, so b comes first
                } else {
                    // Both are not directories, sort by name
                    return a.name.localeCompare(b.name);
                }
            });

            return fileItems;
        } else {
            console.error('Invalid data format received from the server');
            return [];
        }

    } catch (error) {
        console.error('Error parsing file list:', error);
        return [];
    }
}
