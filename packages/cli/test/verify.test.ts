import test from "node:test";
import assert from "node:assert/strict";
import { scenarioSchema } from "../src/verify.ts";

test("verify refuses an expectation that cannot fail", () => {
  assert.equal(scenarioSchema.safeParse({version:1,name:"empty assertion",steps:[{action:"expect",target:{role:"button"}}]}).success,false);
});

test("verify preserves explicit false, zero and empty-string assertions and scope", () => {
  const steps = [
    {action:"expect",target:{role:"button",name:"Save",within:{role:"dialog",name:"Edit"}},visible:false},
    {action:"expect",target:{testId:"items"},count:0},
    {action:"expect",target:{label:"Name"},value:""},
    {action:"expect",target:{role:"button",name:"Save"},focused:false},
  ];
  assert.deepEqual(scenarioSchema.parse({version:1,name:"assertions",steps}).steps,steps);
});
