# syntax = docker/dockerfile:1.3

FROM node:24-bullseye-slim AS base

LABEL maintainer="GPW"
ENV TZ=UTC

RUN echo $TZ > /etc/timezone && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    apt update -q && \
    apt install -yq --no-install-recommends ca-certificates curl git ssh wget python3 make build-essential && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -pv ~/.ssh; \
    ssh-keyscan github.com >> ~/.ssh/known_hosts; \
    ssh-keyscan -p 443 ssh.github.com >> ~/.ssh/known_hosts; \
    ssh-keyscan gitlab.com >> ~/.ssh/known_hosts; \
    ssh-keyscan -p 443 altssh.gitlab.com >> ~/.ssh/known_hosts; \
    echo "StrictHostKeyChecking accept-new" >> /etc/ssh/ssh_config;

COPY --chmod=600 devops/docker/scripts/ssh-config ~/.ssh/config

WORKDIR /app

FROM base AS builder

COPY ./backend/package.json ./package.json
COPY ./backend/package-lock.json ./package-lock.json

RUN echo "unsafe-perm=true" > .npmrc

RUN --mount=type=ssh,mode=754,uid=0,gid=0 npm ci && \
    npm cache clean --force
