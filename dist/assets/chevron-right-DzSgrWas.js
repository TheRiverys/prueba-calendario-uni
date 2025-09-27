import{r as s,t as o,v as g,D as h,c as i}from"./index-B1LHeGs3.js";function m(a,t){s(2,arguments);var e=o(a),r=g(t);if(isNaN(r))return new Date(NaN);if(!r)return e;var u=e.getDate(),n=new Date(e.getTime());n.setMonth(e.getMonth()+r+1,0);var f=n.getDate();return u>=f?n:(e.setFullYear(n.getFullYear(),n.getMonth(),u),e)}function v(a,t){s(2,arguments);var e=h(a),r=h(t);return e.getTime()===r.getTime()}function c(a){s(1,arguments);var t=o(a),e=t.getMonth();return t.setFullYear(t.getFullYear(),e+1,0),t.setHours(23,59,59,999),t}function D(a){s(1,arguments);var t=o(a);return t.setDate(1),t.setHours(0,0,0,0),t}function M(a,t){s(2,arguments);var e=g(t);return m(a,-e)}/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=i("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=i("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);export{l as C,y as a,M as b,m as c,c as e,v as i,D as s};
