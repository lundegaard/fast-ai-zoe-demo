FROM node:10-jessie as builder
COPY yarn.lock /sources/yarn.lock
COPY package.json /sources/package.json

WORKDIR /sources

RUN set -xe \
    && yarn install --non-interactive

COPY docker/docker_env /sources/.env.production
COPY . /sources
ARG API_URL
ARG SA_DISTRIBUTION_URL
RUN set -ex \
    && ls -la /sources \
    && echo "SA_DISTRIBUTION_URL=${SA_DISTRIBUTION_URL}" >> /sources/.env.production \
    && echo "API_URL=${API_URL}" >> /sources/.env.production \
    && yarn build

FROM nginx:stable

COPY docker/etc_nginx_conf.d/default.conf /etc/nginx/conf.d/default.conf
COPY docker/error.html /var/www/default/error.html

# Set up nginx
RUN set -xe \
        && mkdir -p /usr/share/nginx/html

# Final output is added under /demo (due to redirecting for platform nginx)
COPY --from=builder /sources/public /usr/share/nginx/html/demo/
