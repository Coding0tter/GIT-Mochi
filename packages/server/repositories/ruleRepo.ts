import { Rule, type IRule } from "../models/rule";
import BaseRepo from "./baseRepo";

export class RuleRepo extends BaseRepo<IRule> {
  constructor() {
    super(Rule);
  }
}
