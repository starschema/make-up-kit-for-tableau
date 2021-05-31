
let app;



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

async function getThemeConfig() {
  // let settingsJson = DEFAULT_SETTINGS;
  let settingsJson = tableau.extensions.settings.get(SETTINGS_KEY) || DEFAULT_SETTINGS;
  return JSON.parse(settingsJson);
}


async function saveThemeConfig(newConfig) {
  tableau.extensions.settings.set(SETTINGS_KEY, JSON.stringify(newConfig));
  // Todo: add error handling
  await tableau.extensions.settings.saveAsync();
}


// MAIN ENTRY POINT
// ----------------

tableau.extensions.initializeDialogAsync().then(function (openPayload) {


  (async () => {
    let theme = await getThemeConfig();

    app = new Vue({
      el: '#app',
      data: {
        theme,
      },
      methods: {
        save() {
          console.log("save", this.theme);
          saveThemeConfig(this.theme);
        },
      },
    });

  })();


});
