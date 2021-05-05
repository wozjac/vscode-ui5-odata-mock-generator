const vscode = require("vscode");
const ODataMockGeneratorExtension = require("./src/ODataMockGeneratorExtension.js");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let disposable = vscode.commands.registerCommand("vscode-ui5-odata-mock-generator.generateMockData", async () => {
    run();
  });

  context.subscriptions.push(disposable);
}

async function run() {
  try {
    const mockGenerator = new ODataMockGeneratorExtension();
    await mockGenerator.createMockData();
    vscode.window.showInformationMessage("Mock data files generated");
  } catch (error) {
    vscode.window.showErrorMessage(error.message);
    console.error(error);
  }
}

module.exports = {
  activate,
  run
};