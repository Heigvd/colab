FROM adoptopenjdk/openjdk11:alpine-jre

RUN   apk update \
 &&   apk add ca-certificates \
 &&   update-ca-certificates

ENV PAYARA_PATH /opt/payara

RUN   mkdir -p $PAYARA_PATH
WORKDIR $PAYARA_PATH

RUN adduser -D -h $PAYARA_PATH payara && echo payara:payara | chpasswd && chown -R payara:payara /opt

VOLUME /var/lib/wegas

EXPOSE 8080 8181 5701 5702 7800
