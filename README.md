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
create en email testing tool
#### Mail Hog
```
docker run -d --restart always -p 8025:8025 -p 1025:1025 mailhog/mailhog
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
Copy `./colab-webapp/default_colab.properties` to `./colab-webapp/colab.properties` and edit the colab.
Edit `./colab-webapp/colab.properties` to match
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

The `./colab-webapp/colab.properties` is your own configuration file and will never be committed.
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

When changes are made to the data model, the database must be updated to reflect these changes.

As explained above, two databases are used:
1. the first to run tests: the "colab\_test" database);
2. the second for live usage (local dev, prod, ...): the "colab" database.

The way in which these changes are reflected is different in each case.

#### Test database
The test database is automatically reset before running the tests (JPA drop-and-create strategy). Thus, all data are loss... But the database structure is up-to-date regarding the datamodel.


#### Live Database
Data loss is not an option for the live database. Thus, database must be thoroughly migrated to reflect the JPA model.

Such refactors are defined with the help of [LiquiBase](https://www.liquibase.org/). They are applied during the deploymenet of the webapp. They're stored in the `colab-api/src/main/resources/META-INF/dbchangelogs/`.

Writing those changeLogs may be painfull. Luckily, LiquiBase ships with handy tools ([dowload here](https://github.com/liquibase/liquibase/releases)) to ease writing changeLogs. We are especially interested in the `diffChangeLog` tool.

This tool compute a changeLog between a database and a reference. In our case, the database is the live database, the reference is the test database. Here is an script which stores the diff changeLog in a XML file named after the current timestamp.

```sh
#!/bin/bash

LIQUIBASE_FOLDER=<PATH TO THE LIQUIBASE FOLDER YOU JUST DOWNLOADED>

## The 'production' database
FROM_PG_HOST=localhost
FROM_PG_PORT=5432
FROM_DB_NAME=colab
FROM_USER=colab
FROM_PASSWORD=<PASSWORD>

## The 'test' database
TO_PG_HOST=localhost
TO_PG_PORT=5432
TO_DB_NAME=colab_test
TO_USER=colab_test
TO_PASSWORD=<PASSWORD>

FILENAME=`date +"%s"`.xml

${LIQUIBASE_FOLDER}/liquibase \
    --changeLogFile=${FILENAME} \
    --url="jdbc:postgresql://${FROM_PG_HOST}:${FROM_PG_PORT}/${FROM_DB_NAME}" \
    --username=${FROM_USER} \
    --password=${FROM_PASSWORD} \
    diffChangeLog \
    --referenceUrl="jdbc:postgresql://${TO_PG_HOST}:${TO_PG_PORT}/${TO_DB_NAME}" \
    --referencePassword=${TO_PASSWORD} \
    --referenceUsername=${TO_USER}

DIFF_RC=$rc

if [[ "$?" -ne 0 ]] ; then
  echo 'could not generate diff';
  exit $DIFF_RC;
else
  echo
  echo 'Sucessfull!'
  echo
  echo "Please review the changeLog (${FILENAME}) then";
  echo '  1. move it to the changelogs directory: '
  echo "       mv ${FILENAME} colab-api/src/main/resources/META-INF/dbchangelogs/"
  echo '  2. rebuild the war'
  echo '       mvn -pl colab-api,colab-webapp -DskipTests=true -DskipWebappYarn=true install'
  echo '  3. hot-deploy the app'
  echo '       touch colab-webapp/target/coLAB/.reload'
  echo
  exit $DIFF_RC;
fi
```

#### Summary
1. Do changes in the datamodel and re-build colab-api
1. Run any test (eg. `ProjectRestEndpointTest#testUpdateProject`)
1. Execute the diff script
1. Review the changeLog
1. Move it to the changelogs directory and rebuild the app
1. Re-deploy


#### Resources
* Download liquibase CLI https://github.com/liquibase/liquibase/releases
* Liquibase Changes documentation https://docs.liquibase.com/change-types/home.html

#### Notes
Changing the data model is quite a big change, server, clients and webapp must be compiled:
```sh
mvn -DskipTests -pl colab-api,colab-client,colab-webapp install
```
re-deploy is required

### REST API
REST API changes requires to compile server, clients and webapp:
```sh
mvn -DskipTests -pl colab-api,colab-client,colab-webapp install
```
re-deploy is required

### Server internal changes
Since the API will not change,no need to recompile clients. Moreover, there is no need to rebuild
the webapp. This can be skipped by setting the skipWebappYarn property.
```sh
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
