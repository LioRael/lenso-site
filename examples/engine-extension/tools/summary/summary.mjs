import { stdin, stdout } from "node:process";

let input = "";
for await (const chunk of stdin) input += chunk;

const request = JSON.parse(input);
if (request.schema !== "lenso.engine-process.v1") {
  throw new Error("Unsupported Engine process request");
}
const [path] = request.step.inputs;
const bytes = request.files[path];
if (!path || !Array.isArray(bytes)) {
  throw new Error("Expected one declared input file");
}
const source = Buffer.from(bytes).toString("utf8");
const title = source.match(/^# (.+)$/m)?.[1];
if (!title) throw new Error(`${path} needs a first-level heading`);

stdout.write(JSON.stringify({
  schema: "lenso.engine-processed.v1",
  outputs: {
    summary: {
      schema: "example.summary.v1",
      value: { title, source: path },
    },
  },
}));
