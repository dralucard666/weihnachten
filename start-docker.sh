#!/bin/bash

# Copy docker-compose configuration
cp docker-compose.yml.old docker-compose.yml

# Rebuild and restart containers
docker compose down && docker-compose up -d --build
