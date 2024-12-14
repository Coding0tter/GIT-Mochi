import axios from "axios";
import { type TimeTrackEntry } from "../stores/timeTrackStore";
import { addNotification } from "./notificationService";

export const updateTimeTrackEntryAsync = async (
  timeTrackEntry: TimeTrackEntry
) => {
  try {
    const timeTrackEntryId = timeTrackEntry._id;
    const res = await axios.put(
      `/timetrack/${timeTrackEntryId}`,
      timeTrackEntry
    );

    addNotification({
      title: "Success",
      description: "Appointment updated successfully",
      type: "success",
    });

    return res;
  } catch (error) {
    addNotification({
      title: "Error",
      description: "Failed to update appointment",
      type: "error",
    });
  }
};
