# Decky SCP File Transfer Plugin

This is a plugin for Decky, designed to facilitate secure file transfers from the Steam Deck to a remote PC using SCP. With this plugin, you can easily manage and transfer files between your Steam Deck and remote servers.

![Decky-Recorder Example Screenshot](https://github.com/ArnonGuttel/decky-filetransfer-plugin/blob/main/deckSCP-screenshot.png)

## Installation

1. Clone this repository to your machine  :
	
   ```bash
	gh repo clone ArnonGuttel/decky-filetransfer-plugin
   ```

2. update the .vscode/defsettings.json to your deck ip and user details

3. build and deploy the plugin to your deck (if using vsc simply run the builddeploy task)

## Usage

1. open "DeckSCP" plugin on the plugin list.

2. **Source**: Use the "Select File" button to choose the file you want to transfer from your Steam Deck.

3. **Target**: Choose the target profile and path where you want to transfer the file. You can create and manage profiles for different remote servers.

4. Once the SSH client is created, you can explore the remote server's file system using the "Remote File Explorer" modal.

5. After selecting the target path, click the "Move File" or "Upload File" button, depending on your needs.

   - **Move File**: If the selected profile is "Local", This will move the selected file localy from source to selected target.
   - **Upload File**: Else, This will upload the selected file from your deck to the target directory on the remote server.

6. You'll receive a confirmation message indicating whether the file transfer was successful.

## Profiles

Profiles allow you to save and manage settings for different remote servers. You can create, edit, and delete profiles as needed. Each profile includes the following information:

- **Profile Name**: A user-defined name for the profile.
- **IP Address**: The IP address of the remote server.
- **Port**: Selected SSH port (default is 22).
- **Username**: Your username on the remote server.
- **Password**: Your password for the remote server.

## Notes

- This plugin uses SCP for file transfers, so it's important to ensure that the remote server supports SCP and SSH connections.

- The ssh details will be saved localy on your deck on the plugin settings directory ("/home/deck/homebrew/settings/DeckSCP").

- If you encounter any issues or have suggestions for improvements, please feel free to open an issue on this GitHub repository.
