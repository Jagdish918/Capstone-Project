# Videocall Setup Guide

## Overview
This project now includes real-time videocall functionality using Agora.io. Users can initiate video calls with other users and receive incoming call notifications.

## Features
- **Initiating Calls**: Click the "Video Call" button to start a call with another user
- **Incoming Call Popup**: Users receive a popup when someone calls them
- **Real-time Video**: High-quality video and audio streaming
- **Call Controls**: Mute, video on/off, and end call functionality
- **Responsive Design**: Works on both desktop and mobile devices

## Setup Instructions

### 1. Get Agora.io Credentials

1. Go to [Agora Console](https://console.agora.io/)
2. Create a free account
3. Create a new project
4. Get your **App ID** and **App Certificate**

### 2. Frontend Configuration

Create a `.env` file in the `Frontend` directory:

```env
# Agora.io credentials
REACT_APP_AGORA_APP_ID=your_agora_app_id_here
REACT_APP_AGORA_APP_CERTIFICATE=your_agora_app_certificate_here

# Backend URL
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Install Dependencies

#### Frontend
```bash
cd Frontend
npm install
```

#### Backend
```bash
cd Backend
npm install
```

### 4. Start the Application

#### Backend (Terminal 1)
```bash
cd Backend
npm run dev
```

#### Frontend (Terminal 2)
```bash
cd Frontend
npm run dev
```

## How It Works

### Call Flow
1. **User A** clicks "Video Call" button
2. **User B** receives incoming call popup
3. **User B** accepts/rejects the call
4. If accepted, both users join the videocall channel
5. Real-time video and audio streaming begins

### Socket Events
- `incoming_call`: Sent to receiver when call is initiated
- `call_accepted`: Sent to caller when call is accepted
- `call_rejected`: Sent to caller when call is rejected
- `call_ended`: Sent to both users when call ends

### API Endpoints
- `POST /videocall/initiate`: Start a new call
- `POST /videocall/accept`: Accept an incoming call
- `POST /videocall/reject`: Reject an incoming call
- `POST /videocall/end`: End an active call
- `GET /videocall/status/:callId`: Get call status

## Technical Details

### Frontend Components
- `Videocall.jsx`: Main videocall interface component
- `Videocall.css`: Styling for videocall components
- Integrated into `Chats.jsx` for seamless user experience

### Backend Implementation
- `videocall.routes.js`: API route definitions
- `videocall.controllers.js`: Business logic for call management
- Socket.IO integration for real-time communication
- In-memory storage for active calls (can be upgraded to Redis/database)

### Agora SDK Features
- WebRTC-based video/audio streaming
- Automatic device detection and permission handling
- Built-in echo cancellation and noise suppression
- Adaptive bitrate for optimal performance

## Troubleshooting

### Common Issues

1. **Camera/Microphone not working**
   - Check browser permissions
   - Ensure HTTPS in production (required for media access)

2. **Call not connecting**
   - Verify Agora credentials are correct
   - Check network connectivity
   - Ensure both users are online

3. **Poor video quality**
   - Check internet connection
   - Reduce video resolution if needed
   - Close other bandwidth-heavy applications

### Browser Support
- Chrome 66+
- Firefox 60+
- Safari 11+
- Edge 79+

## Security Considerations

- Calls are peer-to-peer when possible
- Agora handles encryption and security
- User authentication required for all call operations
- Call data is not stored permanently

## Future Enhancements

- Screen sharing functionality
- Call recording (with user consent)
- Group video calls
- Call history and analytics
- Integration with calendar systems
- Push notifications for missed calls

## Support

For technical issues:
1. Check browser console for errors
2. Verify all environment variables are set
3. Ensure backend is running and accessible
4. Check Agora console for usage statistics

For Agora-specific issues, refer to their [documentation](https://docs.agora.io/) and [support](https://agora.io/support).



