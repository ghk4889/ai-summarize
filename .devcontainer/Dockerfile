FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04 AS certs
COPY root_ca.crt* /usr/local/share/ca-certificates/

FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04
COPY --from=certs /usr/local/share/ca-certificates/ /usr/local/share/ca-certificates/
RUN update-ca-certificates

RUN apt-get update && apt-get install -y --no-install-recommends \
    openjdk-21-jdk \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
