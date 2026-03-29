import type { ReactNode } from "react";
import type { Deadline } from "../../../shared/types"

export type Section = {
    id: string;
    deadline?: Deadline;
    title: string;
    icon?: string;
    note?: ReactNode;
  };