import { DropdownItem, showModal } from "decky-frontend-lib";
import { FiPlusCircle } from "react-icons/fi";
import { CreateProfileModal } from "../Modals/NewProfileModal";
import { Backend } from "../server";
import { Profile } from "../utils";

const ProfilesDropdown = ({label, backend, profiles, currentProfile, isSource }: { label: string, backend: Backend, profiles: Profile[], currentProfile: any, isSource: boolean }) => {
    return (
        <DropdownItem
            label={label}
            rgOptions={[
                ...profiles.map((profile) => ({
                    data: profile.name,
                    label: profile.name,
                })),
                {
                    data: "New Profile",
                    label: (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "start",
                                gap: "1em",
                            }}
                        >
                            <FiPlusCircle />
                            <span>New Remote Profile</span>
                        </div>
                    ),
                },
            ]}
            selectedOption={currentProfile?.name}
            onChange={async ({ data }) => {
                if (data === "New Profile") {
                    showModal(<CreateProfileModal backend={backend} />);
                }
                else if (data !== currentProfile?.name){
                    if (isSource) {
                        await backend.clearSourcePath();
                        await backend.setSourceProfile(data);
                      } else {
                        await backend.clearTargetPath();
                        await backend.setTargetProfile(data);
                      }
                    await backend.closeSshClient();
                }
            }}
        />
    )
}

export default ProfilesDropdown;