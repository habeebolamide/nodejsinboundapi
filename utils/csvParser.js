// utils/csvParser.js
import csv from 'csv-parser';
import fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

export const parseCSV = async (filePath) => {
  const results = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};