import { type JSXElement, createSignal, onMount } from "solid-js";
import {
  modalStore,
  setSelectedAppointmentValue,
} from "../../../stores/modalStore";
import BaseModal, { type BaseModalProps } from "../BaseModal/BaseModal";
import styles from "./EditAppointmentModal.module.css";
import dayjs from "dayjs";

interface EditAppointmentModalProps extends BaseModalProps {}

const EditAppointmentModal = (props: EditAppointmentModalProps): JSXElement => {
  let startTimeRef: HTMLInputElement | null = null;
  let endTimeRef: HTMLInputElement | null = null;

  const [startTime, setStartTime] = createSignal(
    dayjs(modalStore.selectedAppointment?.start).format("HH:mm") || ""
  );
  const [endTime, setEndTime] = createSignal(
    dayjs(modalStore.selectedAppointment?.end).format("HH:mm") || ""
  );

  onMount(() => {
    if (startTimeRef) {
      setTimeout(() => startTimeRef?.focus(), 0);
    }
  });

  const validateAndFormatTime = (value: string): string | null => {
    // Remove non-numeric characters
    let cleaned = value.replace(/\D/g, "");

    if (cleaned.length === 3) {
      cleaned = `0${cleaned}`;
    }

    // Check valid length (e.g., 4 digits)
    if (cleaned.length === 4) {
      const hours = cleaned.slice(0, 2);
      const minutes = cleaned.slice(2, 4);

      // Validate hours and minutes
      if (parseInt(hours, 10) < 24 && parseInt(minutes, 10) < 60) {
        return `${hours}:${minutes}`;
      }
    }

    return null;
  };

  const handleInputChange = (
    key: "start" | "end",
    value: string,
    setSignal: (value: string) => void
  ) => {
    const formattedTime = validateAndFormatTime(value);

    if (formattedTime) {
      setSignal(formattedTime); // Update the local signal
      setSelectedAppointmentValue(key, formattedTime); // Update the store
    }
  };

  const handleSubmit = () => {
    const startTimeValue = startTime();
    const endTimeValue = endTime();

    if (startTimeValue && endTimeValue) {
      props.onSubmit?.();
    } else {
      alert("Please enter valid times in HH:mm format.");
    }
  };

  return (
    <BaseModal {...props} submitText="Save" onSubmit={handleSubmit}>
      <h2>Edit Appointment</h2>
      <div class={styles.form}>
        <label for="start">Start Time</label>
        <input
          type="text"
          ref={(el) => (startTimeRef = el)}
          value={startTime()}
          onInput={(e) => {
            if (e.currentTarget.value.length >= 3)
              handleInputChange("start", e.currentTarget.value, setStartTime);
          }}
          placeholder="Start Time (HH:mm)"
          pattern="([01]\d|2[0-3]):([0-5]\d)"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            else if (e.key === "Escape") props.onClose?.();
          }}
        />
        <label for="end">End Time</label>
        <input
          type="text"
          ref={(el) => (endTimeRef = el)}
          value={endTime()}
          onInput={(e) => {
            if (e.currentTarget.value.length >= 3)
              handleInputChange("end", e.currentTarget.value, setEndTime);
          }}
          placeholder="End Time (HH:mm)"
          pattern="([01]\d|2[0-3]):([0-5]\d)"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            else if (e.key === "Escape") props.onClose?.();
          }}
        />
      </div>
    </BaseModal>
  );
};

export default EditAppointmentModal;
