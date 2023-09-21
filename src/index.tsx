import {
  ButtonItem,
  definePlugin,
  FileSelectionType,
  PanelSection,
  ServerAPI,
  showModal,
  staticClasses,
  TextField,
} from "decky-frontend-lib";
import { useEffect, useRef, useState, VFC } from "react";
import { FaShip } from "react-icons/fa";
import FileExplorer from "./file_explorer"; // Import your FileExplorer component
import { Backend } from "./server";
import userSettings from "./defaultUser";

const DeckFT: VFC<{ serverAPI: ServerAPI, backend: Backend }> = ({ serverAPI, backend }) => {
  const [sourceFilePath, setSourceFilePath] = useState<string>("");
  const [targetPath, setTargetPath] = useState<string>("");
  const [ipAddr, setIpAddr] = useState<string>(userSettings.ipAddr);
  const [port, setPort] = useState<string>(userSettings.port);
  const [username, setUsername] = useState<string>(userSettings.username);
  const [password, setPassword] = useState<string>(userSettings.password);
  const closeSshClientRef = useRef(true); // Initialize with the initial value
  const remoteHomeDir = useRef("");

  useEffect(() => {
    initState();
  }, []); // will run when the component mounts

  useEffect(() => {
    return () => {
      // will run when the component unmounts
      closeSshClientRef.current && backend.closeSshClient();
    };
  }, []);

  const initState = async () => {
		const sourceFilePath = backend.getSourcePath();
		setSourceFilePath(await sourceFilePath);

		const targetPath = backend.getTargetPath();
		setTargetPath(await targetPath);
  }

  const pickSourceFile = async () => {
    const filePickerResponse = await serverAPI.openFilePickerV2(FileSelectionType.FILE, "/home/deck", true);
    backend.setSourcePath(filePickerResponse.path)
  }

  const getSourceFilePathText = () => {
    return `source file path:  ${sourceFilePath}`;
  }

  const getTargetPathText = () => {
    return `target path:  ${targetPath}`;
  }

  const SourceFilePicker = () => {
    return (
      <ButtonItem
        description={getSourceFilePathText()}
        layout="below"
        onClick={() => {
          closeSshClientRef.current = false;
          pickSourceFile();
        }}>
        {"Set folder 2"}
      </ButtonItem>
    )
  }

  const SelectTargetPathButton = () => {
    return (
      <ButtonItem
        description={getTargetPathText()}
        layout="below"
        onClick={() => {
          closeSshClientRef.current = false;
          showModal(
            <FileExplorer backend={backend} homeDir={remoteHomeDir.current} />
          );
        }}
      >
        {"Select Target Path"}
      </ButtonItem>
    )
  }

  const SshParamButton = ({ label, value, onChangeCall }: { label: string; value: string; onChangeCall: (newValue: string) => void }) => {
    return (
      <TextField
        label={label}
        value={value}
        onBlur={(e) => {
          onChangeCall(e.target.value)
          console.log(`arguttel changed -new value is ${e.target.value}`)
        }}
      />
    )
  }

  const CreateSshClientButton = () => (
    <ButtonItem
      layout="below"
      onClick={async () => {
        backend.createSshClient(ipAddr, username, password, port);
        remoteHomeDir.current = (await backend.getRemoteHomePath()).trim();
      }}
    >
      {"Create SSH Client"}
    </ButtonItem>
  );

  const CloseSshClientButton = () => (
    <ButtonItem
      layout="below"
      onClick={() => {
        backend.closeSshClient();
      }}
    >
      {"Close SSH Client"}
    </ButtonItem>
  );

  const TransferFileButton = () => (
    <ButtonItem
      layout="below"
      onClick={() => {
        backend.transferFile();
      }}
    >
      {"Transfer File"}
    </ButtonItem>
  );


  const RemoteSshParams = () => (
    <div>
      <SshParamButton label="Remote Ip" value={ipAddr} onChangeCall={setIpAddr} />
      <SshParamButton label="Port" value={port} onChangeCall={setPort} />
      <SshParamButton label="username" value={username} onChangeCall={setUsername} />
      <SshParamButton label="password" value={password} onChangeCall={setPassword} />
      <CreateSshClientButton />
    </div>
  );

  return (
    <div>
      <PanelSection title="Source">
        <SourceFilePicker />
      </PanelSection>

      <PanelSection title="Target">
        <RemoteSshParams />
        <SelectTargetPathButton />
        <CloseSshClientButton />
      </PanelSection>

      <PanelSection>
        <TransferFileButton />
      </PanelSection>

    </div>
  );
};


export default definePlugin((serverApi: ServerAPI) => {
  const backend = Backend.initialize(serverApi);

  return {
    title: <div className={staticClasses.Title}>DeckFT</div>,
    content: <DeckFT serverAPI={serverApi} backend={backend} />,
    icon: <FaShip />,
  };
});