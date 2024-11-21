import { describe, expect, test } from "bun:test";
import { useSpies } from "../../../base.test";
import {
  openDeleteModal,
  openDetailsModal,
  openEditTaskModal,
  openHelpModal,
} from "../modalService";
import { ModalType } from "../../stores/modalStore";
import { Task } from "../../stores/taskStore";
import { setSelectedTaskIndex } from "../../stores/keyboardNavigationStore";

describe("ModalService", () => {
  test("should open help modal", () => {
    const { setActiveModalSpy } = useSpies();

    openHelpModal();

    expect(setActiveModalSpy).toHaveBeenCalledWith(ModalType.Help);
  });

  test("should open delete modal", () => {
    const { setActiveModalSpy, setSelectedTaskForModalSpy, getColumnTasksSpy } =
      useSpies();

    setSelectedTaskIndex(0);

    getColumnTasksSpy.mockImplementation(() => [
      {
        title: "Task 1",
        description: "Description 1",
        status: "status1",
      } as Task,
    ]);

    openDeleteModal();

    expect(setActiveModalSpy).toHaveBeenCalledWith(ModalType.DeleteTask);
    expect(setSelectedTaskForModalSpy).toHaveBeenCalledWith(
      getColumnTasksSpy()[0]
    );
  });

  test("should open create modal", () => {
    const { setActiveModalSpy, setSelectedTaskForModalSpy, getColumnTasksSpy } =
      useSpies();

    setSelectedTaskIndex(0);

    getColumnTasksSpy.mockImplementation(() => [
      {
        title: "Task 1",
        description: "Description 1",
        status: "status1",
      } as Task,
    ]);

    openDeleteModal();

    expect(setActiveModalSpy).toHaveBeenCalledWith(ModalType.DeleteTask);
    expect(setSelectedTaskForModalSpy).toHaveBeenCalledWith(
      getColumnTasksSpy()[0]
    );
  });

  test("should open edit modal", () => {
    const { setActiveModalSpy, setSelectedTaskForModalSpy, getColumnTasksSpy } =
      useSpies();

    setSelectedTaskIndex(0);

    getColumnTasksSpy.mockImplementation(() => [
      {
        title: "Task 1",
        description: "Description 1",
        status: "status1",
      } as Task,
    ]);

    openEditTaskModal();

    expect(setActiveModalSpy).toHaveBeenCalledWith(ModalType.CreateTask);
    expect(setSelectedTaskForModalSpy).toHaveBeenCalledWith(
      getColumnTasksSpy()[0]
    );
  });

  test("should open details modal", () => {
    const { setActiveModalSpy, setSelectedTaskForModalSpy, getColumnTasksSpy } =
      useSpies();

    setSelectedTaskIndex(0);

    getColumnTasksSpy.mockImplementation(() => [
      {
        title: "Task 1",
        description: "Description 1",
        status: "status1",
      } as Task,
    ]);

    openDetailsModal();

    expect(setActiveModalSpy).toHaveBeenCalledWith(ModalType.TaskDetails);
    expect(setSelectedTaskForModalSpy).toHaveBeenCalledWith(
      getColumnTasksSpy()[0]
    );
  });
});
