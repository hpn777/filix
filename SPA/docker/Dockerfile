FROM nginx:latest

#ENV http_proxy=${HTTP_PROXY}
#ENV https_proxy=${HTTPS_PROXY}

RUN apt-get update
RUN apt-get install -y wget

WORKDIR /home/

COPY ui-dash.tgz .
RUN tar -xzvf ui-dash.tgz -C /usr/share/nginx/html
