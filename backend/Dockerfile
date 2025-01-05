FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
# Install bash and curl
RUN apk add --no-cache bash curl
COPY . .
COPY wait-for-it.sh ./wait-for-it.sh
RUN chmod +x wait-for-it.sh
# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# Change ownership to the non-root user
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 5000
CMD ["./wait-for-it.sh", "mongo:27017", "--", "npm", "run", "dev"]
