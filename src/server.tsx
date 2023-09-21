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

  async closeSshClient() {
    await this.serverAPI.callPluginMethod('close_ssh_client', {});
  }

  async getRemoteHomePath() {
    const remoteHomePath = await this.serverAPI.callPluginMethod('get_remote_home_dir', {})
    
    return remoteHomePath.result as string
  }

  async setSourcePath(path: string) {
    await this.serverAPI.callPluginMethod('set_source_path', { "path": path })
  }

  async getSourcePath() {
    const sourcePath = await this.serverAPI.callPluginMethod('get_source_path', {})
    return sourcePath.result as string
  }

  async setTargetPath(path: string) {
    await this.serverAPI.callPluginMethod('set_target_path', { "path": path })
  }

  async getTargetPath() {
    const targetPath = await this.serverAPI.callPluginMethod('get_target_path', {})
    return targetPath.result as string
  }

  async transferFile() {
    await this.serverAPI.callPluginMethod('transfer_file', {});
  }
}