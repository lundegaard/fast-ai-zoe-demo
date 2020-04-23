FROM nginx:stable

COPY /maven/build/files/${ARCHIVE} /${ARCHIVE}

COPY yarn.lock /sources/yarn.lock
COPY package.json /sources/package.json
