import * as vscode from "vscode";
import { ODataMockGeneratorExtension } from "./ODataMockGeneratorExtension";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "vscode-ui5-odata-mock-generator.generateMockData",
    async () => {
      run();
    }
  );

  context.subscriptions.push(disposable);
}

export async function run() {
  try {
    const mockGenerator = new ODataMockGeneratorExtension();
    await mockGenerator.createMockData();
    vscode.window.showInformationMessage("Mock data files generated");
  } catch (error) {
    let message;

    if (error instanceof Error) {
      message = error.message;
    } else {
      message = String(error);
    }

    vscode.window.showErrorMessage(message);
    console.error(message);
  }
}
