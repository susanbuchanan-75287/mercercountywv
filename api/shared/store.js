"use strict";
const { TableClient } = require("@azure/data-tables");

const CONN = process.env.AZURE_STORAGE_CONNECTION_STRING || process.env.AzureWebJobsStorage || "";

// In-memory fallback (used locally when no storage connection is configured)
const mem = {};
function memTable(name) {
  mem[name] = mem[name] || [];
  return {
    async *list() { for (const e of mem[name]) yield e; },
    async create(e) { mem[name].push({ ...e }); },
    async remove(pk, rk) { mem[name] = mem[name].filter(e => !(e.partitionKey === pk && e.rowKey === rk)); }
  };
}

const clients = {};
function client(name) {
  if (!CONN) return null;
  if (!clients[name]) clients[name] = TableClient.fromConnectionString(CONN, name, { allowInsecureConnection: false });
  return clients[name];
}

async function ensure(name) {
  const c = client(name);
  if (c) { try { await c.createTable(); } catch (_) {} }
  return c;
}

async function listEntities(name) {
  const c = client(name);
  if (!c) { const t = memTable(name); const out = []; for await (const e of t.list()) out.push(e); return out; }
  await ensure(name);
  const out = [];
  for await (const e of c.listEntities()) out.push(e);
  return out;
}

async function createEntity(name, entity) {
  const c = await ensure(name);
  if (!c) { return memTable(name).create(entity); }
  await c.createEntity(entity);
}

async function deleteEntity(name, partitionKey, rowKey) {
  const c = client(name);
  if (!c) { return memTable(name).remove(partitionKey, rowKey); }
  await c.deleteEntity(partitionKey, rowKey);
}

// Decode SWA client principal from the injected header
function principal(request) {
  try {
    const h = request.headers.get("x-ms-client-principal");
    if (!h) return null;
    const json = Buffer.from(h, "base64").toString("utf8");
    return JSON.parse(json);
  } catch (_) { return null; }
}

function hasRole(request, roles) {
  const p = principal(request);
  if (!p) return false;
  const userRoles = p.userRoles || [];
  return roles.some(r => userRoles.includes(r));
}

const json = (status, body) => ({
  status,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  jsonBody: body
});

const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

module.exports = { listEntities, createEntity, deleteEntity, principal, hasRole, json, id };
