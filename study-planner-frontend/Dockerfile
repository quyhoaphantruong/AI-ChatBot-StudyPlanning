# Use a Node.js base image
FROM node:19.5.0-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app's source code
COPY . .

# Build the app
RUN npm run build

# Install the 'serve' package globally to serve the static files
RUN npm install -g serve

# Expose the port the app will run on
EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
