# MyEduConnect Security Project Phase 1

This repository contains the vulnerable infrastructure for the MyEduConnect platform, built for the CCS6324 Ethical Hacking and Penetration Testing Final Assignment. The environment is containerized using Docker and Docker Compose.

## Prerequisites
* Docker installed on the host machine.
* Docker Compose installed.

## Deployment Guide

### Step 1: Navigate to the Project Directory
Open your terminal and move into the root folder containing the Docker configuration files:
```bash
cd ~/ccs6324-myeduconnect-sec

### Step 2: Build and Launch the Containers
Execute the Docker Compose command to build the images and run them in the background:

Bash
sudo docker-compose up -d --build
up creates and starts the network.

-d runs it in "detached" mode so you can continue using your terminal.

--build forces Docker to compile the Node.js backend using the latest source code.

### Step 3: Verify the Status
Check that all three core services have successfully launched without errors:

Bash
sudo docker ps
You should see myeduconnect_proxy, myeduconnect_backend, and myeduconnect_db listed with an "Up" status.

Accessing the Platform
Once the containers are running, you can interact with the vulnerable application directly from your local browser or database client:

Main Website (Nginx Proxy): Navigate to http://127.0.0.1 to access the front-end web server running on Port 80.

Direct API (Node.js): Navigate to http://127.0.0.1:8080 to hit the backend directly, bypassing the proxy.

Database (MySQL): Connect a database client to 127.0.0.1:3306 using the credentials root:root.

Stopping the Environment
When you are finished testing and want to safely tear down the active environment, run:

Bash
sudo docker-compose down
