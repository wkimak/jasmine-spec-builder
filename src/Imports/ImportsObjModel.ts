import { Identifier } from "typescript";

export default interface ImportObj {
  [key: string]: (string | Identifier)[];
}