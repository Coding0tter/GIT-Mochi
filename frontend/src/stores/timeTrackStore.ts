import axios from "axios";
import { createStore } from "solid-js/store";
import { addNotification } from "../services/notificationService";

export type TimeTrackEntry = {
  start: Date;
  end: Date;
};

export const [timeTrackStore, setTimeTrackStore] = createStore({
  entries: [] as TimeTrackEntry[],
  recording: false,
});

export const fetchTimeTrackEntries = async () => {
  const res = await axios.get(`/timetrack`);
  const response = res.data;

  if (response.error) {
    addNotification({
      title: "Error",
      description: response.error,
      type: "error",
      duration: 5000,
    });
  }

  setTimeTrackStore("entries", response);

  return response;
};

export const fetchRecordingStateAsync = async () => {
  const res = await axios.get(`/timetrack/recording`);
  const response = res.data;
  if (response.error) {
    addNotification({
      title: "Error",
      description: response.error,
      type: "error",
      duration: 5000,
    });
  }
  setTimeTrackStore("recording", response);
  return response;
};

export const toggleTimetrackAsync = async () => {
  const res = await axios.put(`/timetrack/recording`);
  const response = res.data;

  if (response.error) {
    addNotification({
      title: "Error",
      description: response.error,
      type: "error",
      duration: 5000,
    });
  }

  setTimeTrackStore("recording", response);
  return response;
};
