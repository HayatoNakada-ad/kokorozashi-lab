import { Hono } from 'hono'
import { Layout } from '../components/Layout'
import {
  dummyBanners, dummyFeed, dummyVoiceJournals, dummySongs,
  dummyColumns, currentUser, dummyNotifications,
  formatRelativeDate, formatDuration, reactionLabels
} from '../data/dummy'

const app = new Hono()

// ─── カードUI（共通）──────────────────────────────────────────
function FeedCard({ item }: { item: any }) {
  const vj = item.type === 'voice_journal' ? item.content : null
  const song = item.type === 'song' ? item.content : null
  const topReactions = Object.entries(reactionLabels)
    .sort((a: any, b: any) => ((item.content.reactions_count?.[b[0]] || 0) - (item.content.reactions_count?.[a[0]] || 0)))
    .slice(0, 3) as [string, { emoji: string; label: string }][]
  const contentId = vj?.id || song?.id
  const href = vj ? `/voice-journal/${vj.id}` : `/songs/${song?.id}`

  return (
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden card-hover audio-card">
      {/* サムネイル */}
      <div class="relative">
        {vj ? (
          <div class="w-full aspect-square bg-brand-50 flex flex-col items-center justify-center relative overflow-hidden">
            <button
              id={`play-btn-${contentId}-h`}
              class="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md"
              style="background:#3085c7"
              onclick={`initAudioPlayer('${contentId}-h', '')`}
            >
              <i class="fas fa-play text-xs"></i>
            </button>
            <div id={`progress-${contentId}-h`} class="absolute bottom-0 left-0 h-1 rounded-full" style="width:0%;background:#3085c7"></div>
            <span id={`current-time-${contentId}-h`} class="absolute bottom-1.5 right-2 text-[10px] text-brand-600">{formatDuration(vj.duration_seconds)}</span>
          </div>
        ) : song ? (
          <div class="relative">
            <img src={song.jacket_image_url} alt={song.title} class="w-full aspect-square object-cover" />
            <button
              id={`play-btn-${contentId}-h`}
              class="absolute inset-0 w-full h-full flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
              onclick={`initAudioPlayer('${contentId}-h', '')`}
            >
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-white" style="background:#3085c7">
                <i class="fas fa-play text-xs"></i>
              </div>
            </button>
          </div>
        ) : null}
        <span class={`absolute top-1.5 left-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${vj ? 'bg-brand-500 text-white' : 'text-white'}`} style={song ? 'background:#eba528' : ''}>
          {vj ? 'VJ' : 'SONG'}
        </span>
      </div>
      {/* テキスト */}
      <div class="p-2.5">
        <a href={href}>
          <p class="font-bold text-gray-800 hover:text-brand-600 line-clamp-2 text-xs leading-snug mb-1.5">
            {vj ? vj.title : song?.title}
          </p>
        </a>
        <div class="flex items-center gap-1 mb-1.5">
          <img src={item.user.avatar_url} alt={item.user.display_name} class="w-4 h-4 rounded-full object-cover flex-shrink-0" />
          <span class="text-[10px] text-gray-500 truncate">{item.user.display_name}</span>
          <span class="text-[10px] text-gray-400 flex-shrink-0 ml-auto">{formatRelativeDate(item.created_at)}</span>
        </div>
        <div class="flex items-center gap-0.5">
          {topReactions.map(([type, info]) => {
            const count = item.content.reactions_count?.[type] || 0
            return (
              <button onclick={`toggleReaction(this, '${type}')`} class="reaction-btn flex items-center gap-0.5 text-[10px] text-gray-500 bg-gray-50 px-1 py-0.5 rounded-full border border-gray-100">
                <span>{info.emoji}</span>
                <span class="reaction-count">{count}</span>
              </button>
            )
          })}
          <a href={href} class="ml-auto text-[10px] text-gray-400 flex items-center gap-0.5">
            <i class="far fa-comment"></i>
            <span>{item.content.comments_count}</span>
          </a>
        </div>
      </div>
    </div>
  )
}

