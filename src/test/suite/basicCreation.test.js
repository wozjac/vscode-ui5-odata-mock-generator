"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extension_1 = require("../../extension");
const chai_1 = require("chai");
const dataSource_1 = require("../../dataSource");
const stubber_1 = require("../support/stubber");
const sinon = require("sinon");
const fileChecks_1 = require("../support/fileChecks");
const mockDataRootTempDir = "temp";
const metadataPath = "fixtures/metadata.xml";
describe("ODataMockGeneratorExtension - basic scenarios", async () => {
    afterEach(() => {
        sinon.restore();
        dataSource_1.project.deleteDir(mockDataRootTempDir);
        dataSource_1.project.deleteFile(".rules.json");
    });
    it("generates files with 30 entries for each entity set from a file", async () => {
        const targetDir = `${mockDataRootTempDir}/${Date.now().toString()}`;
        (0, stubber_1.stubVSCode)({
            metadataPath: metadataPath,
            mockDataRootURI: "",
            mockDataTargetDirectory: targetDir,
            defaultLengthOfEntitySets: 30,
            overwriteExistingMockFiles: true,
            mockRulesConfigFilePath: "",
        });
        await (0, extension_1.run)();
        const files = dataSource_1.project.listDir(targetDir);
        (0, chai_1.expect)(files).to.have.members([
            "Advertisements.json",
            "Categories.json",
            "Products.json",
            "ProductDetails.json",
            "Suppliers.json",
            "Persons.json",
            "PersonDetails.json",
        ]);
        await (0, fileChecks_1.checkMockFiles)(30, files, targetDir);
    });
    it("overwrites previously generated files", async () => {
        const targetDir = `${mockDataRootTempDir}/${Date.now().toString()}`;
        //put some empty json files here
        dataSource_1.project.writeFile(`${targetDir}/Products.json`, "{}", true);
        dataSource_1.project.writeFile(`${targetDir}/Categories.json`, "{}", true);
        (0, stubber_1.stubVSCode)({
            metadataPath: metadataPath,
            mockDataRootURI: "",
            mockDataTargetDirectory: targetDir,
            defaultLengthOfEntitySets: 5,
            overwriteExistingMockFiles: true,
        });
        await (0, extension_1.run)();
        const files = dataSource_1.project.listDir(targetDir);
        (0, chai_1.expect)(files).to.have.members([
            "Advertisements.json",
            "Categories.json",
            "Products.json",
            "ProductDetails.json",
            "Suppliers.json",
            "Persons.json",
            "PersonDetails.json",
        ]);
        await (0, fileChecks_1.checkMockFiles)(5, files, targetDir);
    });
    it("generates files with 2 entries for each entity set from a file", async () => {
        const targetDir = `${mockDataRootTempDir}/${Date.now().toString()}`;
        (0, stubber_1.stubVSCode)({
            metadataPath: metadataPath,
            mockDataRootURI: "",
            mockDataTargetDirectory: targetDir,
            defaultLengthOfEntitySets: 2,
            overwriteExistingMockFiles: true,
        });
        await (0, extension_1.run)();
        const files = dataSource_1.project.listDir(targetDir);
        (0, chai_1.expect)(files).to.have.members([
            "Advertisements.json",
            "Categories.json",
            "Products.json",
            "ProductDetails.json",
            "Suppliers.json",
            "Persons.json",
            "PersonDetails.json",
        ]);
        await (0, fileChecks_1.checkMockFiles)(2, files, targetDir);
    });
});
//# sourceMappingURL=basicCreation.test.js.map