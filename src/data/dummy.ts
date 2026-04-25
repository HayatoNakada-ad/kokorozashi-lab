import type {
  User, VoiceJournal, KokorozashiSong, Comment, Column, News, Topic, FeedItem, Banner, Notification
} from '../types'

// ==================== Users ====================
export const dummyUsers: User[] = [
  {
    id: 'u1',
    username: 'haruka_voice',
    display_name: '田中はるか',
    email: 'haruka@example.com',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=haruka',
    bio: '毎朝声で日記を書いています。自分の想いを言葉にする練習中 🎙️',
    is_verified: true,
    can_post_kokorozashi_song: true,
    created_at: '2024-04-01T09:00:00Z',
    updated_at: '2024-12-01T09:00:00Z',
    followers_count: 128,
    following_count: 64,
  },
  {
    id: 'u2',
    username: 'sho_dreams',
    display_name: '山田翔',
    email: 'sho@example.com',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sho',
    bio: '教育の未来を変えたいと思っています。声で伝える日々。',
    is_verified: false,
    can_post_kokorozashi_song: true,
    created_at: '2024-05-15T10:30:00Z',
    updated_at: '2024-12-05T10:30:00Z',
    followers_count: 85,
    following_count: 42,
  },
  {
    id: 'u3',
    username: 'yuki_music',
    display_name: '鈴木ゆき',
    email: 'yuki@example.com',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yuki',
    bio: '音楽と言葉で世界をつなぎたい。ここでの出会いに感謝 🌿',
    is_verified: true,
    can_post_kokorozashi_song: false,
    created_at: '2024-03-10T08:00:00Z',
    updated_at: '2024-11-20T08:00:00Z',
    followers_count: 210,
    following_count: 98,
  },
  {
    id: 'u4',
    username: 'kenji_future',
    display_name: '伊藤健司',
    email: 'kenji@example.com',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kenji',
    bio: '地域コミュニティを豊かにするために活動中。声日記始めました！',
    is_verified: false,
    can_post_kokorozashi_song: false,
    created_at: '2024-06-20T11:00:00Z',
    updated_at: '2024-12-10T11:00:00Z',
    followers_count: 52,
    following_count: 76,
  },
  {
    id: 'u5',
    username: 'mei_hope',
    display_name: '佐藤めい',
    email: 'mei@example.com',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mei',
    bio: '子どもたちの笑顔のために。保育士として働きながら発信中 🌸',
    is_verified: false,
    can_post_kokorozashi_song: true,
    created_at: '2024-07-01T07:00:00Z',
    updated_at: '2024-12-01T07:00:00Z',
    followers_count: 143,
    following_count: 89,
  },
]

export const currentUser = dummyUsers[0]

