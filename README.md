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
CREATE DATABASE \"colab_test\" OWNER \"colab_test\";" |  docker exec colab_postgres psql -U colab
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
mvn -Dreporting clean -DskipTests install
mvn -Dreporting site site:stage
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

colab.default.admin.username=
colab.default.admin.email=
colab.default.admin.password=
```

The './colab-webapp/src/colab.properties' is your own configuration file and will never be committed.
So you can safely put secrets in it.

## Dev tooltips
One would not `mvn clean install` each time a small change is made.
Here is some hints to rebuild relevant modules only.

### Deploy the way
Simplest way to deploy the web app is to use the provided run script:
```bash
cd colab-webapp
./run
```
You way have a look on run options:
```bash
./run -h
```

### Hot re-deploy
Some commands listed below require to re-deploy the app.
You can do a full, complete reload by killing the ./run script and running it again.

Or you can do it the quick way: `touch colab-webapp/target/coLAB/.reload'

### Changes in the data model
Database refactoring is not enabled yet.
Database must be cleared so JPA will generate it again from scratch.
DB refactoring will be enabled once the model is quite stable.
```sql
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public AUTHORIZATION "<YOUR_PSQL_USER>";
```

As changing the data model is quite a big change, server, clients and webapp must be compiled:
```
mvn -DskipTests -pl colab-api,colab-client,colab-webapp install
```
re-deploy is required

### REST API
REST API changes requires to compile server, clients and webapp:
```
mvn -DskipTests -pl colab-api,colab-client,colab-webapp install
```
re-deploy is required

### Server internal changes
Since the API will not change,no need to recompile clients. Moreover, there is no need to rebuild
the webapp. This can be skipped by setting the skipWebappYarn property.
```
mvn -DskipTests -DskipWebappYarn -pl colab-api,colab-webapp install
```
re-deploy is required


### Webapp
The `mvn -pl colab-webapp install` command will compile a production version of the webapp.
This is not required for lcoal developemnt.

In this case, one would run the webpack dev-server with
```bash
cd colab-webapp/src/main/node/app
yarn start
```

The webapp will be available on http://localhost:3004

When using webpack-dev-server, one could add `-DskipWebappYarn` to each maven command
