import { ButtonItem, ModalRoot } from 'decky-frontend-lib';
import { useEffect, useState } from 'react';
import { FileItem } from '../utils';
import { Backend } from '../server';
import { FaFolder } from 'react-icons/fa';

const RemoteFileExplorer = ({ closeModal, backend, homeDir, includeFiles }: {
    closeModal?: () => void;
    backend: Backend,
    homeDir: string,
    includeFiles: boolean
}) => {
    const [pathStack, setPathStack] = useState<string[]>([homeDir]);
    const currentPath = pathStack[pathStack.length - 1];
    const [files, setFiles] = useState<FileItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Define the fetchData function
    const fetchData = async () => {
        const updatedFiles = await backend.updateFileList(currentPath, includeFiles);
        setFiles(updatedFiles);
        setIsLoading(false);
    };

    // This useEffect runs whenever currentPath changes
    useEffect(() => {
        fetchData();
    }, [currentPath]);

    const handleItemClick = (item: FileItem) => {
        if (item.isDirectory) {
            setPathStack([...pathStack, item.path]);
            console.log(`new path is: ${item.path}`)
        } else {
            handleSetPath(item.name);
        }
    };

    const handleGoBack = () => {
        console.log(`go back pressed`)

        // Pop the last path from the stack if there is more than one path
        if (pathStack.length > 1) {
            const newPathStack = [...pathStack];
            newPathStack.pop();
            setPathStack(newPathStack);
            console.log(`new path is: ${newPathStack[newPathStack.length - 1]}`)
        }
        else {
            handleClose();
        }
    };

    const handleClose = () => {
        closeModal?.();
    }

    const handleSetPath = (pathSuffix: string) => {
        includeFiles ? backend.setSourcePath(currentPath + '/' + pathSuffix) : backend.setTargetPath(currentPath)
        closeModal?.();
    }

    if (isLoading) {
        return (
            <ModalRoot onCancel={() => handleGoBack()}>
                <h2>Loading...</h2>
                <ButtonItem
                    layout="below"
                    onClick={handleClose}>
                    Close Explorer
                </ButtonItem>
            </ModalRoot>
        );
    }

    return (
        <ModalRoot onCancel={() => handleGoBack()}>
            <h2>File Explorer</h2>
            <h3>{currentPath}</h3>

            {files.map((item) => (
                <ButtonItem
                    layout="below"
                    onClick={() => handleItemClick(item)}>
                    {item.isDirectory ?
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "start",
                                gap: "1em",
                            }}
                        >
                            <FaFolder />
                            <span>{item.name}</span>
                        </div>
                        : item.name}
                </ButtonItem>
            ))}

            <div style={{ padding: files.length > 0 ? '20px' : '0px' }} />

            {!includeFiles &&
                <ButtonItem
                    layout="below"
                    onClick={handleSetPath}>
                    Use This Location
                </ButtonItem>
            }

            {currentPath != homeDir ?
                <ButtonItem
                    layout="below"
                    onClick={() => handleGoBack()}
                >
                    Go Back
                </ButtonItem>
                :
                <ButtonItem
                    layout="below"
                    onClick={handleClose}>
                    Close Explorer
                </ButtonItem>
            }
        </ModalRoot>
    );
};


export default RemoteFileExplorer;
