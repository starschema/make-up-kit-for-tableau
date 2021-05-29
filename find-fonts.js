const xpath = require('xpath')
const dom = require('xmldom').DOMParser;



// Returns a list of fonts used by the by a Tableau workbook from the workbooks XML contents
function findFontsUsedByXml(xmlContents) {

  const doc = new dom().parseFromString(xmlContents);
  const fontNodes = xpath.select("//style-rule/format[@attr='font-family']", doc)

  const fontNames = fontNodes.map(n => n.getAttribute("value"));

  // fonts in <run> -s
  const runFontNodes = xpath.select('//run[@fontname]', doc);
  const runFontNames = runFontNodes.map(n => n.getAttribute("fontname"));


  const fontNamesSet = new Set(fontNames.concat(runFontNames));
  return Array.from(fontNamesSet);
}


module.exports = {
  findFontsUsedByXml,
}

