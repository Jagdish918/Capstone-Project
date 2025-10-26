import pkg from 'agora-access-token';
const { RtcTokenBuilder, RtcRole } = pkg;

const appId = process.env.VITE_AGORA_APP_ID;
const appCertificate = process.env.VITE_AGORA_APP_CERTIFICATE;

export const generateToken = async (req, res) => {
  try {
    const { channelName, uid } = req.body;
    
    if (!channelName) {
      return res.status(400).json({
        success: false,
        message: "Channel name is required"
      });
    }

    // Set token expiration time (24 hours from now)
    const expirationTimeInSeconds = Math.floor(Date.now() / 1000) + 86400;
    
    // Generate the token
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid || 0,
      RtcRole.PUBLISHER,
      expirationTimeInSeconds
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        appId,
        channelName,
        uid: uid || 0
      }
    });

  } catch (error) {
    console.error("Error generating Agora token:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate token"
    });
  }
};
