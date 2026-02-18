# syntax=docker/dockerfile:1
# Build stage
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /home/app

COPY pom.xml .
COPY auth-service/pom.xml auth-service/pom.xml
RUN --mount=type=cache,target=/root/.m2 mvn install -N && mvn -f auth-service/pom.xml dependency:resolve -q

COPY auth-service/src auth-service/src
RUN --mount=type=cache,target=/root/.m2 mvn -f auth-service/pom.xml package -DskipTests

# Package stage
FROM eclipse-temurin:17-jre-alpine
COPY --from=build /home/app/auth-service/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java","-jar","/app.jar"]
