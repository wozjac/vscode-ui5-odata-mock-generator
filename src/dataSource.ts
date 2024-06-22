import * as vscode from "vscode";
import * as fs from "fs";
// import fetch from "node-fetch";
import { TextEncoder } from "util";

let projPath: string;

if (vscode.workspace.workspaceFolders) {
  projPath = vscode.workspace.workspaceFolders[0].uri.path;
} else {
  throw new Error("Workspace folder not found");
}

export const projectPath = projPath;

export const internet = {
  async fetchTextFile(url: string) {
    return (await fetch(url)).text();
  },
};

export const project = {
  async readFileContent(filePath: string) {
    const path = `${projectPath}/${filePath}`;
    return vscodeFs.readFileContent(path);
  },

  async writeFile(filePath: string, content: string, overwrite: boolean) {
    const path = `${projectPath}/${filePath}`;
    await vscodeFs.writeFile(path, content, overwrite);
  },

  fileExists(filePath: string) {
    const path = `${projectPath}/${filePath}`;
    return vscodeFs.fileExists(path);
  },

  deleteDir(dir: string) {
    const dirProjectPath = `${projectPath}/${dir}`;
    vscodeFs.deleteDir(dirProjectPath);
  },

  listDir(dir: string) {
    const dirProjectPath = `${projectPath}/${dir}`;
    return vscodeFs.listDir(dirProjectPath);
  },

  async createDir(dir: string) {
    const dirProjectPath = `${projectPath}/${dir}`;
    await vscodeFs.createDir(dirProjectPath);
  },

  deleteFile(filePath: string) {
    const dirProjectPath = `${projectPath}/${filePath}`;
    vscodeFs.deleteFile(dirProjectPath);
  },
};

export const vscodeFs = {
  async readFileContent(filePath: string) {
    const path = vscode.Uri.file(filePath);
    const file = await vscode.workspace.openTextDocument(path);
    return file.getText();
  },

  async writeFile(filePath: string, content: string, overwrite: boolean) {
    const path = vscode.Uri.file(filePath);
    const textEncoder = new TextEncoder();
    const contentArray = textEncoder.encode(content);

    if (overwrite) {
      await vscode.workspace.fs.writeFile(path, contentArray);
    } else {
      if (!fs.existsSync(path.fsPath)) {
        await vscode.workspace.fs.writeFile(path, contentArray);
      }
    }
  },

  fileExists(filePath: string) {
    const path = vscode.Uri.file(filePath);
    return fs.existsSync(path.fsPath);
  },

  deleteDir(dir: string) {
    const path = vscode.Uri.file(dir);
    fs.rmdirSync(path.fsPath, { recursive: true });
  },

  listDir(dir: string) {
    const path = vscode.Uri.file(dir);
    return fs.readdirSync(path.fsPath);
  },

  async createDir(dir: string) {
    await vscode.workspace.fs.createDirectory(vscode.Uri.file(dir));
  },

  deleteFile(filePath: string) {
    const path = vscode.Uri.file(filePath);
    fs.rmSync(path.fsPath, { force: true });
  },
};
