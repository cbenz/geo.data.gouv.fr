import React from 'react'
import PropTypes from 'prop-types'
import {translate} from 'react-i18next'
import getConfig from 'next/config'

import CommentIcon from 'react-icons/lib/fa/comments'

import {_get, _post} from '../../../lib/fetch'

import Button from '../../button'
import RequireAuth from '../../require-auth'

import Form from './form'
import List from './list'

const {publicRuntimeConfig: {
  DATAGOUV_API_URL
}} = getConfig()

class Discussions extends React.Component {
  static propTypes = {
    remoteId: PropTypes.string.isRequired,
    t: PropTypes.func.isRequired
  }

  state = {
    expanded: false
  }

  componentDidMount() {
    this.refreshDiscussions()
  }

  refreshDiscussions = () => {
    const {remoteId} = this.props

    this.setState(() => ({
      discussionsPromise: _get(`${DATAGOUV_API_URL}/discussions/?for=${remoteId}`)
    }))
  }

  onExpand = () => {
    this.setState({
      expanded: true
    })
  }

  createDiscussion = async (title, comment) => {
    const {remoteId} = this.props

    await _post(`${DATAGOUV_API_URL}/discussions/`, {
      title,
      comment,
      subject: {
        id: remoteId,
        class: 'Dataset'
      }
    })

    this.refreshDiscussions()
  }

  createReply = async (discussionId, comment) => {
    await _post(`${DATAGOUV_API_URL}/discussions/${discussionId}/`, {
      comment
    })

    this.refreshDiscussions()
  }

  onSubmit = ({title, comment}) => {
    this.createDiscussion(title, comment)
  }

  renderAuth = user => (
    <div className='form'>
      <Form onSubmit={this.onSubmit} user={user} />
    </div>
  )

  render() {
    const {t} = this.props
    const {expanded, discussionsPromise} = this.state

    return (
      <div>
        <div className='discussions'>
          <List promise={discussionsPromise} onReply={this.createReply} />
        </div>

        {expanded ? (
          <RequireAuth message={t('discussions.loggedOutMessage')} render={this.renderAuth} />
        ) : (
          <Button onClick={this.onExpand}>
            <CommentIcon style={{verticalAlign: -2}} /> {t('discussions.new')}
          </Button>
        )}
        <style jsx>{`
          @import 'colors';

          .discussions {
            margin-bottom: 1em;
          }

          .form {
            border-left: 2px solid $blue;
            padding-left: 10px;
          }
        `}</style>
      </div>
    )
  }
}

export default translate('dataset')(Discussions)
