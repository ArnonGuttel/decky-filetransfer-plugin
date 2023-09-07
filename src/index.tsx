import {
  ButtonItem,
  definePlugin,
  DialogButton,
  Field,
  FileSelectionType,
  ModalRoot,
  PanelSection,
  PanelSectionRow,
  Router,
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
  const [localFilePath, setLocalFilePath] = useState<string>("/home/deck");
  const [ipAddr, setIpAddr] = useState<string>(userSettings.ipAddr);
  const [port, setPort] = useState<string>(userSettings.port);
  const [username, setUsername] = useState<string>(userSettings.username);
  const [password, setPassword] = useState<string>(userSettings.password);
  const closeSshClientRef = useRef(true); // Initialize with the initial value

  useEffect(() => {
    return () => {
      // This will run when the component unmounts
      console.log(closeSshClientRef.current)
      closeSshClientRef.current && backend.closeSshClient();
    };
  }, []);

  const pickSourceFile = async () => {
    const filePickerResponse = await serverAPI.openFilePickerV2(FileSelectionType.FILE, "/home/deck", true);
    setLocalFilePath(filePickerResponse.path)
  }

  const SourceFilePicker = () => {
    return (
      <ButtonItem
        description={"selected file path:"} W
        layout="below"
        onClick={() => {
          closeSshClientRef.current = false;
          pickSourceFile();
        }}>
        {"Set folder 17"}
      </ButtonItem>
    )
  }

  const SelectTargetPathButton = () => {
    return (
      <ButtonItem
        description={"selected target path: "}
        layout="below"
        onClick={() => {
          closeSshClientRef.current = false;
          showModal(
            <FileExplorer backend={backend} homeDir="/cygdrive/c/Users/gutte" />
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

  const CreateSshClient = () => (
    <ButtonItem
      layout="below"
      onClick={() => {
        backend.createSshClient(ipAddr, username, password, port);
      }}
    >
      {"Create SSH Client"}
    </ButtonItem>
  );

  const CloseSshClient = () => (
    <ButtonItem
      layout="below"
      onClick={() => {
        backend.closeSshClient();
      }}
    >
      {"Close SSH Client"}
    </ButtonItem>
  );

  const RemoteSshParams = () => (
    <div>
      <SshParamButton label="Remote Ip" value={ipAddr} onChangeCall={setIpAddr} />
      <SshParamButton label="Port" value={port} onChangeCall={setPort} />
      <SshParamButton label="username" value={username} onChangeCall={setUsername} />
      <SshParamButton label="password" value={password} onChangeCall={setPassword} />
      <CreateSshClient />
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
        <CloseSshClient />
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