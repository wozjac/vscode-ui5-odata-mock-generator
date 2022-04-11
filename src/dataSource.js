"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vscodeFs = exports.project = exports.internet = exports.projectPath = void 0;
const vscode = require("vscode");
const fs = require("fs");
const node_fetch_1 = require("node-fetch");
const util_1 = require("util");
let projPath;
if (vscode.workspace.workspaceFolders) {
    projPath = vscode.workspace.workspaceFolders[0].uri.path;
}
else {
    throw new Error("Workspace folder not found");
}
exports.projectPath = projPath;
exports.internet = {
    async fetchTextFile(url) {
        return (await (0, node_fetch_1.default)(url)).text();
    },
};
exports.project = {
    async readFileContent(filePath) {
        const path = `${exports.projectPath}/${filePath}`;
        return exports.vscodeFs.readFileContent(path);
    },
    async writeFile(filePath, content, overwrite) {
        const path = `${exports.projectPath}/${filePath}`;
        await exports.vscodeFs.writeFile(path, content, overwrite);
    },
    fileExists(filePath) {
        const path = `${exports.projectPath}/${filePath}`;
        return exports.vscodeFs.fileExists(path);
    },
    deleteDir(dir) {
        const dirProjectPath = `${exports.projectPath}/${dir}`;
        exports.vscodeFs.deleteDir(dirProjectPath);
    },
    listDir(dir) {
        const dirProjectPath = `${exports.projectPath}/${dir}`;
        return exports.vscodeFs.listDir(dirProjectPath);
    },
    async createDir(dir) {
        const dirProjectPath = `${exports.projectPath}/${dir}`;
        await exports.vscodeFs.createDir(dirProjectPath);
    },
    deleteFile(filePath) {
        const dirProjectPath = `${exports.projectPath}/${filePath}`;
        exports.vscodeFs.deleteFile(dirProjectPath);
    },
};
exports.vscodeFs = {
    async readFileContent(filePath) {
        const path = vscode.Uri.file(filePath);
        const file = await vscode.workspace.openTextDocument(path);
        return file.getText();
    },
    async writeFile(filePath, content, overwrite) {
        const path = vscode.Uri.file(filePath);
        const textEncoder = new util_1.TextEncoder();
        const contentArray = textEncoder.encode(content);
        if (overwrite) {
            await vscode.workspace.fs.writeFile(path, contentArray);
        }
        else {
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
    },
};
//# sourceMappingURL=dataSource.js.map