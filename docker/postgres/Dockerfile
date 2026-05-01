FROM postgres:16-alpine

ENV POSTGRES_DB=laravel
ENV POSTGRES_USER=laravel
ENV POSTGRES_PASSWORD=secret

COPY init/ /docker-entrypoint-initdb.d/

EXPOSE 5432
