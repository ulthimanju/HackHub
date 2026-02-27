# Build stage
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /home/app

COPY pom.xml .
COPY ai-service/pom.xml ai-service/pom.xml
RUN mvn install -N && mvn -f ai-service/pom.xml dependency:resolve -q

COPY ai-service/src ai-service/src
RUN mvn -f ai-service/pom.xml package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
# git for repo cloning; nodejs+npm for @google/gemini-cli which runs in-process (no docker-in-docker)
RUN apk add --no-cache git nodejs npm
RUN npm install -g @google/gemini-cli
COPY --from=build /home/app/ai-service/target/*.jar app.jar
EXPOSE 8085
ENTRYPOINT ["java", "-jar", "/app.jar"]
