import { LlamaParseReader, Document } from "llamaindex";
import { settings } from "../core/settings";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

export async function extractText(
  fileContent: Buffer,
  filename: string = "document",
): Promise<string> {
  const parser = new LlamaParseReader({
    apiKey: settings.LLAMA_CLOUD_API_KEY,
    verbose: true,
    language: "en",
    resultType: "markdown",
  });

  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, filename);

  fs.writeFileSync(tempFilePath, fileContent);

  const documents = await parser.loadData(tempFilePath);

  // Extract text from the documents and join them into a single string
  // const text = documents.map((doc: Document) => doc.text).join("\n");
  const text = documents
    .map((doc: Document) => {
      doc.metadata = { ...doc.metadata, file_name: filename };
      return doc.text;
    })
    .join("\n");

  fs.unlinkSync(tempFilePath);

  return text || ""; // Return an empty string if text is not extracted
}
