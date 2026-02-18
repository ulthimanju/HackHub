# Build stage
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /home/app

# Copy the parent pom and install it locally
COPY pom.xml .
RUN mvn install -N

# Build api-gateway
COPY api-gateway /home/app/api-gateway
RUN mvn -f api-gateway/pom.xml clean package -DskipTests

# Package stage
FROM eclipse-temurin:17-jdk-alpine
COPY --from=build /home/app/api-gateway/target/*.jar app.jar
EXPOSE 8000
ENTRYPOINT ["java","-jar","/app.jar"]
