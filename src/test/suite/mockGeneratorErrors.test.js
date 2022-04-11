"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extension_1 = require("../../extension");
const chai_1 = require("chai");
const sinon = require("sinon");
const stubber_1 = require("../support/stubber");
// import { project } from "../../dataSource";
const vscode = require("vscode");
const logPrefix = "[VSCode-OData-Mock-Gen]";
describe("ODataMockGeneratorExtension errors", async () => {
    afterEach(() => {
        sinon.restore();
    });
    it("throws an error if metadataPath configuration is missing", async () => {
        (0, stubber_1.stubVSCode)({
            metadataPath: undefined,
            mockDataRootURI: "",
            mockDataTargetDirectory: "targetDir",
            defaultLengthOfEntitySets: 30,
            overwriteExistingMockFiles: true,
            projectPath: "myPath",
        });
        const windowSpy = sinon.spy(vscode.window, "showErrorMessage");
        await (0, extension_1.run)();
        (0, chai_1.expect)(windowSpy.calledOnce).to.be.true;
        (0, chai_1.expect)(windowSpy.calledWith("Metadata path is empty")).to.be.true;
    });
    it("throws an error if the metadata file path is not a relative path", async () => {
        (0, stubber_1.stubVSCode)({
            metadataPath: "/my/absolute/path",
            mockDataRootURI: "",
            mockDataTargetDirectory: "targetDir",
            defaultLengthOfEntitySets: 30,
            overwriteExistingMockFiles: true,
            projectPath: "myPath",
        });
        const windowSpy = sinon.spy(vscode.window, "showErrorMessage");
        await (0, extension_1.run)();
        (0, chai_1.expect)(windowSpy.calledOnce).to.be.true;
        (0, chai_1.expect)(windowSpy.calledWith("Metadata file path should be a relative path"))
            .to.be.true;
    });
    it("throws an error if the target dir is empty ", async () => {
        (0, stubber_1.stubVSCode)({
            metadataPath: "/my/absolute/path",
            mockDataRootURI: "",
            mockDataTargetDirectory: "",
            defaultLengthOfEntitySets: 30,
            overwriteExistingMockFiles: true,
            projectPath: "myPath",
        });
        const windowSpy = sinon.spy(vscode.window, "showErrorMessage");
        await (0, extension_1.run)();
        (0, chai_1.expect)(windowSpy.calledOnce).to.be.true;
        (0, chai_1.expect)(windowSpy.calledWith("Target dir for mock data files is empty")).to
            .be.true;
    });
    it("throws an error if the metadata can't be read from URL", async () => {
        (0, stubber_1.stubVSCode)({
            metadataPath: "http://w34567gth",
            mockDataRootURI: "",
            mockDataTargetDirectory: "targetDir",
            defaultLengthOfEntitySets: 30,
            overwriteExistingMockFiles: true,
            projectPath: "myPath",
        });
        const windowSpy = sinon.spy(vscode.window, "showErrorMessage");
        await (0, extension_1.run)();
        (0, chai_1.expect)(windowSpy.calledOnce).to.be.true;
        (0, chai_1.expect)(windowSpy.calledWith("Metatada from http://w34567gth could not be read; " +
            "check the console for error details")).to.be.true;
    });
    it("throws an error if the metadata can't be read from a file", async () => {
        (0, stubber_1.stubVSCode)({
            metadataPath: "non-existing/path",
            mockDataRootURI: "",
            mockDataTargetDirectory: "targetDir",
            defaultLengthOfEntitySets: 30,
            overwriteExistingMockFiles: true,
            projectPath: "myPath",
        });
        const windowSpy = sinon.spy(vscode.window, "showErrorMessage");
        await (0, extension_1.run)();
        (0, chai_1.expect)(windowSpy.calledOnce).to.be.true;
        (0, chai_1.expect)(windowSpy.calledWith("Metatada from non-existing/path could not be read; " +
            "check the console for error details")).to.be.true;
    });
});
//# sourceMappingURL=mockGeneratorErrors.test.js.map