// ==================== VoiceJournals ====================
export const dummyVoiceJournals: VoiceJournal[] = [
  {
    id: 'vj1',
    user_id: 'u1',
    user: dummyUsers[0],
    title: '今日感じた小さな喜び',
    description: '朝のコーヒーを飲みながら、窓の外の景色を眺めていたら、ふと「ここにいていいんだ」という気持ちになりました。そんな朝の一コマを声に残してみました。',
    audio_url: '',
    duration_seconds: 85,
    visibility: 'public',
    tags: ['日常', '気づき', '朝活'],
    reactions_count: { like: 24, empathy: 15, support: 8, awesome: 3, cry: 2 },
    comments_count: 7,
    created_at: '2025-01-15T07:30:00Z',
    updated_at: '2025-01-15T07:30:00Z',
  },
  {
    id: 'vj2',
    user_id: 'u2',
    user: dummyUsers[1],
    title: '教育で変えたい未来のこと',
    description: '子どもたちが自分の可能性を信じられる教育環境をつくりたい。今日はそんな想いを話してみました。',
    audio_url: '',
    duration_seconds: 112,
    visibility: 'public',
    tags: ['教育', '志', '未来'],
    reactions_count: { like: 42, empathy: 28, support: 35, awesome: 12, cry: 5 },
    comments_count: 14,
    created_at: '2025-01-14T20:00:00Z',
    updated_at: '2025-01-14T20:00:00Z',
  },
  {
    id: 'vj3',
    user_id: 'u3',
    user: dummyUsers[2],
    title: '音楽が繋いでくれた縁',
    description: '昨日のライブで偶然出会った方から「あなたの歌声で救われた」と言ってもらえました。声の力ってすごいなと改めて感じた一日でした。',
    audio_url: '',
    duration_seconds: 68,
    visibility: 'public',
    tags: ['音楽', '感謝', 'ライブ'],
    reactions_count: { like: 67, empathy: 43, support: 22, awesome: 31, cry: 18 },
    comments_count: 23,
    created_at: '2025-01-13T22:15:00Z',
    updated_at: '2025-01-13T22:15:00Z',
  },
  {
    id: 'vj4',
    user_id: 'u4',
    user: dummyUsers[3],
    title: '地域のおじいちゃんと話した午後',
    description: '商店街のおじいちゃんが昔の町の様子を話してくれました。記録として残したくてここに。',
    audio_url: '',
    duration_seconds: 97,
    visibility: 'public',
    tags: ['地域', 'コミュニティ', '記録'],
    reactions_count: { like: 33, empathy: 21, support: 14, awesome: 7, cry: 4 },
    comments_count: 9,
    created_at: '2025-01-12T16:45:00Z',
    updated_at: '2025-01-12T16:45:00Z',
  },
  {
    id: 'vj5',
    user_id: 'u5',
    user: dummyUsers[4],
    title: '子どもの「なんで？」に答えられなかった日',
    description: '今日、子どもに「先生はなんで保育士になったの？」と聞かれて、うまく答えられませんでした。その悔しさと、改めて自分の志を確認した話です。',
    audio_url: '',
    duration_seconds: 103,
    visibility: 'public',
    tags: ['保育', '志', '子ども'],
    reactions_count: { like: 55, empathy: 48, support: 39, awesome: 16, cry: 22 },
    comments_count: 18,
    created_at: '2025-01-11T21:00:00Z',
    updated_at: '2025-01-11T21:00:00Z',
  },
  {
    id: 'vj6',
    user_id: 'u1',
    user: dummyUsers[0],
    title: '失敗から学んだこと',
    description: 'プロジェクトで大きなミスをしてしまった週でした。でも、そこから気づいたことがありました。',
    audio_url: '',
    duration_seconds: 78,
    visibility: 'public',
    tags: ['学び', '失敗', '成長'],
    reactions_count: { like: 38, empathy: 32, support: 27, awesome: 9, cry: 6 },
    comments_count: 11,
    created_at: '2025-01-10T19:30:00Z',
    updated_at: '2025-01-10T19:30:00Z',
  },
]

// ==================== KokorozashiSongs ====================
export const dummySongs: KokorozashiSong[] = [
  {
    id: 's1',
    user_id: 'u1',
    user: dummyUsers[0],
    title: 'ここから始まる',
    description: '「自分の声で誰かを勇気づけたい」という想いを形にしていただきました。毎日が少しずつ変わっていく感じを歌にしてもらいました。',
    jacket_image_url: 'https://picsum.photos/seed/song1/400/400',
    audio_url: '',
    visibility: 'public',
    reactions_count: { like: 98, empathy: 72, support: 56, awesome: 44, cry: 31 },
    comments_count: 35,
    created_at: '2024-12-20T10:00:00Z',
    updated_at: '2024-12-20T10:00:00Z',
  },
  {
    id: 's2',
    user_id: 'u2',
    user: dummyUsers[1],
    title: '未来の教室で',
    description: '教育現場で感じた希望と葛藤を歌にしていただきました。子どもたちへのメッセージです。',
    jacket_image_url: 'https://picsum.photos/seed/song2/400/400',
    audio_url: '',
    visibility: 'public',
    reactions_count: { like: 134, empathy: 98, support: 87, awesome: 62, cry: 45 },
    comments_count: 52,
    created_at: '2024-11-15T14:00:00Z',
    updated_at: '2024-11-15T14:00:00Z',
  },
  {
    id: 's3',
    user_id: 'u5',
    user: dummyUsers[4],
    title: 'あなたのそばで',
    description: '子どもたちへの愛情と願いをこめた一曲です。保育士として伝えたかったことを歌にしてもらいました。',
    jacket_image_url: 'https://picsum.photos/seed/song3/400/400',
    audio_url: '',
    visibility: 'public',
    reactions_count: { like: 176, empathy: 143, support: 112, awesome: 89, cry: 78 },
    comments_count: 67,
    created_at: '2024-10-05T09:00:00Z',
    updated_at: '2024-10-05T09:00:00Z',
  },
]

