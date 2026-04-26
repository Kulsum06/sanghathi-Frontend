import { useState } from "react";
import api from "../utils/axios";

import logger from "../utils/logger.js";
export const useMeeting = () => {
  const getAllMeetings = async ({ recipient } = {}) => {
    try {
      const response = await api.get("/meetings", {
        params: {
          page: 1,
          limit: 300,
          recipient,
          fields: "_id,title,start,end,type",
        },
      });
      const meetings = response.data?.meetings || [];
      const events = meetings.map((meeting) => ({
        id: meeting._id,
        title: meeting.title,
        start: meeting.start,
        end: meeting.end,
        allDay: meeting.allDay,
      }));
      return events;
    } catch (error) {
      logger.error(error);
      return [];
    }
  };

  const deleteMeeting = async (meetId) => {
    try {
      const response = await api.delete(`/meetings/${meetId}`);
      logger.info(response);
    } catch (error) {
      logger.error(error);
    }
  };

  const createMeeting = async (meeting, userId) => {
    try {
      const mentorResponse = await api.get(`/mentors/${userId}`);
      const mentor = mentorResponse.data.mentor;
      meeting.recipients = [mentor, userId];

      const response = await api.post("/meetings", meeting);

      const notification = {
        userId,
        title: meeting.title,
        description: meeting.type,
        type: "meeting",
      };
      const notificationResponse = await api.post(
        "/notifications",
        notification
      );
      logger.info(notificationResponse.data);
      return response;
    } catch (error) {
      logger.error(error);
    }
  };

  return {
    createMeeting,
    getAllMeetings,
    deleteMeeting,
  };
};
