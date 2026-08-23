window.__ModuleLoader__.load({
  id: "@dsh/social-workbench",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    var React = require("react");
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// client/src/index.jsx
var index_exports = {};
__export(index_exports, {
  RPC_CHANNEL: () => RPC_CHANNEL,
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(index_exports);
var import_react2 = __toESM(require("react"), 1);

// client/src/Workbench.jsx
var import_react = __toESM(require("react"), 1);
var STATE_ZH = { ready: "\u6B63\u5E38", degraded: "\u53D7\u9650", blocked: "\u963B\u585E", unknown: "\u672A\u77E5", "not-applicable": "\u672A\u5B9E\u73B0" };
var LIFE_ZH = { available: "\u5DF2\u5177\u5907", partial: "\u90E8\u5206\u5177\u5907", planned: "\u89C4\u5212\u4E2D" };
function callOrThrow(rpcCall, endpoint) {
  return rpcCall(endpoint, {}).then((response) => {
    if (!response?.ok) throw new Error(response?.error?.message ?? "RPC failed");
    return response.value;
  });
}
function StateBadge({ state, children }) {
  return /* @__PURE__ */ import_react.default.createElement("span", { className: "sw-state", "data-state": state }, children ?? STATE_ZH[state] ?? state);
}
function countOf(counts, key) {
  return Number.isFinite(counts?.[key]) ? counts[key] : 0;
}
function pipelineStages(snapshot) {
  const counts = snapshot.activity.counts;
  const sourceCount = countOf(counts, "sources");
  const briefCount = countOf(counts, "briefs");
  const packageCount = countOf(counts, "packages");
  const revisionCount = countOf(counts, "revisions");
  const receiptCount = countOf(counts, "receipts");
  return [
    { id: "sources", index: "01", title: "Sources", subtitle: "\u8BC1\u636E\u4E0E\u6388\u6743\u7D20\u6750", value: sourceCount, state: sourceCount > 0 ? "active" : "empty" },
    { id: "signals", index: "02", title: "Signals", subtitle: "\u9700\u6C42\u5047\u8BBE\u4E0E\u53CD\u8BC1", value: null, state: "planned" },
    { id: "content", index: "03", title: "Content", subtitle: "Brief\u3001\u5E73\u53F0\u5305\u4E0E\u51BB\u7ED3\u7248\u672C", value: briefCount + packageCount + revisionCount, detail: `${briefCount} brief \xB7 ${packageCount} package \xB7 ${revisionCount} revision`, state: revisionCount > 0 ? "active" : packageCount > 0 ? "partial" : "empty" },
    { id: "publishing", index: "04", title: "Publishing", subtitle: "\u6279\u51C6\u3001\u6267\u884C\u4E0E\u56DE\u6267", value: receiptCount, state: receiptCount > 0 ? "active" : "waiting" },
    { id: "learning", index: "05", title: "Learning", subtitle: "\u6307\u6807\u3001\u7ED3\u8BBA\u4E0E\u4E0B\u4E00\u8F6E", value: null, state: "planned" }
  ];
}
function deriveNextStep(snapshot) {
  const counts = snapshot.activity.counts;
  if (countOf(counts, "sources") === 0) return { eyebrow: "NEXT \xB7 INGRESS", title: "\u6DFB\u52A0\u4E00\u6761\u6709\u6388\u6743\u8BF4\u660E\u7684\u771F\u5B9E\u6765\u6E90", detail: "\u5148\u5EFA\u7ACB\u8BC1\u636E\u4E0E\u6743\u5229\u8FB9\u754C\uFF0C\u518D\u5F00\u59CB\u5206\u6790\u548C\u751F\u4EA7\u3002" };
  if (countOf(counts, "briefs") === 0) return { eyebrow: "NEXT \xB7 UNDERSTAND", title: "\u628A\u6765\u6E90\u6574\u7406\u6210\u8BC1\u636E\u5316 Brief", detail: "\u660E\u786E\u9700\u6C42\u5047\u8BBE\u3001\u652F\u6301\u8BC1\u636E\u548C\u53CD\u8BC1\uFF0C\u800C\u4E0D\u662F\u76F4\u63A5\u751F\u6210\u5185\u5BB9\u3002" };
  if (countOf(counts, "packages") === 0) return { eyebrow: "NEXT \xB7 PRODUCE", title: "\u751F\u6210\u5C0F\u7EA2\u4E66\u4E0E\u6296\u97F3\u72EC\u7ACB\u5185\u5BB9\u5305", detail: "\u5E73\u53F0\u53D8\u4F53\u5171\u4EAB\u8BC1\u636E\uFF0C\u4F46\u4E0D\u5171\u4EAB\u53D1\u5E03\u683C\u5F0F\u3002" };
  if (countOf(counts, "revisions") === 0) return { eyebrow: "NEXT \xB7 FREEZE", title: "\u51BB\u7ED3\u5F85\u5BA1\u6838 revision", detail: "\u53D1\u5E03\u6279\u51C6\u5FC5\u987B\u7ED1\u5B9A\u4E0D\u53EF\u53D8\u5185\u5BB9\u4E0E\u5A92\u4F53\u6307\u7EB9\u3002" };
  if (countOf(counts, "receipts") === 0) return { eyebrow: "NEXT \xB7 VERIFY", title: "\u5B8C\u6210\u53CC\u5E73\u53F0\u79C1\u5BC6\u95ED\u73AF\u9A8C\u8BC1", detail: "\u5728 Browser Use \u4E2D\u767B\u5F55\u4E0E\u89C2\u5BDF\uFF1B\u63D0\u4EA4\u524D\u4ECD\u9010\u4E2A\u5E73\u53F0\u786E\u8BA4\u3002" };
  return { eyebrow: "NEXT \xB7 LEARN", title: "\u8BFB\u53D6\u8868\u73B0\u6570\u636E\u5E76\u590D\u76D8\u5047\u8BBE", detail: "\u628A\u7ED3\u679C\u56DE\u6D41\u4E3A\u4E0B\u4E00\u8F6E\u53EF\u8BC1\u4F2A\u7684\u9700\u6C42\u5224\u65AD\u3002" };
}
function actionableItems(snapshot) {
  const rows = [];
  for (const capability of snapshot.capabilities) {
    if (capability.lifecycle === "planned") continue;
    for (const condition of capability.health.conditions) {
      if (condition.status === "true") continue;
      rows.push({ id: `${capability.id}:${condition.type}`, title: capability.title.zh, message: condition.message, remedy: condition.remedy, state: capability.health.state });
    }
  }
  return rows.slice(0, 4);
}
function PlatformRow({ capability }) {
  if (!capability) return null;
  const positive = capability.health.conditions.filter((item) => item.status === "true").length;
  const total = capability.health.conditions.length;
  const blocker = capability.health.conditions.find((item) => item.status !== "true");
  return /* @__PURE__ */ import_react.default.createElement("article", { className: "sw-platform", "data-state": capability.health.state }, /* @__PURE__ */ import_react.default.createElement("div", { className: "sw-platform-mark" }, capability.id.endsWith("xiaohongshu") ? "RED" : "DY"), /* @__PURE__ */ import_react.default.createElement("div", { className: "sw-platform-copy" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("b", null, capability.title.zh), /* @__PURE__ */ import_react.default.createElement(StateBadge, { state: capability.health.state })), /* @__PURE__ */ import_react.default.createElement("p", null, capability.health.summary), blocker?.remedy && /* @__PURE__ */ import_react.default.createElement("small", null, blocker.remedy)), /* @__PURE__ */ import_react.default.createElement("div", { className: "sw-platform-score" }, /* @__PURE__ */ import_react.default.createElement("b", null, positive, "/", total || "\u2013"), /* @__PURE__ */ import_react.default.createElement("span", null, "conditions")));
}
function Overview({ snapshot }) {
  const stages = pipelineStages(snapshot);
  const next = deriveNextStep(snapshot);
  const actions = actionableItems(snapshot);
  const xhs = snapshot.capabilities.find((item) => item.id === "publication.xiaohongshu");
  const douyin = snapshot.capabilities.find((item) => item.id === "publication.douyin");
  const counts = snapshot.activity.counts;
  return /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("section", { className: "sw-focus-grid" }, /* @__PURE__ */ import_react.default.createElement("article", { className: "sw-mission" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "sw-eyebrow" }, "CURRENT LOOP \xB7 PRIVATE VALIDATION"), /* @__PURE__ */ import_react.default.createElement("h2", null, "\u6253\u901A\u5C0F\u7EA2\u4E66 / \u6296\u97F3\u95ED\u73AF"), /* @__PURE__ */ import_react.default.createElement("p", null, "\u4ECE\u4E00\u6761\u771F\u5B9E\u6765\u6E90\u51FA\u53D1\uFF0C\u5F62\u6210\u51BB\u7ED3\u5185\u5BB9\u7248\u672C\uFF0C\u5206\u522B\u5728\u4E24\u4E2A\u5E73\u53F0\u5B8C\u6210\u79C1\u5BC6\u6267\u884C\u548C\u5E73\u53F0\u4FA7\u53CD\u67E5\u3002"), /* @__PURE__ */ import_react.default.createElement("div", { className: "sw-mission-meta" }, /* @__PURE__ */ import_react.default.createElement("span", null, "\u8303\u56F4 \xB7 \u53CC\u5E73\u53F0"), /* @__PURE__ */ import_react.default.createElement("span", null, "\u6A21\u5F0F \xB7 \u4EBA\u673A\u534F\u4F5C"), /* @__PURE__ */ import_react.default.createElement("span", null, "\u63D0\u4EA4 \xB7 \u9010\u6B21\u786E\u8BA4"))), /* @__PURE__ */ import_react.default.createElement("article", { className: "sw-next" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "sw-eyebrow" }, next.eyebrow), /* @__PURE__ */ import_react.default.createElement("h3", null, next.title), /* @__PURE__ */ import_react.default.createElement("p", null, next.detail), /* @__PURE__ */ import_react.default.createElement("div", { className: "sw-browser-note" }, /* @__PURE__ */ import_react.default.createElement("i", null), "\u6D4F\u89C8\u5668\u5728\u53F3\u4FA7 Browser Use \u9762\u677F\uFF0C\u4E0E\u5F53\u524D Session \u5171\u4EAB"))), /* @__PURE__ */ import_react.default.createElement("section", { className: "sw-section" }, /* @__PURE__ */ import_react.default.createElement("header", { className: "sw-section-head" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("span", null, "FLOW"), /* @__PURE__ */ import_react.default.createElement("h3", null, "\u4ECE\u8BC1\u636E\u5230\u5B66\u4E60")), /* @__PURE__ */ import_react.default.createElement("small", null, "\u9636\u6BB5\u662F\u4E1A\u52A1\u8BED\u4E49\uFF0C\u4E0D\u7B49\u540C\u4E8E\u67D0\u4E2A\u811A\u672C\u6216 adapter")), /* @__PURE__ */ import_react.default.createElement("div", { className: "sw-pipeline" }, stages.map((stage, index) => /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, { key: stage.id }, /* @__PURE__ */ import_react.default.createElement("article", { className: "sw-stage", "data-state": stage.state }, /* @__PURE__ */ import_react.default.createElement("header", null, /* @__PURE__ */ import_react.default.createElement("span", null, stage.index), /* @__PURE__ */ import_react.default.createElement("i", null)), /* @__PURE__ */ import_react.default.createElement("h4", null, stage.title), /* @__PURE__ */ import_react.default.createElement("p", null, stage.subtitle), stage.value === null ? /* @__PURE__ */ import_react.default.createElement("b", { className: "sw-stage-plan" }, "NEXT") : /* @__PURE__ */ import_react.default.createElement("b", { className: "sw-stage-value" }, stage.value), stage.detail && /* @__PURE__ */ import_react.default.createElement("small", null, stage.detail)), index < stages.length - 1 && /* @__PURE__ */ import_react.default.createElement("div", { className: "sw-stage-arrow", "aria-hidden": "true" }, "\u2192"))))), /* @__PURE__ */ import_react.default.createElement("section", { className: "sw-lower-grid" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "sw-panel" }, /* @__PURE__ */ import_react.default.createElement("header", { className: "sw-panel-head" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("span", null, "EXECUTION"), /* @__PURE__ */ import_react.default.createElement("h3", null, "\u5E73\u53F0\u6267\u884C")), /* @__PURE__ */ import_react.default.createElement("small", null, "\u6D4F\u89C8\u5668 / adapter / \u56DE\u6267")), /* @__PURE__ */ import_react.default.createElement("div", { className: "sw-platforms" }, /* @__PURE__ */ import_react.default.createElement(PlatformRow, { capability: xhs }), /* @__PURE__ */ import_react.default.createElement(PlatformRow, { capability: douyin }))), /* @__PURE__ */ import_react.default.createElement("div", { className: "sw-panel" }, /* @__PURE__ */ import_react.default.createElement("header", { className: "sw-panel-head" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("span", null, "ATTENTION"), /* @__PURE__ */ import_react.default.createElement("h3", null, "\u5F85\u5904\u7406")), /* @__PURE__ */ import_react.default.createElement("b", null, actions.length)), actions.length === 0 ? /* @__PURE__ */ import_react.default.createElement("p", { className: "sw-empty" }, "\u5F53\u524D\u6CA1\u6709\u9700\u8981\u5904\u7406\u7684\u8FD0\u884C\u65F6\u5F02\u5E38\u3002") : /* @__PURE__ */ import_react.default.createElement("ol", { className: "sw-actions" }, actions.map((item, index) => /* @__PURE__ */ import_react.default.createElement("li", { key: item.id }, /* @__PURE__ */ import_react.default.createElement("span", null, String(index + 1).padStart(2, "0")), /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("b", null, item.title), /* @__PURE__ */ import_react.default.createElement("p", null, item.message), item.remedy && /* @__PURE__ */ import_react.default.createElement("small", null, item.remedy))))))), /* @__PURE__ */ import_react.default.createElement("section", { className: "sw-facts" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("span", null, "sources"), /* @__PURE__ */ import_react.default.createElement("b", null, countOf(counts, "sources"))), /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("span", null, "briefs"), /* @__PURE__ */ import_react.default.createElement("b", null, countOf(counts, "briefs"))), /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("span", null, "packages"), /* @__PURE__ */ import_react.default.createElement("b", null, countOf(counts, "packages"))), /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("span", null, "revisions"), /* @__PURE__ */ import_react.default.createElement("b", null, countOf(counts, "revisions"))), /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("span", null, "receipts"), /* @__PURE__ */ import_react.default.createElement("b", null, countOf(counts, "receipts"))), /* @__PURE__ */ import_react.default.createElement("p", null, "\u8FD9\u4E9B\u662F canonical objects\uFF0C\u4E0D\u662F\u201C\u5B8C\u6210\u5EA6\u201D\u767E\u5206\u6BD4\u3002")));
}
function SystemView({ snapshot }) {
  return /* @__PURE__ */ import_react.default.createElement("section", { className: "sw-system" }, /* @__PURE__ */ import_react.default.createElement("header", { className: "sw-system-summary" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("span", null, "SYSTEM CONTROL PLANE"), /* @__PURE__ */ import_react.default.createElement("h2", null, "\u80FD\u529B\u4E0E\u8FD0\u884C\u6761\u4EF6"), /* @__PURE__ */ import_react.default.createElement("p", null, "\u8FD9\u91CC\u89E3\u91CA\u7CFB\u7EDF\u4E3A\u4EC0\u4E48\u53EF\u7528\u6216\u53D7\u963B\uFF1B\u5B83\u4E0D\u4EE3\u8868\u5F53\u524D\u5DE5\u4F5C\u7684\u5148\u540E\u987A\u5E8F\u3002")), /* @__PURE__ */ import_react.default.createElement("div", { className: "sw-health-counts" }, /* @__PURE__ */ import_react.default.createElement("b", null, snapshot.summary.ready, /* @__PURE__ */ import_react.default.createElement("small", null, "\u6B63\u5E38")), /* @__PURE__ */ import_react.default.createElement("b", null, snapshot.summary.degraded, /* @__PURE__ */ import_react.default.createElement("small", null, "\u53D7\u9650")), /* @__PURE__ */ import_react.default.createElement("b", null, snapshot.summary.blocked, /* @__PURE__ */ import_react.default.createElement("small", null, "\u963B\u585E")), /* @__PURE__ */ import_react.default.createElement("b", null, snapshot.summary.planned, /* @__PURE__ */ import_react.default.createElement("small", null, "\u89C4\u5212")))), /* @__PURE__ */ import_react.default.createElement("div", { className: "sw-capability-list" }, snapshot.capabilities.map((capability) => /* @__PURE__ */ import_react.default.createElement("article", { key: capability.id, className: "sw-capability-row", "data-state": capability.health.state }, /* @__PURE__ */ import_react.default.createElement("div", { className: "sw-capability-main" }, /* @__PURE__ */ import_react.default.createElement("span", null, capability.area), /* @__PURE__ */ import_react.default.createElement("h3", null, capability.title.zh), /* @__PURE__ */ import_react.default.createElement("p", null, capability.health.summary)), /* @__PURE__ */ import_react.default.createElement("div", { className: "sw-capability-badges" }, /* @__PURE__ */ import_react.default.createElement("span", null, LIFE_ZH[capability.lifecycle]), /* @__PURE__ */ import_react.default.createElement(StateBadge, { state: capability.health.state })), /* @__PURE__ */ import_react.default.createElement("div", { className: "sw-condition-list" }, capability.health.conditions.length === 0 ? /* @__PURE__ */ import_react.default.createElement("small", null, "\u5C1A\u65E0\u8FD0\u884C\u6761\u4EF6") : capability.health.conditions.map((condition) => /* @__PURE__ */ import_react.default.createElement("div", { key: `${capability.id}:${condition.type}`, "data-status": condition.status }, /* @__PURE__ */ import_react.default.createElement("i", null), /* @__PURE__ */ import_react.default.createElement("span", null, /* @__PURE__ */ import_react.default.createElement("b", null, condition.type), condition.message))))))));
}
function Workbench({ rpcCall, t }) {
  const [view, setView] = (0, import_react.useState)({ status: "loading" });
  const [section, setSection] = (0, import_react.useState)("overview");
  const [refreshing, setRefreshing] = (0, import_react.useState)(false);
  const load = (endpoint = "bootstrap") => {
    if (endpoint === "bootstrap") setView({ status: "loading" });
    else setRefreshing(true);
    callOrThrow(rpcCall, endpoint).then(
      (snapshot2) => setView({ status: "ready", snapshot: snapshot2 }),
      (error) => setView((current) => current.status === "ready" ? { ...current, notice: error.message } : { status: "error", error: error.message })
    ).finally(() => setRefreshing(false));
  };
  (0, import_react.useEffect)(() => load(), [rpcCall]);
  const generated = (0, import_react.useMemo)(() => view.status === "ready" ? new Date(view.snapshot.generatedAt).toLocaleTimeString() : "", [view]);
  if (view.status === "loading") return /* @__PURE__ */ import_react.default.createElement("section", { className: "sw-shell sw-centered" }, /* @__PURE__ */ import_react.default.createElement("p", null, t("loading")));
  if (view.status === "error") return /* @__PURE__ */ import_react.default.createElement("section", { className: "sw-shell sw-centered" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "sw-error" }, /* @__PURE__ */ import_react.default.createElement("p", null, view.error), /* @__PURE__ */ import_react.default.createElement("button", { type: "button", onClick: () => load() }, t("retry"))));
  const { snapshot } = view;
  return /* @__PURE__ */ import_react.default.createElement("section", { className: "sw-shell" }, /* @__PURE__ */ import_react.default.createElement("header", { className: "sw-toolbar" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "sw-brand" }, /* @__PURE__ */ import_react.default.createElement("span", null, "SW"), /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("b", null, t("title")), /* @__PURE__ */ import_react.default.createElement("small", null, "evidence \u2192 demand \u2192 content \u2192 publish \u2192 learn"))), /* @__PURE__ */ import_react.default.createElement("nav", { "aria-label": "Social Workbench views" }, /* @__PURE__ */ import_react.default.createElement("button", { type: "button", "data-active": section === "overview", onClick: () => setSection("overview") }, "\u5F53\u524D\u95ED\u73AF"), /* @__PURE__ */ import_react.default.createElement("button", { type: "button", "data-active": section === "system", onClick: () => setSection("system") }, "\u7CFB\u7EDF")), /* @__PURE__ */ import_react.default.createElement("div", { className: "sw-toolbar-status" }, /* @__PURE__ */ import_react.default.createElement(StateBadge, { state: snapshot.overall }, "\u7CFB\u7EDF ", STATE_ZH[snapshot.overall]), /* @__PURE__ */ import_react.default.createElement("small", null, generated), /* @__PURE__ */ import_react.default.createElement("button", { type: "button", disabled: refreshing, onClick: () => load("refresh-health") }, refreshing ? t("refreshing") : t("refresh")))), view.notice && /* @__PURE__ */ import_react.default.createElement("p", { className: "sw-notice" }, view.notice), /* @__PURE__ */ import_react.default.createElement("main", null, section === "overview" ? /* @__PURE__ */ import_react.default.createElement(Overview, { snapshot }) : /* @__PURE__ */ import_react.default.createElement(SystemView, { snapshot })), /* @__PURE__ */ import_react.default.createElement("footer", { className: "sw-boundary" }, /* @__PURE__ */ import_react.default.createElement("b", null, "AUTHORITY"), /* @__PURE__ */ import_react.default.createElement("span", null, "\u5DE5\u4F5C\u53F0\u53EA\u8BFB \xB7 \u6D4F\u89C8\u5668\u767B\u5F55\u7531\u7528\u6237\u5B8C\u6210 \xB7 \u4E0A\u4F20\u4E0E\u53D1\u5E03\u6309 revision \u5355\u72EC\u786E\u8BA4"), /* @__PURE__ */ import_react.default.createElement("i", null, "STAGING ONLY")));
}

