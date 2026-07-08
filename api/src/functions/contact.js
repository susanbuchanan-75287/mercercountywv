"use strict";
const { app } = require("@azure/functions");
const { createEntity, json, id } = require("../../shared/store");

const TABLE = "contact";

async function postContact(request) {
  let b; try { b = await request.json(); } catch { return json(400, { error: "Invalid JSON" }); }
  if (!b.name || !b.email || !b.message) return json(400, { error: "name, email and message required" });
  await createEntity(TABLE, {
    partitionKey: "contact", rowKey: id(),
    name: String(b.name).slice(0, 120),
    email: String(b.email).slice(0, 160),
    subject: String(b.subject || "").slice(0, 200),
    message: String(b.message).slice(0, 4000),
    created: new Date().toISOString()
  });
  return json(201, { ok: true });
}

app.http("contact-post", { methods: ["POST"], authLevel: "anonymous", route: "contact", handler: postContact });
