import * as fs from 'fs';
import { getXml } from './jackTokenizer';

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

// ファイルにトークンを書き込む
export function writeFiles(xmlList: string[], fileNames: string[], folderPath: string){
  xmlList.forEach(
    (item, index) => {
      writeFile(item, fileNames[index], folderPath);
    }
  )
}

function writeFile(xml: string, fileName: string, folderPath: string){
  const filePath = folderPath + "/" + fileName.replace(".jack", ".xml");
  try {
    fs.writeFileSync(filePath, xml);
  } catch (error) {
    console.error(`Problem writing file. :${fileName}`);
  }
}
