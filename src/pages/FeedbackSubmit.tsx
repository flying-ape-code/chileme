import React from 'react';
import FeedbackForm from '../components/Feedback/FeedbackForm';
import { useNavigate } from 'react-router-dom';

export default function FeedbackSubmit() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/feedbacks');
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900 to-purple-900">
      <FeedbackForm onSuccess={handleSuccess} onClose={handleClose} />
    </div>
  );
}
