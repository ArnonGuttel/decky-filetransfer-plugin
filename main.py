import os
import decky_plugin
import sys
import json
from pathlib import Path
from settings import SettingsManager


def add_plugin_to_path():
    plugin_dir = Path(__file__).parent.resolve()
    directories = [["./"], ["defaults", "deps"], ["deps"]]
    for dir in directories:
        sys.path.append(str(plugin_dir.joinpath(*dir)))


add_plugin_to_path()
import paramiko
import scp

settingsDir = os.environ["DECKY_PLUGIN_SETTINGS_DIR"]


class SshClient:
    def __init__(self, remote_ip_address, port, username, password):
        self.host = remote_ip_address
        self.username = username
        self.password = password
        self.port = port
        self.client = None
        self.scp = None
        self.setup_ssh_client()

    def setup_ssh_client(self):
        if self.client is not None:
            decky_plugin.logger.info("Client is already set")
            return

        self.client = paramiko.SSHClient()
        self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        try:
            self.client.connect(self.host, self.port, self.username, self.password)
            decky_plugin.logger.info("SSH client connected")
            self.scp = scp.SCPClient(
                self.client.get_transport()
            )  # Initialize the SCPClient
        except Exception as e:
            decky_plugin.logger.error(f"Error creating SSH client: {str(e)}")
            self.client = None

    def close(self):
        if self.client is not None:
            self.client.close()
            self.client = None
            decky_plugin.logger.info("SSH client closed")

    def execute_command(self, command):
        if self.client is None:
            decky_plugin.logger.error("No active SSH client")
            raise Exception("No active SSH client")

        try:
            decky_plugin.logger.info(f"SSH client executing command: {command}")
            stdin, stdout, stderr = self.client.exec_command(command)
            return stdout.read().decode("utf-8")

        except Exception as e:
            decky_plugin.logger.error(f"Error reading response: {str(e)}")
            return ""


