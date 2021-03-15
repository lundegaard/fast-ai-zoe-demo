#!/usr/bin/env bash
set -euo pipefail

echo "Building docker image for zoe-demo"
API_URL=http://localhost:80/api/v1
SA_DISTRIBUTION_URL=http://localhost:80/versions/stable
IMAGE_ID=docker.pkg.github.com/lundegaard/fast-ai-zoe-demo/zoe-demo
TAG=localhost

docker build ../ --file ../Dockerfile --tag ${IMAGE_ID}:${TAG} --build-arg API_URL=${API_URL} --build-arg SA_DISTRIBUTION_URL=${SA_DISTRIBUTION_URL}
