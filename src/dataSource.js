const vscode = require("vscode");
const fs = require("fs");
const fetch = require("node-fetch");
const { TextEncoder } = require("util");

const projectPath = vscode.workspace.workspaceFolders[0].uri.path;

const internet = {
  async fetchTextFile(url) {
    return (await fetch(url)).text();
  }
};

const project = {
  async readFileContent(filePath) {
    const path = `${projectPath}/${filePath}`;
    return vscodeFs.readFileContent(path);
  },

  async writeFile(filePath, content, overwrite) {
    const path = `${projectPath}/${filePath}`;
    await vscodeFs.writeFile(path, content, overwrite);
  },

  fileExists(filePath) {
    const path = `${projectPath}/${filePath}`;
    return vscodeFs.fileExists(path);
  },

  deleteDir(dir) {
    const dirProjectPath = `${projectPath}/${dir}`;
    vscodeFs.deleteDir(dirProjectPath);
  },

  listDir(dir) {
    const dirProjectPath = `${projectPath}/${dir}`;
    return vscodeFs.listDir(dirProjectPath);
  },

  async createDir(dir) {
    const dirProjectPath = `${projectPath}/${dir}`;
    await vscodeFs.createDir(dirProjectPath);
  },

  deleteFile(filePath) {
    const dirProjectPath = `${projectPath}/${filePath}`;
    vscodeFs.deleteFile(dirProjectPath);
  }
};

const vscodeFs = {
  async readFileContent(filePath) {
    const path = vscode.Uri.file(filePath);
    const file = await vscode.workspace.openTextDocument(path);
    return file.getText();
  },

  async writeFile(filePath, content, overwrite) {
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

  fileExists(filePath) {
    const path = vscode.Uri.file(filePath);
    return fs.existsSync(path.fsPath);
  },

  deleteDir(dir) {
    const path = vscode.Uri.file(dir);
    fs.rmdirSync(path.fsPath, { recursive: true });
  },

  listDir(dir) {
    const path = vscode.Uri.file(dir);
    return fs.readdirSync(path.fsPath);
  },

  async createDir(dir) {
    await vscode.workspace.fs.createDirectory(vscode.Uri.file(dir));
  },

  deleteFile(filePath) {
    const path = vscode.Uri.file(filePath);
    fs.rmSync(path.fsPath, { force: true });
  }
};

module.exports = {
  project,
  vscodeFs,
  internet,
  projectPath
};