import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { register } from "tsx/esm/api";
register();
const { Avatar, initialOf } = await import("../src/avatar.tsx");
const { Field } = await import("../src/field.tsx");
const { Input } = await import("../src/input.tsx");
test("avatar initials preserve Unicode graphemes and tolerate missing names", () => {
  assert.equal(initialOf(""), "?");
  assert.equal(initialOf("   "), "?");
  assert.equal(initialOf("佐藤 美咲"), "佐");
  assert.equal(initialOf("Alex Chen"), "AC");
  assert.equal(initialOf("👩🏽‍🎨"), "👩🏽‍🎨");
});
test("presence is readable without color and defaults to its status when no localized label is given", () => {
  assert.match(
    renderToStaticMarkup(
      h(Avatar, { name: "Alex", status: "away", statusLabel: "離席中" }),
    ),
    /aria-label="Alex, 離席中"/,
  );
  assert.match(
    renderToStaticMarkup(h(Avatar, { name: "Alex", status: "busy" })),
    /aria-label="Alex, busy"/,
  );
});
test("field success is described by the input and an error always takes precedence", () => {
  const html = renderToStaticMarkup(
    h(Field, {
      id: "name",
      label: "Name",
      success: "Available",
      children: h(Input, { "aria-describedby": "external" }),
    }),
  );
  assert.match(html, /aria-describedby="external name-success"/);
  const error = renderToStaticMarkup(
    h(Field, {
      id: "name",
      label: "Name",
      success: "Available",
      error: "Invalid",
      children: h(Input),
    }),
  );
  assert.match(error, /aria-invalid="true"/);
  assert.match(error, /aria-describedby="name-error"/);
  assert.doesNotMatch(error, /Available|name-success/);
});
