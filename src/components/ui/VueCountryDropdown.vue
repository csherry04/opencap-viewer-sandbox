<template>
  <label class="vue-country-select">
    <span class="country-name" v-if="showNameInput">Country</span>
    <select
      class="country-select-input"
      :value="selectedIso2"
      @change="selectCountry($event.target.value)"
    >
      <option
        v-for="country in orderedCountries"
        :key="country.iso2 || 'not-selected'"
        :value="country.iso2"
      >
        {{ countryLabel(country) }}
      </option>
    </select>
  </label>
</template>

<script>
import allCountries from '@/util/allCountries.js'

export default {
  name: 'VueCountryDropdown',
  props: {
    preferredCountries: {
      type: Array,
      default: () => []
    },
    defaultCountry: {
      type: String,
      default: ''
    },
    immediateCallSelectEvent: {
      type: Boolean,
      default: false
    },
    enabledCountryCode: {
      type: Boolean,
      default: true
    },
    showNameInput: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedIso2: ''
    }
  },
  computed: {
    orderedCountries() {
      const preferred = this.preferredCountries.map(country => String(country).toUpperCase())
      const preferredCountries = preferred
        .map(iso2 => allCountries.find(country => country.iso2 === iso2))
        .filter(Boolean)
      const remainingCountries = allCountries.filter(country => !preferred.includes(country.iso2))

      return [...preferredCountries, ...remainingCountries]
    }
  },
  watch: {
    defaultCountry: {
      immediate: true,
      handler(value) {
        const nextIso2 = value ? String(value).toUpperCase() : ''
        if (nextIso2 !== this.selectedIso2) {
          this.selectedIso2 = nextIso2
          if (this.immediateCallSelectEvent) {
            this.emitSelected()
          }
        }
      }
    }
  },
  methods: {
    countryLabel(country) {
      if (!this.enabledCountryCode || !country.dialCode) {
        return country.name
      }

      return `${country.name} +${country.dialCode}`
    },
    selectCountry(iso2) {
      this.selectedIso2 = iso2
      this.emitSelected()
    },
    emitSelected() {
      const country = allCountries.find(country => country.iso2 === this.selectedIso2) || allCountries[0]

      this.$emit('onSelect', {
        name: country.name,
        iso2: country.iso2,
        dialCode: country.dialCode
      })
    }
  }
}
</script>

<style scoped>
.vue-country-select {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.country-name {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  line-height: 1;
  margin-bottom: 4px;
}

.country-select-input {
  width: 100%;
  min-height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 4px;
  background: transparent;
  color: #fff;
  font: inherit;
  padding: 0 12px;
}

.country-select-input option {
  color: #222;
}
</style>
