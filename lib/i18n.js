import i18n from 'i18next'
import XHR from 'i18next-xhr-backend'
import moment from 'moment'

const dev = process.env.NODE_ENV !== 'production'

const languages = [
  'fr',
  'en'
]

if (!i18n.isInitialized) {
  // eslint-disable-next-line import/no-named-as-default-member
  i18n
    .use(XHR)
    .init({
      fallbackLng: 'fr',
      load: 'languageOnly',
      lowerCaseLng: true,

      ns: ['common'],
      defaultNS: 'common',
      whitelist: [...languages],

      saveMissing: dev,

      interpolation: {
        escapeValue: false,
        formatSeparator: ',',
        format: (value, format) => {
          if (format === 'uppercase') {
            return value.toUpperCase()
          }

          return value
        }
      },

      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
        addPath: '/locales/add/{{lng}}/{{ns}}'
      }
    })

  // eslint-disable-next-line import/no-named-as-default-member
  i18n.on('languageChanged', lang => {
    moment.locale(lang)
  })
}

export default i18n
