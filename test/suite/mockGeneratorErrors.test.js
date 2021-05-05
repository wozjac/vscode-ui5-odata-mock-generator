const vscode = require("vscode");
const myExtension = require("../../extension");
const expect = require("chai").expect;
const sinon = require("sinon");
const stubber = require("../support/stubber");

const logPrefix = "[VSCode-OData-Mock-Gen]";

describe("ODataMockGeneratorExtension errors", async () => {
  afterEach(() => {
    sinon.restore();
  });

  it("throws an error if metadataPath configuration is missing", async () => {
    stubber.stubVSCode({
      metadataPath: undefined,
      mockDataRootURI: "",
      mockDataTargetDirectory: "targetDir",
      defaultLengthOfEntitySets: 30,
      overwriteExistingMockFiles: true,
      projectPath: "myPath"
    });

    const windowSpy = sinon.spy(vscode.window, "showErrorMessage");
    await myExtension.run();

    expect(windowSpy.calledOnce).to.be.true;
    expect(windowSpy.calledWith("Metadata path is empty")).to.be.true;
  });

  it("throws an error if the metadata file path is not a relative path", async () => {
    stubber.stubVSCode({
      metadataPath: "/my/absolute/path",
      mockDataRootURI: "",
      mockDataTargetDirectory: "targetDir",
      defaultLengthOfEntitySets: 30,
      overwriteExistingMockFiles: true,
      projectPath: "myPath"
    });

    const windowSpy = sinon.spy(vscode.window, "showErrorMessage");
    await myExtension.run();

    expect(windowSpy.calledOnce).to.be.true;
    expect(windowSpy.calledWith("Metadata file path should be a relative path")).to.be.true;
  });

  it("throws an error if the target dir is empty ", async () => {
    stubber.stubVSCode({
      metadataPath: "/my/absolute/path",
      mockDataRootURI: "",
      mockDataTargetDirectory: "",
      defaultLengthOfEntitySets: 30,
      overwriteExistingMockFiles: true,
      projectPath: "myPath"
    });

    const windowSpy = sinon.spy(vscode.window, "showErrorMessage");
    await myExtension.run();

    expect(windowSpy.calledOnce).to.be.true;
    expect(windowSpy.calledWith("Target dir for mock data files is empty")).to.be.true;
  });

  it("throws an error if the metadata can't be read from URL", async () => {
    stubber.stubVSCode({
      metadataPath: "http://w34567gth",
      mockDataRootURI: "",
      mockDataTargetDirectory: "targetDir",
      defaultLengthOfEntitySets: 30,
      overwriteExistingMockFiles: true,
      projectPath: "myPath"
    });

    const consoleSpy = sinon.spy(console, "error");
    const windowSpy = sinon.spy(vscode.window, "showErrorMessage");
    await myExtension.run();

    expect(consoleSpy.getCall(0).args[0].startsWith(logPrefix)).to.be.true;
    expect(windowSpy.calledOnce).to.be.true;
    expect(windowSpy.calledWith("Metatada from http://w34567gth could not be read; " +
      "check the console for error details")).to.be.true;
  });

  it("throws an error if the metadata can't be read from a file", async () => {
    stubber.stubVSCode({
      metadataPath: "non-existing/path",
      mockDataRootURI: "",
      mockDataTargetDirectory: "targetDir",
      defaultLengthOfEntitySets: 30,
      overwriteExistingMockFiles: true,
      projectPath: "myPath"
    });

    const consoleSpy = sinon.spy(console, "error");
    const windowSpy = sinon.spy(vscode.window, "showErrorMessage");
    await myExtension.run();

    expect(consoleSpy.getCall(0).args[0].startsWith(logPrefix)).to.be.true;
    expect(windowSpy.calledOnce).to.be.true;
    expect(windowSpy.calledWith(
      "Metatada from non-existing/path could not be read; " +
      "check the console for error details")).to.be.true;
  });
});