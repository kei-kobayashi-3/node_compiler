import * as fs from 'fs';

export function readFile(folderPath: string) {
  // フォルダパスの中から*.jackファイルを選択する
  let fileNames: string[] = [];
  let contents: string[] = [];

  try {
    let allPaths = fs.readdirSync(folderPath);
    fileNames = allPaths.filter(file => file.endsWith('.jack'));
    fileNames.forEach(fn => {
      try {
        contents.push(fs.readFileSync(`${folderPath}/${fn}`, 'utf-8'));
    } catch (error) {
      console.error(`${fn}: Problem reading file.`);
    }
    });
  } catch (error) {
  console.error(`${folderPath}: not found *.jack files.`);
  }
  const fileConfigs = {fileNames, contents};
  return  fileConfigs;
}
