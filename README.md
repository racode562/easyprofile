
# easyprofile

This project is a Dockerized MERN stack application with support for development, staging, and production environments.

## Getting Started

### 1. Development
To spin up the development environment:
1. Navigate to the project folder:
   ```bash
   cd easyprofile
   ```
2. Use Docker Compose to build and run containers:
   ```bash
   docker compose -f docker-compose.dev.yml up --build -d
   ```

### 2. Staging
To set up the staging environment:
1. Run the `create-mern-auth-app.mjs` script and choose the **Production** option:
   ```bash
   ./create-mern-auth-app.mjs
   ```

   During the setup, you will be prompted to provide:
   - A valid GitHub repository URL containing your development app.
   - Staging-specific configurations such as the MongoDB URI, API URL, and JWT secret.

   The script will:
   - Clone the specified repository.
   - Update the necessary variables for staging.
   - Set up a `staging` directory within the project.

2. Navigate to the `staging` directory:
   ```bash
   cd staging
   ```
3. Use Docker Compose to build and run containers:
   ```bash
   docker compose -f docker-compose.staging.yml up --build -d
   ```

### 3. Production
To graduate staging to production:
1. Stop the staging environment:
   ```bash
   docker compose -f docker-compose.staging.yml down
   ```
2. Run the `graduate-to-production.sh` script in the `staging` directory:
   ```bash
   ./graduate-to-production.sh
   ```
3. Navigate back to the project root and use Docker Compose to start the production environment:
   ```bash
   docker compose -f docker-compose.prod.yml up --build -d
   ```

### Notes
- You must run the `create-mern-auth-app.mjs` script to set up the staging environment. This script will prompt you to provide critical details about your environment and configure staging correctly.
- Do not attempt to manually spin up the staging environment without completing the script setup.
- For production, remember to set up HTTPS and secure credentials for your environment.

Happy coding!