// ==================== Comments ====================
export const dummyComments: Comment[] = [
  {
    id: 'c1',
    target_type: 'voice_journal',
    target_id: 'vj1',
    user_id: 'u2',
    user: dummyUsers[1],
    body: '聴いてて温かい気持ちになりました。朝のこういう感覚、大切にしたいですよね。',
    created_at: '2025-01-15T08:00:00Z',
  },
  {
    id: 'c2',
    target_type: 'voice_journal',
    target_id: 'vj1',
    user_id: 'u3',
    user: dummyUsers[2],
    body: '声の質感がとても好きです。こういう日記、続けてほしいです！',
    created_at: '2025-01-15T09:30:00Z',
  },
  {
    id: 'c3',
    target_type: 'voice_journal',
    target_id: 'vj2',
    user_id: 'u1',
    user: dummyUsers[0],
    body: '翔さんの想い、すごく伝わってきます。応援しています！',
    created_at: '2025-01-14T21:00:00Z',
  },
  {
    id: 'c4',
    target_type: 'song',
    target_id: 's1',
    user_id: 'u3',
    user: dummyUsers[2],
    body: '素晴らしい曲！はるかさんの想いが歌に滲み出ていて感動しました。',
    created_at: '2024-12-21T10:00:00Z',
  },
  {
    id: 'c5',
    target_type: 'song',
    target_id: 's1',
    user_id: 'u5',
    user: dummyUsers[4],
    body: 'この曲聴くたびに元気もらえます。ありがとうございます✨',
    created_at: '2024-12-22T14:00:00Z',
  },
]

// ==================== Columns ====================
export const dummyColumns: Column[] = [
  {
    id: 'col1',
    title: '声で日記をつける習慣のつくり方',
    slug: 'voice-diary-habit',
    thumbnail_url: 'https://picsum.photos/seed/col1/600/400',
    summary: '音声日記を3ヶ月続けて気づいたこと。自分の声を聴くことで得られる自己理解の深まりについて。',
    body: `## 声で日記をつける習慣のつくり方

音声日記を始めてから3ヶ月が経ちました。最初は「自分の声を聞くのが恥ずかしい」と思っていましたが、今では毎朝の習慣になっています。

### なぜ声なのか

テキストでは表現しきれない感情の微妙なニュアンスが、声には自然と乗り移ります。

### 続けるためのコツ

1. **完璧を求めない** - 話したいことをそのまま話す
2. **時間を決める** - 朝5分、夜5分など
3. **聴き返さなくていい** - 吐き出すことが目的

### まとめ

声日記は、自分との対話の場です。ぜひ試してみてください。`,
    category: 'コツ・ヒント',
    published_at: '2025-01-10T09:00:00Z',
  },
  {
    id: 'col2',
    title: '「志」を言葉にすることの力',
    slug: 'power-of-expressing-vision',
    thumbnail_url: 'https://picsum.photos/seed/col2/600/400',
    summary: '自分の志をアウトプットし続けることで、どんな変化が生まれるのか。3人のユーザーの声を紹介。',
    body: `## 「志」を言葉にすることの力

ここで活動するユーザーの方々にインタビューしました。

### Aさんの場合

起業して2年目のAさんは、毎週ボイスジャーナルで自分のビジョンを語り続けています。

「声にすると、自分でも気づかなかった本音が出てくる」とAさんは言います。

### まとめ

志を声にする行為は、自分へのコミットメントです。`,
    category: 'インタビュー',
    published_at: '2025-01-05T10:00:00Z',
  },
  {
    id: 'col3',
    title: 'ボイスジャーナルで変わった私の毎日',
    slug: 'daily-life-changed-by-voice-journal',
    thumbnail_url: 'https://picsum.photos/seed/col3/600/400',
    summary: '半年間声日記を続けたユーザーの体験談。変化した思考パターンと、コミュニティとの繋がりについて。',
    body: `## ボイスジャーナルで変わった私の毎日

半年間、毎日ボイスジャーナルを続けました。その変化をお伝えします。

### 変化1: 感情の言語化が上手くなった

毎日声に出すことで、自分の感情を適切な言葉で表現できるようになりました。

### 変化2: コミュニティとの繋がり

同じような想いを持つ人と繋がれたことが、一番の宝物です。`,
    category: '体験談',
    published_at: '2024-12-28T11:00:00Z',
  },
]

