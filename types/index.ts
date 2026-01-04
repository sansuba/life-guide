export interface Note {
  id: string;
  title: string;
  content: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WebLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  createdAt: string;
  hidden?: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  note: string;
  date: string;
  category: 'learning' | 'expenses' | 'milestones' | 'achievements' | 'acknowledgements';
  completed: boolean;
  createdAt: string;
}
