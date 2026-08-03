export type Plan = "free" | "premium";

export type Yarn = {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  manufacturer: string | null;
  material: string | null;
  thickness: string | null;
  stock_count: number;
  photo_url: string | null;
  created_at: string;
};

export type Project = {
  id: string;
  user_id: string;
  title: string;
  made_on: string | null;
  photo_url: string | null;
  created_at: string;
};

export type ProjectYarn = {
  id: string;
  project_id: string;
  yarn_id: string;
  used_count: number;
};

export type ProjectYarnWithYarn = ProjectYarn & { yarn: Yarn };
export type ProjectYarnWithProject = ProjectYarn & { project: Project };
