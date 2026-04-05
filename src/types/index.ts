// ==================== User ====================
export interface User {
  id: string
  username: string
  display_name: string
  email: string
  avatar_url: string
  bio: string
  is_verified: boolean
  can_post_kokorozashi_song: boolean
  created_at: string
  updated_at: string
  followers_count?: number
  following_count?: number
}

// ==================== Follow ====================
export interface Follow {
  id: string
  follower_user_id: string
  following_user_id: string
  created_at: string
}

// ==================== VoiceJournal ====================
export type Visibility = 'public' | 'followers_only' | 'draft'

export interface VoiceJournal {
  id: string
  user_id: string
  user?: User
  title: string
  description: string
  audio_url: string
  duration_seconds: number
  visibility: Visibility
  tags?: string[]
  reactions_count?: ReactionCount
  comments_count?: number
  created_at: string
  updated_at: string
}

export interface VoiceJournalTag {
  id: string
  voice_journal_id: string
  tag_name: string
}

// ==================== KokorozashiSong ====================
export interface KokorozashiSong {
  id: string
  user_id: string
  user?: User
  title: string
  description: string
  jacket_image_url: string
  audio_url: string
  visibility: 'public' | 'followers_only'
  reactions_count?: ReactionCount
  comments_count?: number
  created_at: string
  updated_at: string
}

// ==================== Comment ====================
export type TargetType = 'voice_journal' | 'song'

export interface Comment {
  id: string
  target_type: TargetType
  target_id: string
  user_id: string
  user?: User
  body: string
  created_at: string
}

// ==================== Reaction ====================
export type ReactionType = 'like' | 'empathy' | 'support' | 'awesome' | 'cry'

export interface ReactionCount {
  like: number
  empathy: number
  support: number
  awesome: number
  cry: number
}

export interface Reaction {
  id: string
  target_type: TargetType
  target_id: string
  user_id: string
  reaction_type: ReactionType
  created_at: string
}

// ==================== Topic ====================
export interface Topic {
  id: string
  title: string
  description: string
  hashtag: string
  start_date: string
  end_date: string
}

// ==================== Column ====================
export interface Column {
  id: string
  title: string
  slug: string
  thumbnail_url: string
  summary: string
  body: string
  category: string
  published_at: string
}

// ==================== News ====================
export interface News {
  id: string
  title: string
  body: string
  published_at: string
}

// ==================== SongOrder ====================
export type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'

export interface SongOrder {
  id: string
  user_id?: string
  applicant_name: string
  applicant_email: string
  plan_name: string
  status: OrderStatus
  payment_status: PaymentStatus
  created_at: string
}

// ==================== Feed ====================
export interface FeedItem {
  id: string
  type: 'voice_journal' | 'song'
  user: User
  content: VoiceJournal | KokorozashiSong
  created_at: string
}

// ==================== Notification ====================
export interface Notification {
  id: string
  user_id: string
  type: 'comment' | 'reaction' | 'follow' | 'mention'
  message: string
  is_read: boolean
  link: string
  created_at: string
}

// ==================== Banner ====================
export interface Banner {
  id: string
  title: string
  subtitle?: string
  image_url: string
  link_url: string
  type: 'campaign' | 'column' | 'news' | 'feature'
  is_active: boolean
  order_index: number
}
