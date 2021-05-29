let app;

(async () => {

  let allItems = await fetchScanLog();
  let allFonts = await getAllFonts();

  app = new Vue({
    el: '#app',
    data: {
      message: 'Hello Vue!',
      log: allItems,
      fonts: allFonts,

      selectedTab: "scanLog",
    },
    methods: {
      reloadFonts() {
        Promise.all([ fetchScanLog(), getAllFonts() ])
          .then(([log, fonts]) => {
            this.log = log;
            this.fonts = fonts;
          });
      },
    },
  });


})()


async function reloadScanlogAndFonts() {
}

// TABS
// ----

Vue.component('tab-selector', {
  props: [ 'id', 'value'],
  computed: {
    isSelected() {
      return this.id == this.value;
    },
  },
  methods: {
    selectTab() {
      this.$emit('input', this.id);
    },
  },
  template: `
      <a class="tab-selector" :class="{ 'is-selected': isSelected }" @click="selectTab">
      <slot></slot>
    </a>
  `,
});


Vue.component('tab-container', {
  props: ['id', 'selected'],
  computed: {
    isSelected() {
      return this.id == this.selected;
    },
  },
  template: `
    <div class="tab-container" :style="{display: isSelected ? 'block' : 'none' }">
      <slot></slot>
    </div>
  `
});

// LOG TABLE
// ---------

Vue.component('log-table', {
  props: [ 'rows', 'fonts' ],
  data: function() {
    return {};
  },
  template: `
  <div>
    <div class="toolbar">
      <button class="refresh-button" @click="$emit('refresh')">Refresh list</button>
    </div>

    <table class="log-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Workbook</th>
          <th>Site</th>
          <th>Fonts</th>
        </tr>
      </thead>
      <tbody>
        <log-row v-for="row in rows" :key="row.id" :value="row" :fonts="fonts">
        </log-row>
      </tbody>
    </table>

  </div>
  `,
});


// LOG ROW
// -------


// Define a new component called button-counter
Vue.component('log-row', {
  props: [ 'value', 'fonts' ],
  data: function () {
    return {
      count: 0,
    }
  },
  template: `
  <tr>
    <td>{{ value.created_at }}</td>
    <td>{{ value.workbook_name }}</td>
    <td>{{ value.site_name }}</td>
    <td>
      <ul class="fonts-list">
        <li v-for="font in value.fonts_used">
          <font-status :name="font" :fonts="fonts"></font-status>
        </li>
      </ul>
    </td>
  </tr>
  `
})


Vue.component('font-status', {
  props: [ 'name', 'fonts' ],
  computed: {
    isInstalled() {
      // Vue observables do not support for..of loops.... :(
      for (let i=0; i < this.fonts.length; ++i) {
        const font = this.fonts[i];

        if (font.font_name === this.name) {
          return font.is_installed;
        }
      }
      return false;
    },
  },
  template: `
  <span class="font-status" :class="{ 'installed': isInstalled, 'not-installed': !isInstalled }">
    {{ name }}
  </span>
  `,
});



// HTTP IO
// -------

// Fetch the scan log from the server
async function fetchScanLog() {
  let res = await axios({
    method: "GET",
    url: "/scanlog",
    dataType: "json",
  });

  return res.data.data
}


async function getAllFonts() {
  let res = await axios({
    method: "GET",
    url: "/fonts",
    dataType: "json",
  });
  return res.data.fonts;
}

