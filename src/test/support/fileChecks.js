"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkMockFiles = void 0;
const dataSource_1 = require("../../dataSource");
const chai_1 = require("chai");
async function checkMockFiles(numberOfEntities, files, path) {
    for await (const file of files) {
        const content = await dataSource_1.project.readFileContent(`${path}/${file}`);
        (0, chai_1.expect)(JSON.parse(content)).to.have.length(numberOfEntities);
    }
}
exports.checkMockFiles = checkMockFiles;
//# sourceMappingURL=fileChecks.js.map