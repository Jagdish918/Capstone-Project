import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaComments } from 'react-icons/fa';
import './FloatingChatButton.css';

const FloatingChatButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Don't show on chat page or if user is not logged in
  if (location.pathname === '/chats' || !localStorage.getItem('userInfo')) {
    return null;
  }

  const handleClick = () => {
    navigate('/chats');
  };

  return (
    <button className="floating-chat-btn" onClick={handleClick} aria-label="Go to chats">
      <FaComments className="chat-icon" />
      <span className="chat-tooltip">Chats</span>
    </button>
  );
};

export default FloatingChatButton;

