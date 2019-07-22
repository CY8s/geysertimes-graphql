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

        // Refresh if indicated or geysers are not chacehd locally, or requiredID is not found in _geysers
        refresh = refresh || !_geysers || requiredID && !_geysers.find(geyser => geyser['id'] == requiredID);

        // Resolve if geysers are cached locally and refresh is not necessary
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

function getEruptionByURL(relativeURL) {
    return fetch(`${BASE_URL}${relativeURL}`)
        .then(res => res.json())
        .then(json => json.entries.length ? json.entries[0] : null)
}

function getPredictionByURL(relativeURL) {
    return fetch(`${BASE_URL}${relativeURL}`)
        .then(res => res.json())
        .then(json => json.predictions.length ? json.predictions[0] : null)
}

const app = express();

app.use(graphqlHTTP(req => {
    const geyserLoader = new DataLoader(
        keys => Promise.all(keys.map(getGeyserByID))
    )
    const predictionLoader = new DataLoader(
        keys => Promise.all(keys.map(getPredictionByURL))
    )

    const eruptionLoader = new DataLoader(
        keys => Promise.all(keys.map(getEruptionByURL))
    )

    const loaders = {
        geyser: geyserLoader,
        prediction: predictionLoader,
        eruption: eruptionLoader
    }
    return {
        context: {loaders},
        schema,
        graphiql: true,
    }
}))

app.listen(5000) 