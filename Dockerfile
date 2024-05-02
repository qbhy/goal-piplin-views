FROM nginx:latest

RUN mkdir -p /var/www/views

COPY dist /var/www/views
COPY nginx.conf /etc/nginx/conf.d/default.conf
