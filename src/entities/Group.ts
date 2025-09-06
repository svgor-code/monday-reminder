import type { IGroup } from "../interfaces/group";

export class Group implements IGroup {
  id: number;

  constructor(id: number) {
    this.id = id;
  }
}
