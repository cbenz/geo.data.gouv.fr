import React from 'react'
import { shallow, mount } from 'enzyme'

const Datasets = require('proxyquire')('../Datasets', {
  '../../../../fetch/fetch': require('../../../../../fetch/__mocks__/fetch'),
  'react-router': {
    browserHistory: {push:  () => {}}
  }
}).default


describe('<Datasets />', () => {

  let wrapper
  let parentQuery

  beforeEach(() => {
    parentQuery = {
      textInput: 'text',
      page: 2,
      filters: [{name: 'filter1', value: 'value1'}],
    }

    // Simulate WrappedDatasets.setState, could be done with a spy instead.
    const updateQuery = changes => {
      parentQuery = {
        ...parentQuery,
        ...changes
      }
    }

    wrapper = shallow(<Datasets pathname={'pathname'} query={parentQuery} updateQuery={updateQuery} />)
  })

  describe('addFilter()', () => {
    it('should add filter and reset page and offset', () => {
      wrapper.instance().addFilter({name: 'filter2', value: 'value2'})

      expect(parentQuery.page).to.equal(1)
      expect(parentQuery.filters).to.deep.equal([{name: 'filter1', value: 'value1'}, {name: 'filter2', value: 'value2'}])
    })
  })

  describe('removeFilter()', () => {
    it('should remove filter and reset page and offset', () => {
      wrapper.instance().removeFilter({name: 'filter1', value: 'value1'})

      expect(parentQuery.page).to.equal(1)
      expect(parentQuery.filters).to.deep.equal([])
    })
  })

  describe('userSearch()', () => {
    it('should change textInput and reset datasets, offset and page', () => {
      const textInput = 'new seach'
      wrapper.instance().userSearch(textInput)

      expect(parentQuery.textInput).to.deep.equal(textInput)
      expect(parentQuery.filters).to.deep.equal([{name: 'filter1', value: 'value1'}])
      expect(parentQuery.page).to.equal(1)
    })
  })

  describe('handleChangePage()', () => {
    it('should update page and offset', () => {
      let query = {
        textInput: 'text',
        page: 2,
        filters: [{name: 'filter1', value: 'value1'}],
      }

      const updateQuery = changes => {
        query = {
          ...query,
          ...changes
        }
      }

      const wrapper = mount(<Datasets pathname={'pathname'} query={query} updateQuery={updateQuery} />)

      return wrapper.instance()
        .componentDidMount()
        .then(() => {
          wrapper.instance().handleChangePage({selected: 0})
          expect(query.page).to.equal(1)
        })
    })
  })

})