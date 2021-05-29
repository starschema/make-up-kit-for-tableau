// COLOR THEMES TABLE
// ------------------


Vue.component('color-theme-table', {
  data() {
    return {
      themes: [],
      selected: false,
      currenlyEdited: null,
    };
  },
  mounted() {
    this.reloadAllAndDeselect();
  },

  methods: {
    setSelection(e) {
      let idx = e.idx;
      if (this.themes.length <= idx) {
        return;
      }

      this.selected = idx;
    },

    clearSelection() {
      this.selected = false;
    },

    addNewTheme() {
      let newTheme = makeTheme();
      this.themes.push(newTheme);
      this.selected = this.themes.length - 1;
    },

    reloadAll() {
      getScrollbarThemes()
        .then(v => {
          this.themes = v;
        })
    },

    reloadAllAndDeselect() {
      this.clearSelection();
      this.reloadAll();
    },

    selectedThemeChanged() {
      this.reloadAllAndDeselect();
    },

    deleteTheme(id) {
      deleteScrollbarTheme(id)
        .then(() => {
          this.reloadAllAndDeselect();
        })
    },

  },

  computed: {
    hasSelection() {
      return typeof this.selected === 'number';
    },
    selectedTheme() {
      if (!this.hasSelection || this.selected >= this.themes.length) {
        return null;
      }

      return this.themes[this.selected];
    },
  },
  template: `
  <div class="theme-editor">
    <div class="toolbar">
      <button class="add-button" @click="addNewTheme">Create new theme</button>
      <button class="refresh-button" @click="reloadAll">Refresh list</button>
    </div>

    <div class="themes-table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Workbook Name Regexp</th>
            <th>Rule Weight</th>
            <th>Color</th>
            <th>Background</th>
            <th>Width</th>
            <th>Radius</th>
            <th>Inset</th>
          </tr>
        </thead>
        <tbody>
          <color-table-row v-for="(row, idx) in themes" :key="row.id" :value="row" :idx="idx"
              @click="setSelection"
              @delete="deleteTheme">
          </color-table-row>
        </tbody>
      </table>
    </div>


    <div class="themes-editor-wrapper">
      <color-editor v-if="hasSelection" :value="selectedTheme" @change="selectedThemeChanged"></color-editor>
    </div>
  </div>
  `,
});


Vue.component('color-table-row', {
  props: [ 'idx', 'value' ],
  computed: {
    canBeDeleted() {
      return typeof this.value.id === 'number';
    },
  },
  methods: {
    selectThisRow() {
      console.log("Clicked", this.idx);
      this.$emit("click", {idx: this.idx, value: this.value});
    },
  },
  template: `
    <tr>
      <td>{{ value.testRegexp }}</td>
      <td>{{ value.weight }}</td>
      <td @click='selectThisRow()'><color-block :value="value.color"></color-block></td>
      <td><color-block :value="value.backgroundColor"></color-block></td>
      <td>{{ value.width }}</td>
      <td>{{ value.radius }}</td>
      <td>{{ value.inset }}</td>
      <td>
        <button v-if="canBeDeleted" @click="$emit('delete', value.id)">Delete</button>
      </td>
    </tr>
  `
});


Vue.component('color-block', {
  props: [ 'value' ],
  template: `
    <span :style="{ 'background-color': value, width: '100%', height: '100%', display: 'block' }">&nbsp;</span>
  `,
});


async function deleteScrollbarTheme(id) {
  let res = await axios({
    method: "DELETE",
    url: `/styles/${id}`,
    dataType: "json",
  });
  return res.data;
}

// get all themes
async function getScrollbarThemes() {
  let res = await axios({
    method: "GET",
    url: "/styles",
    dataType: "json",
  });
  return res.data;
}


// COLOR EDITOR
// ------------
