Vue.component('fonts-table', {
  props: ['fonts'],
  // data: function() {
  //   return {
  //     fonts: [],
  //   };
  // },

  // mounted() {
  //   getAllFonts().then(res => {
  //     this.fonts = res.fonts;
  //   });
  // },

  template: `
    <div class="fonts-table">

      <div class="toolbar">
        <button class="refresh-button" @click="$emit('refresh')">Refresh list</button>
      </div>

      <table>
        <thead>
        </thead>
        <tbody>
          <fonts-table-row v-for="font in fonts" :key="font.font_name" :value="font">
          </fonts-table-row>
        </tbody>
      </table>
    </div>
  `,
});


Vue.component('fonts-table-row', {
  props: ['value'],
  template: `
    <tr>
      <td>{{ value.is_installed }}</td>
      <td>{{ value.font_name }}</td>
      <td>{{ value.css_for_font }}</td>
      <td>
          <workbooks-list :workbooks=value.workbooks></workbooks-list>
      </td>
    </tr>
  `,
});


Vue.component('workbooks-list', {
  props: [ 'workbooks' ],
  data() {
    return {
      isClosed: true,
    }
  },
  computed: {
    hasWorkbooks() { return this.workbooks.length > 0; },
  },
  methods: {
    toggleClosed() {
      this.isClosed = !this.isClosed;
    },
  },
  template: `
    <div class="workbooks-list">
      <span class="count">
        {{ workbooks.length }} workbook(s)
      </span>

      <button v-if="hasWorkbooks" @click="toggleClosed">
        {{ isClosed ? 'Show list' : 'Hide list' }}
      </button>

      <table v-if="!isClosed" class="workbooks-list-wrapper">
        <thead>
          <tr>
            <th>Name</th>
            <th>LUID</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(workbook, idx) in workbooks" :key="idx">
            <td>{{ workbook.name }}</td>
            <td>{{ workbook.id }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
});


// async function getAllFonts() {
//   let res = await axios({
//     method: "GET",
//     url: "/fonts",
//     dataType: "json",
//   });
//   return res.data;
// }
