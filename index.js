const tableauApi = require('./tableau-api');
const fsPromises = require('fs/promises');

const { getFontsUsedByWorkbook } = require('./get-fonts-used-by-workbook.js');

const scanLog = require('./scan-log');


(async () => {

  const siteContentUrl = 'TableauElementsWorkshopMarch'

  const tableauSession = await tableauApi.login({
    server: 'https://***************',
    apiVersion: '3.9',
    siteContentUrl,
    username: '******',
    password: '*******',
  });


  let workbookId = '4e746f87-614e-4863-a09c-1a3d0475cc13';

  let fontUsageData = await getFontsUsedByWorkbook(tableauSession, workbookId);

  console.log("Font usage data: " ,fontUsageData)


  await scanLog.insertNewLogRow(fontUsageData);

  // let workbookData = await tableauApi.downloadWorkbook(tableauSession, workbookId);

  // await fsPromises.writeFile("/tmp/xxxx.twb", workbookData, "utf-8");


  // let twbData = await getWorkbookTwbFromResponseData(workbookData);
  // let fontsUsed = findFonts.findFontsUsedByXml(twbData);
  // console.log("fonts used:", fontsUsed);


  // sign out
  await tableauApi.logout(tableauSession);
})()


