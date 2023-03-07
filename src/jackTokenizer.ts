// string[]を受け取りtokenの配列を返す
export function tokenize(content: string[]){
  // 配列ごとにtokenに分割
  // 正規表現でキャプチャしているのでsplitはundefinedを返す場合がある
  // 文字列にはまだ識別用に"string"として格納している
  const regExp = /("[^"]*")|([\s\{\}\(\)\[\].,;+\-*\/&\|<>=~])/;
  let tokenList = content.map(l => l.split(regExp))
                 .flat()
                 .filter(s => s !== undefined)
                 .filter(s => s.trim() !== "");
  return tokenList;
}

// string(ファイルごとの読み取ったファイルの内容をクリーンして行ごとに分割し、string[]を返却)
export function trimLines(content: string){
let lineContents = content.split(/(?!".*)\n(?!")/)
                    .map(s => s.trim().replace(/^\/.*|\/\/.*/, ""))
                    .filter(s => s !== "");
return lineContents;
}