// client/src/locales.js
var NS = "socialWorkbench";
var en = {
  settingsLabel: "Social Workbench",
  title: "Social Capability Workbench",
  subtitle: "What the system can do, whether it is usable now, and what unblocks it.",
  loading: "Loading capability health\u2026",
  retry: "Retry",
  refresh: "Refresh health",
  refreshing: "Checking\u2026",
  pipeline: "Pipeline facts",
  capabilities: "Capability map",
  safety: "Authority boundary",
  safetyText: "This surface is read-only. Login, one-time approval, and live publishing remain user-held operations.",
  lastChecked: "Observed",
  noConditions: "No runtime conditions \u2014 this capability is planned."
};
var dictionaries = {
  en,
  zh: {
    settingsLabel: "\u793E\u4EA4\u80FD\u529B\u5DE5\u4F5C\u53F0",
    title: "\u793E\u4EA4\u80FD\u529B\u5DE5\u4F5C\u53F0",
    subtitle: "\u53EA\u770B\u4E09\u4EF6\u4E8B\uFF1A\u7CFB\u7EDF\u80FD\u505A\u4EC0\u4E48\u3001\u6B64\u523B\u662F\u5426\u53EF\u7528\u3001\u4E0B\u4E00\u6B65\u5982\u4F55\u89E3\u9664\u963B\u585E\u3002",
    loading: "\u6B63\u5728\u8BFB\u53D6\u80FD\u529B\u5065\u5EB7\u72B6\u6001\u2026",
    retry: "\u91CD\u8BD5",
    refresh: "\u5237\u65B0\u5065\u5EB7\u72B6\u6001",
    refreshing: "\u68C0\u67E5\u4E2D\u2026",
    pipeline: "\u6D41\u6C34\u7EBF\u4E8B\u5B9E",
    capabilities: "\u80FD\u529B\u5730\u56FE",
    safety: "\u6743\u9650\u8FB9\u754C",
    safetyText: "\u5F53\u524D\u754C\u9762\u53EA\u8BFB\u3002\u767B\u5F55\u3001\u4E00\u6B21\u6027\u786E\u8BA4\u548C\u771F\u5B9E\u53D1\u5E03\u4ECD\u7531\u7528\u6237\u6301\u6709\uFF0C\u4E0D\u56E0\u5DE5\u4F5C\u53F0\u53EF\u89C1\u800C\u81EA\u52A8\u6269\u6743\u3002",
    lastChecked: "\u63A2\u6D4B\u65F6\u95F4",
    noConditions: "\u6CA1\u6709\u8FD0\u884C\u6761\u4EF6\uFF1A\u8BE5\u80FD\u529B\u4ECD\u5904\u4E8E\u89C4\u5212\u9636\u6BB5\u3002"
  }
};

