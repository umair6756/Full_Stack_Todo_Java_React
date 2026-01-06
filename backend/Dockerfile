# Java Backend Dockerfile


FROM maven:3.8.4-openjdk-17-slim AS build


WORKDIR /app


COPY pom.xml .
RUN mvn dependency:go-offline -B


COPY src ./src
RUN mvn clean package -DskipTests

FROM openjdk:27-ea-3-slim


RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app


COPY --from=build /app/target/*.jar app.jar


EXPOSE 5000


ENTRYPOINT ["java", "-jar", "app.jar"]