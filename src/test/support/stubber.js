import { workspace } from "vscode";
import { stub } from "sinon";
import { ExtensionOptions } from "../../ODataMockGeneratorExtension";

export function stubVSCode(options) {
  return stub(workspace, "getConfiguration").returns({
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
}

export default {
  stubVSCode,
};
