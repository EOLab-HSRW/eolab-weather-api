# eolab-weather-api
 The software behind our weather api for our weather station in Kamp-Lintfort.

# Building and starting
 The server has first to be build with `docker compose build`. It can then be started by `docker compose up -d`. Don´t forget to rename `docker-compose.template.yaml` to `docker-compose.yaml`.
 The environment values can both be set in a `.env` file or in the environment section in the `docker-compose.yaml`.