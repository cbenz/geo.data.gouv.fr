import React, { Component } from 'react'
import Errors from '../Errors/Errors'
import Publishing from '../Publication/Publishing'
import PublishingSection from '../Publication/PublishingSection'
import OrganizationCardSection from './OrganizationCardSection'
import { fetchOrganizationMetrics, getOrganizationDetail, getUser, getOrganization, fetchCatalog } from '../../fetch/fetch'
import { waitForDataAndSetState, cancelAllPromises } from '../../helpers/components'

class Organization extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      organization: null,
      metrics: null,
      catalog: null,
      errors: [],
    }
  }

  componentWillMount() {
    return Promise.all([
      this.updateUser(),
      this.updateMetrics(),
      this.updateOrganization(),
      this.updateOrganizationDetail(),
    ])
  }

  componentWillUnmount() {
    return cancelAllPromises(this)
  }

  updateUser() {
    return waitForDataAndSetState(getUser(), this, 'user')
  }


  updateMetrics() {
    return waitForDataAndSetState(fetchOrganizationMetrics(this.props.params.organizationId), this, 'metrics')
  }

  updateOrganization() {
    return waitForDataAndSetState(getOrganization(this.props.params.organizationId), this, 'organization')
      .then(() => waitForDataAndSetState(fetchCatalog(this.state.organization.sourceCatalog), this, 'catalog'))
  }

  updateOrganizationDetail() {
    return waitForDataAndSetState(getOrganizationDetail(this.props.params.organizationId), this, 'organizationDetail')
  }

  render() {
    const { user, organizationDetail, metrics, catalog, errors } = this.state
    const component = <OrganizationCardSection {...this.state} />
    const section = <PublishingSection title={'Organisation'} component={component} toWait={(organizationDetail && catalog && metrics)} />

    if (errors.length) {
      return <Errors errors={errors} />
    } else if (user && organizationDetail) {
      return <Publishing user={user} organization={organizationDetail} section={section} />
    } else {
      return null
    }
  }
}

export default Organization
