
export interface EpisodeView {
  id: string;
  episode_id: string;
  viewed_at: string;
  user_id?: string | null;
}

export interface EpisodeViewCount {
  id: string;
  title: string;
  views: number;
  published_at: string;
}