function VJCard({ vj, badge }: { vj: any; badge?: string }) {
  const topReactions = Object.entries(reactionLabels).slice(0, 3) as [string, { emoji: string; label: string }][]
  return (
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden card-hover audio-card">
      <div class="relative">
        <div class="w-full aspect-square bg-brand-50 flex flex-col items-center justify-center relative overflow-hidden">
          <button
            id={`play-btn-${vj.id}-card`}
            class="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md"
            style="background:#3085c7"
            onclick={`initAudioPlayer('${vj.id}-card', '')`}
          >
            <i class="fas fa-play text-xs"></i>
          </button>
          <div id={`progress-${vj.id}-card`} class="absolute bottom-0 left-0 h-1 rounded-full" style="width:0%;background:#3085c7"></div>
          <span id={`current-time-${vj.id}-card`} class="absolute bottom-1.5 right-2 text-[10px] text-brand-600">{formatDuration(vj.duration_seconds)}</span>
        </div>
        {badge && (
          <span class="absolute top-1.5 left-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white" style="background:#eba528">{badge}</span>
        )}
      </div>
      <div class="p-2.5">
        <a href={`/voice-journal/${vj.id}`}>
          <p class="font-bold text-gray-800 hover:text-brand-600 line-clamp-2 text-xs leading-snug mb-1.5">{vj.title}</p>
        </a>
        <div class="flex items-center gap-1 mb-1.5">
          <img src={vj.user?.avatar_url} alt={vj.user?.display_name} class="w-4 h-4 rounded-full object-cover flex-shrink-0" />
          <span class="text-[10px] text-gray-500 truncate">{vj.user?.display_name}</span>
          <span class="text-[10px] text-gray-400 flex-shrink-0 ml-auto">{formatRelativeDate(vj.created_at)}</span>
        </div>
        <div class="flex items-center gap-0.5">
          {topReactions.map(([type, info]) => (
            <button onclick={`toggleReaction(this, '${type}')`} class="reaction-btn flex items-center gap-0.5 text-[10px] text-gray-500 bg-gray-50 px-1 py-0.5 rounded-full border border-gray-100">
              <span>{info.emoji}</span>
              <span class="reaction-count">{vj.reactions_count?.[type] || 0}</span>
            </button>
          ))}
          <a href={`/voice-journal/${vj.id}`} class="ml-auto text-[10px] text-gray-400 flex items-center gap-0.5">
            <i class="far fa-comment"></i>
            <span>{vj.comments_count}</span>
          </a>
        </div>
      </div>
    </div>
  )
}

