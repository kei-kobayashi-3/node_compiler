import * as readline from 'readline';
import { compileClass, exportXml, getXmlConfigs, xmlConfigs, xmlStack } from './compilationEngine';
import { readFile, writeFiles } from './ioFile';
import { tokenize, trimLines } from './jackTokenizer';

// コンソールからパスを入力する
const inputPath = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// パスを入力してもらい成功したらコールバック関数を呼び出す
inputPath.question(
  'Please input Filepath. (within * .jack)',
  (folderPath: string) => {
    let fileConfigs =  readFile(folderPath);
    inputPath.close()

    // contentごとにトリムした値を配列に格納
    let tokensList: string[][] = [];
    fileConfigs.contents.forEach(
      content => tokensList.push(tokenize(trimLines(content)))
    )
    let results: string[] = [];
    tokensList.forEach(
      tokens => {
        getXmlConfigs(tokens);
        compileClass();
        results.push(exportXml);
      }
    );
    writeFiles(results, fileConfigs.fileNames, folderPath);
  }
);
