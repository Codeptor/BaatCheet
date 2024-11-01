# Baat-Cheet

A real-time video chat application built with Django and React, featuring secure WebRTC communication.

## Features

- 🎥 Real-time video and audio communication
- 💬 Text chat functionality
- 🔒 Secure peer-to-peer connections using WebRTC
- 🎯 Room-based communication system
- 🎮 Media controls (mute/unmute, video on/off)
- 📱 Responsive design
- 💻 Cross-platform support (Windows, Linux, macOS)

## Tech Stack

### Backend
- Django
- Django Channels
- Redis (for WebSocket support)
- ASGI server (Daphne)

### Frontend
- React
- Material-UI
- WebRTC API
- WebSocket API

## Prerequisites

- Python 3.10 or higher
- Node.js 16 or higher
- Redis server
- Git

### Installing Redis

#### Windows
1. Download and install [Windows Subsystem for Linux (WSL)](https://docs.microsoft.com/en-us/windows/wsl/install)
2. Install Redis in WSL:
```bash
wsl
sudo apt-get update
sudo apt-get install redis-server
```

#### Linux
```bash
sudo apt-get update
sudo apt-get install redis-server
```

#### macOS
```bash
brew install redis
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/baat-cheet.git
cd baat-cheet
```

2. Set up the backend:

#### Windows
```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate
```

#### Linux/macOS
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate
```

3. Set up the frontend:
```bash
cd frontend
npm install
```

## Running the Application

### Windows
1. Start Redis server (in WSL):
```bash
wsl
sudo service redis-server start
```

2. Start the application:
```bash
# From the project root
start.bat
```

### Linux/macOS
1. Start Redis server:
```bash
sudo systemctl start redis-server  # Linux
brew services start redis          # macOS
```

2. Start the application:
```bash
# From the project root
./start.sh
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## Project Structure

```
baat_cheet/
├── frontend/              # React frontend
│   ├── public/           # Public assets
│   └── src/
│       ├── features/     # Feature-based modules
│       │   ├── chat/     # Chat feature
│       │   ├── home/     # Home/landing page
│       │   ├── media/    # Media components
│       │   └── room/     # Room feature
│       └── shared/       # Shared resources
│           ├── hooks/    # Custom hooks
│           └── utils/    # Utilities
├── chat/                 # Django app
│   ├── consumers.py      # WebSocket consumers
│   ├── routing.py        # WebSocket routing
│   └── views.py         # HTTP views
├── manage.py            # Django management script
├── start.sh            # Startup script for Linux/macOS
└── start.bat          # Startup script for Windows
```

## Manual Development Setup

### Frontend Development

```bash
cd frontend
npm start
```

### Backend Development

#### Windows
```bash
venv\Scripts\activate
python manage.py runserver
```

#### Linux/macOS
```bash
source venv/bin/activate
python manage.py runserver
```

## Troubleshooting

### Windows
1. Redis Connection Issues:
   - Ensure WSL is properly installed
   - Check Redis service in WSL: `sudo service redis-server status`
   - Try restarting Redis: `sudo service redis-server restart`

2. Python venv Issues:
   - Run PowerShell as Administrator
   - Execute: `Set-ExecutionPolicy RemoteSigned`
   - Try activating venv again

### Linux/macOS
1. Redis Connection Issues:
   - Check Redis status: `systemctl status redis` (Linux) or `brew services list` (macOS)
   - Check Redis logs: `journalctl -u redis` (Linux)
   - Verify Redis port: `netstat -an | grep 6379`

2. Permission Issues:
   - Ensure proper file permissions: `chmod +x start.sh`
   - Check Redis permissions: `sudo chown redis:redis /var/lib/redis`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- WebRTC for providing the peer-to-peer communication technology
- Django Channels for WebSocket support
- Material-UI for the component library


