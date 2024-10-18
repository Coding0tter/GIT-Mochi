import EventEmitter2 from "eventemitter2";

const eventBus = new EventEmitter2({
  wildcard: true,
  delimiter: ".",
});

export default eventBus;
