# Decky SCP File Transfer Plugin

This is a Decky plugin designed to facilitate secure file transfers between the Steam Deck and remote PCs using SCP. With this plugin, you can easily manage and transfer files in both directions—between your Steam Deck and remote servers.

![DeckSCP Screenshot](https://github.com/ArnonGuttel/decky-filetransfer-plugin/blob/main/deckSCP-screenshot.png)

## Installation

You can install this plugin using one of the following methods:

**Method 1: Download and Unzip**

1. Download the `DeckSCP.zip` file from the repository's releases.
2. Unzip the downloaded file into your Decky plugins folder.

**Method 2: Clone the Repository**

1. Clone this repository to your machine using the following command:

   ```bash
   gh repo clone ArnonGuttel/decky-filetransfer-plugin
   ```

2. Configuration:
   - Update the `.vscode/settings.json` file with your Deck's IP address and user details.

3. Build and Deploy:
   - Build and deploy the plugin to your Steam Deck. If you're using Visual Studio Code, you can simply run the `builddeploy` task.

## Usage

To use the Decky SCP File Transfer Plugin:

1. Open the "DeckSCP" plugin from the plugin list in Decky.

2. **Source**: Select a source profile (Local or Remote) and use the "Select File" button to open the local/remote file explorer. Use the explorer to select a file.
   
   2.1 After selection, verify the path in the button description.

3. **Target**: Select a target profile (Local or Remote) and specify the destination path where you want to transfer the file.

4. After selecting the target path, click the action button below. The action button displayed depends on the source and target selected:

   - **Move**: If both the source and target profiles are set to "Local," this will move the selected file locally from the source to the target.

   - **Upload**: If the source profile is "Local" and the target profile is "Remote," this will upload the selected file from your Steam Deck to the target directory on the remote server.

   - **Download**: If the source profile is "Remote" and the target profile is "Local," this will download the selected file from the remote server to your Steam Deck.

5. You will receive a confirmation message indicating whether the file transfer was successful.

## Profiles

Profiles allow you to save and manage settings for different remote servers. You can create, edit, and delete profiles as needed. Each profile includes the following information:

- **Profile Name**: A user-defined name for the profile.
- **IP Address**: The IP address of the remote server.
- **Port**: The selected SSH port (default is 22).
- **Username**: Your username on the remote server.
- **Password**: Your password for the remote server.

## Notes

- This plugin uses SCP for file transfers, so it's important to ensure that the remote server supports SCP and SSH connections.

- SSH details will be saved locally on your Steam Deck in the plugin settings directory (`/home/deck/homebrew/settings/DeckSCP`).

- If you encounter any issues or have suggestions for improvements, please feel free to open an issue on this GitHub repository. Your feedback is valuable for enhancing the functionality of this plugin.