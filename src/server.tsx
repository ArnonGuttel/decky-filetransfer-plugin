import { ServerAPI } from 'decky-frontend-lib';
import { FileItem, ParseFilesList, Profile, ParseBackendProfiles } from './utils';

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

  async getProfiles(): Promise<Profile[]> {
    const profilesJson = (await this.serverAPI.callPluginMethod('get_profiles', {})).result as string;
    return ParseBackendProfiles(profilesJson)
  }

  async createProfile(profileName: string, Ip: string, username: string, password: string, port = "22"): Promise<void> {
    await this.serverAPI.callPluginMethod('append_profile', { "profile_name": profileName, "ip_addr": Ip, "port": port, "username": username, "password": password });
  }
  async deleteProfile(profileName: string): Promise<void> {
    await this.serverAPI.callPluginMethod('delete_profile', { "profile_name": profileName });
  }

  async updateProfile(profileName: string, Ip: string, username: string, password: string, port = "22"): Promise<void> {
    await this.serverAPI.callPluginMethod('delete_profile', { "profile_name": profileName });
    await this.serverAPI.callPluginMethod('append_profile', { "profile_name": profileName, "ip_addr": Ip, "port": port, "username": username, "password": password });
  }

  async getSourceProfile() {
    const sourceProfile = await this.serverAPI.callPluginMethod('get_source_profile', {})
    return sourceProfile.result as string
  }

  async setSourceProfile(profile: string) {
    await this.serverAPI.callPluginMethod('set_source_profile', { "profile_name": profile })
  }

  async getTargetProfile() {
    const targetProfile = await this.serverAPI.callPluginMethod('get_target_profile', {})
    return targetProfile.result as string
  }

  async setTargetProfile(profile: string) {
    await this.serverAPI.callPluginMethod('set_target_profile', { "profile_name": profile })
  }

  async updateFileList(directoryPath: string, includeFiles: boolean): Promise<FileItem[]> {
    const fileList = (await this.serverAPI.callPluginMethod('update_remote_file_list', { "directory_path": directoryPath , "include_files": includeFiles})).result as string;
    return ParseFilesList(fileList);
  }

  async createSshClient(remoteIp: string, username: string, password: string, port = "22") {
    const response = await this.serverAPI.callPluginMethod('create_ssh_client', { "remote_ip": remoteIp, "username": username, "password": password, "port": port });
    console.log(response);
    return response.result as boolean
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

  async uploadFile() {
    const response = await this.serverAPI.callPluginMethod('upload_file', {});
    return response.result as boolean
  }

  async downloadFile() {
    const response = await this.serverAPI.callPluginMethod('download_file', {});
    return response.result as boolean
  }
  
  async moveFile() {
    const response = await this.serverAPI.callPluginMethod('move_file', {});
    return response.result as boolean
  }

  async clearSourcePath(){
    await this.serverAPI.callPluginMethod('clear_source_path', {});
  }

  async clearTargetPath(){
    await this.serverAPI.callPluginMethod('clear_target_path', {});
  }

  async clearPaths() {
    await this.serverAPI.callPluginMethod('clear_source_path', {});
    await this.serverAPI.callPluginMethod('clear_target_path', {});
  }
}