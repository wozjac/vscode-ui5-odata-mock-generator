import { resolve } from "path";
import { runTests } from "@vscode/test-electron";

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = resolve(__dirname, "../");

    // The path to the extension test script
    // Passed to --extensionTestsPath
    const extensionTestsPath = resolve(__dirname, "./suite/index");

    const workdir = resolve(__dirname, "../../test-workdir");

    // Download VS Code, unzip it and run the integration test
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [workdir],
    });
  } catch (err) {
    console.error("Failed to run tests");
    console.error(err);
    process.exit(1);
  }
}

main();
