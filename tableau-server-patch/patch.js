(async function(){
    console.log("hello")

    const HOST='http://localhost:3000';
    const CHECK_TIMER = 5000;


    async function getAllThemes() {
        let res = await $.ajax(`${HOST}/styles`);
        console.log(res);
        return res;
    }


    function getTsConfig() {
        return document.querySelector('iframe').contentWindow.tsConfig;
    }

    function getWorkbookName() {
        let tsConfig = getTsConfig();
        if (tsConfig && typeof tsConfig.workbookName == 'string') {
            return tsConfig.workbookName;
        }
        return '';
    }


    // find the theme if present
    function findThemeIfPresent(doc) {
        console.log("Running for el:", doc);

        let contents = doc.querySelectorAll('#scrollbar-theme-to-apply');
        if (contents.length > 0) {
            console.log("Found raw", contents)
            return contents[0];
        }

        for (const child of doc.querySelectorAll('iframe')) {

            contents = findThemeIfPresent(child.contentWindow.document);
            if (contents) {
                console.log("Found", contents)
                return contents;
            }
        }
        console.log("Closing ", doc)
        return null;
    }


    async function checkAndApplyStyles() {
        let workbookName = getWorkbookName();

        let existingThemes = await getAllThemes();
        console.log("existing: ", existingThemes);

        let matching = existingThemes.filter(t => {
            let rx = new RegExp(t.testRegexp);
            return rx.test(workbookName);
        });

        // sort in descending order by weight
        matching.sort((a,b) => parseFloat(b.weight) - parseFloat(a.weight) );

        console.log("matching themes sorted:", matching);

        let themeCss = '';
        if (matching.length > 0) {
            let matchedTheme = matching[0];
            themeCss = toScrollBarCss(matchedTheme);
        }

        $('#scrollbar-style-container').html(themeCss);

        $('body', $('iframe')[0].contentWindow.document).append(`<style>${themeCss}</style>`)
    }




    function toScrollBarCss(data, prefix='body *') {

      let color = data.color || 'auto';
      let backgroundColor = data.backgroundColor || 'auto';
      let width = data.width || 'auto';
      let pixelWidth = width;

      // 0 radius & radius is a thing
      let radius = data.radius || 0;
      let inset = data.inset || 0;


      return `
    /* Works on Firefox */
    ${prefix} {
      scrollbar-width: ${pixelWidth}px;
      scrollbar-color: ${color} ${backgroundColor};
    }

    /* Works on Chrome, Edge, and Safari */
    ${prefix}::-webkit-scrollbar {
      width: ${pixelWidth}px;
      height: ${pixelWidth}px;
    }

    ${prefix}::-webkit-scrollbar-track,
    ${prefix}::-webkit-scrollbar-corner,

    ${prefix}:hover::-webkit-scrollbar-track,
    ${prefix}:hover::-webkit-scrollbar-corner,

    .tab-tiledViewer::-webkit-scrollbar-track,
    :hover::-webkit-scrollbar-track,
    .tab-tiledViewer ::-webkit-scrollbar-track

     {
      background: ${backgroundColor} !important;
    }

    ${prefix}::-webkit-scrollbar-thumb,
    ${prefix}:hover::-webkit-scrollbar-thumb {
      background-color: ${color};
      border-radius: ${radius}px;
      border: ${inset}px solid ${backgroundColor};
    }


      `
    }


    //let o = findThemeIfPresent(document.body);
    //console.log(o)



    if ($('#scrollbar-style-container').length === 0) {
        $('body').append('<style id="scrollbar-style-container"></style>');
    }

    checkAndApplyStyles();

    //let watchInterval = setInterval(async () => await checkAndApplyStyles(), CHECK_TIMER);



}());
