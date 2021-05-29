const { Pool, Client } = require('pg');
const _ = require('lodash');

const pool = new Pool();

// (async ()=> {
//   // you can also use async/await
//   const res = await pool.query('SELECT NOW()')
//   console.log(res.rows)
//   await pool.end();

// })()

async function runQuery(query) {
  console.log("[SQL] %s | %s", query.text, JSON.stringify(query.values));
  return await pool.query(query);
}

// SCAN LOG
// --------
async function insertNewLogRows(logRows) {
  for (const logRow of logRows) {
    await insertNewLogRow(logRow);
  }
}

async function insertNewLogRow(logRow) {

  // find and insert all unused fonts
  // TODO: if multiple workers are inserting there is a race condition here when two workers intend to insert the same font
  addFontMetadataIfNeeded(logRow.fonts);

  // insert the log rows
  const query = {
    // name: 'insert-log-row',
    text: `
      INSERT INTO font_scan_log(created_at, site_name, workbook_name, fonts_used, workbook_metadata)
      VALUES (
              (now() at time zone 'utc'),
              $1,
              $2,
              $3::jsonb,
              $4::jsonb
             );
    `,
    values: [
      logRow.site.contentUrl,
      logRow.workbook.name,
      JSON.stringify(logRow.fonts),
      JSON.stringify(logRow),
    ]
  };

  const res = await runQuery(query);

  return res;
}





async function getPage(pageSize = 100, offset = 0) {
  const query = {
    text: `SELECT * FROM font_scan_log ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    values: [ pageSize, offset ]
  };

  const res = await runQuery(query);

  return res.rows;
}


// FONTS
// -----


// Returns the CSS for all the fonts that are in the database
async function getFullFontsCss() {
  const query = {
    text: `SELECT string_agg(css_for_font, '\n\n') as css from font_metadata`,
    values: [],
  };

  const res = await runQuery(query);
  return res.rows[0].css;
}

// Get all registered fonts
async function getFonts() {
  const query = {
    text: `SELECT * from font_metadata`,
    values: [],
  };
  const res = await runQuery(query);
  return res.rows;
}


async function getWorkbooksUsedByFonts() {
  const res = await runQuery({
    text: `
    SELECT font_name,
        workbook_name,
        workbook_metadata -> 'workbook' ->> 'id' as workbook_luid
    FROM font_metadata
    LEFT OUTER JOIN font_scan_log ON font_scan_log.fonts_used ? font_metadata.font_name;
    `,
    values: [],
  });

  return res.rows.reduce((memo, row) => {
    let fontName = row.font_name;
    if (typeof memo[fontName] === 'undefined') {
      memo[fontName] = new Set();
    }

    // if no workbooks match then the workbook name is NULL, we dont want it, but we still want it
    // to be present in the output object, so all fonts in the DB are in it
    if (typeof row.workbook_name !== 'string') {
      return memo;
    }

    memo[fontName].add({
      name: row.workbook_name,
      id: row.workbook_luid,
    });
    return memo;
  }, {});

}

async function getAllFontsWithUsedWorkbooks() {
  let allFonts = await getFonts();
  let workbooksByFont = await getWorkbooksUsedByFonts();

  return allFonts.map(f => {
    let workbooks = Array.from(workbooksByFont[f.font_name]);
    return Object.assign(f, { workbooks: workbooks });
  });
}

// Insert empty font metadata for a font if not installed yet.
// TODO: refactor logic to remove race condition when called by multiple workers with the same, not-yet added font at the same time
async function addFontMetadataIfNeeded(fonts) {
  let existing = await runQuery({
    text: 'SELECT font_name FROM font_metadata WHERE font_name = ANY($1)',
    values: [ fonts ],
  });

  let newFonts = new Set(fonts);
  existing.rows.forEach(f => {
    newFonts.delete(f.font_name);
  });

  // if no new fonts are to be added, return
  if (newFonts.size === 0) {
    return;
  }

  console.log("[Font Metadata] Adding font metadata for new fonts:", Array.from(newFonts));

  let insertedFonts = Array.from(newFonts).map(f => {
    return runQuery({
      text: `
        INSERT INTO font_metadata(font_name, css_for_font, is_installed)
        VALUES ($1, '/* Add CSS for ${f} here */', false)
      `,
      values: [ f ]
    });
  });

  await Promise.all(insertedFonts);
}


// THEMES
// ------


// Creates a new scrollbar theme and returns it with the ID
async function createNewScrollbarTheme(data) {
  // let data = transformKeys(_.camelCase, inData);
  const query = {
    text: `
      INSERT INTO scrollbar_themes(test_regexp, weight, color, background_color, radius, width, inset)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
    values: [
      data.testRegexp,
      data.weight,
      data.color,
      data.backgroundColor,
      data.radius,
      data.width,
      data.inset
    ],
  };

  const res = await runQuery(query);
  return transformKeys(_.camelCase, res.rows[0]);
}

// Creates a new scrollbar theme and returns it with the ID
async function updateScrollbarTheme(id, data) {
  // let data = transformKeys(_.camelCase, inData);
  const query = {
    text: `
      UPDATE scrollbar_themes
      SET
        test_regexp = $1,
        weight = $2,
        color = $3,
        background_color = $4,
        radius = $5,
        width = $6,
        inset = $7
      WHERE id = $8
      RETURNING *
    `,
    values: [
      data.testRegexp,
      data.weight,
      data.color,
      data.backgroundColor,
      data.radius,
      data.width,
      data.inset,
      id,
    ],
  };

  const res = await runQuery(query);
  return transformKeys(_.camelCase, res.rows[0]);
}


async function deleteScrollbarTheme(id) {
  const query = {
    text: `DELETE FROM scrollbar_themes WHERE id=$1`,
    values: [ id ]
  };

  const res = await runQuery(query);
  return;
}



async function getAllThemes(pageSize = 100, offset = 0) {
  const query = {
    text: `SELECT * FROM scrollbar_themes ORDER BY id DESC LIMIT $1 OFFSET $2`,
    values: [ pageSize, offset ]
  };

  const res = await runQuery(query);
  return res.rows.map(data => transformKeys(_.camelCase, data));

  // return res.rows.map(data => ({
  //   id: data.id,
  //   testRegexp: data.test_regexp,
  //   weight: data.weight,
  //   color: data.color,
  //   backgroundColor: data.background_color,
  //   radius: data.radius,
  //   width: data.width,
  //   inset: data.inset
  // }));
}


// Transforms the keys of `data` using `fn`
function transformKeys(fn, data) {
  let o = {};
  Object.keys(data).forEach(k => {
    o[fn(k)] = data[k];
  })
  return o;
}


module.exports = {
  insertNewLogRow,
  insertNewLogRows,
  getPage,

  getFullFontsCss,
  getFonts,
  addFontMetadataIfNeeded,
  getWorkbooksUsedByFonts,
  getAllFontsWithUsedWorkbooks,

  createNewScrollbarTheme,
  updateScrollbarTheme,
  deleteScrollbarTheme,
  getAllThemes,
}
