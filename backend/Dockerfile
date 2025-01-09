FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
# Install bash and curl
RUN apk add --no-cache bash curl

# Create all required directories and set permissions
RUN mkdir -p /app/uploads/profile_pictures && \
    chown -R node:node /app && \
    chmod -R 755 /app/uploads

COPY . .
COPY wait-for-it.sh ./wait-for-it.sh
RUN chmod +x wait-for-it.sh && \
    chown -R node:node /app

# Use node user
USER node

EXPOSE 5000
CMD ["./wait-for-it.sh", "mongo:27017", "--", "npm", "run", "dev"]
