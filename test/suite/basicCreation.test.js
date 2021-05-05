const myExtension = require("../../extension");
const expect = require("chai").expect;
const sinon = require("sinon");
const stubber = require("../support/stubber");
const dataSource = require("../../src/dataSource");

const mockDataRootTempDir = "temp";
const metadataPath = "fixtures/metadata.xml";

async function checkMockFiles(number, files, path) {
  for await (const file of files) {
    const content = await dataSource.project.readFileContent(`${path}/${file}`);
    expect(JSON.parse(content)).to.have.length(number);
  }
}

describe("ODataMockGeneratorExtension - basic scenarios", async () => {
  beforeEach(() => {
    dataSource.project.deleteDir(mockDataRootTempDir);
    dataSource.project.deleteFile(".rules.json");
  });

  afterEach(() => {
    sinon.restore();
    dataSource.project.deleteDir(mockDataRootTempDir);
    dataSource.project.deleteFile(".rules.json");
  });

  it("generates files with 30 entries for each entity set from a file", async () => {
    const targetDir = `${mockDataRootTempDir}/${Date.now().toString()}`;

    stubber.stubVSCode({
      metadataPath: metadataPath,
      mockDataRootURI: "",
      mockDataTargetDirectory: targetDir,
      defaultLengthOfEntitySets: 30,
      overwriteExistingMockFiles: true,
    });

    await myExtension.run();
    const files = dataSource.project.listDir(targetDir);

    expect(files).to.have.members([
      "Advertisements.json",
      "Categories.json",
      "Products.json",
      "ProductDetails.json",
      "Suppliers.json",
      "Persons.json",
      "PersonDetails.json"
    ]);

    await checkMockFiles(30, files, targetDir);
  });

  it("overwrites previously generated files", async () => {
    const targetDir = `${mockDataRootTempDir}/${Date.now().toString()}`;

    //put some empty json files here
    dataSource.project.writeFile(`${targetDir}/Products.json`, "{}", true);
    dataSource.project.writeFile(`${targetDir}/Categories.json`, "{}", true);

    stubber.stubVSCode({
      metadataPath: metadataPath,
      mockDataRootURI: "",
      mockDataTargetDirectory: targetDir,
      defaultLengthOfEntitySets: 5,
      overwriteExistingMockFiles: true,
    });

    await myExtension.run();
    const files = dataSource.project.listDir(targetDir);

    expect(files).to.have.members([
      "Advertisements.json",
      "Categories.json",
      "Products.json",
      "ProductDetails.json",
      "Suppliers.json",
      "Persons.json",
      "PersonDetails.json"
    ]);

    await checkMockFiles(5, files, targetDir);
  });

  it("generates files with 2 entries for each entity set from a file", async () => {
    const targetDir = `${mockDataRootTempDir}/${Date.now().toString()}`;

    stubber.stubVSCode({
      metadataPath: metadataPath,
      mockDataRootURI: "",
      mockDataTargetDirectory: targetDir,
      defaultLengthOfEntitySets: 2,
      overwriteExistingMockFiles: true,
    });

    await myExtension.run();
    const files = dataSource.project.listDir(targetDir);

    expect(files).to.have.members([
      "Advertisements.json",
      "Categories.json",
      "Products.json",
      "ProductDetails.json",
      "Suppliers.json",
      "Persons.json",
      "PersonDetails.json"
    ]);

    await checkMockFiles(2, files, targetDir);
  });
});