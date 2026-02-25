# syntax=docker/dockerfile:1
# Build stage
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /home/app

COPY pom.xml .
COPY ai-service/pom.xml ai-service/pom.xml
RUN --mount=type=cache,target=/root/.m2 mvn install -N && mvn -f ai-service/pom.xml dependency:resolve -q

COPY ai-service/src ai-service/src
RUN --mount=type=cache,target=/root/.m2 mvn -f ai-service/pom.xml package -DskipTests

# Package stage
FROM eclipse-temurin:17-jre-alpine
RUN apk add --no-cache nodejs npm git docker-cli
RUN npm install -g repomix
COPY --from=build /home/app/ai-service/target/*.jar app.jar
COPY --from=build /home/app/ai-service/src/main/resources/repomix.config.json /app/repomix.config.json
EXPOSE 8085
ENTRYPOINT ["java","-jar","/app.jar"]
