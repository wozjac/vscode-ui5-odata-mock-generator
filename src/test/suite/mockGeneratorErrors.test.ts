import { run } from "../../extension";
import { expect } from "chai";
import * as sinon from "sinon";
import { stubVSCode } from "../support/stubber";
// import { project } from "../../dataSource";
import * as vscode from "vscode";

const logPrefix = "[VSCode-OData-Mock-Gen]";

describe("ODataMockGeneratorExtension errors", async () => {
  afterEach(() => {
    sinon.restore();
  });

  it("throws an error if metadataPath configuration is missing", async () => {
    stubVSCode({
      metadataPath: undefined,
      mockDataRootURI: "",
      mockDataTargetDirectory: "targetDir",
      defaultLengthOfEntitySets: 30,
      overwriteExistingMockFiles: true,
      projectPath: "myPath",
    });

    const windowSpy = sinon.spy(vscode.window, "showErrorMessage");
    await run();

    expect(windowSpy.calledOnce).to.be.true;
    expect(windowSpy.calledWith("Metadata path is empty")).to.be.true;
  });

  it("throws an error if the metadata file path is not a relative path", async () => {
    stubVSCode({
      metadataPath: "/my/absolute/path",
      mockDataRootURI: "",
      mockDataTargetDirectory: "targetDir",
      defaultLengthOfEntitySets: 30,
      overwriteExistingMockFiles: true,
      projectPath: "myPath",
    });

    const windowSpy = sinon.spy(vscode.window, "showErrorMessage");
    await run();

    expect(windowSpy.calledOnce).to.be.true;
    expect(windowSpy.calledWith("Metadata file path should be a relative path"))
      .to.be.true;
  });

  it("throws an error if the target dir is empty ", async () => {
    stubVSCode({
      metadataPath: "/my/absolute/path",
      mockDataRootURI: "",
      mockDataTargetDirectory: "",
      defaultLengthOfEntitySets: 30,
      overwriteExistingMockFiles: true,
      projectPath: "myPath",
    });

    const windowSpy = sinon.spy(vscode.window, "showErrorMessage");
    await run();

    expect(windowSpy.calledOnce).to.be.true;
    expect(windowSpy.calledWith("Target dir for mock data files is empty")).to
      .be.true;
  });

  it("throws an error if the metadata can't be read from URL", async () => {
    stubVSCode({
      metadataPath: "http://w34567gth",
      mockDataRootURI: "",
      mockDataTargetDirectory: "targetDir",
      defaultLengthOfEntitySets: 30,
      overwriteExistingMockFiles: true,
      projectPath: "myPath",
    });

    const windowSpy = sinon.spy(vscode.window, "showErrorMessage");
    await run();

    expect(windowSpy.calledOnce).to.be.true;
    expect(
      windowSpy.calledWith(
        "Metatada from http://w34567gth could not be read; " +
          "check the console for error details"
      )
    ).to.be.true;
  });

  it("throws an error if the metadata can't be read from a file", async () => {
    stubVSCode({
      metadataPath: "non-existing/path",
      mockDataRootURI: "",
      mockDataTargetDirectory: "targetDir",
      defaultLengthOfEntitySets: 30,
      overwriteExistingMockFiles: true,
      projectPath: "myPath",
    });

    const windowSpy = sinon.spy(vscode.window, "showErrorMessage");
    await run();

    expect(windowSpy.calledOnce).to.be.true;
    expect(
      windowSpy.calledWith(
        "Metatada from non-existing/path could not be read; " +
          "check the console for error details"
      )
    ).to.be.true;
  });
});
