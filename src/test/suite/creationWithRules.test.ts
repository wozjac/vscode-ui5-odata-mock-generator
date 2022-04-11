import { run } from "../../extension";
import { expect } from "chai";
import * as sinon from "sinon";
import { stubVSCode } from "../support/stubber";
import { project } from "../../dataSource";
import { checkMockFiles } from "../support/fileChecks";

const mockDataRootTempDir = "temp";
const metadataPath = "fixtures/metadata.xml";

describe("ODataMockGeneratorExtension - creation with .rules.json file", async () => {
  afterEach(() => {
    sinon.restore();
    project.deleteDir(mockDataRootTempDir);
    project.deleteFile(".rules.json");
  });

  it("skips generation of provided entity sets; rules.json read from default, project root path", async () => {
    const targetDir = `${mockDataRootTempDir}/${Date.now().toString()}`;

    const rules = {
      skipMockGeneration: [
        "Advertisements",
        "ProductDetails",
        "Suppliers",
        "Persons",
        "PersonDetails",
      ],
    };

    // put .rules.json with exclude config in the project root
    await project.writeFile(".rules.json", JSON.stringify(rules), true);

    stubVSCode({
      metadataPath: metadataPath,
      mockDataRootURI: "",
      mockDataTargetDirectory: targetDir,
      defaultLengthOfEntitySets: 2,
      overwriteExistingMockFiles: true,
    });

    await run();
    const files = project.listDir(targetDir);
    expect(files).to.have.length(2);
    expect(files).to.have.members(["Categories.json", "Products.json"]);
    await checkMockFiles(2, files, targetDir);
  });

  it("passes all options to the ODataGenerator from rules.json in the project subdirectory", async () => {
    const targetDir = `${mockDataRootTempDir}/${Date.now().toString()}`;

    const rules = {
      skipMockGeneration: [
        "Advertisements",
        "ProductDetails",
        "Suppliers",
        "Persons",
        "PersonDetails",
      ],
      variables: {
        categoryIds: [1, 2, 3],
      },
      distinctValues: ["Categories"],
      /* eslint-disable @typescript-eslint/naming-convention */
      predefined: {
        Category: {
          ID: "$ref:categoryIds",
          Name: {
            reference: "ID",
            values: [
              {
                key: 1,
                value: "Category1",
              },
              {
                key: 2,
                value: "Category2",
              },
              {
                key: 3,
                value: "Category3",
              },
            ],
          },
        },
      },
    };
    /* eslint-enable @typescript-eslint/naming-convention */

    // put .rules.json
    await project.writeFile(
      `${targetDir}/.rules.json`,
      JSON.stringify(rules),
      true
    );

    stubVSCode({
      metadataPath: metadataPath,
      mockDataRootURI: "",
      mockDataTargetDirectory: targetDir,
      defaultLengthOfEntitySets: 5,
      overwriteExistingMockFiles: true,
      mockRulesConfigFilePath: targetDir,
    });

    await run();
    const files = project.listDir(targetDir);
    expect(files).to.have.length(3); // with .rules.json
    expect(files).to.include.members(["Products.json", "Categories.json"]);

    let content = await project.readFileContent(`${targetDir}/Products.json`);
    const products = JSON.parse(content);
    expect(products).to.have.length(5);

    content = await project.readFileContent(`${targetDir}/Categories.json`);
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
        /* eslint-disable @typescript-eslint/naming-convention */
        Suppliers: 1,
        Persons: 2,
        /* eslint-enable @typescript-eslint/naming-convention */
      },
    };

    // put .rules.json
    await project.writeFile(
      `${targetDir}/.rules.json`,
      JSON.stringify(rules),
      true
    );

    stubVSCode({
      metadataPath: metadataPath,
      mockDataRootURI: "",
      mockDataTargetDirectory: targetDir,
      defaultLengthOfEntitySets: 5,
      overwriteExistingMockFiles: true,
      mockRulesConfigFilePath: targetDir,
    });

    await run();
    const files = project.listDir(targetDir);

    expect(files).to.have.length(5); // with .rules.json
    expect(files).to.include.members([
      "Products.json",
      "Categories.json",
      "Suppliers.json",
      "Persons.json",
    ]);

    let content = await project.readFileContent(`${targetDir}/Products.json`);
    const products = JSON.parse(content);
    expect(products).to.have.length(5);

    content = await project.readFileContent(`${targetDir}/Categories.json`);
    const categories = JSON.parse(content);
    expect(categories).to.have.length(5);

    content = await project.readFileContent(`${targetDir}/Persons.json`);
    const persons = JSON.parse(content);
    expect(persons).to.have.length(2);

    content = await project.readFileContent(`${targetDir}/Suppliers.json`);
    const suppliers = JSON.parse(content);
    expect(suppliers).to.have.length(1);
  });

  it("uses faker.js for configured entity properties", async () => {
    const targetDir = `${mockDataRootTempDir}/${Date.now().toString()}`;

    const rules = {
      skipMockGeneration: [
        "Advertisements",
        "ProductDetails",
        "Suppliers",
        "Persons",
        "PersonDetails",
        "Categories",
      ],
      faker: {
        /* eslint-disable @typescript-eslint/naming-convention */
        Product: {
          Name: "system.semver",
        },
        /* eslint-enable @typescript-eslint/naming-convention */
      },
    };

    // put .rules.json
    await project.writeFile(
      `${targetDir}/.rules.json`,
      JSON.stringify(rules),
      true
    );

    stubVSCode({
      metadataPath: metadataPath,
      mockDataRootURI: "",
      mockDataTargetDirectory: targetDir,
      defaultLengthOfEntitySets: 5,
      overwriteExistingMockFiles: true,
      mockRulesConfigFilePath: targetDir,
    });

    await run();
    const files = project.listDir(targetDir);

    expect(files).to.have.length(2); // with .rules.json
    expect(files).to.include.members(["Products.json"]);

    const content = await project.readFileContent(`${targetDir}/Products.json`);
    const products = JSON.parse(content);

    for (const product of products) {
      expect(product.Name).to.match(/\d*\.\d*\.\d*/);
    }
  });
});