function SongCard({ song }: { song: any }) {
  const topReactions = Object.entries(reactionLabels).slice(0, 3) as [string, { emoji: string; label: string }][]
  return (
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden card-hover audio-card">
      <div class="relative">
        <img src={song.jacket_image_url} alt={song.title} class="w-full aspect-square object-cover" />
        <button
          id={`play-btn-song-${song.id}-card`}
          class="absolute inset-0 w-full h-full flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
          onclick={`initAudioPlayer('song-${song.id}-card', '')`}
        >
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-white" style="background:#eba528">
            <i class="fas fa-play text-xs"></i>
          </div>
        </button>
        <span class="absolute top-1.5 left-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white" style="background:#eba528">SONG</span>
      </div>
      <div class="p-2.5">
        <a href={`/songs/${song.id}`}>
          <p class="font-bold text-gray-800 hover:text-brand-600 line-clamp-2 text-xs leading-snug mb-1.5">{song.title}</p>
        </a>
        <div class="flex items-center gap-1 mb-1.5">
          <img src={song.user?.avatar_url} alt={song.user?.display_name} class="w-4 h-4 rounded-full object-cover flex-shrink-0" />
          <span class="text-[10px] text-gray-500 truncate">{song.user?.display_name}</span>
          <span class="text-[10px] text-gray-400 flex-shrink-0 ml-auto">{formatRelativeDate(song.created_at)}</span>
        </div>
        <div class="flex items-center gap-0.5">
          {topReactions.map(([type, info]) => (
            <button onclick={`toggleReaction(this, '${type}')`} class="reaction-btn flex items-center gap-0.5 text-[10px] text-gray-500 bg-gray-50 px-1 py-0.5 rounded-full border border-gray-100">
              <span>{info.emoji}</span>
              <span class="reaction-count">{song.reactions_count?.[type] || 0}</span>
            </button>
          ))}
          <a href={`/songs/${song.id}`} class="ml-auto text-[10px] text-gray-400 flex items-center gap-0.5">
            <i class="far fa-comment"></i>
            <span>{song.comments_count || 0}</span>
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── フォロー中フィードページ ───────────────────────────────
app.get('/following-feed', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length
  const filter = c.req.query('filter') || 'all'

  const filtered = dummyFeed.filter(item =>
    filter === 'all' ? true : item.type === filter
  )

  return c.html(
    <Layout title="フォロー中の投稿" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications} currentPath="/following-feed">
      <div>
        <div class="mb-5">
          <h1 class="section-heading mb-3">フォロー中の投稿</h1>
          <div class="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'すべて', count: dummyFeed.length },
              { key: 'voice_journal', label: 'ボイスジャーナル', count: dummyFeed.filter(i => i.type === 'voice_journal').length },
              { key: 'song', label: 'ソング', count: dummyFeed.filter(i => i.type === 'song').length },
            ].map(tab => (
              <a
                href={`/following-feed?filter=${tab.key}`}
                class={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-brand-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300'
                }`}
              >
                {tab.label}
                <span class="ml-1.5 text-xs opacity-70">{tab.count}</span>
              </a>
            ))}
          </div>
        </div>

        {filtered.length > 0 ? (
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map(item => <FeedCard item={item} />)}
          </div>
        ) : (
          <div class="text-center py-20 text-gray-400">
            <i class="fas fa-rss text-5xl mb-4 block opacity-20"></i>
            <p class="text-lg font-semibold mb-2">投稿はまだありません</p>
            <p class="text-sm">ユーザーをフォローすると投稿が表示されます</p>
            <a href="/voice-journals" class="btn-primary inline-block mt-6 px-6 py-2.5 rounded-full text-sm font-medium">ユーザーを探す</a>
          </div>
        )}
      </div>
    </Layout>
  )
})

// ─── ホームページ ────────────────────────────────────────────
app.get('/', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length

  // おすすめ投稿（自分以外のユーザーの投稿）
  const recommendedVJs = dummyVoiceJournals.filter(v => v.user?.id !== currentUser.id).slice(0, 6)
  const newSongs = dummySongs.slice(0, 6)

  return c.html(
    <Layout title="ホーム" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications} currentPath="/">
      {/* Hero Banner Carousel */}
      <section class="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-6">
        <div class="relative" id="bannerCarousel">
          <div class="flex" id="bannerSlider" style="transition: transform 0.4s ease;">
            {dummyBanners.map((banner, i) => (
              <a href={banner.link_url} class="flex-shrink-0 w-full block" style="min-width:100%">
                <div class="aspect-[3/1] relative" style={`background: ${i === 0 ? '#3085c7' : i === 1 ? '#2469a3' : '#1e5282'}`}>
                  <div class="absolute inset-0 flex items-center px-8">
                    <div class="text-white">
                      <span class="text-xs font-semibold bg-white/20 rounded-full px-3 py-1 mb-3 inline-block">
                        {banner.type === 'campaign' ? '🎁 キャンペーン' : banner.type === 'feature' ? '✨ 特集' : '📢 お知らせ'}
                      </span>
                      <h2 class="text-xl font-bold mb-1">{banner.title}</h2>
                      {banner.subtitle && <p class="text-sm opacity-90">{banner.subtitle}</p>}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
          <button onclick="moveBanner(-1)" class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full shadow flex items-center justify-center hover:bg-white">
            <i class="fas fa-chevron-left text-gray-600 text-xs"></i>
          </button>
          <button onclick="moveBanner(1)" class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full shadow flex items-center justify-center hover:bg-white">
            <i class="fas fa-chevron-right text-gray-600 text-xs"></i>
          </button>
          <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {dummyBanners.map((_, i) => (
              <button onclick={`setBanner(${i})`} id={`dot-${i}`} class={`h-1.5 rounded-full transition-all ${i === 0 ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`}></button>
            ))}
          </div>
        </div>
      </section>

      {/* ── フォロー中の投稿 ── */}
      <section class="mb-8" id="following">
        <div class="flex items-center justify-between mb-3">
          <h2 class="section-heading">フォロー中</h2>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {dummyFeed.slice(0, 6).map(item => <FeedCard item={item} />)}
        </div>
        <div class="text-center mt-4">
          <a href="/following-feed" class="btn-outline px-8 py-2 rounded-full text-sm font-medium inline-block">
            もっと見る
          </a>
        </div>
      </section>

      {/* ── おすすめ ── */}
      <section class="mb-8" id="recommended">
        <div class="flex items-center justify-between mb-3">
          <h2 class="section-heading">おすすめ</h2>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {recommendedVJs.map(vj => <VJCard vj={vj} badge="おすすめ" />)}
        </div>
        <div class="text-center mt-4">
          <a href="/voice-journals" class="btn-outline px-8 py-2 rounded-full text-sm font-medium inline-block">
            もっと見る
          </a>
        </div>
      </section>

      {/* ── 新着ボイスジャーナル ── */}
      <section class="mb-8" id="new-vj">
        <div class="flex items-center justify-between mb-3">
          <h2 class="section-heading">新着ボイスジャーナル</h2>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {dummyVoiceJournals.slice(0, 6).map(vj => <VJCard vj={vj} />)}
        </div>
        <div class="text-center mt-4">
          <a href="/voice-journals" class="btn-outline px-8 py-2 rounded-full text-sm font-medium inline-block">
            もっと見る
          </a>
        </div>
      </section>

      {/* ── 今の気持ちを声に ── */}
      <section class="bg-brand-50 rounded-2xl border border-brand-100 p-5 mb-8">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex-1">
            <p class="section-heading-sub mb-0.5">声で記録しよう</p>
            <h3 class="section-heading" style="font-size:1.1rem!important">今の気持ちを声に</h3>
            <p class="text-sm text-gray-500 mt-1">思ったことをそのまま声で記録しよう</p>
          </div>
          <a href="/voice-journal/create" class="btn-primary px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 flex-shrink-0">
            <i class="fas fa-microphone"></i>
            録音して投稿
          </a>
        </div>
      </section>

      {/* ── 新着ソング ── */}
      <section class="mb-8" id="new-songs">
        <div class="flex items-center justify-between mb-3">
          <h2 class="section-heading">新着ソング</h2>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {newSongs.map(song => <SongCard song={song} />)}
        </div>
        <div class="text-center mt-4">
          <a href="/songs" class="btn-outline px-8 py-2 rounded-full text-sm font-medium inline-block">
            もっと見る
          </a>
        </div>
      </section>

      {/* ── コラム ── */}
      <section class="mb-8">
        <div class="flex items-center justify-between mb-3">
          <h2 class="section-heading">コラム</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {dummyColumns.slice(0, 4).map(col => (
            <a href={`/columns/${col.slug}`} class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden card-hover flex gap-3 p-3">
              <img src={col.thumbnail_url} alt={col.title} class="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <span class="text-[10px] text-brand-600 font-semibold bg-brand-50 px-1.5 py-0.5 rounded-full">{col.category}</span>
                <h3 class="font-bold text-gray-800 mt-1 text-xs line-clamp-2">{col.title}</h3>
                <p class="text-[10px] text-gray-400 mt-1">{formatDate(col.published_at)}</p>
              </div>
            </a>
          ))}
        </div>
        <div class="text-center mt-4">
          <a href="/columns" class="btn-outline px-8 py-2 rounded-full text-sm font-medium inline-block">
            もっと見る
          </a>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section class="rounded-2xl overflow-hidden mb-4" style="background:#3085c7">
        <div class="px-6 py-10 text-white text-center">
          <p class="text-sm font-semibold opacity-80 mb-2">✨ ここロザシソング</p>
          <h2 class="text-2xl font-bold mb-3">あなたの志が、歌になる</h2>
          <p class="text-sm opacity-90 mb-6 max-w-md mx-auto">
            思いや志をヒアリングして、プロが楽曲化。<br />
            本人歌唱の作品として、永遠に残せます。
          </p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/songs/create" class="bg-white text-brand-700 font-bold px-6 py-2.5 rounded-full hover:bg-gray-50 transition-colors text-sm">申し込む</a>
            <a href="/songs/about" class="bg-white/20 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-white/30 transition-colors text-sm">詳しく見る</a>
          </div>
        </div>
      </section>

      <script dangerouslySetInnerHTML={{ __html: `
        let currentBanner = 0;
        const totalBanners = ${dummyBanners.length};
        function moveBanner(dir) {
          currentBanner = (currentBanner + dir + totalBanners) % totalBanners;
          setBanner(currentBanner);
        }
        function setBanner(idx) {
          currentBanner = idx;
          document.getElementById('bannerSlider').style.transform = 'translateX(-' + (idx * 100) + '%)';
          document.querySelectorAll('[id^="dot-"]').forEach((d, i) => {
            d.style.width = i === idx ? '16px' : '8px';
            d.style.opacity = i === idx ? '1' : '0.5';
          });
        }
        setInterval(() => moveBanner(1), 5000);
      `}} />
    </Layout>
  )
})

export default app
