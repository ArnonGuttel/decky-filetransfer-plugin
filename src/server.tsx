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

  async updateFileList(directoryPath : string): Promise<FileItem[]> {
    console.log('arnon updateFileList request recived');
    const fileList = (await this.serverAPI.callPluginMethod('update_file_list',  {"directory_path": directoryPath})).result as string;
    console.log(fileList);
    console.log('arnon asking to parse response');
    return ParseFilesList(fileList);
  }
}