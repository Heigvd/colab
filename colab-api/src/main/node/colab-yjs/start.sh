#!/bin/bash

env

if [[ "$MODE" == 'dev' ]]; then
    echo Start Hot Dev
    yarn install
    yarn watch
else
    echo Start prod
    yarn start
fi