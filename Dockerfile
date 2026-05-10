FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY gradle gradle
COPY gradlew build.gradle settings.gradle ./
COPY src src
RUN chmod +x gradlew && ./gradlew bootJar --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/summarize-api-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "echo | openssl s_client -connect api.anthropic.com:443 2>/dev/null | openssl x509 -out /tmp/proxy_ca.crt && keytool -import -alias proxy-ca -keystore $JAVA_HOME/lib/security/cacerts -storepass changeit -file /tmp/proxy_ca.crt -noprompt 2>/dev/null; java -Djavax.net.ssl.trustStorePassword=changeit -jar app.jar"]
