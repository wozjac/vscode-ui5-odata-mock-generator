"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extension_1 = require("../../extension");
const chai_1 = require("chai");
const sinon = require("sinon");
const stubber_1 = require("../support/stubber");
const dataSource_1 = require("../../dataSource");
const fileChecks_1 = require("../support/fileChecks");
const mockDataRootTempDir = "temp";
const metadataPath = "fixtures/metadata.xml";
describe("ODataMockGeneratorExtension - creation with .rules.json file", async () => {
    afterEach(() => {
        sinon.restore();
        dataSource_1.project.deleteDir(mockDataRootTempDir);
        dataSource_1.project.deleteFile(".rules.json");
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
        await dataSource_1.project.writeFile(".rules.json", JSON.stringify(rules), true);
        (0, stubber_1.stubVSCode)({
            metadataPath: metadataPath,
            mockDataRootURI: "",
            mockDataTargetDirectory: targetDir,
            defaultLengthOfEntitySets: 2,
            overwriteExistingMockFiles: true,
        });
        await (0, extension_1.run)();
        const files = dataSource_1.project.listDir(targetDir);
        (0, chai_1.expect)(files).to.have.length(2);
        (0, chai_1.expect)(files).to.have.members(["Categories.json", "Products.json"]);
        await (0, fileChecks_1.checkMockFiles)(2, files, targetDir);
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
        await dataSource_1.project.writeFile(`${targetDir}/.rules.json`, JSON.stringify(rules), true);
        (0, stubber_1.stubVSCode)({
            metadataPath: metadataPath,
            mockDataRootURI: "",
            mockDataTargetDirectory: targetDir,
            defaultLengthOfEntitySets: 5,
            overwriteExistingMockFiles: true,
            mockRulesConfigFilePath: targetDir,
        });
        await (0, extension_1.run)();
        const files = dataSource_1.project.listDir(targetDir);
        (0, chai_1.expect)(files).to.have.length(3); // with .rules.json
        (0, chai_1.expect)(files).to.include.members(["Products.json", "Categories.json"]);
        let content = await dataSource_1.project.readFileContent(`${targetDir}/Products.json`);
        const products = JSON.parse(content);
        (0, chai_1.expect)(products).to.have.length(5);
        content = await dataSource_1.project.readFileContent(`${targetDir}/Categories.json`);
        const categories = JSON.parse(content);
        (0, chai_1.expect)(categories).to.have.length.at.most(3);
        for (const category of categories) {
            (0, chai_1.expect)(category.ID).to.be.oneOf([1, 2, 3]);
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
        await dataSource_1.project.writeFile(`${targetDir}/.rules.json`, JSON.stringify(rules), true);
        (0, stubber_1.stubVSCode)({
            metadataPath: metadataPath,
            mockDataRootURI: "",
            mockDataTargetDirectory: targetDir,
            defaultLengthOfEntitySets: 5,
            overwriteExistingMockFiles: true,
            mockRulesConfigFilePath: targetDir,
        });
        await (0, extension_1.run)();
        const files = dataSource_1.project.listDir(targetDir);
        (0, chai_1.expect)(files).to.have.length(5); // with .rules.json
        (0, chai_1.expect)(files).to.include.members([
            "Products.json",
            "Categories.json",
            "Suppliers.json",
            "Persons.json",
        ]);
        let content = await dataSource_1.project.readFileContent(`${targetDir}/Products.json`);
        const products = JSON.parse(content);
        (0, chai_1.expect)(products).to.have.length(5);
        content = await dataSource_1.project.readFileContent(`${targetDir}/Categories.json`);
        const categories = JSON.parse(content);
        (0, chai_1.expect)(categories).to.have.length(5);
        content = await dataSource_1.project.readFileContent(`${targetDir}/Persons.json`);
        const persons = JSON.parse(content);
        (0, chai_1.expect)(persons).to.have.length(2);
        content = await dataSource_1.project.readFileContent(`${targetDir}/Suppliers.json`);
        const suppliers = JSON.parse(content);
        (0, chai_1.expect)(suppliers).to.have.length(1);
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
        await dataSource_1.project.writeFile(`${targetDir}/.rules.json`, JSON.stringify(rules), true);
        (0, stubber_1.stubVSCode)({
            metadataPath: metadataPath,
            mockDataRootURI: "",
            mockDataTargetDirectory: targetDir,
            defaultLengthOfEntitySets: 5,
            overwriteExistingMockFiles: true,
            mockRulesConfigFilePath: targetDir,
        });
        await (0, extension_1.run)();
        const files = dataSource_1.project.listDir(targetDir);
        (0, chai_1.expect)(files).to.have.length(2); // with .rules.json
        (0, chai_1.expect)(files).to.include.members(["Products.json"]);
        const content = await dataSource_1.project.readFileContent(`${targetDir}/Products.json`);
        const products = JSON.parse(content);
        for (const product of products) {
            (0, chai_1.expect)(product.Name).to.match(/\d*\.\d*\.\d*/);
        }
    });
});
//# sourceMappingURL=creationWithRules.test.js.map