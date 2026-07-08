"use strict";
const { app } = require("@azure/functions");
const { listEntities, createEntity, deleteEntity, hasRole, json, id } = require("../../shared/store");

const TABLE = "documents";
const WRITE_ROLES = ["admin", "commissioner"];

async function getDocuments() {
  const items = (await listEntities(TABLE))
    .map(e => ({
      id: e.rowKey,
      title: e.title,
      category: e.category,
      url: e.url,
      date: e.date,
      created: e.created
    }))
    .sort((a, b) => String(b.date || b.created).localeCompare(String(a.date || a.created)));
  return json(200, { items });
}

async function postDocument(request) {
  if (!hasRole(request, WRITE_ROLES)) return json(403, { error: "Forbidden" });
  let b; try { b = await request.json(); } catch { return json(400, { error: "Invalid JSON" }); }
  if (!b.title || !b.url) return json(400, { error: "title and url required" });
  const rowKey = id();
  await createEntity(TABLE, {
    partitionKey: "document", rowKey,
    title: String(b.title).slice(0, 160),
    category: String(b.category || "General").slice(0, 60),
    url: String(b.url).slice(0, 600),
    date: String(b.date || new Date().toISOString().slice(0, 10)).slice(0, 10),
    created: new Date().toISOString()
  });
  return json(201, { id: rowKey });
}

async function deleteDocument(request) {
  if (!hasRole(request, WRITE_ROLES)) return json(403, { error: "Forbidden" });
  const rowKey = request.params.id;
  if (!rowKey) return json(400, { error: "id required" });
  try { await deleteEntity(TABLE, "document", rowKey); } catch { return json(404, { error: "Not found" }); }
  return json(200, { ok: true });
}

app.http("documents-get", { methods: ["GET"], authLevel: "anonymous", route: "documents", handler: getDocuments });
app.http("documents-post", { methods: ["POST"], authLevel: "anonymous", route: "documents", handler: postDocument });
app.http("documents-delete", { methods: ["DELETE"], authLevel: "anonymous", route: "documents/{id}", handler: deleteDocument });
