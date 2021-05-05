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

describe("ODataMockGeneratorExtension - creation with .rules.json file", async () => {
  beforeEach(() => {
    dataSource.project.deleteDir(mockDataRootTempDir);
    dataSource.project.deleteFile(".rules.json");
  });

  afterEach(() => {
    sinon.restore();
    dataSource.project.deleteDir(mockDataRootTempDir);
    dataSource.project.deleteFile(".rules.json");
  });

  it("skips generation of provided entity sets; rules.json read from default, project root path", async () => {
    const targetDir = `${mockDataRootTempDir}/${Date.now().toString()}`;

    const rules = {
      skipMockGeneration: ["Advertisements", "ProductDetails", "Suppliers", "Persons", "PersonDetails"]
    };

    // put .rules.json with exclude config in the project root
    await dataSource.project.writeFile(".rules.json", JSON.stringify(rules));

    stubber.stubVSCode({
      metadataPath: metadataPath,
      mockDataRootURI: "",
      mockDataTargetDirectory: targetDir,
      defaultLengthOfEntitySets: 2,
      overwriteExistingMockFiles: true,
    });

    await myExtension.run();
    const files = dataSource.project.listDir(targetDir);

    expect(files).to.have.length(2);

    expect(files).to.have.members([
      "Categories.json",
      "Products.json",
    ]);

    await checkMockFiles(2, files, targetDir);
  });

  it("passes all options to the ODataGenerator from rules.json in the project subdirectory", async () => {
    const targetDir = `${mockDataRootTempDir}/${Date.now().toString()}`;

    const rules = {
      skipMockGeneration: ["Advertisements", "ProductDetails", "Suppliers", "Persons", "PersonDetails"],
      variables: {
        categoryIds: [1, 2, 3]
      },
      distinctValues: ["Categories"],
      predefined: {
        Category: {
          ID: "$ref:categoryIds",
          Name: {
            reference: "ID",
            values: [{
              key: 1,
              value: "Category1"
            }, {
              key: 2,
              value: "Category2"
            }, {
              key: 3,
              value: "Category3"
            }]
          }
        }
      }
    };

    // put .rules.json 
    await dataSource.project.writeFile(`${targetDir}/.rules.json`, JSON.stringify(rules));

    stubber.stubVSCode({
      metadataPath: metadataPath,
      mockDataRootURI: "",
      mockDataTargetDirectory: targetDir,
      defaultLengthOfEntitySets: 5,
      overwriteExistingMockFiles: true,
      mockRulesConfigFilePath: targetDir
    });

    await myExtension.run();
    const files = dataSource.project.listDir(targetDir);

    expect(files).to.have.length(3); // with .rules.json
    expect(files).to.include.members(["Products.json", "Categories.json"]);

    let content = await dataSource.project.readFileContent(`${targetDir}/Products.json`);
    const products = JSON.parse(content);
    expect(products).to.have.length(5);

    content = await dataSource.project.readFileContent(`${targetDir}/Categories.json`);
    const categories = JSON.parse(content);
    expect(categories).to.have.length.at.most(3);

    for (const category of categories) {
      expect(category.ID).to.be.oneOf([1, 2, 3]);
    }
  });

  it("generates different number of entities for configured entity sets", async () => {
    const targetDir = `${mockDataRootTempDir}/${Date.now().toString()}`;

    const rules = {
      skipMockGeneration: ["Advertisements", "ProductDetails", "PersonDetails"],
      lengthOf: {
        Suppliers: 1,
        Persons: 2
      }
    };

    // put .rules.json 
    await dataSource.project.writeFile(`${targetDir}/.rules.json`, JSON.stringify(rules));

    stubber.stubVSCode({
      metadataPath: metadataPath,
      mockDataRootURI: "",
      mockDataTargetDirectory: targetDir,
      defaultLengthOfEntitySets: 5,
      overwriteExistingMockFiles: true,
      mockRulesConfigFilePath: targetDir
    });

    await myExtension.run();
    const files = dataSource.project.listDir(targetDir);

    expect(files).to.have.length(5); // with .rules.json
    expect(files).to.include.members(["Products.json", "Categories.json", "Suppliers.json", "Persons.json"]);

    let content = await dataSource.project.readFileContent(`${targetDir}/Products.json`);
    const products = JSON.parse(content);
    expect(products).to.have.length(5);

    content = await dataSource.project.readFileContent(`${targetDir}/Categories.json`);
    const categories = JSON.parse(content);
    expect(categories).to.have.length(5);

    content = await dataSource.project.readFileContent(`${targetDir}/Persons.json`);
    const persons = JSON.parse(content);
    expect(persons).to.have.length(2);

    content = await dataSource.project.readFileContent(`${targetDir}/Suppliers.json`);
    const suppliers = JSON.parse(content);
    expect(suppliers).to.have.length(1);
  });

  it("uses faker.js for configured entity properties", async () => {
    const targetDir = `${mockDataRootTempDir}/${Date.now().toString()}`;

    const rules = {
      skipMockGeneration: ["Advertisements", "ProductDetails", "Suppliers", "Persons", "PersonDetails", "Categories"],
      faker: {
        Product: {
          Name: "system.semver"
        }
      }
    };

    // put .rules.json 
    await dataSource.project.writeFile(`${targetDir}/.rules.json`, JSON.stringify(rules));

    stubber.stubVSCode({
      metadataPath: metadataPath,
      mockDataRootURI: "",
      mockDataTargetDirectory: targetDir,
      defaultLengthOfEntitySets: 5,
      overwriteExistingMockFiles: true,
      mockRulesConfigFilePath: targetDir
    });

    await myExtension.run();
    const files = dataSource.project.listDir(targetDir);

    expect(files).to.have.length(2); // with .rules.json
    expect(files).to.include.members(["Products.json"]);

    const content = await dataSource.project.readFileContent(`${targetDir}/Products.json`);
    const products = JSON.parse(content);

    for (const product of products) {
      expect(product.Name).to.match(/\d*\.\d*\.\d*/);
    }
  });
});