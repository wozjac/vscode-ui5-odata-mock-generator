"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = exports.activate = void 0;
const vscode = require("vscode");
const ODataMockGeneratorExtension_1 = require("./ODataMockGeneratorExtension");
function activate(context) {
    let disposable = vscode.commands.registerCommand("vscode-ui5-odata-mock-generator.generateMockData", async () => {
        run();
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
async function run() {
    try {
        const mockGenerator = new ODataMockGeneratorExtension_1.ODataMockGeneratorExtension();
        await mockGenerator.createMockData();
        vscode.window.showInformationMessage("Mock data files generated");
    }
    catch (error) {
        let message;
        if (error instanceof Error) {
            message = error.message;
        }
        else {
            message = String(error);
        }
        vscode.window.showErrorMessage(message);
        console.error(message);
    }
}
exports.run = run;
//# sourceMappingURL=extension.js.map