// ==================== News ====================
export const dummyNews: News[] = [
  {
    id: 'n1',
    title: 'ボイスジャーナル機能がリニューアルされました',
    body: '録音機能を大幅に改善し、よりクリアな音声で投稿できるようになりました。',
    published_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 'n2',
    title: '「今日のお題」機能を追加しました',
    body: '毎日テーマを設定する「今日のお題」機能が加わりました。ぜひ参加してみてください。',
    published_at: '2025-01-10T10:00:00Z',
  },
  {
    id: 'n3',
    title: 'ご利用規約の一部改定について',
    body: '2025年2月1日より、利用規約の一部が改定されます。詳細はこちらをご確認ください。',
    published_at: '2025-01-05T10:00:00Z',
  },
  {
    id: 'n4',
    title: 'ococロザシソング 春のキャンペーン開始',
    body: '3月末までのお申し込みで、制作費10%オフになるキャンペーンを実施中です。',
    published_at: '2024-12-25T10:00:00Z',
  },
]

// ==================== Topic ====================
export const dummyTopics: Topic[] = [
  {
    id: 't1',
    title: '10年後の自分へのメッセージ',
    description: '10年後の自分に伝えたいことを、声に残してみてください。',
    hashtag: '10年後の自分へ',
    start_date: '2025-01-13T00:00:00Z',
    end_date: '2025-01-20T23:59:59Z',
  },
  {
    id: 't2',
    title: '今年の目標を宣言しよう',
    description: '2025年の目標を声で宣言してみましょう！',
    hashtag: '2025年の目標',
    start_date: '2025-01-01T00:00:00Z',
    end_date: '2025-01-15T23:59:59Z',
  },
]

// ==================== Feed ====================
export const dummyFeed: FeedItem[] = [
  {
    id: 'f1',
    type: 'voice_journal',
    user: dummyUsers[1],
    content: dummyVoiceJournals[1],
    created_at: '2025-01-14T20:00:00Z',
  },
  {
    id: 'f2',
    type: 'song',
    user: dummyUsers[4],
    content: dummySongs[2],
    created_at: '2025-01-13T12:00:00Z',
  },
  {
    id: 'f3',
    type: 'voice_journal',
    user: dummyUsers[2],
    content: dummyVoiceJournals[2],
    created_at: '2025-01-13T22:15:00Z',
  },
  {
    id: 'f4',
    type: 'voice_journal',
    user: dummyUsers[3],
    content: dummyVoiceJournals[3],
    created_at: '2025-01-12T16:45:00Z',
  },
]

