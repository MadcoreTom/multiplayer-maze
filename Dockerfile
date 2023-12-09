FROM nginx:stable-alpine3.17-slim

# Copy in static content
COPY ./www /usr/share/nginx/html

# Install NodeJS
RUN apk update
RUN apk add nodejs

# Copy in server code and websocket proxy config
# COPY ./dist /server
COPY ./nginx-ws.conf /etc/nginx/conf.d/default.conf
COPY ./dist /gameserver

COPY ./script.sh /script.sh
CMD ["/script.sh"]