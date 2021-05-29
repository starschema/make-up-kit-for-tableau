const findFonts = require('./find-fonts');
const tableauApi = require('./tableau-api');

const JSZip = require("jszip");


// takes a buffer and returns it (if its a TWB) or unzips and finds the first TWB file and returns that
async function getWorkbookTwbFromResponseData(responseData) {
  // we'll have to decode stuff from ArrayBuffer, and assume UTF-8 for all
  let decoder = new TextDecoder('utf-8');


  // check if its an XML (we dont want to eat ZIP opening errors and do this in a catch)
  const checkHeader = "<\?xml version='1.0' encoding='utf-8' \?>"
  if (responseData.length > checkHeader.length) {
    let headerBuffer = responseData.slice(0, checkHeader.length);
    let decodedHeader = decoder.decode(headerBuffer);

    if (decodedHeader == checkHeader) {
      console.log("Contents start with XML header -- using full response as TWB");
      return decoder.decode(responseData);
    }
  }


  // Load the zip
  let loadedZip = await JSZip.loadAsync(responseData);
  let targetPath;

  // first find the file (forEach is not async)
  loadedZip.forEach(function (relativePath, zipEntry) {  // 2) print entries
    let entryName = zipEntry.name;
    if (/\.twb$/.test(entryName)) {
      targetPath = relativePath;
    }
  });

  // check if we actually have the file
  if (typeof targetPath !== 'string') {
    throw new Error("Cannot find workbook inside the TWBX file");
  }

  // then read the target file
  let data = await loadedZip.file(targetPath).async('string');

  return data;
}



async function getFontsUsedByWorkbook(tableauSession, workbookId) {
  // download the workbook
  let workbookData = await tableauApi.downloadWorkbook(tableauSession, workbookId);
  let twbData = await getWorkbookTwbFromResponseData(workbookData);

  // figure out the fonts
  let fontsUsed = findFonts.findFontsUsedByXml(twbData);

  // download workbook metadata
  let workbookMetadata = await tableauApi.getWorkbookMetadata(tableauSession, workbookId);

  return {
    createdAt: new Date().getUTCDate(),
    workbook: workbookMetadata.workbook,
    site: tableauSession.site,
    fonts: fontsUsed,
  }
}


// Logs in to the server, and fetches workbooks for a site, scans them and returns a list of scan results
async function scanWorkbooksOnSite(tableauSessionConfig, siteContentUrl, workbookIds ) {
  // add the site content URL to the login config (and duplicate it so we dont overwrite it...
  const sessionConfig = Object.assign({}, tableauSessionConfig, {
    siteContentUrl: siteContentUrl,
  });

  const tableauSession = await tableauApi.login(sessionConfig);

  // the output
  const results = [];

  // scan one at a time and wait instead of jumping on the server at once
  for (const workbookId of workbookIds) {
    results.push(await getFontsUsedByWorkbook(tableauSession, workbookId));
  }

  await tableauApi.logout(tableauSession);

  return results;
}


module.exports = {
  getFontsUsedByWorkbook,
  scanWorkbooksOnSite,
}
