import { Rule, type IRule } from "../models/rule.model";
import BaseRepo from "./base.repo";

export class RuleRepo extends BaseRepo<IRule> {
  constructor() {
    super(Rule);
  }
}
