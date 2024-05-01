FROM nginx:latest

RUN mkdir -p /var/www/views

COPY dist /var/www/views
