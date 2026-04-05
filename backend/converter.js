import path from "path";
import fs from "fs/promises";
import csvToJson from "convert-csv-to-json";

async function convertCsv(file) {
  try {
    const json = await csvToJson.getJsonFromCsvAsync(file);

    // Create output file path (same name but .json)
    const outputFile = path.join(
      path.dirname(file),
      path.basename(file, ".csv") + ".json",
    );

    // Write JSON to file (pretty formatted)
    await fs.writeFile(outputFile, JSON.stringify(json, null, 2), "utf8");

    console.log("File written successfully:", outputFile);
  } catch (error) {
    console.error("Error converting CSV:", error);
  }
}

convertCsv("backup/Job_Apps_rows.csv");
