# Rate Limit Frontend

A React-based frontend application built with Vite, TypeScript, and Tailwind CSS.

## Features

- React 19 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- Responsive UI components
- Docker support for easy deployment

## Prerequisites

- Node.js 18+ 
- Docker (for containerized deployment)

## Local Development

### Using Node.js directly

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Docker Deployment

### Production Build

```bash
# Build the production image
docker build -t rate-limit-frontend .

# Run the container
docker run -p 3000:80 rate-limit-frontend

# The app will be available at http://localhost:3000
```

### Run in Background

```bash
# Run in detached mode
docker run -d -p 3000:80 --name rate-limit-frontend rate-limit-frontend

# Stop the container
docker stop rate-limit-frontend

# Remove the container
docker rm rate-limit-frontend
```

### Development with Docker (Optional)

If you want to run the development server in Docker:

```bash
# Create a development container with volume mounting
docker run -it --rm -p 5173:5173 -v $(pwd):/app -w /app node:18-alpine sh

# Inside the container, install dependencies and start dev server
npm install
npm run dev -- --host 0.0.0.0
```

## Environment Variables

- `NODE_ENV`: Set to `production` or `development`

## Health Check

The production container includes a health check endpoint at `/health` that returns a 200 status when the application is running properly.

## Performance Features

- Multi-stage Docker build for optimized image size
- Nginx with gzip compression
- Static asset caching
- Security headers
- Client-side routing support

## Troubleshooting

### Container won't start
```bash
# Check container logs
docker logs <container_name>

# Check if port 3000 is already in use
netstat -tulpn | grep :3000
```

### Port already in use
```bash
# Use a different port
docker run -p 3001:80 rate-limit-frontend

# Or stop the process using port 3000
sudo lsof -ti:3000 | xargs kill -9
```

## Building for Different Environments

```bash
# Production build
docker build -t rate-limit-frontend:prod .

# Latest build
docker build -t rate-limit-frontend:latest .

# Custom tag
docker build -t rate-limit-frontend:v1.0.0 .
```

## Container Management

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# List images
docker images

# Remove unused images
docker image prune

# Remove all stopped containers
docker container prune
```
