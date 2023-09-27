import { DropdownItem, showModal } from "decky-frontend-lib";
import { FiPlusCircle } from "react-icons/fi";
import { CreateProfileModal } from "../Modals/NewProfileModal";
import { Backend } from "../server";
import { Profile } from "../utils";

const ProfilesDropdown = ({ backend, profiles, currentProfile }: { backend: Backend, profiles: Profile[], currentProfile: any }) => {
    return (
        <DropdownItem
            label="Selected Profile"
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
                            <span>New Profile</span>
                        </div>
                    ),
                },
            ]}
            selectedOption={currentProfile?.name}
            onChange={async ({ data }) => {
                if (data === "New Profile") {
                    showModal(<CreateProfileModal backend={backend} />);
                }
                else {
                    await backend.setTargetProfile(data)
                }
            }}
        />
    )
}

export default ProfilesDropdown;