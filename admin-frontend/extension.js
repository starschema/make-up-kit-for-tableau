// This will contain the current theme data, and is used by the
let SCROLLBAR_THEME_TO_APPLY = null;

const DEFAULT_SETTINGS = `{
  "id": false,
  "testRegexp": ".*",
  "weight": -1,
  "color": "#05ff2f",
  "backgroundColor": "#666666",
  "radius": 24,
  "width": 16,
  "inset": 3
}`;

const SETTINGS_KEY = "theme";


function getThemeConfig() {
  // let settingsJson = DEFAULT_SETTINGS;
  let settingsJson = tableau.extensions.settings.get(SETTINGS_KEY) || DEFAULT_SETTINGS;
  return JSON.parse(settingsJson);
}

(function () {
  const popupUrl = 'configure.html';
  const defaultIntervalInMin = '5';

  tableau.extensions.initializeAsync({configure}).then(function() {

    let theme = getThemeConfig();
    console.log("setting theme: theme", theme);
    document.body.innerHTML += `<div id='scrollbar-theme-to-apply' style="display:none">${JSON.stringify(theme)}</div>`

  }, function(err) {

    // something went wrong in initialization
  });

  function configure() {
    // ... code to configure the extension
    // for example, set up and call displayDialogAsync() to create the configuration window
    // and set initial settings (defaultIntervalInMin)
    // and handle the return payload
    // ...
    tableau.extensions.ui.displayDialogAsync(popupUrl, defaultIntervalInMin, { height: 500, width: 500 }).then((closePayload) => {
      // The promise is resolved when the dialog has been expectedly closed, meaning that
      // the popup extension has called tableau.extensions.ui.closeDialog.
      // ...

      // The close payload is returned from the popup extension via the closeDialog() method.
      // ....

    }).catch((error) => {
      //  ...
      // ... code for error handling
    });
  }
}());
