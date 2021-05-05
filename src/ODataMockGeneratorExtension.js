const vscode = require("vscode");
const dataSource = require("./dataSource.js");
const { ODataMockGenerator } = require("omg-odata-mock-generator/dist/cjs");

const logPrefix = "[VSCode-OData-Mock-Gen]";

class ODataMockGeneratorExtension {
  constructor() {
    this._configuration = vscode.workspace.getConfiguration("");

    this._rootUri = this._configuration.get("mockDataRootURI");
    this._metadataPath = this._configuration.get("metadataPath");
    this._mockRulesFilePath = this._configuration.get("mockRulesConfigFilePath");
    this._mockDataDir = this._configuration.get("mockDataTargetDirectory");
    this._numberOfEntities = this._configuration.get("defaultLengthOfEntitySets");
    this._overwriteMockFiles = this._configuration.get("overwriteExistingMockFiles");

    this._validateConfiguration();

    if (this._metadataPath.indexOf("http") !== -1) {
      this._isMetadataPathURL = true;
    }
  }

  async createMockData() {
    await this._getMetadata();
    await this._loadMockRulesConfig();

    await dataSource.project.createDir(this._mockDataDir);

    const options = {
      defaultLengthOfEntitySets: this._numberOfEntities,
      mockDataRootURI: this._rootUri,
      rules: this._mockRules
    };

    const generator = new ODataMockGenerator(this._metadataText, options);
    const mockData = generator.createMockData();

    let content, filePath;
    const overwrite = this._overwriteMockFiles;

    const forLoop = async () => {
      for (const key in mockData) {
        filePath = `${this._mockDataDir}/${key}.json`;
        content = JSON.stringify(mockData[key]);
        await dataSource.project.writeFile(filePath, content, overwrite);
      }
    };

    await forLoop();
  }

  async _getMetadata() {
    try {
      if (this._isMetadataPathURL) {
        this._metadataText = await dataSource.internet.fetchTextFile(this._metadataPath);
      } else {
        this._metadataText = await dataSource.project.readFileContent(this._metadataPath);
      }
    } catch (error) {
      console.error(`${logPrefix} ${error}`);
      throw new Error(`Metatada from ${this._metadataPath} could not be read; ` +
        "check the console for error details");
    }
  }

  _validateConfiguration() {
    if (!this._metadataPath) {
      throw new Error("Metadata path is empty");
    }

    if (!this._mockDataDir) {
      throw new Error("Target dir for mock data files is empty");
    }

    if (!this._isMetadataPathURL && this._metadataPath.startsWith("/")) {
      throw new Error("Metadata file path should be a relative path");
    }
  }

  async _loadMockRulesConfig() {
    let mockRulesPath;

    if (!this._mockRulesFilePath) {
      mockRulesPath = ".rules.json";
    } else {
      mockRulesPath = `${this._mockRulesFilePath}/.rules.json`;
    }

    if (dataSource.project.fileExists(mockRulesPath)) {
      try {
        const mockRulesContent = await dataSource.project.readFileContent(mockRulesPath);
        this._mockRules = JSON.parse(mockRulesContent);
      } catch (error) {
        console.error(` ${error}`);
        vscode.window.showWarningMessage(`Mock rules JSON from ${mockRulesPath} could not be parsed;` +
          "check the console for errors, continuing without it");
      }
    } else {
      console.info(`${logPrefix} Rules file .rules.json not found in ${mockRulesPath}; continuing without it`);
    }
  }
}

module.exports = ODataMockGeneratorExtension;