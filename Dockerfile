FROM node:22-alpine

WORKDIR /app

# Install libc6-compat for compatibility
RUN apk add --no-cache libc6-compat

## Copy package files and install dependencies
COPY package.json .
COPY package-lock.json .


RUN npm install --frozen-lockfile --legacy-peer-deps

# Move node_modules aside to prevent overwriting by COPY . .
RUN mv node_modules ../node_modules_cache

COPY . .

# Restore node_modules
RUN rm -rf node_modules && mv ../node_modules_cache node_modules

# Set development environment
ENV NODE_ENV=development

CMD ["npm", "run", "dev"]

EXPOSE 3000