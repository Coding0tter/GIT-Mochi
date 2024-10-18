import type EventEmitter2 from "eventemitter2";
import { EventEmitterService } from "./eventEmitterService";

const emitter: EventEmitter2 = EventEmitterService.getEmitter();

emitter.on("**.created", async (data) => {});

emitter.on("**.updated", async (data) => {});

emitter.on("**.deleted", async (data) => {});
