# syntax=docker/dockerfile:1
# Build stage
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /home/app

COPY pom.xml .
COPY notification-service/pom.xml notification-service/pom.xml
RUN --mount=type=cache,target=/root/.m2 mvn install -N && mvn -f notification-service/pom.xml dependency:resolve -q

COPY notification-service/src notification-service/src
RUN --mount=type=cache,target=/root/.m2 mvn -f notification-service/pom.xml package -DskipTests

# Package stage
FROM eclipse-temurin:17-jre-alpine
COPY --from=build /home/app/notification-service/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java","-jar","/app.jar"]
