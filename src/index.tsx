import {
  ButtonItem,
  definePlugin,
  FileSelectionType,
  PanelSection,
  ServerAPI,
  showModal,
  staticClasses,
  Toggle,
} from "decky-frontend-lib";
import { useEffect, useRef, useState, VFC } from "react";
import { RiArrowDownSFill, RiArrowUpSFill } from "react-icons/ri";
import { FaFileUpload } from "react-icons/fa";
import RemoteFileExplorer from "./Modals/RemoteFileExplorer";
import { Backend } from "./server";
import { Profile } from "./utils"
import { EditProfileModal } from "./Modals/EditProfileModal"
import ProfilesDropdown from "./Dropdowns/ProfilesDropdown";
import { SimpleMessageModal } from "./Modals/SimpleMessageModal";

const DeckFT: VFC<{ serverAPI: ServerAPI, backend: Backend }> = ({ serverAPI, backend }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  // const [sourceProfileName, setSourceProfileName] = useState<string>("");
  const [targetProfileName, setTargetProfileName] = useState<string>("Local");
  const [targetCollapsed, setTargetCollapsed] = useState<boolean>(false);
  const [sourceFilePath, setSourceFilePath] = useState<string>("");
  const [targetPath, setTargetPath] = useState<string>("");
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

  const currentProfile = profiles.find(profile => profile.name === targetProfileName);
  const isTargetLocal = currentProfile?.name === "Local"

  const initState = async () => {
    const sourceFilePath = backend.getSourcePath();
    setSourceFilePath(await sourceFilePath);

    const targetPath = backend.getTargetPath();
    setTargetPath(await targetPath);

    const profile = backend.getProfiles();
    setProfiles(await profile)

    const targetProfile = backend.getTargetProfile();
    setTargetProfileName(await targetProfile)
  }

  const pickLocalFile = async (isSource: boolean) => {
    const selectionType = isSource ? FileSelectionType.FILE : FileSelectionType.FOLDER
    const filePickerResponse = await serverAPI.openFilePickerV2(selectionType, "/home/deck", true);
    isSource ? backend.setSourcePath(filePickerResponse.path) : backend.setTargetPath(filePickerResponse.path)
  }

  const getSourceFilePathText = () => {
    return `source file path:  ${sourceFilePath}`;
  }

  const getTargetPathText = () => {
    return `target path:  ${targetPath}`;
  }

  const createSshClient = async () => {
    const response = await backend.createSshClient(currentProfile!.ipAddr, currentProfile!.username, currentProfile!.password, currentProfile!.port);
    if (!response) {
      showModal(<SimpleMessageModal title_message={"There Was Error While Creating SSH Client, Please Verify Profile Details"} />)
      return false
    }
    return true
  }

  const LocalFilePicker = ({ buttonName, isSource }: { buttonName: string, isSource: boolean }) => {
    return (
      <ButtonItem
        description={isSource ? getSourceFilePathText() : getTargetPathText()}
        layout="below"
        onClick={() => {
          closeSshClientRef.current = false;
          pickLocalFile(isSource);
        }}>
        {buttonName}
      </ButtonItem>
    )
  }

  const SelectTargetPathButton = () => {
    return (
      <ButtonItem
        description={getTargetPathText()}
        layout="below"
        onClick={async () => {
          if (await createSshClient()) {
            remoteHomeDir.current = (await backend.getRemoteHomePath()).trim();
            closeSshClientRef.current = false;
            showModal(
              <RemoteFileExplorer backend={backend} homeDir={remoteHomeDir.current} includeFiles={false} />
            );
          }
        }}
      >
        {"Select Target Path"}
      </ButtonItem>
    )
  }

  const CreateSshClientButton = () => (
    <ButtonItem
      layout="below"
      onClick={async () => {
        if (await createSshClient()) {
          remoteHomeDir.current = (await backend.getRemoteHomePath()).trim();
        }
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

  const ProfileOptions = ({ collapsed, profile, setCollapsed }: { collapsed: boolean, profile: any; setCollapsed: (arg0: boolean) => any }) => {
    return (
      <>
        <style>
          {`
            .collapsable_button > div > div > div > button {
              height: 10px !important;
            }
          `}
        </style>

        <div className="collapsable_button">
          <ButtonItem
            layout="below"
            bottomSeparator={collapsed ? "standard" : "none"}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <RiArrowUpSFill
                style={{ transform: "translate(0, -13px)", fontSize: "1.5em" }} />
            ) : (
              <RiArrowDownSFill
                style={{ transform: "translate(0, -12px)", fontSize: "1.5em" }} />
            )}
          </ButtonItem>
        </div>

        {collapsed &&
          <div>
            <ButtonItem
              layout="inline"
              label="↳"
              onClick={() => {
                showModal(<EditProfileModal backend={backend} profile={profile} />);
              }}>
              {"Edit Profile"}
            </ButtonItem>

            <ButtonItem
              layout="inline"
              label="↳"
              onClick={async () => {
                await backend.deleteProfile(profile.name);
                await backend.setTargetProfile("Local");
                setTargetProfileName("Local");
                setProfiles(await backend.getProfiles());
                setCollapsed(false);
              }}>
              {"Delete Profile"}
            </ButtonItem>
          </div>}
      </>
    )
  }

  const TransferFileButton = ({ button_message }: { button_message: string }) => (
    <ButtonItem
      layout="below"
      onClick={async () => {
        if (isTargetLocal) {
          const response = await backend.moveFile();
          response && backend.clearPaths();
          showModal(<SimpleMessageModal title_message={response ? "File Moved Successfully!" : "There Was Unexpected Error, Try Again"} />)
        }
        else {
          if (await createSshClient()) {
            remoteHomeDir.current = (await backend.getRemoteHomePath()).trim();
            const response = await backend.uploadFile();
            response && backend.clearPaths();
            showModal(<SimpleMessageModal title_message={response ? "File Transfered Successfully!" : "There Was Unexpected Error, Try Again"} />)
          }
        }
      }}
      disabled={!sourceFilePath || !targetPath}
    >
      {button_message}
    </ButtonItem>
  );

  return (
    <>
      <PanelSection title="Source">
        <LocalFilePicker buttonName="Select File" isSource={true} />
      </PanelSection>

      <PanelSection title="Target">
        <ProfilesDropdown backend={backend} profiles={profiles} currentProfile={currentProfile} />
        {currentProfile && !isTargetLocal && <ProfileOptions collapsed={targetCollapsed} profile={currentProfile} setCollapsed={setTargetCollapsed} />}
        {(currentProfile && !isTargetLocal) ? <SelectTargetPathButton /> : <LocalFilePicker buttonName="Set Folder Path" isSource={false} />}
      </PanelSection>

      <PanelSection>
        <TransferFileButton button_message={isTargetLocal ? "Move File" : "Upload File"} />
      </PanelSection>
    </>
  );
};


export default definePlugin((serverApi: ServerAPI) => {
  const backend = Backend.initialize(serverApi);

  return {
    title: <div className={staticClasses.Title}>DeckFT</div>,
    content: <DeckFT serverAPI={serverApi} backend={backend} />,
    icon: <FaFileUpload />,
  };
});