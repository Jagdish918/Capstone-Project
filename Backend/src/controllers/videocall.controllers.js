import { v4 as uuidv4 } from "uuid";

// In-memory storage for active calls (in production, use Redis or database)
const activeCalls = new Map();
const pendingCalls = new Map();

export const initiateCall = async (req, res) => {
  try {
    const { receiverUsername } = req.body;
    const caller = req.user;

    if (!receiverUsername) {
      return res.status(400).json({
        success: false,
        message: "Receiver username is required"
      });
    }

    // Generate unique call ID
    const callId = uuidv4();
    
    // Create call object
    const callData = {
      callId,
      caller: {
        _id: caller._id,
        username: caller.username,
        name: caller.name,
        picture: caller.picture
      },
      receiverUsername,
      status: "pending",
      startTime: new Date(),
      channelName: `call_${callId}`
    };

    // Store pending call
    pendingCalls.set(callId, callData);

    // Emit call event to receiver via Socket.IO
    req.app.get('io').to(receiverUsername).emit('incoming_call', {
      callId,
      caller: callData.caller,
      channelName: callData.channelName
    });

    res.status(200).json({
      success: true,
      message: "Call initiated successfully",
      data: {
        callId,
        channelName: callData.channelName
      }
    });

  } catch (error) {
    console.error("Error initiating call:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initiate call"
    });
  }
};

export const acceptCall = async (req, res) => {
  try {
    const { callId } = req.body;
    const receiver = req.user;

    if (!callId) {
      return res.status(400).json({
        success: false,
        message: "Call ID is required"
      });
    }

    const pendingCall = pendingCalls.get(callId);
    if (!pendingCall) {
      return res.status(404).json({
        success: false,
        message: "Call not found or expired"
      });
    }

    // Update call status
    const activeCall = {
      ...pendingCall,
      status: "active",
      receiver: {
        _id: receiver._id,
        username: receiver.username,
        name: receiver.name,
        picture: receiver.picture
      },
      acceptedTime: new Date()
    };

    // Move to active calls
    activeCalls.set(callId, activeCall);
    pendingCalls.delete(callId);

    // Notify caller that call was accepted
    req.app.get('io').to(pendingCall.caller._id).emit('call_accepted', {
      callId,
      receiver: activeCall.receiver,
      channelName: activeCall.channelName
    });

    res.status(200).json({
      success: true,
      message: "Call accepted successfully",
      data: {
        callId,
        channelName: activeCall.channelName
      }
    });

  } catch (error) {
    console.error("Error accepting call:", error);
    res.status(500).json({
      success: false,
      message: "Failed to accept call"
    });
  }
};

export const rejectCall = async (req, res) => {
  try {
    const { callId } = req.body;
    const receiver = req.user;

    if (!callId) {
      return res.status(400).json({
        success: false,
        message: "Call ID is required"
      });
    }

    const pendingCall = pendingCalls.get(callId);
    if (!pendingCall) {
      return res.status(404).json({
        success: false,
        message: "Call not found or expired"
      });
    }

    // Remove from pending calls
    pendingCalls.delete(callId);

    // Notify caller that call was rejected
    req.app.get('io').to(pendingCall.caller._id).emit('call_rejected', {
      callId,
      receiver: {
        username: receiver.username,
        name: receiver.name
      }
    });

    res.status(200).json({
      success: true,
      message: "Call rejected successfully"
    });

  } catch (error) {
    console.error("Error rejecting call:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject call"
    });
  }
};

export const endCall = async (req, res) => {
  try {
    const { callId } = req.body;
    const user = req.user;

    if (!callId) {
      return res.status(400).json({
        success: false,
        message: "Call ID is required"
      });
    }

    const activeCall = activeCalls.get(callId);
    if (!activeCall) {
      return res.status(404).json({
        success: false,
        message: "Active call not found"
      });
    }

    // Check if user is part of the call
    if (activeCall.caller._id !== user._id && activeCall.receiver._id !== user._id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to end this call"
      });
    }

    // Update call status
    activeCall.status = "ended";
    activeCall.endTime = new Date();
    activeCall.duration = activeCall.endTime - activeCall.startTime;

    // Remove from active calls
    activeCalls.delete(callId);

    // Notify other participant that call ended
    const otherUserId = activeCall.caller._id === user._id ? activeCall.receiver._id : activeCall.caller._id;
    req.app.get('io').to(otherUserId).emit('call_ended', {
      callId,
      endedBy: user.username
    });

    res.status(200).json({
      success: true,
      message: "Call ended successfully"
    });

  } catch (error) {
    console.error("Error ending call:", error);
    res.status(500).json({
      success: false,
      message: "Failed to end call"
    });
  }
};

export const getCallStatus = async (req, res) => {
  try {
    const { callId } = req.params;
    const user = req.user;

    if (!callId) {
      return res.status(400).json({
        success: false,
        message: "Call ID is required"
      });
    }

    // Check active calls
    const activeCall = activeCalls.get(callId);
    if (activeCall) {
      // Check if user is part of the call
      if (activeCall.caller._id === user._id || activeCall.receiver._id === user._id) {
        return res.status(200).json({
          success: true,
          data: {
            status: activeCall.status,
            channelName: activeCall.channelName,
            startTime: activeCall.startTime
          }
        });
      }
    }

    // Check pending calls
    const pendingCall = pendingCalls.get(callId);
    if (pendingCall) {
      // Check if user is the caller
      if (pendingCall.caller._id === user._id) {
        return res.status(200).json({
          success: true,
          data: {
            status: pendingCall.status,
            channelName: pendingCall.channelName,
            startTime: pendingCall.startTime
          }
        });
      }
    }

    res.status(404).json({
      success: false,
      message: "Call not found"
    });

  } catch (error) {
    console.error("Error getting call status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get call status"
    });
  }
};
