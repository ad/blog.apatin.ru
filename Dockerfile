ARG HUGO_VERSION="0.92.1-ext"
FROM klakegg/hugo:${HUGO_VERSION} as build
COPY ./ /site
WORKDIR /site
RUN hugo --minify

FROM nginx:alpine
COPY --from=build /site/public /usr/share/nginx/html
COPY --from=build /site/nginx.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
