//import DataLoader from 'dataloader';
const DataLoader = require('dataloader');

//import express from 'express';
const express = require('express');

//import fetch from 'node-fetch';
const fetch = require('node-fetch');

//import graphqlHTTP from 'express-graphql';
const graphqlHTTP = require('express-graphql');

//import schema from './schema';
const schema = require('./schema');

const BASE_URL = 'https://www.geysertimes.org/api/v5';

let _geysers;

let geysers = function(refresh = false, requiredID) {
    return new Promise((resolve, reject) => {

        // Refresh if indicated OR geysers are not cached locally OR requiredID is not found in _geysers
        refresh = refresh || !_geysers || requiredID && !_geysers.find(geyser => geyser['id'] == requiredID);

        // Resolve if refresh is not necessary
        if (!refresh) {
            resolve(_geysers);
            return;
        }

        // Fetch geysers as last resort
        fetch(`${BASE_URL}/geysers`)
            .then(res => res.json())
            .then(json => {
                _geysers = json.geysers;
                resolve(_geysers);
            });
    })
};

function getGeyserByID(id) {
    return geysers(false, id)
        .then(res => res.find(geyser => geyser['id'] == id))
}

function getLastEruptionByGeyserID(id) {
    return fetch(`${BASE_URL}/entries_latest/${id}`)
        .then(res => res.json())
        .then(json => json.entries.length ? json.entries[0] : null)
}

function getPredictionByGeyserID(id) {
    return fetch(`${BASE_URL}/predictions_latest/${id}`)
        .then(res => res.json())
        .then(json => json.predictions.length ? json.predictions[0] : null)
}

const app = express();

app.use(graphqlHTTP(req => {
    const geyserLoader = new DataLoader(
        keys => Promise.all(keys.map(getGeyserByID))
    )
    const predictionLoader = new DataLoader(
        keys => Promise.all(keys.map(getPredictionByGeyserID))
    )

    const lastEruptionLoader = new DataLoader(
        keys => Promise.all(keys.map(getLastEruptionByGeyserID))
    )

    const loaders = {
        geyser: geyserLoader,
        prediction: predictionLoader,
        lastEruption: lastEruptionLoader
    }
    return {
        context: {loaders},
        schema,
        graphiql: true,
    }
}))

app.listen(process.env.PORT || 5000)