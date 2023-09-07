# Use the base image
FROM ghcr.io/steamdeckhomebrew/holo-base:latest

# Install Python and Paramiko inside the container
RUN pacman -Syu --noconfirm python python-pip && \
    pip install ssh2-python --no-cache-dir

COPY entrypoint.sh /entrypoint.sh

# Make the script executable
RUN chmod +x /entrypoint.sh

# entrypoint.sh should always be located in the backend folder
ENTRYPOINT [ "/entrypoint.sh" ]