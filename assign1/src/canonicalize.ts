import { canonicalize } from "json-canonicalize";

const obj = {b: 3, a: 2};
console.log(obj)
console.log(canonicalize(obj))