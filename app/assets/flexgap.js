/* Flex `gap` fallback for older Tizen web engines (Tizen 4.0 is ~Chromium 56).
   Does nothing where the browser supports flex gap. Spacing comes from the
   generated --fg values in flexgap-compat.css and is applied as child margins. */
(function () {
  'use strict';
  function supported() {
    var box = document.createElement('div');
    box.style.cssText = 'display:flex;flex-direction:column;row-gap:1px;position:absolute;visibility:hidden';
    box.appendChild(document.createElement('div'));
    box.appendChild(document.createElement('div'));
    document.documentElement.appendChild(box);
    var ok = box.scrollHeight === 1;
    box.parentNode.removeChild(box);
    return ok;
  }
  if (!window.CleanFrameForceFlexGapFallback && supported()) return;
  document.documentElement.className += ' no-flexgap';
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'assets/flexgap-compat.css';
  document.head.appendChild(link);

  var SIDES = ['marginLeft', 'marginRight', 'marginTop', 'marginBottom'];
  var touched = [], queued = false;

  function inFlow(el) {
    var cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.position !== 'absolute' && cs.position !== 'fixed';
  }
  function reset() {
    for (var i = 0; i < touched.length; i++) {
      for (var s = 0; s < SIDES.length; s++) touched[i].style[SIDES[s]] = '';
      touched[i].removeAttribute('data-fg');
    }
    touched = [];
  }
  function apply() {
    queued = false;
    if (!window.CleanFrameFlexGapSelectors) return;
    reset();
    var boxes = document.querySelectorAll(window.CleanFrameFlexGapSelectors);
    var plan = [];
    for (var b = 0; b < boxes.length; b++) {
      var cs = getComputedStyle(boxes[b]);
      var gap = parseFloat(cs.getPropertyValue('--fg'));
      if (!(gap > 0) || cs.display.indexOf('flex') < 0) continue;
      var dir = cs.flexDirection;
      var side = dir === 'column' ? 'marginBottom' : dir === 'column-reverse' ? 'marginTop' : dir === 'row-reverse' ? 'marginLeft' : 'marginRight';
      var kids = [];
      for (var k = 0; k < boxes[b].children.length; k++) if (inFlow(boxes[b].children[k])) kids.push(boxes[b].children[k]);
      for (var j = 0; j < kids.length - 1; j++) {
        var base = parseFloat(getComputedStyle(kids[j])[side]) || 0;
        plan.push([kids[j], side, (base + gap) + 'px']);
      }
    }
    for (var p = 0; p < plan.length; p++) {
      plan[p][0].style[plan[p][1]] = plan[p][2];
      plan[p][0].setAttribute('data-fg', '');
      touched.push(plan[p][0]);
    }
  }
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(apply);
  }
  function start() {
    schedule();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
  }
  link.onload = schedule;
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
}());
