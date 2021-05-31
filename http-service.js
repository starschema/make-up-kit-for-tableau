const scanLog = require('./scan-log');
const fontScanner = require('./get-fonts-used-by-workbook.js');

const fs = require('fs');
const express = require('express')
const cors = require('cors')
const app = express();
const port = 3000;

// read the config
// TODO: this should come from ENV
const CONFIG_FILE_NAME = 'config.demo.json';
const CONFIG = JSON.parse(fs.readFileSync(CONFIG_FILE_NAME, 'utf-8'));


// wrap calls to async function with some error handling
function runAsyncWrapper (callback) {
  return function (req, res, next) {
    callback(req, res, next)
      .catch(next)
  }
}


app.use(cors());
app.use(express.static('admin-frontend'))
app.use(express.json());

// app.use(function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
//   res.header('Access-Control-Expose-Headers', 'Content-Length');
//   res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
//   if (req.method === 'OPTIONS') {
//     return res.send(200);
//   } else {
//     return next();
//   }
// });

app.get('/', (req, res) => {
  res.send('Hello-hellp')
})




// TRIGGERING SCANS
// ----------------

// BODY should be:
// {
//    "site": <site contentUrl>
//    "luids": [ <LUIDs to scan> ]
// }
//

app.post('/scan', runAsyncWrapper(async (req, res, next) => {
  let { site, luids } = req.body;
  if (typeof site !== 'string') {
    res.status(400).send('Expecting a `site` string in request body')
    return;
  }

  if (!Array.isArray(luids)) {
    res.status(400).send('Expecting a `luids` string array in request body')
    return;
  }

  let scanResults = await fontScanner.scanWorkbooksOnSite(CONFIG.server, site, luids);

  await scanLog.insertNewLogRows(scanResults);

  res.json({ ok: true });
}));



// GET scanlog
app.get('/scanlog', runAsyncWrapper(async (req, res) => {
  let entries = await scanLog.getPage();
  res.json({
    pagination: {},
    data: entries,
  });
}));

app.get('/fonts', runAsyncWrapper(async (req, res) => {

  // await scanLog.addFontMetadataIfNeeded(['Tableau Book', 'Tableau Bold', 'Cursive', 'Monaco']);

  // let fonts = await scanLog.getFonts();
  let fonts = await scanLog.getAllFontsWithUsedWorkbooks();
  res.json({
    fonts,
  });
}));




app.get('/css', runAsyncWrapper(async (req, res) => {
  let fontsCss = await scanLog.getFullFontsCss();
  console.log("fonts css:", fontsCss);
  res.type('css').send(fontsCss);
}));

// Styles
// ------

app.get('/styles', runAsyncWrapper(async (req, res) => {

  let allThemes = await scanLog.getAllThemes();
  res.json(allThemes);
}));

app.post('/styles', runAsyncWrapper(async (req, res) => {
  let newTheme = await scanLog.createNewScrollbarTheme(req.body);
  res.json(newTheme);
}));

app.put('/styles/:styleId', runAsyncWrapper(async (req, res) => {
  let id = req.params.styleId;
  let theme = await scanLog.updateScrollbarTheme(id, req.body);
  res.json(theme);
}));

app.delete('/styles/:styleId', runAsyncWrapper(async (req, res) => {
  let id = req.params.styleId;
  let theme = await scanLog.deleteScrollbarTheme(id);
  res.json({});
}));

// APP
// ---

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
