const axios = require('axios');


async function doRequest(req) {
  console.log("%s %s", req.method, req.url);
  let response = await axios(req);
  console.log("%s (%s) %s %s", response.status, response.statusText, req.method, req.url);
  return response;
}


// login and create tableau session
async function login({server, apiVersion, siteContentUrl, username, password}) {
  let response = await doRequest({
    method: 'POST',
    url: `${server}/api/${apiVersion}/auth/signin`,
    headers: {
      'Accept': 'application/json',
    },
    data: {
      credentials: {
        name: username,
        password,
        site: {
          contentUrl: siteContentUrl,
        },
      },
    },
  }).catch(err => {
    console.error(err)
  });

  return {
    server,
    apiVersion,
    site: response.data.credentials.site,
    siteId: response.data.credentials.site.id,
    token: response.data.credentials.token,
  };

}

// log out a tableau session
async function logout(tableauSession) {
  let response = await doRequest({
    method: 'POST',
    url: `${tableauSession.server}/api/${tableauSession.apiVersion}/auth/signout`,
    headers: {
      'X-Tableau-Auth': tableauSession.token,
    },
  })
}



async function downloadWorkbook(tableauSession, workbookLuid) {
  let path = `/sites/${tableauSession.siteId}/workbooks/${workbookLuid}/content?includeExtract=false`;

  let response = await doRequest({
    method: 'GET',
    url: `${tableauSession.server}/api/${tableauSession.apiVersion}${path}`,
    headers: {
      'X-Tableau-Auth': tableauSession.token,

    },
    // we need to make sure we have the right data
    responseType: "arraybuffer",
  })

  return response.data;
}


async function getWorkbookMetadata(tableauSession, workbookLuid) {
  let path = `/sites/${tableauSession.siteId}/workbooks/${workbookLuid}`;

  let response = await doRequest({
    method: 'GET',
    url: `${tableauSession.server}/api/${tableauSession.apiVersion}${path}`,
    headers: {
      'X-Tableau-Auth': tableauSession.token,

    },
    // we need to make sure we have the right data
    responseType: "json",
  });


  return response.data;
}


module.exports = {
  login,
  logout,


  downloadWorkbook,
  getWorkbookMetadata,
}
