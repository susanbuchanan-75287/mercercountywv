"use strict";
const { app } = require("@azure/functions");
const { listEntities, createEntity, upsertEntity, deleteEntity, hasRole, json, id } = require("../../shared/store");

const TABLE = "people";
const WRITE_ROLES = ["admin", "commissioner"];
const STATUSES = ["active", "retired", "former", "appointed", "vacant"];

async function getPeople() {
  const items = (await listEntities(TABLE))
    .map(e => ({
      id: e.rowKey,
      name: e.name,
      role: e.role,
      status: e.status,
      term: e.term,
      order: typeof e.order === "number" ? e.order : parseInt(e.order || "0", 10) || 0,
      created: e.created
    }))
    .sort((a, b) => (a.order - b.order) || String(a.name).localeCompare(String(b.name)));
  return json(200, { items });
}

async function postPerson(request) {
  if (!hasRole(request, WRITE_ROLES)) return json(403, { error: "Forbidden" });
  let b; try { b = await request.json(); } catch { return json(400, { error: "Invalid JSON" }); }
  if (!b.name) return json(400, { error: "name required" });
  const status = STATUSES.indexOf(String(b.status || "").toLowerCase()) !== -1
    ? String(b.status).toLowerCase() : "active";
  // Reuse rowKey when provided to update an existing person (e.g. change status).
  const rowKey = b.id ? String(b.id).slice(0, 40) : id();
  const entity = {
    partitionKey: "person", rowKey,
    name: String(b.name).slice(0, 120),
    role: String(b.role || "").slice(0, 120),
    status,
    term: String(b.term || "").slice(0, 60),
    order: parseInt(b.order, 10) || 0,
    created: new Date().toISOString()
  };
  if (b.id) await upsertEntity(TABLE, entity);
  else await createEntity(TABLE, entity);
  return json(b.id ? 200 : 201, { id: rowKey });
}

async function deletePerson(request) {
  if (!hasRole(request, WRITE_ROLES)) return json(403, { error: "Forbidden" });
  const rowKey = request.params.id;
  if (!rowKey) return json(400, { error: "id required" });
  try { await deleteEntity(TABLE, "person", rowKey); } catch { return json(404, { error: "Not found" }); }
  return json(200, { ok: true });
}

app.http("people-get", { methods: ["GET"], authLevel: "anonymous", route: "people", handler: getPeople });
app.http("people-post", { methods: ["POST"], authLevel: "anonymous", route: "people", handler: postPerson });
app.http("people-delete", { methods: ["DELETE"], authLevel: "anonymous", route: "people/{id}", handler: deletePerson });
