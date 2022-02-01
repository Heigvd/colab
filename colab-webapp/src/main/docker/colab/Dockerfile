FROM eclipse-temurin:11-jre-focal

RUN  update-ca-certificates

ENV COLAB_PATH=/var/lib/colab

RUN mkdir -p $COLAB_PATH

WORKDIR $COLAB_PATH

RUN useradd --home-dir $COLAB_PATH colab && chown -R colab:colab $COLAB_PATH

ARG GITHUB_RUN_NUMBER
ARG DOCKER_IMAGE_TAGS

ENV CLUSTER_MODE=DEFAULT \
    DEBUG=false \
    GC=G1GC \
    INTERFACES=172.17.*.* \ 
    PAYARA=/var/lib/colab/payara.jar \
    THE_WAR=/var/lib/colab/coLAB.war \
    CLUSTER_NAME=ColabCluster \
    HEAP_SIZE=512M \
    COLAB_BUILD_NUMBER=${GITHUB_RUN_NUMBER} \
    COLAB_BUILD_IMAGES=${DOCKER_IMAGE_TAGS}

# VOLUME /var/lib/colab/payara.jar
# VOLUME /var/lib/colab/colab.war

COPY coLAB.war ./coLAB.war
COPY payara-micro.current.jar ./payara.jar
COPY run ./

# VOLUME /var/lib/colab/colab.properties

RUN chown -R colab:colab .

USER colab

CMD ["/var/lib/colab/run"]

EXPOSE 8181
