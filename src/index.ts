import * as readline from 'readline';
import { readFile } from './readFile';
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
    let tokensList: any = [];
    fileConfigs.contents.forEach(
      content => tokensList.push(tokenize(trimLines(content)))
    )
    console.log(tokensList);

  });
