import type { Rule } from "eslint";

// Both supported parsers expose ESTree nodes and scope definitions, with
// slightly different extensions for TypeScript.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Node = any;
function binding(node: Node, context: Rule.RuleContext) {
  for (let scope = context.sourceCode.getScope(node); scope; scope = scope.upper!) {
    const found = scope.set.get(node.name);
    if (found) return found;
  }
  return null;
}
function isUseState(node: Node, context: Rule.RuleContext) {
  if (node?.type === "Identifier") {
    const def = binding(node, context)?.defs[0];
    return def?.type === "ImportBinding" && (def.parent as Node)?.source.value === "react" &&
      (def.node as Node).type === "ImportSpecifier" && (def.node as Node).imported.name === "useState";
  }
  if (node?.type === "MemberExpression" && !node.computed && node.property.name === "useState" && node.object.type === "Identifier") {
    const def = binding(node.object, context)?.defs[0];
    return def?.type === "ImportBinding" && (def.parent as Node)?.source.value === "react" &&
      ["ImportDefaultSpecifier", "ImportNamespaceSpecifier"].includes((def.node as Node).type);
  }
  return false;
}
function isStateSetter(node: Node, context: Rule.RuleContext) {
  if (node?.type !== "Identifier") return false;
  const def = binding(node, context)?.defs[0];
  const declaration = def?.node as Node;
  return def?.type === "Variable" && declaration?.id?.type === "ArrayPattern" &&
    declaration.id.elements[1]?.name === node.name && declaration.init?.type === "CallExpression" &&
    isUseState(declaration.init.callee, context);
}

/** React can run a functional state updater after the event handler returns.
 * currentTarget is then null, even though React no longer pools the event. */
export const noDeferredEventCurrentTarget: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: { description: "Capture React event values before passing a functional useState updater." },
    schema: [],
    messages: { deferred: "更新関数の中で {{name}}.currentTarget を参照しています。イベント処理の終了後は null になるため、イベントハンドラ内で必要な値を取り出し、更新関数にはその値を渡してください。例: const value = {{name}}.currentTarget.value; setState(previous => ({ ...previous, value }));" },
  },
  create(context) {
    return {
      MemberExpression(node: Node) {
        if (node.computed || node.property.name !== "currentTarget" || node.object.type !== "Identifier") return;
        const event = binding(node.object, context);
        const definition = event?.defs.find(def => def.type === "Parameter");
        if (!definition) return;
        const handler = definition.node as Node;
        // Inline JSX event handlers are unambiguously React event boundaries.
        const attribute = handler.parent?.type === "JSXExpressionContainer" ? handler.parent.parent : null;
        if (attribute?.type !== "JSXAttribute" || !/^on[A-Z]/.test(attribute.name.name)) return;
        for (let ancestor = node.parent; ancestor && ancestor !== handler; ancestor = ancestor.parent) {
          if (!["ArrowFunctionExpression", "FunctionExpression"].includes(ancestor.type)) continue;
          const call = ancestor.parent;
          if (call?.type === "CallExpression" && call.arguments[0] === ancestor && isStateSetter(call.callee, context)) {
            context.report({ node, messageId: "deferred", data: { name: node.object.name } });
            break;
          }
        }
      },
    };
  },
};
