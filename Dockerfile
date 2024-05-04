FROM node:18 as builder

WORKDIR /app

# Copy all source files
COPY . .

# Build the UmiJS project
RUN yarn && yarn build

# Stage 2: Serve with Nginx
FROM nginx:latest

RUN mkdir -p /var/www/views

COPY --from=builder /app/dist  /var/www/views
COPY nginx.conf /etc/nginx/conf.d/default.conf
