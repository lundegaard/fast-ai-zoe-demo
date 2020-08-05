#!/usr/bin/env bash

echo "Building docker image for zoe-demo"
API_URL=http://localhost:8080/api/v1
SA_DISTRIBUTION_URL=http://localhost:8081/versions/stable
IMAGE_ID=docker.pkg.github.com/lundegaard/fast-ai-zoe-demo/zoe-demo
TAG=localhost
docker build ../ --file ../Dockerfile --tag ${IMAGE_ID}:${TAG} --build-arg API_URL=${API_URL} --build-arg SA_DISTRIBUTION_URL=${SA_DISTRIBUTION_URL}
