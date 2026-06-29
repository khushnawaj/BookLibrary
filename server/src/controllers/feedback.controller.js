const { Feedback, User, Notification } = require('../models');
const { HTTP_STATUS } = require('../constants');

const createFeedback = async (req, res) => {
  try {
    const { type, subject, message } = req.body;
    if (!type || !subject || !message) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Type, subject, and message are required fields.',
      });
    }

    const feedback = await Feedback.create({
      user: req.user.id,
      type,
      subject,
      message,
    });

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Feedback submitted successfully. Thank you!',
      data: { feedback },
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to submit feedback.',
    });
  }
};

const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('user', 'name username email avatar')
      .sort({ createdAt: -1 });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { feedbacks },
    });
  } catch (error) {
    console.error('Error getting feedback list:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve feedback.',
    });
  }
};

const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    if (!status || !['PENDING', 'RESOLVED'].includes(status)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Valid status is required.',
      });
    }

    const updateData = { status };
    if (adminResponse !== undefined) {
      updateData.adminResponse = adminResponse;
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('user', 'name username email avatar');

    if (!feedback) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Feedback not found.',
      });
    }

    // Create a notification for the user if resolved
    if (status === 'RESOLVED') {
      try {
        await Notification.create({
          recipient: feedback.user._id,
          sender: req.user._id,
          type: 'FEEDBACK_RESOLVED',
          title: 'Support Request Resolved',
          message: adminResponse 
            ? `Admin resolved your query: "${adminResponse}"`
            : `Your support request regarding "${feedback.subject}" has been marked as resolved.`,
          metadata: {
            feedbackId: feedback._id,
            subject: feedback.subject,
            type: feedback.type,
            adminResponse: adminResponse || ''
          }
        });
      } catch (notifErr) {
        console.error('Error creating notification for feedback resolution:', notifErr);
      }
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Feedback status updated successfully.',
      data: { feedback },
    });
  } catch (error) {
    console.error('Error updating feedback status:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to update feedback status.',
    });
  }
};

module.exports = {
  createFeedback,
  getAllFeedback,
  updateFeedbackStatus,
};
