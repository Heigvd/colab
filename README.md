# colab
A Digital Lab for the co-Design, co-Development and co-Evaluation of Digital Learning Games

[![CI](https://github.com/Heigvd/colab/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Heigvd/colab/actions/workflows/ci.yml) [reports](https://heigvd.github.io/colab/)

## setup

### postgresql

#### Install
Install fresh postgresql in docker
```shell
docker run -d -p 5432:5432 -e POSTGRES_DB=colab -e POSTGRES_USER=colab -e POSTGRES_PASSWORD=<YOUR_SECRET_PASSWORD> --name colab_postgres -d postgres:13-alpine
```
You may want to add `--restart always` to the `docker run` command.

Setup a 2nd database for tests
#### Configure test database

```shell
echo "CREATE USER \"colab_test\" WITH PASSWORD '1234';
CREATE DATABASE \"colab_test\" OWNER \"colab_test\";" |  docker exec -it colab_postgres psql -U postgres
```

## Compile

### Tools & version to use
* java11 & maven
* node
* yarn


### command line
Rebuild everything with :
```bash
mvn clean install
```

Rebuild everything but skip tests with :
```bash
mvn -DskipTests clean install
```

### Maven Site
PMD and other tools may fails the build. You may want to consult human-readable reports.

Regenerate maven site:
```bash
mvn -Dreporting clean site ste:stage
```
And open ./target/staging/index.html

## Run (development)

### Configuration file
Copy './colab-webapp/src/default_colab.properties' to './colab-webapp/src/colab.properties' and edit the colab.
Edit './colab-webapp/src/colab.properties' to match
```
#
# coLAB properties
#######################

## Database
colab.database.user=colab
colab.database.password=<YOUR_SECRET_PASSWORD>
colab.database.name=colab
```

The './colab-webapp/src/colab.properties' is your own configuration file and will never be committed.
So you can safely put secrets in it.

start server with
```bash
cd colab-webapp
./run
```

You way have a look on run options:
```bash
./run -h
```

### Webpack dev server
Start a webpack dev server on localhost:3004
```bash
cd colab-webapp/src/main/webapp/app
yarn start
```
