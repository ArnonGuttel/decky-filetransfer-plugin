import decky_plugin
import sys
from pathlib import Path

def add_plugin_to_path():

    plugin_dir = Path(__file__).parent.resolve()
    directories = [["./"], ["ssh2"], ["defaults", "deps"], ["deps"]]
    for dir in directories:
        sys.path.append(str(plugin_dir.joinpath(*dir)))

add_plugin_to_path()
import paramiko

class SshClient:
    def __init__(self, remote_ip_address, port, username, password):
        self.host = remote_ip_address
        self.username = username
        self.password = password
        self.port = port
        self.client = None
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
            return stdout.read().decode('utf-8')
        
        except Exception as e:
            decky_plugin.logger.error(f"Error reading response: {str(e)}")
            return ""

class Plugin:

    # Can be called from JavaScript using call_plugin_function("update_file_list", directory_path)
    async def update_remote_file_list(self, directory_path):
        decky_plugin.logger.info(f"update_remote_file_list request recived")

        if not hasattr(self, 'ssh_client') or self.ssh_client is None:
            decky_plugin.logger.error(f"no ssh client, make sure to create one before use")
            return []
        
        try:
            decky_plugin.logger.info(f"getting files in dir: {directory_path}")
            output = self.ssh_client.execute_command(f"ls -l {directory_path}")
            # Parse the output to extract file information
            file_list = []
            for line in output.splitlines():
                # Parse each line of the "ls" output
                parts = line.split()
                if len(parts) >= 9:
                    permissions, _, _, _, _, _, _, _, name = parts[:9]
                    file_path = f"{directory_path}/{name}"
                    is_directory = permissions.startswith("d")
                    file_list.append(
                        {
                            "name": name,
                            "isDirectory": is_directory,
                            "path": file_path,
                        }
                    )
                    decky_plugin.logger.info(f"parsed file, name: {name}, isDirectory: {is_directory}, path : {file_path}.")
            return file_list

        except Exception as e:
            decky_plugin.logger.info(
                f"Error reading directory {directory_path}: {str(e)}"
            )
            return []
        
    async def create_ssh_client(self, remote_ip, username, password, port=22):
        decky_plugin.logger.info(f"create_ssh_client request recived")
        self.ssh_client = SshClient(remote_ip,port,username,password)
        return None
    
    async def close_ssh_client(self):
        decky_plugin.logger.info(f"close_ssh_client request recived")
        if hasattr(self, 'ssh_client') and self.ssh_client is not None:
            self.ssh_client.close()
            self.ssh_client = None