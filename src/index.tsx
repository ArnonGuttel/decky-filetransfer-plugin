import { useEffect, useRef, useState, VFC } from "react";
import { RiArrowDownSFill, RiArrowUpSFill } from "react-icons/ri";
import { FaFileUpload, FaAngleRight } from "react-icons/fa";
import {
  ButtonItem,
  definePlugin,
  FileSelectionType,
  PanelSection,
  ServerAPI,
  showModal,
  staticClasses,
} from "decky-frontend-lib";
import RemoteFileExplorer from "./Modals/RemoteFileExplorer";
import { Backend } from "./server";
import { Profile } from "./utils";
import { EditProfileModal } from "./Modals/EditProfileModal";
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
  const closeSshClientRef = useRef(true);
  const remoteHomeDir = useRef("");

  useEffect(() => {
    initState();
  }, []); // component mounts

  useEffect(() => {
    return () => {
      // component unmounts
      closeSshClientRef.current && backend.closeSshClient();
    };
  }, []);

  const initState = async () => {
    setSourceFilePath(await backend.getSourcePath());
    setTargetPath(await backend.getTargetPath());
    setProfiles(await backend.getProfiles());
    setSourceProfileName(await backend.getSourceProfile());
    setTargetProfileName(await backend.getTargetProfile());
  };

  const currentSourceProfile = profiles.find(profile => profile.name === sourceProfileName);
  const currentTargetProfile = profiles.find(profile => profile.name === targetProfileName);
  const isSourceLocal = currentSourceProfile?.name === "Local"
  const isTargetLocal = currentTargetProfile?.name === "Local"

  const getSourceFilePathText = () => { return `source file path:  ${sourceFilePath}`; }
  const getTargetPathText = () => { return `target path:  ${targetPath}`; }

  const pickLocalFile = async (isSource: boolean) => {
    closeSshClientRef.current = false;
    const selectionType = isSource ? FileSelectionType.FILE : FileSelectionType.FOLDER
    const filePickerResponse = await serverAPI.openFilePickerV2(selectionType, "/home/deck", isSource);
    isSource ? backend.setSourcePath(filePickerResponse.path) : backend.setTargetPath(filePickerResponse.path)
  }

  const createSshClient = async () => {
    const RemoteProfile = isSourceLocal ? currentTargetProfile : currentSourceProfile
    const timeoutMs = 10000; 
    const createSshClientPromise = backend.createSshClient(
      RemoteProfile!.ipAddr,
      RemoteProfile!.username,
      RemoteProfile!.password,
      RemoteProfile!.port
    );
    try {
      const response = await Promise.race([
        createSshClientPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeoutMs)),
      ]);
  
      if (!response) {
        showModal(
          <SimpleMessageModal title_message={"SSH Client creation failed.\n Please verify profile details and try again"} />
        );
        return false;
      }

      return true;
    } catch {
      console.error('Operation timed out');
      showModal(
        <SimpleMessageModal title_message={"SSH Client creation failed.\nPlease verify profile details and try again"
      } />
        );
      return false;
    }
  }

  const LocalFilePicker = ({ buttonName, isSource }: { buttonName: string, isSource: boolean }) => {
    return (
      <ButtonItem
        description={isSource ? getSourceFilePathText() : getTargetPathText()}
        layout="below"
        onClick={() => {
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

  const FileActionButton = ({ buttonMessage, actionType, isSourceLocal }: {
    buttonMessage: string;
    actionType: "move" | "upload" | "download";
    isSourceLocal: boolean;
  }) => (
    <ButtonItem
      layout="below"
      onClick={async () => {
        setIsInProgress(true);
        if (isSourceLocal) {
          if (actionType === "move") {
            const response = await backend.moveFile();
            response && backend.clearPaths();
            showModal(
              <SimpleMessageModal
                title_message={
                  response
                    ? "File Moved Successfully!"
                    : "There Was Unexpected Error, Try Again"
                }
              />
            );
          } else if (actionType === "upload") {
            const response = await backend.uploadFile();
            response && backend.clearPaths();
            showModal(
              <SimpleMessageModal
                title_message={
                  response
                    ? "File Uploaded Successfully!"
                    : "There Was Unexpected Error, Try Again"
                }
              />
            );
          }
        } else {
          if (await createSshClient()) {
            remoteHomeDir.current = (await backend.getRemoteHomePath()).trim();
            if (actionType === "download") {
              const response = await backend.downloadFile();
              response && backend.clearPaths();
              showModal(
                <SimpleMessageModal
                  title_message={
                    response
                      ? "File Downloaded Successfully!"
                      : "There Was Unexpected Error, Try Again"
                  }
                />
              );
            }
          }
        }
        setIsInProgress(false);
      }}
      disabled={!sourceFilePath || !targetPath || isInProgress || (!isSourceLocal && !isTargetLocal)}
    >
      {isInProgress ? "Operation in Progress..." : buttonMessage}
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
        {isSourceLocal ? (
          <FileActionButton
            buttonMessage={isTargetLocal ? "Move File" : "Upload File"}
            actionType={isTargetLocal ? "move" : "upload"}
            isSourceLocal={isSourceLocal}
          />
        ) : (
          <FileActionButton
            buttonMessage="Download File"
            actionType="download"
            isSourceLocal={isSourceLocal}
          />
        )}
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