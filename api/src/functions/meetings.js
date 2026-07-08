"use strict";
const { app } = require("@azure/functions");
const { listEntities, createEntity, hasRole, json, id } = require("../../shared/store");

const TABLE = "meetings";
const WRITE_ROLES = ["admin", "commissioner"];

async function getMeetings() {
  const items = (await listEntities(TABLE))
    .map(e => ({ id: e.rowKey, date: e.date, time: e.time, type: e.type, video: e.video, minutes: e.minutes, created: e.created }))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return json(200, { items });
}

async function postMeeting(request) {
  if (!hasRole(request, WRITE_ROLES)) return json(403, { error: "Forbidden" });
  let b; try { b = await request.json(); } catch { return json(400, { error: "Invalid JSON" }); }
  if (!b.date || !b.time) return json(400, { error: "date and time required" });
  const rowKey = id();
  await createEntity(TABLE, {
    partitionKey: "meeting", rowKey,
    date: String(b.date).slice(0, 10),
    time: String(b.time).slice(0, 20),
    type: String(b.type || "Commission Meeting").slice(0, 60),
    video: String(b.video || "").slice(0, 500),
    minutes: String(b.minutes || "").slice(0, 500),
    created: new Date().toISOString()
  });
  return json(201, { id: rowKey });
}

app.http("meetings-get", { methods: ["GET"], authLevel: "anonymous", route: "meetings", handler: getMeetings });
app.http("meetings-post", { methods: ["POST"], authLevel: "anonymous", route: "meetings", handler: postMeeting });
