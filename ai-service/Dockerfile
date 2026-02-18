# Build stage
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /home/app

# Copy the parent pom and install it locally
COPY pom.xml .
RUN mvn install -N

# Copy and install shared-kernel
COPY shared-kernel /home/app/shared-kernel
RUN mvn -f shared-kernel/pom.xml clean install -DskipTests

# Build ai-service
COPY ai-service /home/app/ai-service
RUN mvn -f ai-service/pom.xml clean package -DskipTests

# Package stage
FROM eclipse-temurin:17-jdk-alpine
COPY --from=build /home/app/ai-service/target/*.jar app.jar
EXPOSE 8085
ENTRYPOINT ["java","-jar","/app.jar"]
