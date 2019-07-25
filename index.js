// import DataLoader from 'dataloader';
const DataLoader = require('dataloader')

// import express from 'express';
const express = require('express')

// import fetch from 'node-fetch';
const fetch = require('node-fetch')

// import graphqlHTTP from 'express-graphql';
const graphqlHTTP = require('express-graphql')

// import schema from './schema';
const schema = require('./schema')

const BASE_URL = 'https://www.geysertimes.org/api/v5'

let _geysers

const geysers = function (refresh = false, requiredID) {
  return new Promise((resolve, reject) => {
    // Refresh if indicated OR geysers are not cached locally OR requiredID is not found in _geysers
    refresh =
      refresh ||
      !_geysers ||
      (requiredID &&
        !_geysers.find(
          geyser =>
            geyser['id'] == requiredID ||
            geyser['idString'] ==
              String(requiredID)
                .toLowerCase()
                .replace(' ', '+')
        ))

    // Resolve if refresh is not necessary
    if (!refresh) {
      resolve(_geysers)
      return
    }

    // Fetch geysers as last resort
    fetch(`${BASE_URL}/geysers`)
      .then(res => res.json())
      .then(json => {
        _geysers = json.geysers.map(geyser => {
          geyser['idString'] = geyser['name'].toLowerCase().replace(' ', '+')
          return geyser
        })
        resolve(_geysers)
      })
  })
}

function getGeyserByID (id) {
  return geysers(false, id).then(res =>
    res.find(
      geyser =>
        geyser['id'] == id ||
        geyser['idString'] ==
          String(id)
            .toLowerCase()
            .replace(' ', '+')
    )
  )
}

function getLastEruptionByGeyserID (id) {
  return fetch(`${BASE_URL}/entries_latest/${id}`)
    .then(res => res.json())
    .then(json => (json.entries.length ? json.entries[0] : null))
}

function getRecentEruptions ({ geysers, range, offset }) {
  geysers = geysers || []
  range = parseInt(range) || 24 * 60 * 60
  offset = parseInt(offset) || 0

  const end = Math.floor(new Date().getTime() / 1000) - offset
  const start = end - range

  let url = `${BASE_URL}/entries/${start}/${end}`

  geysers = geysers // .map(geyser => parseInt(geyser))
    .filter((value, index, self) => self.indexOf(value) === index)
    .filter(geyser => geyser)

  if (geysers.length) {
    url += `/${geysers.join(';')}`
  }

  return fetch(url)
    .then(res => res.json())
    .then(json =>
      json.entries
        .filter(eruption => eruption.primaryID == eruption.eruptionID)
        .sort((a, b) => {
          const timeA = parseInt(a.time)
          const timeB = parseInt(b.time)

          if (timeA < timeB) {
            return 1
          }

          if (timeA > timeB) {
            return -1
          }

          return 0
        })
    )
}

function getEruptionByID (id) {
  return fetch(`${BASE_URL}/entries/${id}`)
    .then(res => res.json())
    .then(json => (json.entries.length ? json.entries[0] : null))
}

function getPredictions ({ userID, geysers }) {
  let url = `${BASE_URL}/predictions_latest`
  userID = parseInt(userID) || 44

  if (geysers) {
    geysers = geysers // .map(geyser => parseInt(geyser))
      .filter((value, index, self) => self.indexOf(value) === index)
      .filter(geyser => geyser)

    if (geysers.length) {
      url += `/${geysers.join(';')}`
    }
  }

  return fetch(url)
    .then(res => res.json())
    .then(json =>
      json.predictions
        .filter(prediction => prediction.userID == `${userID}`)
        .sort((a, b) => {
          const timeA = parseInt(a.prediction)
          const timeB = parseInt(b.prediction)

          if (timeA > timeB) {
            return 1
          }

          if (timeA < timeB) {
            return -1
          }

          return 0
        })
    )
}

function getPredictionByGeyserID (id) {
  return fetch(`${BASE_URL}/predictions_latest/${id}`)
    .then(res => res.json())
    .then(json => (json.predictions.length ? json.predictions[0] : null))
}

const app = express()

app.use(
  graphqlHTTP(req => {
    const geyserLoader = new DataLoader(keys =>
      Promise.all(keys.map(getGeyserByID))
    )

    const predictionsLoader = new DataLoader(keys =>
      Promise.all(keys.map(getPredictions))
    )
    const predictionLoader = new DataLoader(keys =>
      Promise.all(keys.map(getPredictionByGeyserID))
    )

    const recentEruptionsLoader = new DataLoader(keys =>
      Promise.all(keys.map(getRecentEruptions))
    )

    const eruptionLoader = new DataLoader(keys =>
      Promise.all(keys.map(getEruptionByID))
    )

    const lastEruptionLoader = new DataLoader(keys =>
      Promise.all(keys.map(getLastEruptionByGeyserID))
    )

    const loaders = {
      geyser: geyserLoader,
      prediction: predictionLoader,
      predictions: predictionsLoader,
      eruption: eruptionLoader,
      recentEruptions: recentEruptionsLoader,
      lastEruption: lastEruptionLoader
    }
    return {
      context: { loaders },
      schema,
      graphiql: true
    }
  })
)

app.listen(process.env.PORT || 5000)
