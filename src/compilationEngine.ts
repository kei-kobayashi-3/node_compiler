import { xmlConfig, getXml } from "./jackTokenizer";

export let exportXml: string = "";
// xmlのインデントと最後に閉じるためにスタックに保存
export let xmlStack: string[] = [];

export let xmlConfigs: xmlConfig[] = [];

// tokenの配列を入力として受け取りxmlConfigを返却する
export function getXmlConfigs(tokens: string[]) {
  xmlConfigs = [];
  tokens.forEach(
    token => {
      const xmlConfig = getXml(token);
      if(xmlConfig) {
        xmlConfigs.push(xmlConfig);
      };
    }
  );
}

// ここから始まる
export function compileClass(){
  exportXml = ""
  exportXml += `<class>\n`;
  xmlStack.push("</class>\n");
  outputNtimes(3);
  // call classVarDec*
  let peek = xmlConfigs[0];
  let hasNextCompile = ["static", "field"].some((keyword) => Object.values(peek).includes(keyword));
  while( hasNextCompile ){
    compileClassVarDec();
    peek = xmlConfigs[0];
    hasNextCompile = ["static", "field"].some((keyword) => Object.values(peek).includes(keyword));
  }

  // call subroutineDec*
  peek = xmlConfigs[0];
  hasNextCompile = ["constructor", "function", "method"].some((keyword) => Object.values(peek).includes(keyword));
  while( hasNextCompile ){
    compileSubroutine();
    peek = xmlConfigs[0];
    hasNextCompile = ["constructor", "function", "method"].some((keyword) => Object.values(peek).includes(keyword));
  }
  outputNtimes(1);
  closeTag();
}
// (static|field) type varName (,varName)* ;
function compileClassVarDec(){
  nextXml(xmlStack.length, "<classVarDec>");
  xmlStack.push("</classVarDec>");

  let hasNext = false;
  while(!hasNext){
    let next = xmlConfigs.shift();
    if(next){
      nextXml(xmlStack.length, next.xml);
      hasNext = Object.values(next).includes(";");
    }
  }
  closeTag();
}

// ●文●
// [statements] statement*
// [statement] letStatement | ifStatement | whileStatement | doStatement | returnStatement
function compileStatements(){
  nextXml(xmlStack.length, "<statements>");
  xmlStack.push("</statements>");

  let hasNextStatement = ["let", "if", "while", "do", "return"].some(statement => Object.values(xmlConfigs[0]).includes(statement));
  while(hasNextStatement){
    const nextStatement = Object.values(xmlConfigs[0]).pop();
    switch (nextStatement) {
      case "let":
        compileLet();
        break;
      case "if":
        compileIf();
        break;
      case "while":
        compileWhile();
        break;
      case "do":
        compileDo();
        break;
      case "return":
        compileReturn();
        break;
    }
    hasNextStatement = ["let", "if", "while", "do", "return"].some(statement => Object.values(xmlConfigs[0]).includes(statement));
  }
  closeTag();
}
// [letStatement] let varName ([ expression])? = expression ;
function compileLet(){
  nextXml(xmlStack.length, "<letStatement>");
  xmlStack.push("</letStatement>");
  outputNtimes(2);

  const hasNextLeftBracket = Object.values(xmlConfigs[0]).includes("[");
  if(hasNextLeftBracket){
    outputNtimes(1);
    compileExpression();
    outputNtimes(1);
  }
  outputNtimes(1);
  compileExpression();
  outputNtimes(1);

  closeTag();
}

// [ifStatement] if `(` expressin `)` { statements } (else { statements })?
function compileIf(){
  nextXml(xmlStack.length, "<ifStatement>");
  xmlStack.push("</ifStatement>");
  outputNtimes(2);
  compileExpression();
  outputNtimes(2);
  compileStatements();
  outputNtimes(1);

  if(Object.values(xmlConfigs[0]).includes("else")){
    outputNtimes(2);
    compileStatements();
    outputNtimes(1);
  }
  closeTag();
}

// [whileStatement] while `(` expression `)` { statements }
function compileWhile(){
  nextXml(xmlStack.length, "<whileStatement>");
  xmlStack.push("</whileStatement>");
  outputNtimes(2);
  compileExpression();
  outputNtimes(2);
  compileStatements();
  outputNtimes(1);
  closeTag();
}

// [doStatement] do subroutineCall ;
function compileDo(){
  nextXml(xmlStack.length, "<doStatement>");
  xmlStack.push("</doStatement>");
  outputNtimes(1);

  if(Object.values(xmlConfigs[1]).includes("(")){
    outputNtimes(2);
    compileExpressionList();
    outputNtimes(1);
  }else if(Object.values(xmlConfigs[1]).includes(".")){
    outputNtimes(4);
    compileExpressionList();
    outputNtimes(1);
  }
  outputNtimes(1);
  closeTag();
}

// [returnStatement] return expression? ;
function compileReturn(){
  nextXml(xmlStack.length, "<returnStatement>");
  xmlStack.push("</returnStatement>");
  outputNtimes(1);
  if(!Object.values(xmlConfigs[0]).includes(";")){
    compileExpression();
  }
  outputNtimes(1);
  closeTag();
}

