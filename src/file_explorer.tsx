import { ButtonItem, Router } from 'decky-frontend-lib';
import { VFC, useEffect, useState } from 'react';
import { FileItem } from './utils';
import { Backend } from './server';

const FileExplorer: VFC<{ backend: Backend }> = ({ backend }) => {
    const [currentPath, setCurrentPath] = useState("/home/deck");
    const [files, setFiles] = useState<FileItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Define the fetchData function
    const fetchData = async () => {
        console.log("helllooooo arnon 1");
        const updatedFiles = await backend.updateFileList(currentPath);
        setFiles(updatedFiles);
        setIsLoading(false);
    };

    // This useEffect runs on the initial render
    useEffect(() => {
        fetchData();
    }, []); // Empty dependency array for initial render only

    // This useEffect runs whenever currentPath changes
    useEffect(() => {
        fetchData();
    }, [currentPath]);

    const handleItemClick = (item: FileItem) => {
        if (item.isDirectory) {
            setCurrentPath(item.path);
        } else {
            // Handle file click (e.g., open or perform an action)
            console.log(`File clicked: ${item.name}`);
        }
    };

    if (isLoading) {
        // Render a loading indicator here if needed
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>File Explorer</h2>
            {console.log("helllooooo arnon 2")}
            <ButtonItem 
                layout="below" 
                onClick={() => Router.NavigateToLibraryTab()}>
                Go Back
            </ButtonItem>
            <div>
                {files.map((item) => (
                    <ButtonItem 
                        layout="below" 
                        onClick={() => Router.NavigateToLibraryTab()}>
                        {item.name} 
                    </ButtonItem>
                ))}
            </div>
        </div>
    );
};

export default FileExplorer;
