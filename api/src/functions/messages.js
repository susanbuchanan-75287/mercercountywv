"use strict";
const { app } = require("@azure/functions");
const { listEntities, createEntity, principal, hasRole, json, id } = require("../../shared/store");

const TABLE = "messages";
const BOARD_ROLES = ["admin", "commissioner"];

async function getMessages(request) {
  if (!hasRole(request, BOARD_ROLES)) return json(403, { error: "Forbidden" });
  const items = (await listEntities(TABLE))
    .map(e => ({ id: e.rowKey, author: e.author, text: e.text, created: e.created }))
    .sort((a, b) => String(a.created).localeCompare(String(b.created)));
  return json(200, { items });
}

async function postMessage(request) {
  if (!hasRole(request, BOARD_ROLES)) return json(403, { error: "Forbidden" });
  let b; try { b = await request.json(); } catch { return json(400, { error: "Invalid JSON" }); }
  if (!b.text) return json(400, { error: "text required" });
  const p = principal(request);
  const rowKey = id();
  await createEntity(TABLE, {
    partitionKey: "msg", rowKey,
    author: (p && p.userDetails) || "Member",
    text: String(b.text).slice(0, 2000),
    created: new Date().toISOString()
  });
  return json(201, { id: rowKey });
}

app.http("messages-get", { methods: ["GET"], authLevel: "anonymous", route: "messages", handler: getMessages });
app.http("messages-post", { methods: ["POST"], authLevel: "anonymous", route: "messages", handler: postMessage });
