FROM nginx:1.27-alpine

COPY coolify/landing/nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

COPY index.html landing.css ./
COPY landing-urls.js landing-drive-video.js landing-plans.js landing-anti-inspect.js problem-carousel.js results-carousel.js ./
COPY assets/ ./assets/

EXPOSE 80
