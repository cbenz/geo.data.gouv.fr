import { injectLocale } from 'common/i18n/helpers'

import HomeContainer from './containers/HomeContainer'

export default (store, i18n) => ({
  getComponent(nextState, cb) {
    i18n.availableLanguages.forEach(lang => {
      injectLocale(i18n, {
        locale: lang,
        namespace: 'Home',
        resources: require(`./locales/${lang}.json`)
      })
    })

    cb(null, HomeContainer)
  }
})