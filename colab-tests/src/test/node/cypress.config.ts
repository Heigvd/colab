import { defineConfig } from 'cypress'

export default defineConfig({
  env: {
    'cypress-react-selector': {
      root: '#root',
    },
  },
  reporter: 'junit',
  reporterOptions: {
    mochaFile:
      '../../../target/surefire-reports/TEST-ch.colabproject.colab.tests.e2e.CypressTest.[hash].xml',
    rootSuiteTitle: 'ch.colabproject.tests.e2e',
    testsuitesTitle: 'Cypress Test Suite',
    suiteTitleSeparatedBy: '.',
    useFullSuiteTitle: true,
    jenkinsMode: true,
    testCaseSwitchClassnameAndName: true,
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
  },
})
