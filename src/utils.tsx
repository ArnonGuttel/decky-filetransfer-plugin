import { Backend } from "./server";

export interface FileItem {
    name: string;
    isDirectory: boolean;
    path: string;
}

export interface FileExplorerPageProps {
    backend: Backend;
}

export function ParseFilesList(fileListString: string): FileItem[] {
    try {
        console.error(fileListString);
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