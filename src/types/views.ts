
export interface EpisodeView {
  id: string;
  episode_id: string;
  viewed_at: string;
  user_id?: string | null;
  play_count: number;
  minutes_played: number;
}

export interface EpisodeViewCount {
  id: string;
  title: string;
  views: number;
  play_count?: number;
  minutes_played?: number;
  published_at: string;
}
