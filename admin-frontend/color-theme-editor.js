// COLOR EDITOR
// ------------


Vue.component('color-editor', {
  props: [ 'value' ],
  data: function() {
    return {
    };
  },
  computed: {
    css() {
      return toScrollBarCss(this.value);
    },

    widthValues() {
      return [12, 16, 18, 20, 22, 24, 28, 32, 48];
    },

    radiusValues() {
      return [0, 2, 4, 5, 7, 9, 10, 12, 16, 18, 20, 22, 24, 28, 32, 48];
    },
    offsetValues() {
      return [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 12];
    },

    isUnsaved() {
      return typeof this.value.id !== 'number';
    },

    themeData() {
      let { id, testRegexp, weight, color, backgroundColor, radius, width, inset, } = this.value;

      return { id, testRegexp, weight, color, backgroundColor, radius, width, inset, };
    },
  },
  methods: {
    saveNew() {
      createNewScrollbarTheme(this.themeData)
        .then(response => {
          this.$emit('change', response);
        })
    },

    saveExisting() {
      updateScrollbarTheme(this.themeData)
        .then(response => {
          this.$emit('change', response);
        });
    },

    setData(newData) {
      let {
        testRegexp,
        weight,
        color,
        backgroundColor,
        radius,
        width,
        inset,
        id,
      } = newData;

      this.id = id;
      this.testRegexp = testRegexp;
      this.weight = weight;
      this.color = color;
      this.backgroundColor = backgroundColor;
      this.radius = radius;
      this.width = width;
      this.inset = inset;
    },
  },
  template: `
    <div class='color-editor'>
      <text-input v-model="value.testRegexp" label="Test Regexp"></text-input>
      <help>
        A regular expression that will be checked against the name of the current workbook.
        If the title matches, then the heaviest matched scroll bar theme wins (see "Rule weight").

        To apply to all workbooks set it to <code>.*</code>.
      </help>

      <number-input v-model="value.weight" label="Weight"></number-input>
      <help>
        Used for finding out which style to apply if more then one style matches the name of the current workbook.
        If the current workbook's title matches, then the heaviest matched scroll bar theme wins (see "Rule weight").

      </help>





      <color-selector v-model='value.color' label='Scrollbar colour'></color-selector>
      <help>
        The colour of the scrollbar.
      </help>

      <color-selector v-model='value.backgroundColor' label='Background'></color-selector>
      <help>
        The colour of the scroll area.
      </help>

      <size-selector v-model="value.width" label="Width" :values="widthValues"></size-selector>
      <help>
        The width of the scrollbar
      </help>

      <size-selector v-model="value.radius" label="Radius" :values="radiusValues"></size-selector>
      <help>
        The radius of the rounding of the scroll bar. When set to zero the scrollbar is all square angles.
      </help>

      <size-selector v-model="value.inset" label="Inset" :values="offsetValues"></size-selector>
      <help>
        The amount of space between the scrollbar and the scroll area.
      </help>

      <component is="style">
        {{css}}
      </component>

      <pre :style="{overflow: 'scroll', height: '200px'}">
        {{ css }}

        {{ themeData }}
      </pre>

      <div v-if="isUnsaved">
        <button @click="saveNew">Create new Theme</button>
      </div>

      <div v-if="!isUnsaved">
        <button @click="saveExisting">Save Theme</button>
      </div>
    </div>
  `,
});


let lastId = 0;


Vue.component('help', {
  template: `<p class='help'><slot></slot></p>`,
});

Vue.component('color-selector', {
  props: ['label', 'value'],
  data: () => {
    return {
      id: `color-selector-${lastId++}`
    }
  },
  methods: {
    valueChanged(e) {
      let value = e.target.value;
      this.$emit('input', value);
    },
  },
  template: `
  <div class='input-row color-selector'>
    <input type='color' :id='id' :value='value' @input='valueChanged' />
    <label :for='id' >{{ label }}</label>
  </div>
  `,
});


Vue.component('size-selector', {
  props: ['label', 'value', 'values'],
  data: () => {
    return {
      id: `size-selector-${lastId++}`,
    }
  },
  methods: {
    valueChanged(e) {
      let value = e.target.value;
      this.$emit('input', value);
    },
  },
  template: `
  <div class='input-row size-selector'>
    <label :for='id' >{{ label }}</label>
    <select :id='id' :value='value' @change="$emit('input', $event.target.value)">
      <option v-for="x in values" :value="x">{{ x }} px</option>
    </select>
  </div>
  `,
});



Vue.component('text-input', {
  props: ['label', 'value'],
  data: () => {
    return {
      id: `text-input-${lastId++}`
    }
  },
  template: `
  <div class='input-row text-input'>
    <label :for='id' >{{ label }}</label>
    <input type='text' :id='id' :value='value' @input='$emit("input", $event.target.value)' />
  </div>
  `,
});

Vue.component('number-input', {
  props: ['label', 'value'],
  data: () => {
    return {
      id: `number-input-${lastId++}`
    }
  },
  template: `
  <div class='input-row number-input'>
    <label :for='id' >{{ label }}</label>
    <input type='number' :id='id' :value='value' @input='$emit("input", $event.target.value)' />
  </div>
  `,
});


// HTTP IO
// -------

// create a new theme
async function createNewScrollbarTheme(data) {
  let res = await axios({
    method: "POST",
    url: "/styles",
    dataType: "json",
    data,
  });
  return res.data;
}

// create a new theme
async function updateScrollbarTheme(data) {
  let id = data.id;
  if (typeof id !== 'number') {
    throw new Error(`no ID provided for data: ${JSON.stringify(data)}`);
  }

  let res = await axios({
    method: "PUT",
    url: `/styles/${id}`,
    dataType: "json",
    data,
  });
  return res.data;
}


// SCROLLBAR CSS
// -------------


function makeTheme() {
  return {
        testRegexp: "",
        weight: 0,
        color: '#777777',
        backgroundColor: '#cccccc',
        radius: 24,
        width: 16,
        inset: 3,
    id: null
  };
}

function toScrollBarCss(data, prefix='*') {

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

${prefix}::-webkit-scrollbar-track {
  background: ${backgroundColor};
}

${prefix}::-webkit-scrollbar-thumb {
  background-color: ${color};
  border-radius: ${radius}px;
  border: ${inset}px solid ${backgroundColor};
}
  `
}
