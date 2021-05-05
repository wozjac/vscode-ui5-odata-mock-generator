const vscode = require("vscode");
const sinon = require("sinon");

function stubVSCode(options) {
  return sinon.stub(vscode.workspace, "getConfiguration").returns({
    get(option) {
      switch (option) {
        case "metadataPath":
          return options.metadataPath;
        case "mockDataRootURI":
          return options.mockDataRootURI;
        case "mockDataTargetDirectory":
          return options.mockDataTargetDirectory;
        case "defaultLengthOfEntitySets":
          return options.defaultLengthOfEntitySets;
        case "overwriteExistingMockFiles":
          return options.overwriteExistingMockFiles;
        case "mockRulesConfigFilePath":
          return options.mockRulesConfigFilePath;
      }
    }
  });
};

module.exports = {
  stubVSCode
};