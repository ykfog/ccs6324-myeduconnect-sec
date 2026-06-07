# MyEduConnect Security Lab Setup

## Step 1: Navigate to the Project Directory

```bash
cd ~/ccs6324-myeduconnect-sec
```

---

## Step 2: Build and Launch the Containers

Execute the following Docker Compose command to build the images and start the containers in the background:

```bash
sudo docker-compose up -d --build
```

### Command Explanation

| Option | Description |
|----------|-------------|
| `up` | Creates and starts the containers and network |
| `-d` | Runs containers in detached mode, allowing you to continue using the terminal |
| `--build` | Rebuilds the Docker images using the latest source code before starting |

---

## Step 3: Verify Container Status

Check that all services are running correctly:

```bash
sudo docker ps
```

### Expected Services

The following containers should display an **Up** status:

- `myeduconnect_proxy`
- `myeduconnect_backend`
- `myeduconnect_db`

---

# Accessing the Platform

Once all containers are running, you can access the application through the following endpoints:

| Service | URL | Description |
|----------|-----|-------------|
| Main Website (Nginx Proxy) | http://127.0.0.1 | Front-end web application |
| Direct API (Node.js Backend) | http://127.0.0.1:8080 | Backend API endpoint (bypasses Nginx proxy) |
| MySQL Database | 127.0.0.1:3306 | Database access using `root:root` credentials |

### Database Credentials

```text
Host: 127.0.0.1
Port: 3306
Username: root
Password: root
```

---

# Stopping the Environment

To safely stop and remove the containers, network, and associated resources, run:

```bash
sudo docker-compose down
```

This command will:

- Stop all running containers
- Remove the created network
- Clean up the local testing environment

---

## Troubleshooting

### Check Running Containers

```bash
sudo docker ps
```

### View Container Logs

```bash
sudo docker-compose logs
```

### Rebuild and Restart Containers

```bash
sudo docker-compose up -d --build
```