class Plugin:
    __settings = None
    __profiles = None
    __source_profile = "Local"
    __target_profile = "Local"
    __source_path = ""
    __target_path = ""
    __remote_home_path = ""

    async def _main(self):
        await Plugin.loadConfig(self)
        return

    async def loadConfig(self):
        decky_plugin.logger.info(
            "Loading settings from: {}".format(
                os.path.join(settingsDir, "settings.json")
            )
        )

        self.__settings = SettingsManager(
            name="settings", settings_directory=settingsDir
        )
        self.__settings.read()

        self.__profiles = self.__settings.getSetting(
            "profiles",
            {
                "Local": {
                    "local": True,
                    "ipAddr": "",
                    "port": "",
                    "username": "",
                    "password": "",
                }
            }
        )

        # Need this for initialization only honestly
        await Plugin.saveConfig(self)
        return

    async def saveConfig(self):
        decky_plugin.logger.info("Saving config")
        self.__settings.setSetting("profiles", self.__profiles)
        return

    async def get_profiles(self):
        decky_plugin.logger.info(f"get_profiles request received")
        return self.__profiles

    async def append_profile(self, profile_name, ip_addr, port, username, password):
        decky_plugin.logger.info(
            f"append_profile request received for profile: {profile_name}"
        )
        # Create a new profile dictionary
        new_profile = {
            "local": False,
            "ipAddr": ip_addr,
            "port": port,
            "username": username,
            "password": password,
        }

        self.__profiles[profile_name] = new_profile
        self.__settings.setSetting("profiles", self.__profiles)

    async def delete_profile(self, profile_name):
        decky_plugin.logger.info(
            f"delete_profile request received for profile: {profile_name}"
        )

        if profile_name in self.__profiles:
            del self.__profiles[profile_name]
            self.__settings.setSetting("profiles", self.__profiles)
            decky_plugin.logger.info(f"profile: {profile_name} deleted!")
            return True
        else:
            decky_plugin.logger.error(f"Profile '{profile_name}' not found.")
            return False

    async def update_remote_file_list(self, directory_path, include_files):
        decky_plugin.logger.info(f"update_remote_file_list request recived")

        if not hasattr(self, "ssh_client") or self.ssh_client is None:
            decky_plugin.logger.error(
                f"no ssh client, make sure to create one before use"
            )
            return []

        try:
            decky_plugin.logger.info(f"getting files in dir: {directory_path}")
            output = self.ssh_client.execute_command(f"ls -l -L {directory_path}")
            # Parse the output to extract file information
            file_list = []
            for line in output.splitlines():
                parts = line.split(None, 8)
                if len(parts) >= 9:
                    permissions, _, _, _, _, _, _, _, name = parts[:9]
                    if permissions.startswith("l"):
                        name = name.split(" -> ")[0]
                    file_path = f"{directory_path}/{name}"
                    is_directory = permissions.startswith("d") or permissions.startswith("l")
                    excluded_extensions = [".LOG", ".regtrans-ms", ".ini", ".tmp", ".bak", ".DAT", ".blf"]
                    if (is_directory or include_files) and not name.endswith(tuple(excluded_extensions)):
                        file_list.append(
                            {
                                "name": name,
                                "isDirectory": is_directory,
                                "path": file_path,
                            }
                        )
                    decky_plugin.logger.debug(
                        f"parsed file, name: {name}, isDirectory: {is_directory}, path : {file_path}."
                    )
            return file_list

        except Exception as e:
            decky_plugin.logger.info(
                f"Error reading directory {directory_path}: {str(e)}"
            )
            return []

    async def create_ssh_client(self, remote_ip, username, password, port=22):
        decky_plugin.logger.info(f"create_ssh_client request recived")
        self.ssh_client = SshClient(remote_ip, port, username, password)
        decky_plugin.logger.info(self.ssh_client.client)
        decky_plugin.logger.info(self.ssh_client.client is not None)
        return self.ssh_client.client is not None

    async def close_ssh_client(self):
        decky_plugin.logger.info(f"close_ssh_client request recived")
        if hasattr(self, "ssh_client") and self.ssh_client is not None:
            self.ssh_client.close()
            self.ssh_client = None
        self.__remote_home_path = ""

    async def get_source_profile(self):
        decky_plugin.logger.info(f"get_source_profile request recived")
        return self.__source_profile

    async def set_source_profile(self, profile_name):
        decky_plugin.logger.info(f"set_source_profile request recived")
        self.__source_profile = profile_name
        decky_plugin.logger.info(
            f"updated source profile name: {self.__source_profile}"
        )

    async def get_target_profile(self):
        decky_plugin.logger.info(f"get_target_profile request recived")
        return self.__target_profile

    async def set_target_profile(self, profile_name):
        decky_plugin.logger.info(f"set_target_profile request recived")
        self.__target_profile = profile_name
        decky_plugin.logger.info(
            f"updated source profile name: {self.__target_profile}"
        )

    async def set_source_path(self, path):
        decky_plugin.logger.info(f"set_source_path request recived")
        self.__source_path = path
        decky_plugin.logger.info(f"updated source path: {self.__source_path}")

    async def get_remote_home_dir(self):
        decky_plugin.logger.info(f"get_remote_home_dir request recived")
        self.__remote_home_path = self.ssh_client.execute_command(f"pwd").strip()
        decky_plugin.logger.info(f"remote home path: {self.__remote_home_path}")
        return self.__remote_home_path

    async def set_target_path(self, path):
        decky_plugin.logger.info(f"set_target_path request recived")
        self.__target_path = path
        decky_plugin.logger.info(f"updated target path: {self.__target_path}")

    async def get_source_path(self):
        decky_plugin.logger.info(f"get_source_path request recived")
        return self.__source_path

    async def get_target_path(self):
        decky_plugin.logger.info(f"get_target_path request recived")
        return self.__target_path
    
    async def clear_source_path(self):
        decky_plugin.logger.info(f"clear_source_path request recived")
        self.__source_path = ""

    async def clear_target_path(self):
        decky_plugin.logger.info(f"clear_target_path request recived")
        self.__target_path = "" 

    async def move_file(self):
        try:
            decky_plugin.logger.info(f"move_file request received")
            head, tail = os.path.split(self.__source_path)
            target_path = self.__target_path + '/' + tail
            os.rename(self.__source_path,target_path)
            decky_plugin.logger.error(f"Error moving file: {e}")

            return True
        except OSError as e:
            decky_plugin.logger.error(f"Error moving file: {e}")
            return False
    
    async def upload_file(self):
        decky_plugin.logger.info(f"upload_file request received")

        if not hasattr(self, "ssh_client") or self.ssh_client.scp is None:
            decky_plugin.logger.error(
                f"No SCP client available. Create one before transferring files."
            )
            return False

        try:
            target_dir = self.__target_path
            if self.__remote_home_path in target_dir:
                target_dir = target_dir.removeprefix(self.__remote_home_path + "/")

            decky_plugin.logger.info(
                f"Transferring file: {self.__source_path} to {target_dir}"
            )
            self.ssh_client.scp.put(self.__source_path, target_dir)
            decky_plugin.logger.info(f"File transferred successfully.")
            return True
        except Exception as e:
            decky_plugin.logger.error(f"Error transferring file: {str(e)}")
            return False

    async def download_file(self):
        decky_plugin.logger.info(f"download_file request received")

        if not hasattr(self, "ssh_client") or self.ssh_client.scp is None:
            decky_plugin.logger.error(
                f"No SCP client available. Create one before transferring files."
            )
            return False

        try:
            source_dir = self.__source_path
            if self.__remote_home_path in source_dir:
                source_dir = source_dir.removeprefix(self.__remote_home_path + "/")
                decky_plugin.logger.info(source_dir)

            decky_plugin.logger.info(
                f"Donwloading file: {source_dir} to {self.__target_path}"
            )
            self.ssh_client.scp.get(source_dir, self.__target_path)
            decky_plugin.logger.info(f"File donwloaded successfully.")
            return True
        except Exception as e:
            decky_plugin.logger.error(f"Error donwloading file: {str(e)}")
            return False