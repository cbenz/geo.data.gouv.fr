import React from 'react'
import PropTypes from 'prop-types'
import dynamic from 'next/dynamic'
import {translate} from 'react-i18next'

import MapIcon from 'react-icons/lib/fa/map'
import TableIcon from 'react-icons/lib/fa/table'

import {_get} from '../../../lib/fetch'

import Modal from '../../modal'
import Button from '../../button'

const CenteredMap = dynamic(import('../../centered-map'), {
  ssr: false,
  loading: translate()(({t}) => t('loading'))
})

const PreviewTable = dynamic(import('./preview-table'), {
  ssr: false,
  loading: translate()(({t}) => t('loading'))
})

class Preview extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired
  }

  state = {
    loading: true,
    data: null,
    view: 'map'
  }

  async componentDidMount() {
    const {link} = this.props

    try {
      const data = await _get(`${link}?format=GeoJSON&projection=WGS84`)

      this.setState({
        loading: false,
        data
      })
    } catch (err) {
      this.setState({
        loading: false,
        error: err
      })
    }
  }

  changeView = view => () => {
    this.setState(() => ({
      view
    }))
  }

  render() {
    const {title, onClose, t} = this.props
    const {loading, data, view, error} = this.state

    return (
      <Modal fluid fullHeight onClose={onClose} title={title}>
        {loading ? t('common:loading') : (
          <div className='preview'>
            <div className='actions'>
              <Button
                size='large'
                color={view === 'map' ? 'blue' : 'white'}
                onClick={this.changeView('map')}
              >
                <MapIcon />
              </Button>
              <Button
                size='large'
                color={view === 'table' ? 'blue' : 'white'}
                onClick={this.changeView('table')}
              >
                <TableIcon />
              </Button>
            </div>

            {error ? <span className='error'>{t('preview.errors.download')}</span> : (
              <div className='map-wrapper'>
                {view === 'map' ? (
                  <div className='map'>
                    <CenteredMap
                      vectors={data}
                      lat={47}
                      lon={1}
                      zoom={5.5}
                    />
                  </div>
                ) : (
                  <PreviewTable data={data} />
                )}
              </div>
            )}
          </div>
        )}

        <style jsx>{`
          @import 'colors';

          .preview {
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .error {
            color: $red;
          }

          .map-wrapper {
            flex: 1;
            position: relative;
            display: flex;
            flex-direction: column;
          }

          .map {
            position: absolute;
            height: 100%;
            width: 100%;
          }

          .actions {
            :global(button) {
              margin-right: 7px;
              margin-bottom: 10px;
            }
          }
        `}</style>
      </Modal>
    )
  }
}

export default translate('dataset')(Preview)
