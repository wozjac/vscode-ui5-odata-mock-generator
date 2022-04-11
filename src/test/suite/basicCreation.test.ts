import { run } from "../../extension";
import { expect } from "chai";
import { project } from "../../dataSource";
import * as vscode from "vscode";
import { stubVSCode } from "../support/stubber";
import * as sinon from "sinon";
import { checkMockFiles } from "../support/fileChecks";

const mockDataRootTempDir = "temp";
const metadataPath = "fixtures/metadata.xml";

describe("ODataMockGeneratorExtension - basic scenarios", async () => {
  afterEach(() => {
    sinon.restore();
    project.deleteDir(mockDataRootTempDir);
    project.deleteFile(".rules.json");
  });

  it("generates files with 30 entries for each entity set from a file", async () => {
    const targetDir = `${mockDataRootTempDir}/${Date.now().toString()}`;

    stubVSCode({
      metadataPath: metadataPath,
      mockDataRootURI: "",
      mockDataTargetDirectory: targetDir,
      defaultLengthOfEntitySets: 30,
      overwriteExistingMockFiles: true,
      mockRulesConfigFilePath: "",
    });

    await run();
    const files = project.listDir(targetDir);

    expect(files).to.have.members([
      "Advertisements.json",
      "Categories.json",
      "Products.json",
      "ProductDetails.json",
      "Suppliers.json",
      "Persons.json",
      "PersonDetails.json",
    ]);

    await checkMockFiles(30, files, targetDir);
  });

  it("overwrites previously generated files", async () => {
    const targetDir = `${mockDataRootTempDir}/${Date.now().toString()}`;

    //put some empty json files here
    project.writeFile(`${targetDir}/Products.json`, "{}", true);
    project.writeFile(`${targetDir}/Categories.json`, "{}", true);

    stubVSCode({
      metadataPath: metadataPath,
      mockDataRootURI: "",
      mockDataTargetDirectory: targetDir,
      defaultLengthOfEntitySets: 5,
      overwriteExistingMockFiles: true,
    });

    await run();
    const files = project.listDir(targetDir);

    expect(files).to.have.members([
      "Advertisements.json",
      "Categories.json",
      "Products.json",
      "ProductDetails.json",
      "Suppliers.json",
      "Persons.json",
      "PersonDetails.json",
    ]);

    await checkMockFiles(5, files, targetDir);
  });

  it("generates files with 2 entries for each entity set from a file", async () => {
    const targetDir = `${mockDataRootTempDir}/${Date.now().toString()}`;

    stubVSCode({
      metadataPath: metadataPath,
      mockDataRootURI: "",
      mockDataTargetDirectory: targetDir,
      defaultLengthOfEntitySets: 2,
      overwriteExistingMockFiles: true,
    });

    await run();
    const files = project.listDir(targetDir);

    expect(files).to.have.members([
      "Advertisements.json",
      "Categories.json",
      "Products.json",
      "ProductDetails.json",
      "Suppliers.json",
      "Persons.json",
      "PersonDetails.json",
    ]);

    await checkMockFiles(2, files, targetDir);
  });
});
