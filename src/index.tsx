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
import { FaFileUpload, FaAngleRight } from "react-icons/fa";
import RemoteFileExplorer from "./Modals/RemoteFileExplorer";
import { Backend } from "./server";
import { Profile } from "./utils"
import { EditProfileModal } from "./Modals/EditProfileModal"
import ProfilesDropdown from "./Dropdowns/ProfilesDropdown";
import { SimpleMessageModal } from "./Modals/SimpleMessageModal";

const DeckSCP: VFC<{ serverAPI: ServerAPI, backend: Backend }> = ({ serverAPI, backend }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [sourceProfileName, setSourceProfileName] = useState<string>("Local");
  const [targetProfileName, setTargetProfileName] = useState<string>("Local");
  const [sourceCollapsed, setSourceCollapsed] = useState<boolean>(false);
  const [targetCollapsed, setTargetCollapsed] = useState<boolean>(false);
  const [sourceFilePath, setSourceFilePath] = useState<string>("");
  const [targetPath, setTargetPath] = useState<string>("");
  const [isInProgress, setIsInProgress] = useState(false);
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

  const currentSourceProfile = profiles.find(profile => profile.name === sourceProfileName);
  const currentTargetProfile = profiles.find(profile => profile.name === targetProfileName);
  const isSourceLocal = currentSourceProfile?.name === "Local"
  const isTargetLocal = currentTargetProfile?.name === "Local"

  const initState = async () => {
    const sourceFilePath = backend.getSourcePath();
    setSourceFilePath(await sourceFilePath);

    const targetPath = backend.getTargetPath();
    setTargetPath(await targetPath);

    const profile = backend.getProfiles();
    setProfiles(await profile)

    const sourceProfile = backend.getSourceProfile();
    const targetProfile = backend.getTargetProfile();
    setSourceProfileName(await sourceProfile)
    setTargetProfileName(await targetProfile)
  }

  const pickLocalFile = async (isSource: boolean) => {
    const selectionType = isSource ? FileSelectionType.FILE : FileSelectionType.FOLDER
    const filePickerResponse = await serverAPI.openFilePickerV2(selectionType, "/home/deck", isSource);

    isSource ? backend.setSourcePath(filePickerResponse.path) : backend.setTargetPath(filePickerResponse.path)
  }

  const getSourceFilePathText = () => {
    return `source file path:  ${sourceFilePath}`;
  }

  const getTargetPathText = () => {
    return `target path:  ${targetPath}`;
  }

  const createSshClient = async () => {
    const RemoteProfile = isSourceLocal ? currentTargetProfile : currentSourceProfile
    const response = await backend.createSshClient(RemoteProfile!.ipAddr, RemoteProfile!.username, RemoteProfile!.password, RemoteProfile!.port);
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

  const SelectRemotePathButton = ({ isSource, includeFiles }: { isSource: boolean, includeFiles: boolean }) => {
    return (
      <ButtonItem
        description={isSource ? getSourceFilePathText() : getTargetPathText()}
        layout="below"
        onClick={async () => {
          if (await createSshClient()) {
            remoteHomeDir.current = (await backend.getRemoteHomePath()).trim();
            closeSshClientRef.current = false;
            showModal(
              <RemoteFileExplorer backend={backend} homeDir={remoteHomeDir.current} includeFiles={includeFiles} />
            );
          }
        }}
        disabled={!isSourceLocal && !isTargetLocal}
      >
        {isSource ? "Select File" : "Select Target Path"}
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
              layout="below"
              onClick={() => {
                showModal(<EditProfileModal backend={backend} profile={profile} />);
              }}>
              {
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "start",
                    gap: "1em",
                  }}
                >
                  <FaAngleRight />
                  <span>{"Edit Profile"}</span>
                </div>
              }
            </ButtonItem>

            <ButtonItem
              layout="below"
              onClick={async () => {
                await backend.deleteProfile(profile.name);
                await backend.setTargetProfile("Local");
                setTargetProfileName("Local");
                setProfiles(await backend.getProfiles());
                setCollapsed(false);
              }}>
              {
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "start",
                    gap: "1em",
                  }}
                >
                  <FaAngleRight />
                  <span>{"Delete Profile"}</span>
                </div>
              }
            </ButtonItem>
          </div>}
      </>
    )
  }

  const TransferFileButton = ({ button_message }: { button_message: string }) => (
    <ButtonItem
      layout="below"
      onClick={async () => {
        setIsInProgress(true);
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
            showModal(<SimpleMessageModal title_message={response ? "File Uploaded Successfully!" : "There Was Unexpected Error, Try Again"} />)
          }
        }
        setIsInProgress(false);
      }}
      disabled={!sourceFilePath || !targetPath || isInProgress}
    >
      {isInProgress ? "Operation in Progress..." : button_message}
    </ButtonItem>
  );

  const DownloadFileButton = ({ button_message }: { button_message: string }) => (
    <ButtonItem
      layout="below"
      onClick={async () => {
        setIsInProgress(true);
        if (await createSshClient()) {
          remoteHomeDir.current = (await backend.getRemoteHomePath()).trim();
          const response = await backend.downloadFile();
          response && backend.clearPaths();
          showModal(<SimpleMessageModal title_message={response ? "File Downloaded Successfully!" : "There Was Unexpected Error, Try Again"} />)
        }
        setIsInProgress(false);
      }}
      disabled={!sourceFilePath || !targetPath || !isTargetLocal || isInProgress}
    >
      {isInProgress ? "Operation in Progress..." : button_message}
    </ButtonItem>
  );

  return (
    <>
      <PanelSection title="Source">
        <ProfilesDropdown label={"Source Profile"} backend={backend} profiles={profiles} currentProfile={currentSourceProfile} isSource={true} />
        {!isSourceLocal && <ProfileOptions collapsed={sourceCollapsed} profile={currentSourceProfile} setCollapsed={setSourceCollapsed} />}
        {!isSourceLocal ? <SelectRemotePathButton isSource={true} includeFiles={true} /> : <LocalFilePicker buttonName="Select File" isSource={true} />}
      </PanelSection>

      <PanelSection title="Target">
        <ProfilesDropdown label={"Target Profile"} backend={backend} profiles={profiles} currentProfile={currentTargetProfile} isSource={false} />
        {!isTargetLocal && <ProfileOptions collapsed={targetCollapsed} profile={currentTargetProfile} setCollapsed={setTargetCollapsed} />}
        {!isTargetLocal ? <SelectRemotePathButton isSource={false} includeFiles={false} /> : <LocalFilePicker buttonName="Set Folder Path" isSource={false} />}
      </PanelSection>

      <PanelSection>
        {isSourceLocal ?
          <TransferFileButton button_message={isTargetLocal ? "Move File" : "Upload File"} /> :
          <DownloadFileButton button_message={"Download File"} />
        }
      </PanelSection>
    </>
  );
};


export default definePlugin((serverApi: ServerAPI) => {
  const backend = Backend.initialize(serverApi);

  return {
    title: <div className={staticClasses.Title}>DeckFT</div>,
    content: <DeckSCP serverAPI={serverApi} backend={backend} />,
    icon: <FaFileUpload />,
  };
});