// ==================== Banners ====================
export const dummyBanners: Banner[] = [
  {
    id: 'b1',
    title: '春のボイスジャーナルキャンペーン',
    subtitle: '投稿して豪華プレゼントをゲット！',
    image_url: 'https://picsum.photos/seed/banner1/1200/400',
    link_url: '/voice-journals',
    type: 'campaign',
    is_active: true,
    order_index: 1,
  },
  {
    id: 'b2',
    title: '「10年後の自分へ」特集',
    subtitle: '今週のお題、参加者募集中',
    image_url: 'https://picsum.photos/seed/banner2/1200/400',
    link_url: '/voice-journals/topics',
    type: 'feature',
    is_active: true,
    order_index: 2,
  },
  {
    id: 'b3',
    title: 'ご利用規約改定のお知らせ',
    subtitle: '2025年2月1日より適用',
    image_url: 'https://picsum.photos/seed/banner3/1200/400',
    link_url: '/news',
    type: 'news',
    is_active: true,
    order_index: 3,
  },
]

// ==================== Notifications ====================
export const dummyNotifications: Notification[] = [
  {
    id: 'notif1',
    user_id: 'u1',
    type: 'reaction',
    message: '山田翔さんがあなたのボイスジャーナルに「いいね」しました',
    is_read: false,
    link: '/voice-journal/vj1',
    created_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 'notif2',
    user_id: 'u1',
    type: 'comment',
    message: '鈴木ゆきさんがあなたのボイスジャーナルにコメントしました',
    is_read: false,
    link: '/voice-journal/vj1',
    created_at: '2025-01-15T09:30:00Z',
  },
  {
    id: 'notif3',
    user_id: 'u1',
    type: 'follow',
    message: '伊藤健司さんがあなたをフォローしました',
    is_read: true,
    link: '/user/kenji_future',
    created_at: '2025-01-14T18:00:00Z',
  },
]

// ==================== Helper Functions ====================
export function getUserById(id: string): User | undefined {
  return dummyUsers.find(u => u.id === id)
}

export function getVoiceJournalById(id: string): VoiceJournal | undefined {
  return dummyVoiceJournals.find(vj => vj.id === id)
}

export function getSongById(id: string): KokorozashiSong | undefined {
  return dummySongs.find(s => s.id === id)
}

export function getColumnBySlug(slug: string): Column | undefined {
  return dummyColumns.find(c => c.slug === slug)
}

export function getCommentsForTarget(targetType: string, targetId: string): Comment[] {
  return dummyComments.filter(c => c.target_type === targetType && c.target_id === targetId)
}

export function getUserByUsername(username: string): User | undefined {
  return dummyUsers.find(u => u.username === username)
}

export function getVoiceJournalsByUser(userId: string): VoiceJournal[] {
  return dummyVoiceJournals.filter(vj => vj.user_id === userId)
}

export function getSongsByUser(userId: string): KokorozashiSong[] {
  return dummySongs.filter(s => s.user_id === userId)
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}分前`
  if (hours < 24) return `${hours}時間前`
  if (days < 7) return `${days}日前`
  return formatDate(dateStr)
}

export const reactionLabels: Record<string, { emoji: string; label: string }> = {
  like: { emoji: '❤️', label: 'いいね' },
  empathy: { emoji: '🫂', label: '共感' },
  support: { emoji: '📣', label: '応援' },
  awesome: { emoji: '✨', label: 'すごい' },
  cry: { emoji: '😢', label: '泣いた' },
}

// ==================== Popular Hashtags ====================
export const dummyHashtags: { tag: string; count: number }[] = [
  { tag: '日常', count: 142 },
  { tag: '志', count: 128 },
  { tag: '音楽', count: 97 },
  { tag: '気づき', count: 89 },
  { tag: '教育', count: 76 },
  { tag: '朝活', count: 68 },
  { tag: '感謝', count: 61 },
  { tag: '保育', count: 54 },
  { tag: '未来', count: 48 },
  { tag: '地域', count: 43 },
  { tag: 'コミュニティ', count: 39 },
  { tag: '子ども', count: 35 },
]