// client/src/styles.js
var CSS = `
.sw-shell{--sw-ink:var(--dsw-alias-label-primary,#17202a);--sw-muted:var(--dsw-alias-label-secondary,#64748b);--sw-line:var(--dsw-alias-border-l2,#dbe3e8);width:min(1120px,100%);display:flex;flex-direction:column;gap:16px;color:var(--sw-ink);padding-bottom:40px}.sw-shell *{box-sizing:border-box}.sw-shell button{font:inherit;cursor:pointer}.sw-hero{display:flex;justify-content:space-between;gap:24px;padding:25px 27px;border-radius:20px;color:#eefbf7;background:radial-gradient(circle at 78% -20%,#2dd4bf55,transparent 38%),linear-gradient(135deg,#101827,#17243a 55%,#173d43);box-shadow:0 16px 34px #0f172a20}.sw-kicker{font-size:10px;letter-spacing:.16em;color:#5eead4}.sw-hero h2{margin:7px 0 5px;font-size:27px;letter-spacing:-.035em}.sw-hero p{margin:0;max-width:620px;color:#bdd0d7;font-size:12px;line-height:1.6}.sw-overall{display:flex;min-width:160px;align-items:flex-end;flex-direction:column;gap:7px}.sw-overall small{color:#94a3b8;font-size:10px}.sw-overall button,.sw-error button{border:1px solid #5eead466;border-radius:9px;background:#5eead4;color:#123134;font-weight:750;padding:7px 11px}.sw-overall button:disabled{opacity:.55}.sw-state{display:inline-flex;align-items:center;border:1px solid transparent;border-radius:999px;font-size:10px;font-weight:800;padding:4px 8px;white-space:nowrap}.sw-state[data-state=ready]{background:#dcfce7;color:#166534;border-color:#86efac}.sw-state[data-state=degraded]{background:#fef3c7;color:#92400e;border-color:#fcd34d}.sw-state[data-state=blocked]{background:#fee2e2;color:#991b1b;border-color:#fca5a5}.sw-state[data-state=unknown],.sw-state[data-state=not-applicable]{background:#e2e8f0;color:#475569;border-color:#cbd5e1}.sw-safety{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:13px 16px;border:1px solid #a7f3d0;border-radius:13px;background:#ecfdf5}.sw-safety b{font-size:11px;color:#047857}.sw-safety p{display:inline;margin-left:10px;font-size:11px;color:#47625b}.sw-safety>span{font:800 9px/1 monospace;letter-spacing:.12em;color:#047857;white-space:nowrap}.sw-summary{display:grid;grid-template-columns:1.2fr repeat(5,.55fr) 1.2fr;gap:8px}.sw-summary>div{min-height:78px;border:1px solid var(--sw-line);border-radius:13px;background:var(--dsw-alias-bg-layer-1,#fff);padding:12px}.sw-summary-title span,.sw-summary-health>span{display:block;color:#0f766e;font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.sw-summary-title b{display:block;margin-top:4px;font-size:23px}.sw-summary-title small{font-size:9px;color:var(--sw-muted)}.sw-metric{display:flex;flex-direction:column;justify-content:center;align-items:center}.sw-metric b{font-size:19px}.sw-metric span{font-size:9px;color:var(--sw-muted)}.sw-summary-health{display:grid;grid-template-columns:1fr 1fr;gap:3px 8px}.sw-summary-health>span{grid-column:1/-1}.sw-summary-health div{display:flex;align-items:center;gap:4px;font-size:9px;color:var(--sw-muted)}.sw-summary-health i{width:6px;height:6px;border-radius:50%}.sw-summary-health i[data-state=ready]{background:#22c55e}.sw-summary-health i[data-state=degraded]{background:#f59e0b}.sw-summary-health i[data-state=blocked]{background:#ef4444}.sw-summary-health i[data-state=unknown]{background:#64748b}.sw-summary-health i[data-state=planned]{background:#cbd5e1}.sw-groups{display:flex;flex-direction:column;gap:17px}.sw-group>header{display:flex;align-items:center;gap:10px;margin-bottom:8px}.sw-group>header span{font-size:11px;font-weight:850;letter-spacing:.08em;text-transform:uppercase}.sw-group>header i{font-style:normal;font:700 9px/1 monospace;color:#0f766e}.sw-group>header:after{content:"";height:1px;flex:1;background:var(--sw-line)}.sw-group>div{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.sw-capability{position:relative;overflow:hidden;border:1px solid var(--sw-line);border-radius:15px;background:var(--dsw-alias-bg-layer-1,#fff);padding:15px;display:flex;flex-direction:column;gap:10px}.sw-capability:before{content:"";position:absolute;inset:0 auto 0 0;width:3px;background:#94a3b8}.sw-capability[data-state=ready]:before{background:#22c55e}.sw-capability[data-state=degraded]:before{background:#f59e0b}.sw-capability[data-state=blocked]:before{background:#ef4444}.sw-capability>header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.sw-area{font:750 9px/1.2 monospace;color:#0f766e;text-transform:uppercase}.sw-capability h3{margin:4px 0 0;font-size:15px}.sw-badges{display:flex;gap:5px}.sw-life{border-radius:999px;background:#f1f5f9;color:#475569;font-size:9px;font-weight:750;padding:4px 7px;white-space:nowrap}.sw-life[data-life=planned]{color:#64748b;border:1px dashed #94a3b8}.sw-capability>p{margin:0;color:var(--sw-muted);font-size:11px;line-height:1.55}.sw-operations{display:flex;flex-wrap:wrap;gap:5px}.sw-operations span{border-radius:6px;background:#f0fdfa;color:#0f766e;font-size:9px;padding:3px 6px}.sw-operations span[data-status=restricted]{background:#fff7ed;color:#9a3412}.sw-operations span[data-status=planned]{background:#f1f5f9;color:#64748b}.sw-health-summary{display:flex;align-items:end;justify-content:space-between;gap:12px;border-top:1px solid var(--sw-line);padding-top:9px}.sw-health-summary b{font-size:10px;line-height:1.45}.sw-health-summary small{font-size:8px;color:var(--sw-muted);white-space:nowrap}.sw-conditions{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:5px}.sw-condition{display:grid;grid-template-columns:8px 1fr;gap:7px;border-radius:8px;background:#f8fafc;padding:7px}.sw-condition>i{width:7px;height:7px;margin-top:3px;border-radius:50%;background:#94a3b8}.sw-condition[data-status=true]>i{background:#22c55e}.sw-condition[data-status=false]>i{background:#ef4444}.sw-condition div{display:flex;flex-direction:column;gap:1px}.sw-condition b{font:750 9px/1.3 monospace;color:#334155}.sw-condition span,.sw-condition small{font-size:9px;line-height:1.45;color:#64748b}.sw-condition small{color:#9a3412}.sw-empty{border:1px dashed var(--sw-line);border-radius:8px;padding:8px!important;font-size:9px!important}.sw-capability>footer{display:flex;justify-content:space-between;gap:10px;margin-top:auto;color:#94a3b8;font-size:8px}.sw-capability code{font-size:8px}.sw-notice,.sw-error{border:1px solid #fecaca;border-radius:10px;background:#fff1f2;color:#9f1239;padding:11px;font-size:11px}.sw-error button{margin-top:8px}.sw-error p{margin:0}@media(max-width:900px){.sw-summary{grid-template-columns:repeat(3,1fr)}.sw-summary-title,.sw-summary-health{grid-column:span 3}.sw-group>div{grid-template-columns:1fr}}@media(max-width:620px){.sw-hero{flex-direction:column}.sw-overall{align-items:flex-start}.sw-safety{align-items:flex-start}.sw-safety p{display:block;margin:4px 0 0}.sw-summary{grid-template-columns:repeat(2,1fr)}.sw-summary-title,.sw-summary-health{grid-column:span 2}.sw-capability>header,.sw-health-summary{flex-direction:column;align-items:flex-start}.sw-badges{flex-wrap:wrap}.sw-health-summary small{white-space:normal}}
`;

// client/src/index.jsx
var name = "social-workbench";
var inject = ["slots", "connection", "locale"];
var RPC_CHANNEL = "/dsh-social-workbench";
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, dictionaries), "social-workbench: dictionaries");
  const t = ctx.locale.bind(NS);
  ctx.effect(() => {
    const style = document.createElement("style");
    style.dataset.plugin = "social-workbench";
    style.textContent = CSS;
    document.head.append(style);
    return () => style.remove();
  }, "social-workbench: styles");
  const rpcCall = (endpoint, payload, signal) => ctx.connection.rpc.call(RPC_CHANNEL, endpoint, payload, signal);
  ctx.slots.inject("settings.section", () => ctx.slots.register({
    name: "settings.section",
    id: "social-workbench",
    order: 42,
    label: () => t("settingsLabel"),
    locale: NS,
    inject: () => ({ rpcCall, t })
  }, Workbench));
}

    return module.exports;
  }
});
