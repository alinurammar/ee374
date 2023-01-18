"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_canonicalize_1 = require("json-canonicalize");
const obj = { b: 3, a: 2 };
console.log(obj);
console.log((0, json_canonicalize_1.canonicalize)(obj));
