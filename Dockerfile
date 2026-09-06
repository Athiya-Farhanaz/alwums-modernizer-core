# Multi-Language Runtime Sandbox & Service Container for ALWUMS
# Built with Python 3.11, Node.js (for React/JS testing), and PHP CLI (for legacy PHP validation)

FROM python:3.11-slim

# Install system utilities, Node.js, and PHP for automated runtime & compiler validation
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gnupg \
    php-cli \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Set environment
ENV PORT=5000
ENV PYTHONUNBUFFERED=1

EXPOSE 5000

# Start Flask backend with Gunicorn
CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:5000", "universal_upgrader:app"]