// ●式●
// term (op term)*
function compileExpression(){
  nextXml(xmlStack.length, "<expression>");
  xmlStack.push("</expression>");

  compileTerm();
  let nextOp = ["+", "-", "*", "/", "&", "|", "<", ">", "="].some(op => Object.values(xmlConfigs[0]).includes(op));
  while(nextOp){
    outputNtimes(1);
    compileTerm();
    nextOp = ["+", "-", "*", "/", "&", "|", "<", ">", "="].some(op => Object.values(xmlConfigs[0]).includes(op));
  }
  closeTag();
}
// [term] integerConstant | stringConstant | keywordConstant | varName | varName `[` expression `]` | subroutineCall | `(` expression `)` | unaryOp term
function compileTerm(){
  nextXml(xmlStack.length, "<term>");
  xmlStack.push("</term>");

  const nextTerm = xmlConfigs[0];
  const afterNextTerm = xmlConfigs[1];

  const nextIsSimple = ["integerConstant", "stringConstant"].some(next => Object.keys(nextTerm).includes(next)) ||
                       ["true", "false", "null", "this"].some(keyword => Object.values(nextTerm).includes(keyword));
  const nextIsExpression = Object.values(nextTerm).includes("(");
  const nextIsUnary = ["-", "~"].some(next => Object.values(nextTerm).includes(next));
  const nextIsIdentifier = Object.keys(nextTerm).includes("identifier");


  if(nextIsSimple){
    outputNtimes(1);
  }else if(nextIsExpression){
    outputNtimes(1);
    compileExpression();
    outputNtimes(1);
  }else if(nextIsUnary){
    outputNtimes(1);
    compileTerm();
  }else if(nextIsIdentifier){
    // ひとつ先 => "["の場合はvarName[expression] => "(" or "."の場合はsubroutineName `(`expressionList`)` | (className|varName).subroutineName `(`expressionList`)`
    // それ以外はvarName

    if(Object.values(afterNextTerm).includes("(")){
      outputNtimes(2);
      compileExpressionList();
      outputNtimes(1);
    }else if (Object.values(afterNextTerm).includes(".")){
      outputNtimes(4);
      compileExpressionList();
      outputNtimes(1);
    }else if (Object.values(afterNextTerm).includes("[")){
      outputNtimes(2);
      compileExpression();
      outputNtimes(1);
    }else{
      outputNtimes(1);
    }
  }else{
    console.error(`Problem comileTerm. :${nextTerm}`);
  }
  closeTag();
}
// [expressionList] (expression (, expression)* )?
function compileExpressionList(){
  nextXml(xmlStack.length, "<expressionList>");
  xmlStack.push("</expressionList>");
  if(Object.values(xmlConfigs[0]).includes(")")){

  }else{
    compileExpression();
    let expressionIs = Object.values(xmlConfigs[0]).includes(",");
    while(expressionIs){
      outputNtimes(1);
      compileExpression();
      expressionIs = Object.values(xmlConfigs[0]).includes(",");
    }
  }
  closeTag();
}



// ●プログラム構造●
// (constructor|function|method) (void|type) subroutineName (parameterList) subroutineBody ;
// [subroutineBody] { varDec* statements }
function compileSubroutine(){
  nextXml(xmlStack.length, "<subroutineDec>");
  xmlStack.push("</subroutineDec>");
  outputNtimes(4);
  // call compileParameterList [parameterList] ( (type varName (, type varName)*) )?
  compileParameterList();
  outputNtimes(1);
  // compilesubroutineBody [subroutineBody] { varDec* statements }
  nextXml(xmlStack.length, "<subroutineBody>");
  xmlStack.push("</subroutineBody>");
  // {
  outputNtimes(1);
  // [varDec* ] "var"が次のtokenの場合実行。
  let hasNextVarDec = Object.values(xmlConfigs[0]).includes("var");
  while(hasNextVarDec){
    compileVarDec();
    hasNextVarDec = Object.values(xmlConfigs[0]).includes("var");
  }
  // call compileStatements
  compileStatements();
  // }
  outputNtimes(1);
  // subroutineBody close
  closeTag();
  // subroutineDec close
  closeTag();
}

// [parameterList] ( (type varName (, type varName)*) )?
function compileParameterList(){
  nextXml(xmlStack.length, "<parameterList>");
  xmlStack.push("</parameterList>");
  // 次にパラメータがあるかどうか。")"が次のtokenの場合パラメータはない。
  let hasNextParameter = Object.values(xmlConfigs[0]).includes(")");
  while(!hasNextParameter){
    let next = xmlConfigs.shift();
    if(next){
      nextXml(xmlStack.length, next.xml);
      hasNextParameter = Object.values(xmlConfigs[0]).includes(")");
    }
  }
  closeTag();
}

// [varDec] var type varName (, varName)* ;
function compileVarDec(){
  nextXml(xmlStack.length, "<varDec>");
  xmlStack.push("</varDec>");
  outputNtimes(3);

  // ";"が次のtokenの場合はない。
  let hasNextVarName = Object.values(xmlConfigs[0]).includes(";");
  while(!hasNextVarName){
    let next = xmlConfigs.shift();
    if(next){
      nextXml(xmlStack.length, next.xml);
      hasNextVarName = Object.values(xmlConfigs[0]).includes(";");
    }
  }

  outputNtimes(1);
  closeTag();
}





function nextXml(tabTimes: number, xmlString: string){
  exportXml += "\t".repeat(tabTimes) + xmlString + "\n";
}
function outputNtimes(times: number){
  let outputNtimes = 0;
  while(outputNtimes < times){
    let next = xmlConfigs.shift();
    if(next){
      nextXml(xmlStack.length, next.xml);
    };
    outputNtimes++;
  }
}
function closeTag(){
  const closingTag = xmlStack.pop();
  if(closingTag){
    nextXml(xmlStack.length, closingTag);
  }
}
