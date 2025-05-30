import EditAppointmentModal from "../../components/modals/EditAppointmentModal/EditAppointmentModal";
import WeekCalendar from "../../components/TimeTrack/WeekCalendar/WeekCalendar";
import { updateTimeTrackEntryAsync } from "../../services/timeTrackService";
import { unfocusInputs } from "../../services/uiService";
import {
  handleCloseModal,
  modalStore,
  ModalType,
} from "../../stores/modalStore";
import styles from "./TimeTrack.module.css";

const TimeTrack = () => {
  const handleEditAppointment = async () => {
    const timeTrackEntry = modalStore.selectedAppointment;
    if (!timeTrackEntry) return;

    await updateTimeTrackEntryAsync(timeTrackEntry);
    unfocusInputs();
  };

  return (
    <>
      <div class={styles.timetrack}>
        <WeekCalendar startHour={8} endHour={20} />
      </div>

      {modalStore.activeModals.includes(ModalType.EditAppointment) && (
        <EditAppointmentModal
          onSubmit={handleEditAppointment}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default TimeTrack;
