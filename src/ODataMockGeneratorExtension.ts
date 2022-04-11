import * as vscode from "vscode";
import * as dataSource from "./dataSource";
import { ODataMockGenerator } from "omg-odata-mock-generator/dist/cjs";

const logPrefix = "[VSCode-OData-Mock-Gen]";

export class ODataMockGeneratorExtension {
  private configuration: vscode.WorkspaceConfiguration;
  private rootUri: string;
  private metadataPath: string;
  private mockRulesFilePath: string;
  private mockDataDir: string;
  private numberOfEntities: Number;
  private overwriteMockFiles: boolean = false;
  private isMetadataPathURL: boolean = false;
  private mockRules: string = "";
  private metadataText: string = "";

  constructor() {
    this.configuration =
      vscode.workspace.getConfiguration("odataMockGenerator");

    const rootUri: string | undefined =
      this.configuration.get("mockDataRootURI");

    this.rootUri = rootUri ? rootUri : "";

    const metadataPath: string | undefined =
      this.configuration.get("metadataPath");

    if (metadataPath) {
      this.metadataPath = metadataPath;
    } else {
      throw new Error("Metadata path is empty");
    }

    const mockRulesFilesPath: string | undefined = this.configuration.get(
      "mockRulesConfigFilePath"
    );

    if (mockRulesFilesPath) {
      this.mockRulesFilePath = mockRulesFilesPath;
    } else {
      this.mockRulesFilePath = "";
    }

    const mockDataDir: string | undefined = this.configuration.get(
      "mockDataTargetDirectory"
    );

    if (mockDataDir) {
      this.mockDataDir = mockDataDir;
    } else {
      throw new Error("Target dir for mock data files is empty");
    }

    const numberOfEntities: Number | undefined = this.configuration.get<Number>(
      "defaultLengthOfEntitySets"
    );

    if (numberOfEntities) {
      this.numberOfEntities = numberOfEntities;
    } else {
      this.numberOfEntities = 30;
    }

    const overwriteMockFiles: boolean | undefined =
      this.configuration.get<boolean>("overwriteExistingMockFiles");

    if (overwriteMockFiles) {
      this.overwriteMockFiles = overwriteMockFiles;
    } else {
      this.overwriteMockFiles = false;
    }

    if (!this.isMetadataPathURL && this.metadataPath.startsWith("/")) {
      throw new Error("Metadata file path should be a relative path");
    }

    if (this.metadataPath && this.metadataPath.indexOf("http") !== -1) {
      this.isMetadataPathURL = true;
    }
  }

  async createMockData() {
    await this.getMetadata();
    await this.loadMockRulesConfig();

    await dataSource.project.createDir(this.mockDataDir);

    const options = {
      defaultLengthOfEntitySets: this.numberOfEntities,
      mockDataRootURI: this.rootUri,
      rules: this.mockRules,
    };

    const generator = new ODataMockGenerator(this.metadataText, options);
    const mockData = generator.createMockData();

    let content, filePath;
    const overwrite = this.overwriteMockFiles;

    const forLoop = async () => {
      for (const key in mockData) {
        filePath = `${this.mockDataDir}/${key}.json`;
        content = JSON.stringify(mockData[key]);
        await dataSource.project.writeFile(filePath, content, overwrite);
      }
    };

    await forLoop();
  }

  private async getMetadata() {
    try {
      if (this.isMetadataPathURL) {
        this.metadataText = await dataSource.internet.fetchTextFile(
          this.metadataPath
        );
      } else {
        this.metadataText = await dataSource.project.readFileContent(
          this.metadataPath
        );
      }
    } catch (error) {
      console.error(`${logPrefix} ${error}`);
      throw new Error(
        `Metatada from ${this.metadataPath} could not be read; ` +
          "check the console for error details"
      );
    }
  }

  private async loadMockRulesConfig() {
    let mockRulesPath;

    if (!this.mockRulesFilePath) {
      mockRulesPath = ".rules.json";
    } else {
      mockRulesPath = `${this.mockRulesFilePath}/.rules.json`;
    }

    if (dataSource.project.fileExists(mockRulesPath)) {
      try {
        const mockRulesContent = await dataSource.project.readFileContent(
          mockRulesPath
        );
        this.mockRules = JSON.parse(mockRulesContent);
      } catch (error) {
        console.error(` ${error}`);
        vscode.window.showWarningMessage(
          `Mock rules JSON from ${mockRulesPath} could not be parsed;` +
            "check the console for errors, continuing without it"
        );
      }
    } else {
      console.info(
        `${logPrefix} Rules file .rules.json not found in ${mockRulesPath}; continuing without it`
      );
    }
  }
}
