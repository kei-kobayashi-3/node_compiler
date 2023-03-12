
// tokenに対し、出力するxmlの情報を返す
export interface xmlConfig {
  [key: string] : string;
  xml : string;
}
export function getXml(token: string){
  const regExpKeyword = /^(class|constructor|function|method|field|static|var|int|char|boolean|void|true|false|null|this|let|do|if|else|while|return)$/;
  const regExpSymbol = /^([\{\}\(\)\[\].,;+\-*\/&\|<>=~])$/;
  const regExpInteger = /^([0-9]+$)/;
  const regExpString = /^"([^]*)"$/;
  const regExpIdentifier = /^([a-zA-Z_][\w\d]*)$/;

  const keywordIs = regExpKeyword.exec(token);
  const symbolIs = regExpSymbol.exec(token);
  const integerIs = regExpInteger.exec(token);
  const stringIs = regExpString.exec(token);
  const identifierIs = regExpIdentifier.exec(token);

  const xmlConfig: xmlConfig = {xml: ""};

  if (keywordIs){
    xmlConfig["keyword"] = keywordIs[1];
    xmlConfig["xml"] = `<keyword> ${keywordIs[1]} </keyword>`;
    return xmlConfig;
  }else if (symbolIs){
    let sy = symbolIs[1];
    if (sy === "<"){
      sy = "&lt;";
    }else if(sy === ">"){
      sy = "&gt;";
    }else if(sy === "&"){
      sy = "&amp;";
    }else{
      sy = sy
    }
    xmlConfig["symbol"] = symbolIs[1];
    xmlConfig["xml"] = `<symbol> ${sy} </symbol>`;
    return xmlConfig;
  }else if (integerIs){
    xmlConfig["integerConstant"] = integerIs[1];
    xmlConfig["xml"] = `<integerConstant> ${integerIs[1]} </integerConstant>`;
    return xmlConfig;
  }else if (stringIs){
    xmlConfig["stringConstant"] = stringIs[1];
    xmlConfig["xml"] = `<stringConstant> ${stringIs[1]} </stringConstant>`;
    return xmlConfig;
  }else if (identifierIs){
    xmlConfig["identifier"] = identifierIs[1];
    xmlConfig["xml"] = `<identifier> ${identifierIs[1]} </identifier>`;
    return xmlConfig;
  }else{
     console.error(`Problem parsing to XML. : ${token}`);
  }
}

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
  let lineContents = content.replace(/\/\*[\s\S]*?\*\//g, "\n")
                      .split(/(?!".*)\n(?!")/)
                      .map(s => s.trim().replace(/^\/.*|\/\/.*/, ""))
                      .filter(s => s !== "");
  return lineContents;
}
