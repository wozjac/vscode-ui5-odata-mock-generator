import { project } from "../../dataSource";
import { expect } from "chai";

export async function checkMockFiles(
  numberOfEntities: number,
  files: string[],
  path: string
) {
  for await (const file of files) {
    const content = await project.readFileContent(`${path}/${file}`);
    expect(JSON.parse(content)).to.have.length(numberOfEntities);
  }
}
