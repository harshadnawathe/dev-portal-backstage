import path from "path";
import extract from "extract-zip";
import * as fs from "fs";
import csv from "csv-parser";

const processFile = async () => {
    const records = []
    const csvFileStream = await fs.createReadStream(`${__dirname}/tmp/testReport.csv`)
        .pipe(csv())
    for await (const record of csvFileStream) {
        records.push(record)
    }
    fs.unlinkSync(`${__dirname}/tmp/testReport.csv`)
    fs.unlinkSync(`${__dirname}/target.zip`)
    return records
}

async function unzip(zipPath: string) {
    try {
        const tmpDir = path.resolve(`${__dirname}/tmp`);
        await extract(zipPath, {dir: tmpDir})
        return await processFile();
    } catch (err) {
        console.error(err)
        return [];
    }
}

export default unzip;
