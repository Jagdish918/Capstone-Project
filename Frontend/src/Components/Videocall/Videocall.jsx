import React, { useState, useEffect } from 'react';
import { AgoraVideoPlayer, createClient, createMicrophoneAndCameraTracks } from 'agora-rtc-react';
import { toast } from 'react-toastify';
import './Videocall.css';
import axios from 'axios';

const useClient = createClient({ mode: "rtc", codec: "vp8" });
const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();

const Videocall = ({ 
  isOpen, 
  onClose, 
  isIncoming = false, 
  caller = null, 
  onAcceptCall = null, 
  onRejectCall = null,
  isCaller = false,
  remoteUser = null,
  channelName = null
}) => {
  const [users, setUsers] = useState([]);
  const [start, setStart] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [permissionError, setPermissionError] = useState(false);

  const client = useClient();
  const { ready, tracks } = useMicrophoneAndCameraTracks();

  const agoraAppId = import.meta.env.VITE_AGORA_APP_ID;
  
  useEffect(() => {
    if (!agoraAppId) {
      console.error("Agora App ID is not defined in environment variables");
      toast.error("Video call configuration error. Please check environment variables.");
      return;
    }

    if (!isOpen || !channelName) return;

    let init = async () => {
      try {
        // Agora event listeners
        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === "video") {
            setUsers((prevUsers) => [...prevUsers, user]);
          }
          if (mediaType === "audio") {
            user.audioTrack?.play();
          }
        });

        client.on("user-unpublished", (user, mediaType) => {
          if (mediaType === "audio") {
            user.audioTrack?.stop();
          }
          if (mediaType === "video") {
            setUsers((prevUsers) => prevUsers.filter((User) => User.uid !== user.uid));
          }
        });

        client.on("user-left", (user) => {
          setUsers((prevUsers) => prevUsers.filter((User) => User.uid !== user.uid));
        });

        if (ready && tracks) {
          try {
            // 1. Generate UID for this user
            const uid = Math.floor(Math.random() * 10000);

              const tokenResponse = await axios.post('/agora/token', {
                channelName,
                uid
              }, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });

              const tokenData = tokenResponse.data;


            if (!tokenData.success || !tokenData.data.token) {
              throw new Error('Failed to get Agora token');
            }

            // 3. Join channel using App ID and the fetched token
            await client.join(
              agoraAppId,
              channelName,
              tokenData.data.token,
              uid
            );
            // 4. Publish tracks
            await client.publish(tracks);
            setStart(true);
            setPermissionError(false);
          } catch (error) {
            console.log("Error joining channel:", error);
            if (error.code === "PERMISSION_DENIED") {
              setPermissionError(true);
              toast.error("Camera/Microphone access denied. Please allow permissions and try again.");
            } else if (error.code === "CAN_NOT_GET_GATEWAY_SERVER") {
              toast.error("Unable to connect to Agora servers. Please check your App ID, token, and internet connection.");
            } else {
              toast.error("Failed to join call: " + (error.message || error.code || "Unknown error"));
            }
          }
        }
      } catch (error) {
        console.log("Error in init:", error);
        toast.error("Failed to initialize call");
      }
    };

    if (ready && tracks && !permissionError) {
      init();
    }
    // eslint-disable-next-line
  }, [client, ready, tracks, channelName, isOpen, agoraAppId]);

  useEffect(() => {
    return () => {
      if (tracks) {
        tracks.forEach(track => {
          try {
            track.close();
          } catch (error) {
            console.log("Error closing track:", error);
          }
        });
      }
      if (client) {
        try {
          client.leave();
        } catch (error) {
          console.log("Error leaving client:", error);
        }
      }
    };
    // eslint-disable-next-line
  }, []);

  const handleMute = () => {
    if (!tracks || !tracks[0]) return;
    try {
      tracks[0].setMuted(!tracks[0].muted);
      setIsMuted(!tracks[0].muted);
    } catch (error) {
      console.log("Error toggling mute:", error);
    }
  };

  const handleVideoOff = () => {
    if (!tracks || !tracks[1]) return;
    try {
      tracks[1].setMuted(!tracks[1].muted);
      setIsVideoOff(!tracks[1].muted);
    } catch (error) {
      console.log("Error toggling video:", error);
    }
  };

  const handleEndCall = async () => {
    try {
      if (tracks) {
        tracks.forEach(track => {
          try {
            track.close();
          } catch (error) {
            console.log("Error closing track:", error);
          }
        });
      }
      if (client) {
        await client.leave();
      }
    } catch (error) {
      console.log("Error ending call:", error);
    } finally {
      onClose();
    }
  };

  const handleRetryPermissions = () => {
    setPermissionError(false);
    window.location.reload();
  };

  if (isIncoming) {
    return (
      <div className="videocall-overlay">
        <div className="incoming-call-modal">
          <div className="caller-info">
            <img 
              src={caller?.picture || "https://via.placeholder.com/80"} 
              alt="Caller" 
              className="caller-avatar"
            />
            <h3>Incoming Call</h3>
            <p>{caller?.name || caller?.username || "Unknown"}</p>
          </div>
          <div className="call-actions">
            <button className="accept-call-btn" onClick={onAcceptCall}>
              <i className="fas fa-phone"></i>
              Accept
            </button>
            <button className="reject-call-btn" onClick={onRejectCall}>
              <i className="fas fa-phone-slash"></i>
              Decline
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  if (!agoraAppId) {
    return (
      <div className="videocall-overlay">
        <div className="videocall-container">
          <div className="videocall-header">
            <h3>Configuration Error</h3>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="error-container">
            <p>Video call is not properly configured. Please contact support.</p>
          </div>
        </div>
      </div>
    );
  }

  if (permissionError) {
    return (
      <div className="videocall-overlay">
        <div className="videocall-container">
          <div className="videocall-header">
            <h3>Permission Required</h3>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="error-container">
            <p>Camera and microphone access is required for video calls.</p>
            <p>Please allow permissions in your browser and try again.</p>
            <button className="retry-btn" onClick={handleRetryPermissions}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="videocall-overlay">
      <div className="videocall-container">
        <div className="videocall-header">
          <h3>Video Call with {remoteUser?.name || remoteUser?.username || "User"}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="video-container">
          {start && tracks && tracks[1] && (
            <div className="local-video">
              <AgoraVideoPlayer
                videoTrack={tracks[1]}
                style={{ width: "100%", height: "100%" }}
              />
              <div className="local-video-label">You</div>
            </div>
          )}
          
          {users.length > 0 && users[0] && users[0].videoTrack && (
            <div className="remote-video">
              <AgoraVideoPlayer
                videoTrack={users[0].videoTrack}
                style={{ width: "100%", height: "100%" }}
              />
              <div className="remote-video-label">{remoteUser?.name || remoteUser?.username || "Remote User"}</div>
            </div>
          )}
          
          {!start && (
            <div className="loading-container">
              <p>Connecting to call...</p>
            </div>
          )}
        </div>

        <div className="videocall-controls">
          <button 
            className={`control-btn ${isMuted ? 'muted' : ''}`}
            onClick={handleMute}
            disabled={!tracks || !tracks[0]}
          >
            <i className={`fas fa-microphone${isMuted ? '-slash' : ''}`}></i>
          </button>
          
          <button 
            className={`control-btn ${isVideoOff ? 'video-off' : ''}`}
            onClick={handleVideoOff}
            disabled={!tracks || !tracks[1]}
          >
            <i className={`fas fa-video${isVideoOff ? '-slash' : ''}`}></i>
          </button>
          
          <button className="control-btn end-call" onClick={handleEndCall}>
            <i className="fas fa-phone-slash"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Videocall;
