import React, { Component } from 'react'
import { browserHistory } from 'react-router'
import { search, buildSearchQuery } from '../../fetch/fetch'
import { waitForDataAndSetState, cancelAllPromises } from '../../helpers/components'
import SearchInput from '../SearchInput/SearchInput'
import ContentLoader from '../Loader/ContentLoader'
import DatasetPreview from './DatasetPreview'
import WrappedPagination from '../Pagination/WrappedPagination'
import Facets from '../Facets/Facets'
import Filter from '../Filter/Filter'
import { addFilter, removeFilter } from '../../helpers/manageFilters'

const styles = {
  results: {
    display: 'flex',
    margin: '4em',
  },
  searchInputWrapper: {
    margin: '4em',
  },
  loader: {
    textAlign: 'center',
    marginTop: '5em',
  },
  paginationWrapper: {
    display: 'flex',
    justifyContent: 'center',
    margin: '0 4em 2em',
  },
}

class Datasets extends Component {
  constructor(props) {
    super(props)
    this.state = {
      errors: [],
      ...props.query
    }
  }

  componentWillMount() {
    return this.search()
  }

  componentWillUnmount() {
    return cancelAllPromises(this)
  }

  search(changes = {}) {
    const params = Object.assign({}, this.state, changes);
    let { textInput, filters, offset, page } = params
    const query = buildSearchQuery(textInput, filters, page)
    let allFilters = filters

    if (!offset && page) {
      offset = (page - 1) * 20 // Comment remplacer 20 par limit
    }

    if (this.props.pathname  === 'datasets') {
      allFilters = [...filters, {name: 'availability', value: 'yes'}]
    }

    browserHistory.push(`${this.props.pathname}?${query}`)

    return waitForDataAndSetState(search(textInput, allFilters, offset), this, 'datasets')
  }

  renderResult() {
    const max = this.state.datasets ? Math.ceil(this.state.datasets.count / this.state.datasets.query.limit) : 0

    if (this.state.errors.length) {
      return <div>Une erreur est survenue.
                {this.state.errors.map((error, idx) => <p key={idx}>{error}</p>)}
              </div>
    }

    if (!this.state.datasets) {
      return <div style={styles.loader}><ContentLoader /></div>
    }

    if (!this.state.datasets.results.length) {
      return <div style={styles.results}>Aucun jeu de données trouvé.</div>
    }

    return (
      <div>
        <div style={styles.results}>
          <div>
            {this.state.datasets.results.map((dataset, idx) => <DatasetPreview key={idx} dataset={dataset} addFilter={(filter) => this.addFilter(filter)}/>)}
          </div>
          <Facets
            facets={this.state.datasets.facets}
            filters={this.state.filters}
            addFilter={(filter) => this.addFilter(filter)} />
        </div>

        <div style={styles.paginationWrapper}>
          <WrappedPagination max={max} initialSelected={this.state.page} handlePageClick={this.handlePageClick} />
        </div>
      </div>
    )
  }

  addFilter(filter) {
    const filters = addFilter(this.state.filters, filter)
    this.setState({filters})
    this.search({filters})
  }

  removeFilter(filter) {
    const filters = removeFilter(this.state.filters, filter)
    this.setState({filters})
    this.search({filters})
  }

  userSearch(textInput) {
    const changes = { textInput, filters: [], offset: undefined, page: undefined }
    this.setState(changes)
    this.search(changes)
  }

  handlePageClick = (data) => {
    const limit = this.state.datasets.query.limit
    const selected = data.selected
    const offset = Math.ceil(selected * limit)
    const page = (offset / limit) + 1

    this.setState({page, offset}, () => {
      this.search({offset})
    })
  }

  render() {
    return (
      <div style={styles.container}>
        <div style={styles.searchInputWrapper}>
          <SearchInput
            textInput={this.state.textInput}
            filters={this.state.filters}
            searchButton={true}
            handleTextChange={(textInput) => this.userSearch(textInput)} />

          {this.state.filters.map((filter, idx) => <Filter key={idx} filter={filter} onClick={(filter) => this.removeFilter(filter)} />)}
        </div>

        {this.renderResult()}

      </div>
    )
  }
}

export default Datasets
