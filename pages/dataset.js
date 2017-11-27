import React from 'react'
import PropTypes from 'prop-types'

import { _get } from '../lib/fetch'

import withI18n from '../components/hoc/with-i18n'

import Page from '../components/page'
import Meta from '../components/meta'
import Content from '../components/content'
import Container from '../components/container'
import Box from '../components/box'

import Producer from '../components/dataset/producer'
import Datagouv from '../components/dataset/datagouv'
import Organizations from '../components/dataset/organizations'

import Header from '../components/dataset/header'
import Downloads from '../components/dataset/downloads'

import Thumbnails from '../components/dataset/thumbnails'
import SpatialExtent from '../components/dataset/spatial-extent'

import { GEODATA_API_URL, DATAGOUV_API_URL } from '@env'

class DatasetPage extends React.Component {
  static propTypes = {
    dataset: PropTypes.shape({
      recordId: PropTypes.string.isRequired,
      metadata: PropTypes.shape({
        title: PropTypes.string.isRequired,
        thumbnails: PropTypes.array,
        spatialExtent: PropTypes.object,
        equivalentScaleDenominator: PropTypes.number,
        spatialResolution: PropTypes.object
      }).isRequired,

      organizations: PropTypes.array.isRequired,

      dataset: PropTypes.shape({
        distributions: PropTypes.array.isRequired
      }).isRequired
    }).isRequired,

    datagouvPublication: PropTypes.shape({
      remoteId: PropTypes.isRequired
    }),

    t: PropTypes.func.isRequired
  }

  static async getInitialProps({ query }) {
    const [dataset, publications] = await Promise.all([
      _get(`${GEODATA_API_URL}/records/${query.did}`),
      _get(`${GEODATA_API_URL}/records/${query.did}/publications`)
    ])

    const datagouvPublication = publications.find(p => p.target === 'dgv')

    return {
      dataset,
      datagouvPublication
    }
  }

  state = {
    datagouvDatasetPromise: null
  }

  componentDidMount() {
    const { datagouvPublication } = this.props

    // Let’s not depend too much on data.gouv.fr’s availability, so we’re
    // fetching this after the page has loaded.
    if (datagouvPublication && datagouvPublication.remoteId) {
      this.setState(() => ({
        datagouvDatasetPromise: _get(`${DATAGOUV_API_URL}/datasets/${datagouvPublication.remoteId}/`)
      }))
    }
  }

  render() {
    const { dataset: { recordId, metadata, dataset, organizations }, datagouvPublication, t } = this.props
    const { datagouvDatasetPromise } = this.state

    const hasThumbnails = metadata.thumbnails && metadata.thumbnails.length > 0

    return (
      <Page>
        <Meta title={metadata.title} />

        <Content clouds>
          <Container fluid>
            <div className='container'>
              <div className='left'>
                <Box title={t('blocks.producer')}>
                  {datagouvPublication && (
                    <div className='producer'>
                      <Producer promise={datagouvDatasetPromise} />
                    </div>
                  )}
                  <div className='organization'>
                    <Organizations organizations={organizations} />
                  </div>
                </Box>

                <Box title={t('blocks.datagouv')}>
                  <Datagouv
                    license={metadata.license}
                    organizations={organizations}
                    distributions={dataset.distributions}
                    publication={datagouvPublication}
                  />
                </Box>
              </div>
              <div className='main'>
                <Box>
                  <Header metadata={metadata} />
                </Box>
                <Box title={t('blocks.downloads')}>
                  <Downloads distributions={dataset.distributions} />
                </Box>
              </div>
              {(hasThumbnails || metadata.spatialExtent) && (
                <div className='right'>
                  {hasThumbnails && (
                    <Box title={t('blocks.thumbnails')}>
                      <Thumbnails recordId={recordId} thumbnails={metadata.thumbnails} />
                    </Box>
                  )}
                  {metadata.spatialExtent && (
                    <Box title={t('blocks.spatialExtent')}>
                      <SpatialExtent
                        extent={metadata.spatialExtent}
                        scale={metadata.equivalentScaleDenominator}
                        resolution={metadata.spatialResolution}
                      />
                    </Box>
                  )}
                </div>
              )}
            </div>
          </Container>
        </Content>

        <style jsx>{`
          .container {
            display: flex;
            flex-wrap: wrap;

            @media (max-width: 768px) {
              flex-direction: column;
            }
          }

          .left, .right {
            width: 370px;

            @media (max-width: 1680px) {
              width: 330px;
            }

            @media (max-width: 1480px) {
              width: 310px;
            }

            @media (max-width: 1280px) {
              width: 270px;
            }

            @media (max-width: 1080px) {
              width: 230px;
            }
          }

          .left {
            @media (max-width: 960px) {
              width: 290px;
            }

            @media (max-width: 768px) {
              width: 100%;
              order: 1;
            }
          }

          .right {
            @media (max-width: 960px) {
              flex: 1 0 100%;
            }

            @media (max-width: 768px) {
              width: 100%;
              order: 2;
            }
          }

          .main {
            flex: 1;
            margin: 0 20px;

            @media (max-width: 960px) {
              margin-right: 0;
            }

            @media (max-width: 768px) {
              margin-left: 0;
              order: 0;
            }
          }

          .producer + .organization {
            margin-top: 1.6em;
          }
        `}</style>
      </Page>
    )
  }
}

export default withI18n('dataset')(DatasetPage)
