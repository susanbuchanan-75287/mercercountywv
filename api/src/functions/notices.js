"use strict";
const { app } = require("@azure/functions");
const { listEntities, createEntity, deleteEntity, hasRole, json, id } = require("../../shared/store");

const TABLE = "notices";
const WRITE_ROLES = ["admin", "commissioner"];

async function getNotices(request) {
  const items = (await listEntities(TABLE))
    .map(e => ({ id: e.rowKey, title: e.title, body: e.body, category: e.category, date: e.date, created: e.created, expires: e.expires }))
    .filter(n => !n.expires || new Date(n.expires) >= new Date(new Date().toDateString()))
    .sort((a, b) => String(b.date || b.created).localeCompare(String(a.date || a.created)));
  const limit = parseInt(new URL(request.url).searchParams.get("limit") || "0", 10);
  return json(200, { items: limit > 0 ? items.slice(0, limit) : items });
}

async function postNotice(request) {
  if (!hasRole(request, WRITE_ROLES)) return json(403, { error: "Forbidden" });
  let b; try { b = await request.json(); } catch { return json(400, { error: "Invalid JSON" }); }
  if (!b.title || !b.body) return json(400, { error: "title and body required" });
  const rowKey = id();
  await createEntity(TABLE, {
    partitionKey: "notice", rowKey,
    title: String(b.title).slice(0, 200),
    body: String(b.body).slice(0, 4000),
    category: String(b.category || "legal").slice(0, 40),
    date: b.date || new Date().toISOString().slice(0, 10),
    expires: b.expires || "",
    created: new Date().toISOString()
  });
  return json(201, { id: rowKey });
}

async function deleteNotice(request, context) {
  if (!hasRole(request, WRITE_ROLES)) return json(403, { error: "Forbidden" });
  const rowKey = context.params.id;
  await deleteEntity(TABLE, "notice", rowKey);
  return json(200, { ok: true });
}

app.http("notices-get", { methods: ["GET"], authLevel: "anonymous", route: "notices", handler: getNotices });
app.http("notices-post", { methods: ["POST"], authLevel: "anonymous", route: "notices", handler: postNotice });
app.http("notices-delete", { methods: ["DELETE"], authLevel: "anonymous", route: "notices/{id}", handler: deleteNotice });
