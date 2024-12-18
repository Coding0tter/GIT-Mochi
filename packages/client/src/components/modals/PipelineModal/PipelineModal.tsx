import { modalStore } from "../../../stores/modalStore";
import BaseModal, { type BaseModalProps } from "../BaseModal/BaseModal";
import styles from "./PipelineModal.module.css";
import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { parseMarkdown } from "../../../utils/parseMarkdown";

interface PipelineModalProps extends BaseModalProps {}

const PipelineModal = (props: PipelineModalProps) => {
  const { selectedTask: task } = modalStore;
  const [selectedReport, setSelectedReport] = createSignal<number>(0);

  onMount(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "j" || event.key === "ArrowDown") {
        if (selectedReport() < (task?.pipelineReports?.length ?? 0) - 1) {
          setSelectedReport(selectedReport() + 1);
        } else {
          setSelectedReport(0);
        }
      } else if (event.key === "k" || event.key === "ArrowUp") {
        if (selectedReport() > 0) {
          setSelectedReport(selectedReport() - 1);
        } else {
          setSelectedReport((task?.pipelineReports?.length ?? 0) - 1);
        }
      }

      const report = document.getElementById(`report-${selectedReport()}`);
      report?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    window.addEventListener("keydown", handleKeydown);

    onCleanup(() => {
      window.removeEventListener("keydown", handleKeydown);
    });
  });

  const getPipelinesStatus = (status: string) => {
    switch (status) {
      case "success":
        return <i class="fa-regular fa-thumbs-up"></i>;
      case "failed":
        return <i class="fa-regular fa-thumbs-down"></i>;
      case "running":
      case "pending":
        return <i class="fa-solid fa-person-running"></i>;
      case "canceled":
        return <i class="fa-solid fa-person-running"></i>;
      case "skipped":
        return <i class="fa-solid fa-forward"></i>;
      default:
        return <i class="fa-solid fa-question"></i>;
    }
  };

  return (
    <BaseModal {...props} closeText="Close">
      <div class={styles.content}>
        <div class={styles.title}>{task?.title}</div>
        <Show when={task?.description}>
          <div class={styles.card}>
            <div
              class={styles.description}
              innerHTML={parseMarkdown(task?.description || "")}
            ></div>
          </div>
        </Show>
        <div
          class={`${styles.pipelineState} ${
            styles[task?.pipelineStatus || ""]
          }`}
        >
          {getPipelinesStatus(task?.pipelineStatus || "")}{" "}
          {task?.pipelineStatus}
        </div>

        <div class={styles.divider} />
        <div class={styles.reports}>
          <For each={task?.pipelineReports || []}>
            {(report, index) => (
              <div
                id={`report-${index()}`}
                class={`${styles.card} ${
                  selectedReport() === index() ? styles.selected : ""
                }`}
              >
                <div class={styles.pipelineReportTitle}>{report.name}</div>
                <img
                  src={report.attachment_url.replace("file", "raw")}
                  loading="lazy"
                />
              </div>
            )}
          </For>
        </div>
      </div>
    </BaseModal>
  );
};

export default PipelineModal;
