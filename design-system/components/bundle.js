/* @ds-bundle: {"format":4,"namespace":"YourWave","components":[{"name":"Button"},{"name":"Badge"},{"name":"SessionCard"},{"name":"WaveDivider"},{"name":"Testimonial"},{"name":"FaqItem"}]} */
(function () {
  var R = window.React, h = R.createElement;
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(" "); }
  function omit(o, keys) { var r = {}; for (var k in o) if (keys.indexOf(k) < 0) r[k] = o[k]; return r; }

  function Button(p) {
    var variant = p.variant || "primary", tag = p.href ? "a" : "button";
    var rest = omit(p, ["variant", "size", "className", "children"]);
    if (!p.href && !rest.type) rest.type = "button";
    rest.className = cx("yw-btn", "yw-btn-" + variant, p.size === "lg" && "yw-btn-lg", p.className);
    return h(tag, rest, p.children);
  }

  var BADGE_LABEL = { breathwork: "Breathwork", meditacion: "Meditación", coaching: "Coaching · Hipnoterapia", cometa: "Cometa", surf: "Surf" };
  function Badge(p) {
    var tone = p.tone || "neutral";
    return h("span", { className: cx("yw-badge", "yw-badge-" + tone, p.className) }, p.children != null ? p.children : (BADGE_LABEL[tone] || ""));
  }

  function SessionCard(p) {
    return h("article", { className: cx("yw-card", p.className) },
      p.image ? h("img", { className: "yw-card-media", src: p.image, alt: p.imageAlt || "" }) : null,
      h("div", { className: "yw-card-body" },
        p.disciplines && p.disciplines.length ? h("div", { style: { display: "flex", flexWrap: "wrap", gap: "var(--space-2)" } },
          p.disciplines.map(function (d) { return h(Badge, { key: d, tone: d }); })) : null,
        h("h3", { className: "yw-card-title" }, p.title),
        p.meta ? h("p", { className: "yw-card-meta" }, p.meta) : null,
        p.description ? h("p", { className: "yw-card-text" }, p.description) : null),
      h("div", { className: "yw-card-foot" },
        p.price ? h("span", { className: "yw-card-price" }, p.price) : h("span"),
        h(Button, { variant: "primary", href: p.href, onClick: p.onAction }, p.actionLabel || "Reservar")));
  }

  var WAVE_FRONT = "M0 48 C 120 12, 240 12, 360 40 S 600 76, 720 44 S 960 0, 1080 28 S 1320 60, 1440 36 L1440 96 L0 96 Z";
  var WAVE_BACK = "M0 30 C 160 60, 300 64, 460 34 S 760 4, 920 30 S 1240 70, 1440 22 L1440 96 L0 96 Z";
  function WaveDivider(p) {
    var to = p.to || "var(--sand)", from = p.from || "transparent";
    return h("svg", { className: cx("yw-wave", p.className), viewBox: "0 0 1440 96", preserveAspectRatio: "none", "aria-hidden": "true", style: { background: from, height: p.height || 72, transform: p.flip ? "scaleX(-1)" : undefined } },
      p.layered === false ? null : h("path", { className: "yw-wave-back", d: WAVE_BACK, fill: p.back || to }),
      h("path", { d: WAVE_FRONT, fill: to }));
  }

  function Testimonial(p) {
    return h("figure", { className: cx("yw-quote", p.className) },
      h("blockquote", { className: "yw-quote-text", style: { margin: 0 } }, "“" + p.quote + "”"),
      h("figcaption", { className: "yw-quote-who" },
        p.photo ? h("img", { className: "yw-quote-avatar", src: p.photo, alt: "" }) : h("span", { className: "yw-quote-avatar", "aria-hidden": "true" }),
        h("span", null, h("strong", null, p.name), p.detail)));
  }

  function FaqItem(p) {
    return h("details", { className: cx("yw-faq", p.className), open: p.defaultOpen },
      h("summary", null, p.question, h("span", { className: "yw-faq-icon", "aria-hidden": "true" })),
      h("div", { className: "yw-faq-body" }, p.children));
  }

  window.YourWave = Object.assign(window.YourWave || {}, { Button: Button, Badge: Badge, SessionCard: SessionCard, WaveDivider: WaveDivider, Testimonial: Testimonial, FaqItem: FaqItem });
})();
