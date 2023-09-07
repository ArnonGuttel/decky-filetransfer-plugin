import { ServerAPI } from 'decky-frontend-lib';
import { FileItem, ParseFilesList } from './utils';

let backend: Backend;

export class Backend {
  serverAPI: ServerAPI;

  static get instance() {
    return backend;
  }

  static initialize(server: ServerAPI) {
    backend = new Backend(server);
    return backend;
  }

  private constructor(server: ServerAPI) {
    this.serverAPI = server;
  }

  async updateFileList(directoryPath: string): Promise<FileItem[]> {
    const fileList = (await this.serverAPI.callPluginMethod('update_remote_file_list', { "directory_path": directoryPath })).result as string;
    return ParseFilesList(fileList);
  }

  async createSshClient(remoteIp: string, username: string, password: string, port = "22"): Promise<void> {
    await this.serverAPI.callPluginMethod('create_ssh_client', { "remote_ip": remoteIp, "username": username, "password": password, "port": port });
  }

  async closeSshClient(){
    await this.serverAPI.callPluginMethod('close_ssh_client', {});
  }
}