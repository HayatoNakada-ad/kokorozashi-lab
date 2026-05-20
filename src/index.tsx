import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { Layout } from './components/Layout'
import {
  currentUser, dummyNotifications, dummyNews, dummyUsers, dummyVoiceJournals, dummySongs,
  formatDate, dummyBanners, dummyFeed, dummyColumns, dummyTopics, dummyHashtags,
  formatRelativeDate, formatDuration, reactionLabels, getVoiceJournalById,
  getSongById, getColumnBySlug, getCommentsForTarget, getUserByUsername,
  getVoiceJournalsByUser, getSongsByUser, dummyNotifications as notifs, dummyComments
} from './data/dummy'

// ─── 左サイドバー（ホーム系共通） ───────────────────────────────
function HomeSidebar({ currentPath = '/' }: { currentPath?: string }) {
  const navItems = [
    { href: '/', label: 'すべて', icon: 'fa-th-large' },
    { href: '/following-feed', label: 'フォロー中', icon: 'fa-rss' },
    { href: '/voice-journals', label: '新着ボイスジャーナル', icon: 'fa-microphone' },
    { href: '/songs', label: '新着ソング', icon: 'fa-music' },
    { href: '/news', label: 'お知らせ', icon: 'fa-bell' },
  ]
  return (
    <div>
      <nav class="mb-5">
        <ul class="space-y-0.5">
          {navItems.map(item => {
            const isActive = currentPath === item.href
            return (
              <li>
                <a href={item.href} class={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-brand-50 text-brand-700 font-bold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                  <i class={`fas ${item.icon} w-4 text-center ${isActive ? 'text-brand-500' : 'text-gray-400'}`}></i>
                  {item.label}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* 人気のハッシュタグ */}
      <div class="mb-5">
        <h3 class="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">人気のハッシュタグ</h3>
        <div class="flex flex-col gap-0.5">
          {dummyHashtags.slice(0, 10).map(({ tag, count }: { tag: string; count: number }) => (
            <a href={`/voice-journals?tag=${encodeURIComponent(tag)}`} class="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors group">
              <span class="text-sm text-gray-600 group-hover:text-brand-600">#{tag}</span>
              <span class="text-xs text-gray-400">{count}</span>
            </a>
          ))}
        </div>
      </div>

      {/* 録音ボタン */}
      <a href="/voice-journal/create" class="btn-primary w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 mb-5">
        <i class="fas fa-microphone text-xs"></i>
        録音して投稿
      </a>

      {/* 最新のお知らせ */}
      <div>
        <h3 class="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">お知らせ</h3>
        <div class="flex flex-col gap-1">
          {dummyNews.slice(0, 3).map((news: any) => (
            <a href="/news" class="block px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              <p class="text-xs text-gray-600 line-clamp-2 leading-relaxed">{news.title}</p>
              <p class="text-[10px] text-gray-400 mt-0.5">{formatDate(news.published_at)}</p>
            </a>
          ))}
          <a href="/news" class="text-xs text-brand-600 hover:underline px-3 py-1 font-medium">すべて見る →</a>
        </div>
      </div>
    </div>
  )
}

const app = new Hono()

// Static files
app.use('/static/*', serveStatic({ root: './' }))

// ==================== HOME ====================
app.get('/', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length
  const recommendedVJs = dummyVoiceJournals.filter(v => v.user?.id !== currentUser.id).slice(0, 6)
  const newSongs = dummySongs.slice(0, 6)

  const renderVJCard = (vj: any, suffix: string, badge?: string) => (
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden card-hover audio-card">
      <div class="relative">
        <div class="w-full aspect-square bg-brand-50 flex flex-col items-center justify-center relative overflow-hidden">
          <button id={`play-btn-${vj.id}-${suffix}`} class="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md" style="background:#3085c7" onclick={`initAudioPlayer('${vj.id}-${suffix}', '')`}>
            <i class="fas fa-play text-xs"></i>
          </button>
          <div id={`progress-${vj.id}-${suffix}`} class="absolute bottom-0 left-0 h-1 rounded-full" style="width:0%;background:#3085c7"></div>
          <span id={`current-time-${vj.id}-${suffix}`} class="absolute bottom-1.5 right-2 text-[10px] text-brand-600">{formatDuration(vj.duration_seconds)}</span>
        </div>
        {badge && <span class="absolute top-1.5 left-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white" style="background:#eba528">{badge}</span>}
      </div>
      <div class="p-2.5">
        <a href={`/voice-journal/${vj.id}`}><p class="font-bold text-gray-800 hover:text-brand-600 line-clamp-2 text-xs leading-snug mb-1.5">{vj.title}</p></a>
        <div class="flex items-center gap-1 mb-1.5">
          <img src={vj.user?.avatar_url} alt={vj.user?.display_name} class="w-4 h-4 rounded-full object-cover flex-shrink-0" />
          <span class="text-[10px] text-gray-500 truncate">{vj.user?.display_name}</span>
          <span class="text-[10px] text-gray-400 flex-shrink-0 ml-auto">{formatRelativeDate(vj.created_at)}</span>
        </div>
        <div class="flex items-center gap-0.5">
          {Object.entries(reactionLabels).slice(0, 3).map(([type, info]) => (
            <button onclick={`toggleReaction(this, '${type}')`} class="reaction-btn flex items-center gap-0.5 text-[10px] text-gray-500 bg-gray-50 px-1 py-0.5 rounded-full border border-gray-100">
              <span>{info.emoji}</span>
              <span class="reaction-count">{vj.reactions_count?.[type as keyof typeof vj.reactions_count] || 0}</span>
            </button>
          ))}
          <a href={`/voice-journal/${vj.id}`} class="ml-auto text-[10px] text-gray-400 flex items-center gap-0.5">
            <i class="far fa-comment"></i><span>{vj.comments_count}</span>
          </a>
        </div>
      </div>
    </div>
  )

  const renderSongCard = (song: any) => (
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden card-hover audio-card">
      <div class="relative">
        <img src={song.jacket_image_url} alt={song.title} class="w-full aspect-square object-cover" />
        <button id={`play-btn-song-${song.id}`} class="absolute inset-0 w-full h-full flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity" onclick={`initAudioPlayer('song-${song.id}', '')`}>
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-white" style="background:#eba528"><i class="fas fa-play text-xs"></i></div>
        </button>
        <span class="absolute top-1.5 left-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white" style="background:#eba528">SONG</span>
      </div>
      <div class="p-2.5">
        <a href={`/songs/${song.id}`}><p class="font-bold text-gray-800 hover:text-brand-600 line-clamp-2 text-xs leading-snug mb-1.5">{song.title}</p></a>
        <div class="flex items-center gap-1 mb-1.5">
          <img src={song.user?.avatar_url} alt={song.user?.display_name} class="w-4 h-4 rounded-full object-cover flex-shrink-0" />
          <span class="text-[10px] text-gray-500 truncate">{song.user?.display_name}</span>
          <span class="text-[10px] text-gray-400 flex-shrink-0 ml-auto">{formatRelativeDate(song.created_at)}</span>
        </div>
        <div class="flex items-center gap-0.5">
          {Object.entries(reactionLabels).slice(0, 3).map(([type, info]) => (
            <button onclick={`toggleReaction(this, '${type}')`} class="reaction-btn flex items-center gap-0.5 text-[10px] text-gray-500 bg-gray-50 px-1 py-0.5 rounded-full border border-gray-100">
              <span>{info.emoji}</span>
              <span class="reaction-count">{(song.reactions_count as any)?.[type] || 0}</span>
            </button>
          ))}
          <a href={`/songs/${song.id}`} class="ml-auto text-[10px] text-gray-400 flex items-center gap-0.5">
            <i class="far fa-comment"></i><span>{song.comments_count || 0}</span>
          </a>
        </div>
      </div>
    </div>
  )

  const renderFeedCard = (item: any) => {
    const vj = item.type === 'voice_journal' ? item.content as any : null
    const song = item.type === 'song' ? item.content as any : null
    const topReactions = Object.entries(reactionLabels)
      .sort((a: any, b: any) => ((item.content.reactions_count?.[b[0]] || 0) - (item.content.reactions_count?.[a[0]] || 0)))
      .slice(0, 3)
    const contentId = (vj?.id || song?.id) + '-fh'
    const href = vj ? `/voice-journal/${vj.id}` : `/songs/${song?.id}`
    return (
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden card-hover audio-card">
        <div class="relative">
          {vj ? (
            <div class="w-full aspect-square bg-brand-50 flex flex-col items-center justify-center relative overflow-hidden">
              <button id={`play-btn-${contentId}`} class="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md" style="background:#3085c7" onclick={`initAudioPlayer('${contentId}', '')`}>
                <i class="fas fa-play text-xs"></i>
              </button>
              <div id={`progress-${contentId}`} class="absolute bottom-0 left-0 h-1 rounded-full" style="width:0%;background:#3085c7"></div>
              <span id={`current-time-${contentId}`} class="absolute bottom-1.5 right-2 text-[10px] text-brand-600">{formatDuration(vj.duration_seconds)}</span>
            </div>
          ) : song ? (
            <div class="relative">
              <img src={song.jacket_image_url} alt={song.title} class="w-full aspect-square object-cover" />
              <button id={`play-btn-${contentId}`} class="absolute inset-0 w-full h-full flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity" onclick={`initAudioPlayer('${contentId}', '')`}>
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-white" style="background:#3085c7"><i class="fas fa-play text-xs"></i></div>
              </button>
            </div>
          ) : null}
          <span class={`absolute top-1.5 left-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${vj ? 'bg-brand-500 text-white' : 'text-white'}`} style={song ? 'background:#eba528' : ''}>{vj ? 'VJ' : 'SONG'}</span>
        </div>
        <div class="p-2.5">
          <a href={href}><p class="font-bold text-gray-800 hover:text-brand-600 line-clamp-2 text-xs leading-snug mb-1.5">{vj ? vj.title : song?.title}</p></a>
          <div class="flex items-center gap-1 mb-1.5">
            <img src={item.user.avatar_url} alt={item.user.display_name} class="w-4 h-4 rounded-full object-cover flex-shrink-0" />
            <span class="text-[10px] text-gray-500 truncate">{item.user.display_name}</span>
            <span class="text-[10px] text-gray-400 flex-shrink-0 ml-auto">{formatRelativeDate(item.created_at)}</span>
          </div>
          <div class="flex items-center gap-0.5">
            {topReactions.map(([type, info]: any) => (
              <button onclick={`toggleReaction(this, '${type}')`} class="reaction-btn flex items-center gap-0.5 text-[10px] text-gray-500 bg-gray-50 px-1 py-0.5 rounded-full border border-gray-100">
                <span>{info.emoji}</span>
                <span class="reaction-count">{item.content.reactions_count?.[type] || 0}</span>
              </button>
            ))}
            <a href={href} class="ml-auto text-[10px] text-gray-400 flex items-center gap-0.5">
              <i class="far fa-comment"></i><span>{item.content.comments_count}</span>
            </a>
          </div>
        </div>
      </div>
    )
  }

  return c.html(
    <Layout title="ホーム" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}
      sidebar={<HomeSidebar currentPath="/" />}
    >
      {/* Hero Banner */}
      <section class="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-6">
        <div class="relative" id="bannerCarousel">
          <div class="flex" id="bannerSlider" style="transition: transform 0.4s ease;">
            {dummyBanners.map((banner, i) => (
              <a href={banner.link_url} class="flex-shrink-0 w-full block" style="min-width:100%">
                <div class="aspect-[3/1] relative" style={`background: ${i === 0 ? '#3085c7' : i === 1 ? '#2469a3' : '#1e5282'}`}>
                  <div class="absolute inset-0 flex items-center px-6 md:px-10">
                    <div class="text-white">
                      <span class="text-xs font-semibold bg-white/20 rounded-full px-3 py-1 mb-2 inline-block">
                        {banner.type === 'campaign' ? '🎁 キャンペーン' : banner.type === 'feature' ? '✨ 特集' : '📢 お知らせ'}
                      </span>
                      <h2 class="text-lg md:text-2xl font-bold mb-1">{banner.title}</h2>
                      {banner.subtitle && <p class="text-sm opacity-90">{banner.subtitle}</p>}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
          <button onclick="moveBanner(-1)" class="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 rounded-full shadow flex items-center justify-center hover:bg-white">
            <i class="fas fa-chevron-left text-gray-600 text-xs"></i>
          </button>
          <button onclick="moveBanner(1)" class="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 rounded-full shadow flex items-center justify-center hover:bg-white">
            <i class="fas fa-chevron-right text-gray-600 text-xs"></i>
          </button>
          <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {dummyBanners.map((_, i) => (
              <button onclick={`setBanner(${i})`} id={`dot-${i}`} class={`h-1.5 rounded-full transition-all bg-white ${i === 0 ? 'w-4' : 'w-1.5 opacity-50'}`}></button>
            ))}
          </div>
        </div>
      </section>

      {/* フォロー中 */}
      <section class="mb-8">
        <h2 class="section-heading mb-3">フォロー中</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {dummyFeed.slice(0, 6).map(item => renderFeedCard(item))}
        </div>
        <div class="text-center mt-4">
          <a href="/following-feed" class="btn-outline px-8 py-2 rounded-full text-sm font-medium inline-block">もっと見る</a>
        </div>
      </section>

      {/* おすすめ */}
      <section class="mb-8">
        <h2 class="section-heading mb-3">おすすめ</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {recommendedVJs.map(vj => renderVJCard(vj, 'rec', 'おすすめ'))}
        </div>
        <div class="text-center mt-4">
          <a href="/voice-journals" class="btn-outline px-8 py-2 rounded-full text-sm font-medium inline-block">もっと見る</a>
        </div>
      </section>

      {/* 新着ボイスジャーナル */}
      <section class="mb-8">
        <h2 class="section-heading mb-3">新着ボイスジャーナル</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {dummyVoiceJournals.slice(0, 6).map(vj => renderVJCard(vj, 'newvj'))}
        </div>
        <div class="text-center mt-4">
          <a href="/voice-journals" class="btn-outline px-8 py-2 rounded-full text-sm font-medium inline-block">もっと見る</a>
        </div>
      </section>

      {/* 今の気持ちを声に */}
      <section class="bg-brand-50 rounded-2xl border border-brand-100 p-5 mb-8">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex-1">
            <p class="section-heading-sub mb-0.5">声で記録しよう</p>
            <h3 class="font-black text-gray-900" style="font-size:1.1rem">今の気持ちを声に</h3>
            <p class="text-sm text-gray-500 mt-1">思ったことをそのまま声で記録しよう</p>
          </div>
          <a href="/voice-journal/create" class="btn-primary px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 flex-shrink-0">
            <i class="fas fa-microphone"></i>録音して投稿
          </a>
        </div>
      </section>

      {/* 新着ソング */}
      <section class="mb-8">
        <h2 class="section-heading mb-3">新着ソング</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {newSongs.map(song => renderSongCard(song))}
        </div>
        <div class="text-center mt-4">
          <a href="/songs" class="btn-outline px-8 py-2 rounded-full text-sm font-medium inline-block">もっと見る</a>
        </div>
      </section>

      {/* コラム */}
      <section class="mb-8">
        <h2 class="section-heading mb-3">コラム</h2>
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
          <a href="/columns" class="btn-outline px-8 py-2 rounded-full text-sm font-medium inline-block">もっと見る</a>
        </div>
      </section>

      {/* Bottom CTA */}
      <section class="rounded-2xl overflow-hidden mb-4" style="background:#3085c7">
        <div class="px-6 py-10 text-white text-center">
          <p class="text-sm font-semibold opacity-80 mb-2">✨ ここロザシソング</p>
          <h2 class="text-2xl font-bold mb-3">あなたの志が、歌になる</h2>
          <p class="text-sm opacity-90 mb-6 max-w-md mx-auto">思いや志をヒアリングして、プロが楽曲化。<br />本人歌唱の作品として、永遠に残せます。</p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/songs/create" class="bg-white text-brand-700 font-bold px-6 py-2.5 rounded-full hover:bg-gray-50 transition-colors text-sm">申し込む</a>
            <a href="/songs/about" class="bg-white/20 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-white/30 transition-colors text-sm">詳しく見る</a>
          </div>
        </div>
      </section>

      <script dangerouslySetInnerHTML={{ __html: `
        let currentBanner = 0;
        const totalBanners = ${dummyBanners.length};
        function moveBanner(dir) { currentBanner = (currentBanner + dir + totalBanners) % totalBanners; setBanner(currentBanner); }
        function setBanner(idx) {
          currentBanner = idx;
          document.getElementById('bannerSlider').style.transform = 'translateX(-' + (idx * 100) + '%)';
          document.querySelectorAll('[id^="dot-"]').forEach((d, i) => {
            d.style.width = i === idx ? '16px' : '8px';
            d.style.opacity = i === idx ? '1' : '0.5';
          });
        }
        setInterval(() => moveBanner(1), 5000);
      ` }} />
    </Layout>
  )
})

// ==================== FOLLOWING FEED ====================
app.get('/following-feed', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length
  const filter = c.req.query('filter') || 'all'
  const filteredFeed = filter === 'voice_journal'
    ? dummyFeed.filter(item => item.type === 'voice_journal')
    : filter === 'song'
    ? dummyFeed.filter(item => item.type === 'song')
    : dummyFeed

  return c.html(
    <Layout title="フォロー中の投稿" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}
      sidebar={<HomeSidebar currentPath="/following-feed" />}
    >
      <div>
        <h1 class="section-heading mb-3">フォロー中の投稿</h1>
        <div class="flex gap-2 flex-wrap mb-5">
          {[
            { key: 'all', label: 'すべて' },
            { key: 'voice_journal', label: 'ボイスジャーナル' },
            { key: 'song', label: 'ここロザシソング' },
          ].map(f => (
            <a href={`/following-feed?filter=${f.key}`}
              class={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f.key ? 'text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300'}`}
              style={filter === f.key ? 'background:#3085c7' : ''}
            >
              {f.label}
            </a>
          ))}
        </div>
        {filteredFeed.length === 0 ? (
          <div class="text-center py-16 text-gray-400">
            <i class="fas fa-inbox text-5xl mb-4 block opacity-30"></i>
            <p class="text-lg font-semibold mb-2">投稿がありません</p>
            <p class="text-sm">フォローしているユーザーの投稿がここに表示されます</p>
          </div>
        ) : (
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredFeed.map(item => {
              const vj = item.type === 'voice_journal' ? item.content as any : null
              const song = item.type === 'song' ? item.content as any : null
              const topReactions = Object.entries(reactionLabels)
                .sort((a: any, b: any) => ((item.content as any).reactions_count?.[b[0]] || 0) - ((item.content as any).reactions_count?.[a[0]] || 0))
                .slice(0, 3)
              const contentId = (vj?.id || song?.id) + '-ff'
              const href = vj ? `/voice-journal/${vj.id}` : `/songs/${song?.id}`
              return (
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden card-hover audio-card">
                  <div class="relative">
                    {vj ? (
                      <div class="w-full aspect-square bg-brand-50 flex flex-col items-center justify-center relative overflow-hidden">
                        <button id={`play-btn-${contentId}`} class="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md" style="background:#3085c7" onclick={`initAudioPlayer('${contentId}', '')`}>
                          <i class="fas fa-play text-xs"></i>
                        </button>
                        <div id={`progress-${contentId}`} class="absolute bottom-0 left-0 h-1 rounded-full" style="width:0%;background:#3085c7"></div>
                        <span id={`current-time-${contentId}`} class="absolute bottom-1.5 right-2 text-[10px] text-brand-600">{formatDuration(vj.duration_seconds)}</span>
                      </div>
                    ) : song ? (
                      <div class="relative">
                        <img src={song.jacket_image_url} alt={song.title} class="w-full aspect-square object-cover" />
                        <button id={`play-btn-${contentId}`} class="absolute inset-0 w-full h-full flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity" onclick={`initAudioPlayer('${contentId}', '')`}>
                          <div class="w-10 h-10 rounded-full flex items-center justify-center text-white" style="background:#3085c7"><i class="fas fa-play text-xs"></i></div>
                        </button>
                      </div>
                    ) : null}
                    <span class={`absolute top-1.5 left-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${vj ? 'bg-brand-500 text-white' : 'text-white'}`} style={song ? 'background:#eba528' : ''}>{vj ? 'VJ' : 'SONG'}</span>
                  </div>
                  <div class="p-2.5">
                    <a href={href}><p class="font-bold text-gray-800 hover:text-brand-600 line-clamp-2 text-xs leading-snug mb-1.5">{vj ? vj.title : song?.title}</p></a>
                    <div class="flex items-center gap-1 mb-1.5">
                      <img src={item.user.avatar_url} alt={item.user.display_name} class="w-4 h-4 rounded-full object-cover flex-shrink-0" />
                      <span class="text-[10px] text-gray-500 truncate">{item.user.display_name}</span>
                      <span class="text-[10px] text-gray-400 flex-shrink-0 ml-auto">{formatRelativeDate(item.created_at)}</span>
                    </div>
                    <div class="flex items-center gap-0.5">
                      {topReactions.map(([type, info]: any) => (
                        <button onclick={`toggleReaction(this, '${type}')`} class="reaction-btn flex items-center gap-0.5 text-[10px] text-gray-500 bg-gray-50 px-1 py-0.5 rounded-full border border-gray-100">
                          <span>{info.emoji}</span>
                          <span class="reaction-count">{(item.content as any).reactions_count?.[type] || 0}</span>
                        </button>
                      ))}
                      <a href={href} class="ml-auto text-[10px] text-gray-400 flex items-center gap-0.5">
                        <i class="far fa-comment"></i><span>{(item.content as any).comments_count}</span>
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
})

// ==================== VOICE JOURNALS ====================
app.get('/voice-journals', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length
  const tag = c.req.query('tag')
  const filtered = tag ? dummyVoiceJournals.filter(vj => vj.tags?.includes(tag)) : dummyVoiceJournals

  return c.html(
    <Layout title="ボイスジャーナル一覧" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-4xl mx-auto px-4 py-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="section-heading text-2xl">ボイスジャーナル</h1>
            {tag && <p class="text-sm text-gray-500 mt-1">#{tag} の投稿</p>}
          </div>
          <a href="/voice-journal/create" class="btn-primary px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2"><i class="fas fa-microphone text-xs"></i>投稿する</a>
        </div>
        <div class="flex gap-2 overflow-x-auto pb-2 mb-6">
          {['日常', '気づき', '志', '音楽', '教育', '保育', '地域', '学び'].map(t => (
            <a href={`/voice-journals?tag=${t}`} class={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${tag === t ? 'bg-brand-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300'}`}>#{t}</a>
          ))}
        </div>
        <div class="space-y-4">
          {filtered.map(vj => (
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover audio-card">
              <div class="p-5">
                <div class="flex items-start gap-3">
                  <a href={`/user/${vj.user?.username}`} class="flex-shrink-0"><img src={vj.user?.avatar_url} alt={vj.user?.display_name} class="w-11 h-11 rounded-full" /></a>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-0.5">
                      <a href={`/user/${vj.user?.username}`} class="text-sm font-semibold text-gray-800 hover:text-brand-600">{vj.user?.display_name}</a>
                      <span class="text-xs text-gray-400">{formatRelativeDate(vj.created_at)}</span>
                    </div>
                    <a href={`/voice-journal/${vj.id}`}><h2 class="font-bold text-gray-800 hover:text-brand-600 text-base mb-2 line-clamp-2">{vj.title}</h2></a>
                    <p class="text-sm text-gray-500 line-clamp-2 mb-3">{vj.description}</p>
                    <div class="bg-brand-50 rounded-xl p-3">
                      <div class="flex items-center gap-3">
                        <button id={`play-btn-${vj.id}`} class="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm flex-shrink-0" style="background: #3085c7" onclick={`initAudioPlayer('${vj.id}', '')`}><i class="fas fa-play text-sm"></i></button>
                        <div class="flex-1">
                          <div class="bg-white/60 rounded-full h-1.5"><div id={`progress-${vj.id}`} class="audio-player-bar h-1.5 rounded-full" style="width:0%"></div></div>
                          <div class="flex justify-between text-xs text-gray-400 mt-1.5">
                            <span id={`current-time-${vj.id}`}>0:00</span>
                            <div class="wave-animation"><span></span><span></span><span></span><span></span><span></span></div>
                            <span>{formatDuration(vj.duration_seconds)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {vj.tags?.length > 0 && <div class="flex flex-wrap gap-1.5 mt-3">{vj.tags.map(t => <a href={`/voice-journals?tag=${t}`} class="tag-badge text-xs px-2 py-0.5 rounded-full">#{t}</a>)}</div>}
                    <div class="flex items-center justify-between mt-3">
                      <div class="flex items-center gap-1 flex-wrap">
                        {Object.entries(reactionLabels).map(([type, info]) => (
                          <button onclick={`toggleReaction(this, '${type}')`} class="reaction-btn flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600 bg-gray-50 hover:bg-brand-50 px-2 py-1 rounded-full border border-gray-100">
                            <span>{info.emoji}</span><span class="reaction-count">{vj.reactions_count?.[type as keyof typeof vj.reactions_count] || 0}</span>
                          </button>
                        ))}
                      </div>
                      <a href={`/voice-journal/${vj.id}`} class="text-xs text-gray-400 hover:text-brand-600 flex items-center gap-1"><i class="far fa-comment"></i>{vj.comments_count}件</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div class="text-center py-16 text-gray-400">
            <i class="fas fa-microphone text-5xl mb-4 block opacity-30"></i>
            <p class="text-lg font-semibold mb-2">まだ投稿がありません</p>
            <a href="/voice-journal/create" class="btn-primary px-8 py-3 rounded-full text-sm font-medium inline-block mt-4">投稿する</a>
          </div>
        )}
      </div>
    </Layout>
  )
})

// Voice Journal Detail
app.get('/voice-journal/:id', (c) => {
  const id = c.req.param('id')
  // Special routes
  if (id === 'create') {
    return handleVJCreate(c)
  }
  const vj = getVoiceJournalById(id)
  const unread = dummyNotifications.filter(n => !n.is_read).length
  if (!vj) return c.html(<Layout title="404" currentUser={currentUser}><div class="text-center py-16"><h1 class="text-2xl font-bold">見つかりません</h1></div></Layout>)
  const comments = getCommentsForTarget('voice_journal', id)
  return c.html(
    <Layout title={vj.title} currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-3xl mx-auto px-4 py-8">
        <a href="/voice-journals" class="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-6"><i class="fas fa-arrow-left"></i>ボイスジャーナル一覧</a>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 md:p-8">
            <div class="flex items-center gap-3 mb-5">
              <a href={`/user/${vj.user?.username}`}><img src={vj.user?.avatar_url} alt="" class="w-12 h-12 rounded-full" /></a>
              <div>
                <a href={`/user/${vj.user?.username}`} class="font-bold text-gray-800 hover:text-brand-600">{vj.user?.display_name}</a>
                <p class="text-xs text-gray-400">@{vj.user?.username} · {formatDate(vj.created_at)}</p>
              </div>
              <button onclick={`toggleFollow(this, '${vj.user?.username}')`} data-following="false" class="btn-primary ml-auto px-4 py-1.5 rounded-full text-sm font-medium">フォロー</button>
            </div>
            <h1 class="text-2xl font-bold text-gray-800 mb-3">{vj.title}</h1>
            <div class="bg-brand-50 rounded-2xl p-5 mb-5 audio-card">
              <div class="flex items-center gap-4">
                <button id={`play-btn-${vj.id}`} class="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0" style="background: #3085c7" onclick={`initAudioPlayer('${vj.id}', '')`}><i class="fas fa-play text-lg"></i></button>
                <div class="flex-1">
                  <div class="bg-white/60 rounded-full h-2 mb-2"><div id={`progress-${vj.id}`} class="audio-player-bar h-2 rounded-full" style="width:0%"></div></div>
                  <div class="flex justify-between text-sm text-gray-500">
                    <span id={`current-time-${vj.id}`}>0:00</span>
                    <div class="wave-animation"><span></span><span></span><span></span><span></span><span></span></div>
                    <span>{formatDuration(vj.duration_seconds)}</span>
                  </div>
                </div>
              </div>
            </div>
            <p class="text-gray-700 leading-relaxed mb-4">{vj.description}</p>
            {vj.tags?.length > 0 && <div class="flex flex-wrap gap-2 mb-6">{vj.tags.map(t => <a href={`/voice-journals?tag=${t}`} class="tag-badge text-sm px-3 py-1 rounded-full">#{t}</a>)}</div>}
            <div class="border-t border-gray-100 pt-5 mb-5">
              <h3 class="text-sm font-semibold text-gray-600 mb-3">リアクション</h3>
              <div class="flex flex-wrap gap-2">
                {Object.entries(reactionLabels).map(([type, info]) => (
                  <button onclick={`toggleReaction(this, '${type}')`} class="reaction-btn flex items-center gap-2 text-sm text-gray-600 hover:text-brand-600 bg-gray-50 hover:bg-brand-50 px-4 py-2 rounded-full border border-gray-200 hover:border-brand-300 font-medium">
                    <span class="text-lg">{info.emoji}</span><span>{info.label}</span><span class="reaction-count text-gray-400 text-xs ml-1">{vj.reactions_count?.[type as keyof typeof vj.reactions_count] || 0}</span>
                  </button>
                ))}
              </div>
            </div>
            <div class="border-t border-gray-100 pt-4">
              <div class="flex gap-2">
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(vj.title)}`} target="_blank" class="flex items-center gap-2 text-sm bg-sky-50 text-sky-500 hover:bg-sky-100 px-4 py-2 rounded-full border border-sky-200"><i class="fab fa-twitter"></i>X</a>
                <button onclick="navigator.clipboard.writeText(window.location.href);showToast('コピーしました')" class="flex items-center gap-2 text-sm bg-gray-50 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-full border border-gray-200"><i class="fas fa-link"></i>コピー</button>
              </div>
            </div>
          </div>
          <div class="border-t border-gray-100 bg-gray-50 p-6 md:p-8">
            <h3 class="font-bold text-gray-800 mb-5"><i class="far fa-comment mr-2 text-brand-500"></i>コメント ({comments.length}件)</h3>
            <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <div class="flex gap-3">
                <img src={currentUser.avatar_url} alt="" class="w-9 h-9 rounded-full flex-shrink-0" />
                <div class="flex-1">
                  <textarea placeholder="コメントを入力..." rows={3} class="w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none resize-none"></textarea>
                  <div class="flex justify-end mt-2"><button class="btn-primary px-5 py-2 rounded-full text-sm font-medium">コメントする</button></div>
                </div>
              </div>
            </div>
            <div class="space-y-4">
              {comments.map(comment => (
                <div class="flex gap-3">
                  <a href={`/user/${comment.user?.username}`} class="flex-shrink-0"><img src={comment.user?.avatar_url} alt="" class="w-9 h-9 rounded-full" /></a>
                  <div class="flex-1 bg-white rounded-xl border border-gray-100 p-3">
                    <div class="flex items-center gap-2 mb-1">
                      <a href={`/user/${comment.user?.username}`} class="text-sm font-semibold text-gray-800 hover:text-brand-600">{comment.user?.display_name}</a>
                      <span class="text-xs text-gray-400">{formatRelativeDate(comment.created_at)}</span>
                    </div>
                    <p class="text-sm text-gray-700">{comment.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div id="toast" class="toast"></div>
      <script dangerouslySetInnerHTML={{ __html: `function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000);}` }} />
    </Layout>
  )
})

function handleVJCreate(c: any) {
  const unread = dummyNotifications.filter(n => !n.is_read).length
  return c.html(
    <Layout title="ボイスジャーナルを作る" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-2xl mx-auto px-4 py-8">
        <div class="flex items-center gap-2 mb-8">
          {[{n:1,l:'録音',a:true},{n:2,l:'設定',a:false},{n:3,l:'完了',a:false}].map((s,i) => (
            <>
              <div class="flex items-center gap-2">
                <div class={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${s.a ? 'text-white' : 'bg-gray-200 text-gray-500'}`} style={s.a ? 'background:#3085c7' : ''}>{s.n}</div>
                <span class={`text-sm ${s.a ? 'font-semibold text-brand-600' : 'text-gray-400'}`}>{s.l}</span>
              </div>
              {i < 2 && <div class="flex-1 h-0.5 bg-gray-200"></div>}
            </>
          ))}
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 md:p-8">
            <h1 class="text-xl font-bold text-gray-800 mb-2">ボイスジャーナルを録音</h1>
            <p class="text-sm text-gray-500 mb-8">最大2分間、声で日記を投稿できます</p>
            <div class="bg-brand-50 rounded-2xl p-8 text-center mb-6">
              <div id="recorderStatus" class="mb-6">
                <div class="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4" style="background: #eef5fc">
                  <button onclick="startRecording()" class="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg" style="background: #3085c7" id="mainRecordBtn">
                    <i class="fas fa-microphone text-3xl"></i>
                  </button>
                </div>
                <p class="text-sm text-gray-500">タップして録音開始</p>
              </div>
              <div id="timerDisplay" class="hidden mb-4">
                <div class="text-4xl font-bold text-brand-600 mb-1" id="timerText">0:00</div>
                <div class="text-sm text-gray-500">残り <span id="remainingTime">2:00</span></div>
                <div class="mt-3 bg-white/60 rounded-full h-2 w-full max-w-xs mx-auto"><div id="timerProgress" class="audio-player-bar h-2 rounded-full" style="width:0%"></div></div>
              </div>
              <div id="recordingControls" class="hidden justify-center gap-3 mt-4">
                <button onclick="stopRecording()" class="flex items-center gap-2 text-white px-5 py-2.5 rounded-full text-sm font-medium" style="background: #ef4444"><i class="fas fa-stop"></i>録音完了</button>
              </div>
              <div id="recordedPreview" class="hidden">
                <div class="bg-white rounded-xl p-4 mb-4 text-left">
                  <p class="text-sm font-semibold text-gray-700 mb-2">録音完了！確認してみましょう</p>
                  <div class="flex items-center gap-3">
                    <button id="play-btn-preview" onclick="playPreview()" class="w-10 h-10 rounded-full flex items-center justify-center text-white" style="background: #3085c7"><i class="fas fa-play text-sm"></i></button>
                    <div class="flex-1"><div class="bg-gray-100 rounded-full h-1.5"><div class="audio-player-bar h-1.5 rounded-full" id="previewProgress" style="width:0%"></div></div></div>
                  </div>
                </div>
                <div class="flex justify-center gap-3">
                  <button onclick="reRecord()" class="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full text-sm font-medium text-gray-700 border border-gray-200"><i class="fas fa-redo"></i>録り直す</button>
                  <button onclick="proceedToSettings()" class="flex items-center gap-2 text-white px-5 py-2.5 rounded-full text-sm font-medium btn-primary">次へ進む <i class="fas fa-arrow-right"></i></button>
                </div>
              </div>
            </div>
            <div class="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-brand-300 transition-colors cursor-pointer" onclick="document.getElementById('fileInput').click()">
              <i class="fas fa-upload text-2xl text-gray-300 mb-2 block"></i>
              <p class="text-sm font-medium text-gray-600">音声ファイルをアップロード</p>
              <p class="text-xs text-gray-400 mt-1">MP3, WAV, M4A対応 (最大50MB)</p>
              <input type="file" id="fileInput" accept="audio/*" class="hidden" onchange="handleFileUpload(event)" />
            </div>
          </div>
        </div>
        <div id="settingsForm" class="hidden mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 md:p-8">
            <h2 class="text-xl font-bold text-gray-800 mb-6">投稿設定</h2>
            <div class="space-y-5">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">タイトル <span class="text-red-500">*</span></label>
                <input type="text" id="vjTitle" placeholder="今日の気持ちや出来事" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" maxlength={100} oninput="document.getElementById('titleCount').textContent=this.value.length" />
                <p class="text-xs text-gray-400 mt-1 text-right"><span id="titleCount">0</span>/100</p>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">説明・本文</label>
                <textarea id="vjDescription" placeholder="声日記の補足や感想を書いてみましょう" rows={4} class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"></textarea>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">ハッシュタグ</label>
                <input type="text" placeholder="#日常 #気づき" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">公開範囲</label>
                <div class="space-y-2">
                  {[{v:'public',l:'全体公開',d:'すべてのユーザーが閲覧できます',i:'fa-globe'},{v:'followers_only',l:'フォロワー限定',d:'フォロワーのみ閲覧できます',i:'fa-user-friends'},{v:'draft',l:'下書き',d:'自分のみ閲覧できます',i:'fa-lock'}].map(opt => (
                    <label class="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-colors">
                      <input type="radio" name="visibility" value={opt.v} class="text-brand-500" checked={opt.v === 'public'} />
                      <i class={`fas ${opt.i} text-brand-500 w-5 text-center`}></i>
                      <div><p class="text-sm font-semibold text-gray-700">{opt.l}</p><p class="text-xs text-gray-400">{opt.d}</p></div>
                    </label>
                  ))}
                </div>
              </div>
              <div class="flex gap-3 pt-2">
                <button onclick="window.location.href='/mypage/drafts'" class="flex-1 btn-outline py-3 rounded-xl text-sm font-medium"><i class="fas fa-save mr-2"></i>下書き保存</button>
                <button onclick="window.location.href='/voice-journal/create/complete'" class="flex-1 btn-primary py-3 rounded-xl text-sm font-medium"><i class="fas fa-paper-plane mr-2"></i>投稿する</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: `
        let mediaRecorder=null,chunks=[],recordingInterval=null,elapsedSeconds=0;
        const MAX_SECONDS=120;
        async function startRecording(){
          try{
            const stream=await navigator.mediaDevices.getUserMedia({audio:true});
            mediaRecorder=new MediaRecorder(stream);chunks=[];
            mediaRecorder.ondataavailable=e=>chunks.push(e.data);
            mediaRecorder.onstop=()=>showPreview();
            mediaRecorder.start(100);
            document.getElementById('recorderStatus').classList.add('hidden');
            document.getElementById('timerDisplay').classList.remove('hidden');
            document.getElementById('recordingControls').classList.remove('hidden');
            document.getElementById('recordingControls').classList.add('flex');
            elapsedSeconds=0;
            recordingInterval=setInterval(()=>{
              elapsedSeconds++;
              const m=Math.floor(elapsedSeconds/60),s=elapsedSeconds%60;
              document.getElementById('timerText').textContent=m+':'+s.toString().padStart(2,'0');
              const rem=MAX_SECONDS-elapsedSeconds,rm=Math.floor(rem/60),rs=rem%60;
              document.getElementById('remainingTime').textContent=rm+':'+rs.toString().padStart(2,'0');
              document.getElementById('timerProgress').style.width=(elapsedSeconds/MAX_SECONDS*100)+'%';
              if(elapsedSeconds>=MAX_SECONDS)stopRecording();
            },1000);
          }catch(e){alert('マイクへのアクセスを許可してください');}
        }
        function stopRecording(){if(recordingInterval)clearInterval(recordingInterval);if(mediaRecorder){mediaRecorder.stop();mediaRecorder.stream.getTracks().forEach(t=>t.stop());}}
        function showPreview(){document.getElementById('timerDisplay').classList.add('hidden');document.getElementById('recordingControls').classList.add('hidden');document.getElementById('recordedPreview').classList.remove('hidden');}
        function reRecord(){document.getElementById('recordedPreview').classList.add('hidden');document.getElementById('recorderStatus').classList.remove('hidden');}
        function playPreview(){
          if(!chunks.length)return;
          const blob=new Blob(chunks,{type:'audio/webm'}),url=URL.createObjectURL(blob),audio=new Audio(url);
          const btn=document.getElementById('play-btn-preview');
          audio.play();btn.innerHTML='<i class="fas fa-pause text-sm"></i>';
          audio.onended=()=>{btn.innerHTML='<i class="fas fa-play text-sm"></i>';};
          btn.onclick=()=>{if(!audio.paused){audio.pause();btn.innerHTML='<i class="fas fa-play text-sm"></i>';}else{audio.play();btn.innerHTML='<i class="fas fa-pause text-sm"></i>';}};
        }
        function proceedToSettings(){document.getElementById('settingsForm').classList.remove('hidden');document.getElementById('settingsForm').scrollIntoView({behavior:'smooth'});}
        function handleFileUpload(e){if(e.target.files[0])showPreview();}
      `}} />
    </Layout>
  )
}

// VJ Create Complete
app.get('/voice-journal/create/complete', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length
  return c.html(
    <Layout title="投稿完了" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-lg mx-auto px-4 py-16 text-center">
        <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style="background: #3085c7"><i class="fas fa-check text-white text-3xl"></i></div>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">投稿しました！</h1>
        <p class="text-gray-500 mb-8">あなたの声が届きました。ありがとうございます 🎉</p>
        <div class="flex flex-col gap-3">
          <a href="/voice-journals" class="btn-primary py-3 rounded-xl font-medium"><i class="fas fa-list mr-2"></i>投稿一覧を見る</a>
          <a href="/mypage" class="btn-outline py-3 rounded-xl font-medium"><i class="fas fa-home mr-2"></i>マイページへ</a>
          <a href="/voice-journal/create" class="text-sm text-brand-600 hover:underline mt-2">続けて投稿する</a>
        </div>
      </div>
    </Layout>
  )
})

// ==================== SONGS ====================
// Import sub-routes
import songsAppRoute from './routes/songs'
import usersAppRoute from './routes/users'
import mypageAppRoute from './routes/mypage'
import columnsAppRoute from './routes/columns'
import adminAppRoute from './routes/admin'

app.route('/songs', songsAppRoute)
app.route('/user', usersAppRoute)
app.route('/mypage', mypageAppRoute)
app.route('/columns', columnsAppRoute)
app.route('/admin', adminAppRoute)

// Auth pages - inline
app.get('/login', (c) => {
  return c.html(
    <Layout title="ログイン">
      <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div class="w-full max-w-md">
          <div class="text-center mb-8">
            <a href="/" class="inline-flex items-center gap-2 mb-4">
              <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: #3085c7"><i class="fas fa-microphone text-white"></i></div>
              <span class="logo-text text-2xl font-bold">ココロザシラボ</span>
            </a>
            <h1 class="text-xl font-bold text-gray-800">ログイン</h1>
            <p class="text-sm text-gray-500 mt-1">アカウントにサインインしてください</p>
          </div>
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div class="space-y-3 mb-5">
              <button class="w-full flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"><img src="https://www.google.com/favicon.ico" alt="Google" class="w-5 h-5" />Googleでログイン</button>
            </div>
            <div class="flex items-center gap-3 my-5"><div class="flex-1 h-px bg-gray-200"></div><span class="text-xs text-gray-400">または</span><div class="flex-1 h-px bg-gray-200"></div></div>
            <form class="space-y-4" onsubmit="event.preventDefault();window.location.href='/'">
              <div><label class="block text-sm font-semibold text-gray-700 mb-1.5">メールアドレス</label><input type="email" placeholder="hello@example.com" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" /></div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">パスワード</label>
                <input type="password" placeholder="パスワード" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
              </div>
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" class="rounded" /><span class="text-sm text-gray-600">ログイン状態を保持</span></label>
                <a href="/password/reset" class="text-sm text-brand-600 hover:underline">パスワードを忘れた方</a>
              </div>
              <button type="submit" class="w-full btn-primary py-3.5 rounded-xl text-sm font-bold">ログイン</button>
            </form>
          </div>
          <p class="text-center text-sm text-gray-500 mt-6">アカウントをお持ちでない方は<a href="/signup" class="text-brand-600 font-semibold hover:underline ml-1">新規登録</a></p>
        </div>
      </div>
    </Layout>
  )
})

app.get('/signup', (c) => {
  return c.html(
    <Layout title="新規登録">
      <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div class="w-full max-w-md">
          <div class="text-center mb-8">
            <a href="/" class="inline-flex items-center gap-2 mb-4">
              <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: #3085c7"><i class="fas fa-microphone text-white"></i></div>
              <span class="logo-text text-2xl font-bold">ココロザシラボ</span>
            </a>
            <h1 class="text-xl font-bold text-gray-800">アカウント作成</h1>
            <p class="text-sm text-gray-500 mt-1">声と想いのコミュニティへようこそ</p>
          </div>
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div class="space-y-3 mb-5">
              <button class="w-full flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"><img src="https://www.google.com/favicon.ico" alt="Google" class="w-5 h-5" />Googleで登録</button>
            </div>
            <div class="flex items-center gap-3 my-5"><div class="flex-1 h-px bg-gray-200"></div><span class="text-xs text-gray-400">または</span><div class="flex-1 h-px bg-gray-200"></div></div>
            <form class="space-y-4" onsubmit="event.preventDefault();window.location.href='/signup/terms'">
              <div><label class="block text-sm font-semibold text-gray-700 mb-1.5">表示名 *</label><input type="text" placeholder="田中はるか" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" required /></div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">ユーザーID *</label>
                <div class="relative"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span><input type="text" placeholder="haruka_voice" class="w-full pl-7 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" required /></div>
              </div>
              <div><label class="block text-sm font-semibold text-gray-700 mb-1.5">メールアドレス *</label><input type="email" placeholder="hello@example.com" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" required /></div>
              <div><label class="block text-sm font-semibold text-gray-700 mb-1.5">パスワード *</label><input type="password" placeholder="8文字以上" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" required minlength={8} /></div>
              <button type="submit" class="w-full btn-primary py-3.5 rounded-xl text-sm font-bold">次へ（規約確認）</button>
            </form>
          </div>
          <p class="text-center text-sm text-gray-500 mt-6">すでにアカウントをお持ちの方は<a href="/login" class="text-brand-600 font-semibold hover:underline ml-1">ログイン</a></p>
        </div>
      </div>
    </Layout>
  )
})

app.get('/signup/terms', (c) => {
  return c.html(
    <Layout title="利用規約確認">
      <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div class="w-full max-w-md">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h1 class="text-xl font-bold text-gray-800 mb-4">利用規約の確認</h1>
            <div class="h-64 overflow-y-auto border border-gray-200 rounded-xl p-4 text-sm text-gray-600 mb-5 leading-relaxed">
              <h3 class="font-bold mb-2">ココロザシラボ 利用規約</h3>
              <p class="mb-3">第1条（目的）本規約は、ココロザシラボの利用条件を定めるものです。</p>
              <p class="mb-3">第2条（利用登録）本規約に同意の上、当社の定める方法によって利用登録を申請し、当社が承認することで完了します。</p>
              <p class="mb-3">第3条（禁止事項）法令違反、他者の権利侵害、スパム行為等を禁止します。</p>
              <p>第4条（コンテンツの権利）投稿コンテンツの著作権はユーザーに帰属します。</p>
            </div>
            <label class="flex items-center gap-3 mb-4 cursor-pointer"><input type="checkbox" id="agreeTerms" /><span class="text-sm text-gray-700">利用規約に同意する</span></label>
            <label class="flex items-center gap-3 mb-5 cursor-pointer"><input type="checkbox" id="agreePrivacy" /><span class="text-sm text-gray-700"><a href="/privacy" class="text-brand-600 hover:underline" target="_blank">プライバシーポリシー</a>に同意する</span></label>
            <a href="/signup/complete" onclick="if(!document.getElementById('agreeTerms').checked||!document.getElementById('agreePrivacy').checked){alert('規約に同意してください');return false;}" class="block w-full btn-primary py-3.5 rounded-xl text-sm font-bold text-center">同意して登録を完了する</a>
          </div>
        </div>
      </div>
    </Layout>
  )
})

app.get('/signup/complete', (c) => {
  return c.html(
    <Layout title="登録完了">
      <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div class="w-full max-w-md text-center">
          <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style="background: #3085c7"><i class="fas fa-check text-white text-3xl"></i></div>
          <h1 class="text-2xl font-bold text-gray-800 mb-2">登録完了！</h1>
          <p class="text-gray-500 mb-2">ココロザシラボへようこそ！</p>
          <p class="text-sm text-gray-400 mb-8">確認メールをお送りしました。メール内のリンクをクリックして本登録を完了してください。</p>
          <a href="/" class="btn-primary px-8 py-3 rounded-full font-medium inline-block">ホームへ</a>
        </div>
      </div>
    </Layout>
  )
})

app.get('/password/reset', (c) => {
  return c.html(
    <Layout title="パスワードリセット">
      <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div class="w-full max-w-md">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h1 class="text-xl font-bold text-gray-800 mb-2">パスワードリセット</h1>
            <p class="text-sm text-gray-500 mb-5">登録済みのメールアドレスを入力してください。</p>
            <div class="space-y-4">
              <input type="email" placeholder="hello@example.com" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
              <button onclick="alert('リセットメールを送信しました')" class="w-full btn-primary py-3 rounded-xl text-sm font-bold">リセットメールを送信</button>
            </div>
            <p class="text-center text-sm text-gray-500 mt-4"><a href="/login" class="text-brand-600 hover:underline">ログインに戻る</a></p>
          </div>
        </div>
      </div>
    </Layout>
  )
})

// Static pages
app.get('/about', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length
  return c.html(
    <Layout title="初めての方へ" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      {/* Google Fonts + About page styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;700;900&family=Montserrat:wght@400;600;700;800&display=swap');
        .about-jp { font-family: 'Zen Kaku Gothic New', sans-serif; }
        .about-en { font-family: 'Montserrat', sans-serif; }
        .about-section-label {
          font-family: 'Montserrat', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.15em; color: #35C3F0;
          text-transform: uppercase; display: block; margin-bottom: 6px;
        }
        .about-section-heading {
          font-family: 'Zen Kaku Gothic New', sans-serif;
          font-size: 1.75rem; font-weight: 900; color: #1a2a3a;
          display: flex; align-items: center; gap: 10px; line-height: 1.3;
        }
        .about-section-heading img { width: 28px; height: 35px; flex-shrink: 0; }
        .about-feature-card {
          background: #fff; border-radius: 18px; border: 1px solid #e8eef5;
          padding: 0; overflow: hidden;
          box-shadow: 0 2px 12px rgba(48,133,199,0.06);
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .about-feature-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(48,133,199,0.13); }
        .about-feature-card-img {
          background: #f0f4f8; width: 100%; aspect-ratio: 16/9;
          display: flex; align-items: center; justify-content: center;
        }
        .about-feature-card-body { padding: 20px; }
        .about-feature-card-title { font-family: 'Zen Kaku Gothic New', sans-serif; font-size: 1rem; font-weight: 900; color: #1a2a3a; margin-bottom: 8px; }
        .about-feature-card-desc { font-family: 'Zen Kaku Gothic New', sans-serif; font-size: 0.84rem; color: #5a6a7a; line-height: 1.7; }
        .about-song-visual {
          background: linear-gradient(135deg, #1a7db8 0%, #35C3F0 100%);
          border-radius: 18px; padding: 32px;
          display: flex; align-items: center; justify-content: center; min-height: 200px;
        }
        .about-cta-banner {
          background: #35C3F0; border-radius: 20px; padding: 40px 32px;
          display: flex; flex-direction: column; align-items: center;
          text-align: center; gap: 16px;
        }
        .about-cta-title { font-family: 'Zen Kaku Gothic New', sans-serif; font-size: 1.5rem; font-weight: 900; color: #fff; }
        .about-cta-sub { font-family: 'Zen Kaku Gothic New', sans-serif; font-size: 0.9rem; color: rgba(255,255,255,0.9); }
        .about-cta-btn {
          font-family: 'Montserrat', sans-serif; font-weight: 700;
          background: #fff; color: #1a7db8; border-radius: 100px;
          padding: 12px 36px; font-size: 0.95rem; text-decoration: none;
          display: inline-block; transition: background 0.15s;
        }
        .about-cta-btn:hover { background: #e8f7fd; }
        @media (max-width: 768px) {
          .about-section-heading { font-size: 1.3rem; }
          .about-hero-logo { display: none !important; }
          .about-two-col { grid-template-columns: 1fr !important; }
        }
      `}} />

      {/* HERO */}
      <section style="background:#35C3F0; overflow:hidden;">
        <div style="max-width:1100px; margin:0 auto; padding:56px 32px 48px; display:flex; align-items:center; gap:48px;">
          <div style="flex:1; color:#fff;">
            <span class="about-en" style="font-size:11px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; opacity:0.85; display:block; margin-bottom:12px;">
              Welcome to Kokorozashi Lab!
            </span>
            <h1 class="about-jp" style="font-size:clamp(1.7rem,4vw,2.6rem); font-weight:900; line-height:1.3; margin-bottom:18px; color:#fff;">
              声と歌で志を発信する<br />コミュニティプラットフォーム
            </h1>
            <p class="about-jp" style="font-size:1rem; line-height:1.8; opacity:0.92; margin-bottom:28px; max-width:420px;">
              ここロザシラボは、声で「志」を記録・発信し、<br />同じ想いを持つ人と繋がれる場所です。
            </p>
            <a href="/signup" class="about-en" style="background:#fff; color:#1a7db8; font-weight:700; padding:13px 36px; border-radius:100px; text-decoration:none; font-size:0.95rem; display:inline-block;">
              今すぐ始める →
            </a>
          </div>
          <div class="about-hero-logo" style="flex-shrink:0; width:220px; opacity:0.92;">
            <img src="/static/logo-mark.svg" alt="ここロザシラボ" style="width:100%; height:auto;" />
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div style="max-width:1000px; margin:0 auto; padding:64px 24px 80px;">

        {/* Features */}
        <section style="margin-bottom:72px;">
          <span class="about-section-label">Features</span>
          <h2 class="about-section-heading" style="margin-bottom:32px;">
            <img src="/static/midashi.svg" alt="" />
            ここロザシラボでできること
          </h2>
          <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(270px,1fr)); gap:24px;">
            {[
              { title:'ボイスジャーナル', icon:'fa-microphone', iconColor:'#3085c7',
                desc:'ブラウザで録音してそのまま投稿。声で日記を書くように、今日の気持ちや気づきをシェアしましょう。コメントやリアクションで仲間と繋がれます。' },
              { title:'ここロザシソング', icon:'fa-music', iconColor:'#eba528',
                desc:'あなたの志や想いをヒアリングして、プロのクリエイターが楽曲化。本人歌唱の作品として、世界にひとつだけの歌を永遠に残せます。' },
              { title:'コミュニティ', icon:'fa-users', iconColor:'#35C3F0',
                desc:'フォローして、コメントやリアクションで繋がろう。声と想いが人と人をつなぐ、温かいコミュニティがここにあります。' },
            ].map(f => (
              <div class="about-feature-card">
                <div class="about-feature-card-img">
                  <i class={`fas ${f.icon}`} style={`font-size:2.5rem; color:${f.iconColor}; opacity:0.45;`}></i>
                </div>
                <div class="about-feature-card-body">
                  <p class="about-feature-card-title">{f.title}</p>
                  <p class="about-feature-card-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Voice Journal */}
        <section style="margin-bottom:72px;">
          <span class="about-section-label">Voice Journal</span>
          <h2 class="about-section-heading" style="margin-bottom:32px;">
            <img src="/static/midashi.svg" alt="" />
            ボイスジャーナルとは
          </h2>
          <div class="about-two-col" style="display:grid; grid-template-columns:1fr 1fr; gap:40px; align-items:center;">
            <div>
              <p class="about-jp" style="font-size:0.95rem; color:#3a4a5a; line-height:1.85; margin-bottom:20px;">
                ボイスジャーナルは、声で緤る日記のような投稿機能です。スマートフォンやパソコンのブラウザから録音して、タイトルとハッシュタグをつけるだけで投稿完了。
              </p>
              <p class="about-jp" style="font-size:0.95rem; color:#3a4a5a; line-height:1.85; margin-bottom:20px;">
                文章を書くのが苦手でも大丈夫。声なら、思ったことをそのまま、ありのままに届けられます。
              </p>
              <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:24px;">
                {[
                  { icon:'fa-microphone', text:'ブラウザから簡単録音（最大20分）' },
                  { icon:'fa-hashtag', text:'ハッシュタグで検索・発見しやすい' },
                  { icon:'fa-heart', text:'リアクションとコメントで交流' },
                  { icon:'fa-lock', text:'公開範囲を選べる（全体・フォロワー・非公開）' },
                ].map(item => (
                  <div style="display:flex; align-items:center; gap:12px;">
                    <div style="width:32px; height:32px; border-radius:50%; background:#eef5fc; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                      <i class={`fas ${item.icon}`} style="color:#3085c7; font-size:13px;"></i>
                    </div>
                    <span class="about-jp" style="font-size:0.88rem; color:#3a4a5a;">{item.text}</span>
                  </div>
                ))}
              </div>
              <a href="/voice-journals" class="about-en" style="background:#3085c7; color:#fff; font-weight:700; padding:11px 28px; border-radius:100px; text-decoration:none; font-size:0.88rem; display:inline-block;">
                投稿を聴いてみる →
              </a>
            </div>
            <div style="background:linear-gradient(135deg,#eef5fc 0%,#d4e8f7 100%); border-radius:18px; padding:40px; display:flex; flex-direction:column; align-items:center; gap:16px; min-height:220px; justify-content:center;">
              <div style="width:72px; height:72px; border-radius:50%; background:#3085c7; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 24px rgba(48,133,199,0.3);">
                <i class="fas fa-microphone" style="color:#fff; font-size:28px;"></i>
              </div>
              <p class="about-jp" style="font-size:0.9rem; color:#3085c7; font-weight:700; text-align:center;">声で、今日を記録しよう</p>
              <div style="display:flex; gap:6px; align-items:flex-end; height:40px;">
                {[14,22,30,18,26,20,32,16,24,28].map((h: number) => (
                  <div style={`width:6px; height:${h}px; border-radius:3px; background:#3085c7; opacity:0.55;`}></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Song */}
        <section style="margin-bottom:72px;">
          <span class="about-section-label">Kokorozashi Song</span>
          <h2 class="about-section-heading" style="margin-bottom:32px;">
            <img src="/static/midashi.svg" alt="" />
            ここロザシソングとは
          </h2>
          <div class="about-two-col" style="display:grid; grid-template-columns:1fr 1fr; gap:40px; align-items:center;">
            <div class="about-song-visual">
              <div style="text-align:center; color:#fff;">
                <div style="width:72px; height:72px; border-radius:50%; background:rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; margin:0 auto 16px;">
                  <i class="fas fa-music" style="font-size:28px;"></i>
                </div>
                <p class="about-jp" style="font-size:1rem; font-weight:900; margin-bottom:6px;">あなたの志が、歌になる</p>
                <p class="about-jp" style="font-size:0.82rem; opacity:0.85;">世界でひとつだけの楽曲</p>
              </div>
            </div>
            <div>
              <p class="about-jp" style="font-size:0.95rem; color:#3a4a5a; line-height:1.85; margin-bottom:20px;">
                ここロザシソングは、あなたの「志」や「人生の物語」を音楽にするサービスです。プロのクリエイターがヒアリングを行い、あなただけの歌詞とメロディを制作します。
              </p>
              <p class="about-jp" style="font-size:0.95rem; color:#3a4a5a; line-height:1.85; margin-bottom:20px;">
                完成した楽曲はプラットフォーム上で公開・シェアでき、生涯にわたって聴き続けられる「声の記念碑」として残ります。
              </p>
              <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:24px;">
                {[
                  { icon:'fa-headset', text:'プロによる丁寧なヒアリング' },
                  { icon:'fa-wand-magic-sparkles', text:'オリジナル楽曲・歌詞の制作' },
                  { icon:'fa-compact-disc', text:'本人歌唱で仕上げ' },
                  { icon:'fa-share-nodes', text:'プラットフォームで永続公開' },
                ].map(item => (
                  <div style="display:flex; align-items:center; gap:12px;">
                    <div style="width:32px; height:32px; border-radius:50%; background:#fff8ec; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                      <i class={`fas ${item.icon}`} style="color:#eba528; font-size:13px;"></i>
                    </div>
                    <span class="about-jp" style="font-size:0.88rem; color:#3a4a5a;">{item.text}</span>
                  </div>
                ))}
              </div>
              <a href="/songs/about" class="about-en" style="background:#eba528; color:#fff; font-weight:700; padding:11px 28px; border-radius:100px; text-decoration:none; font-size:0.88rem; display:inline-block;">
                サービスを詳しく見る →
              </a>
            </div>
          </div>
        </section>

        {/* Get Started Today */}
        <div class="about-cta-banner">
          <span class="about-en" style="font-size:11px; font-weight:700; letter-spacing:0.18em; color:rgba(255,255,255,0.8); text-transform:uppercase;">Get Started Today</span>
          <p class="about-cta-title">今すぐ、声を届けよう</p>
          <p class="about-cta-sub">無料登録で、ボイスジャーナルの投稿・閲覧・コメントがすぐに始められます。</p>
          <a href="/signup" class="about-cta-btn">無料アカウントを作成する</a>
        </div>

      </div>
    </Layout>
  )
})
app.get('/news', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length
  return c.html(
    <Layout title="お知らせ" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}
      sidebar={<HomeSidebar currentPath="/news" />}
    >
      <div>
        <h1 class="section-heading mb-6">お知らせ</h1>
        <div class="space-y-4">
          {dummyNews.map((news: any) => (
            <article class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div class="flex items-start gap-3">
                <div class="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-2"></div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 class="font-bold text-gray-800">{news.title}</h2>
                  </div>
                  <p class="text-sm text-gray-600 mb-2 leading-relaxed">{news.body}</p>
                  <p class="text-xs text-gray-400">{formatDate(news.published_at)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        {dummyNews.length === 0 && (
          <div class="text-center py-16 text-gray-400">
            <i class="fas fa-bell text-5xl mb-4 block opacity-30"></i>
            <p class="text-lg font-semibold">お知らせはありません</p>
          </div>
        )}
      </div>
    </Layout>
  )
})

app.get('/search', (c) => {
  const q = c.req.query('q') || ''
  const tab = c.req.query('tab') || 'all'
  const unread = dummyNotifications.filter(n => !n.is_read).length
  const filteredUsers = q ? dummyUsers.filter(u => u.display_name.includes(q) || u.username.includes(q) || u.bio?.includes(q)) : []
  const filteredVJs = q ? dummyVoiceJournals.filter(vj => vj.title.includes(q) || vj.description?.includes(q)) : []
  const filteredSongs = q ? dummySongs.filter(s => s.title.includes(q) || s.description?.includes(q)) : []
  return c.html(
    <Layout title={q ? `「${q}」の検索結果` : '検索'} currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-4xl mx-auto px-4 py-8">
        <div class="relative mb-6">
          <input type="text" value={q} placeholder="ユーザー、投稿を検索" class="w-full pl-12 pr-4 py-4 text-base border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-300 shadow-sm" onkeydown={`if(event.key==='Enter'){window.location='/search?q='+this.value+'&tab=all'}`} />
          <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
        </div>
        {q ? (
          <div>
            <p class="text-sm text-gray-500 mb-4">「{q}」の検索結果</p>
            <div class="flex border-b border-gray-200 mb-6">
              {[{k:'all',l:'すべて',c:filteredUsers.length+filteredVJs.length+filteredSongs.length},{k:'users',l:'ユーザー',c:filteredUsers.length},{k:'voice-journals',l:'ボイスジャーナル',c:filteredVJs.length},{k:'songs',l:'ココロザシソング',c:filteredSongs.length}].map(t => (
                <a href={`/search?q=${q}&tab=${t.k}`} class={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${tab===t.k?'border-brand-500 text-brand-600':'border-transparent text-gray-500 hover:text-gray-700'}`}>{t.l} ({t.c})</a>
              ))}
            </div>
            <div class="space-y-3">
              {(tab==='all'||tab==='users') && filteredUsers.map(u => (
                <a href={`/user/${u.username}`} class="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:bg-brand-50 transition-colors">
                  <img src={u.avatar_url} alt="" class="w-12 h-12 rounded-full" />
                  <div><p class="font-bold text-gray-800">{u.display_name}</p><p class="text-sm text-gray-400">@{u.username}</p></div>
                </a>
              ))}
              {(tab==='all'||tab==='voice-journals') && filteredVJs.map(vj => (
                <a href={`/voice-journal/${vj.id}`} class="flex items-start gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:bg-brand-50 transition-colors">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style="background: #3085c7"><i class="fas fa-microphone text-white text-sm"></i></div>
                  <div><p class="font-bold text-gray-800">{vj.title}</p><p class="text-xs text-gray-400">{vj.user?.display_name}</p></div>
                </a>
              ))}
              {(tab==='all'||tab==='songs') && filteredSongs.map(s => (
                <a href={`/songs/${s.id}`} class="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:bg-brand-50 transition-colors">
                  <img src={s.jacket_image_url} alt="" class="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                  <div><p class="font-bold text-gray-800">{s.title}</p><p class="text-xs text-gray-400">{s.user?.display_name}</p></div>
                </a>
              ))}
              {filteredUsers.length===0&&filteredVJs.length===0&&filteredSongs.length===0 && <div class="text-center py-12 text-gray-400"><i class="fas fa-search text-4xl mb-3 block opacity-30"></i><p>「{q}」の検索結果が見つかりませんでした</p></div>}
            </div>
          </div>
        ) : <div class="text-center py-12 text-gray-400"><i class="fas fa-search text-4xl mb-3 block opacity-30"></i><p>検索ワードを入力してください</p></div>}
      </div>
    </Layout>
  )
})

app.get('/terms', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length
  return c.html(
    <Layout title="利用規約" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-3xl mx-auto px-4 py-8">
        <h1 class="text-2xl font-bold text-gray-800 mb-2">利用規約</h1>
        <p class="text-sm text-gray-400 mb-8">最終更新日: 2025年1月1日</p>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6 text-sm text-gray-700 leading-relaxed">
          {[{t:'第1条（目的）',b:'本規約は、ココロザシラボの利用条件を定めるものです。'},{t:'第2条（利用登録）',b:'本規約に同意の上、当社の定める方法によって利用登録を申請し、当社が承認することで利用登録が完了します。'},{t:'第3条（禁止事項）',b:'法令または公序良俗に違反する行為、他者の権利を侵害する行為、スパム行為を禁止します。'},{t:'第4条（コンテンツの権利）',b:'ユーザーが投稿したコンテンツの著作権はユーザーに帰属します。ただし、サービス運営に必要な範囲で使用する権利を許諾するものとします。'},{t:'第5条（免責事項）',b:'当社は、ユーザー間のトラブルについて一切責任を負いません。'}].map(s => (
            <section><h2 class="text-lg font-bold text-gray-800 mb-3">{s.t}</h2><p>{s.b}</p></section>
          ))}
        </div>
      </div>
    </Layout>
  )
})

app.get('/privacy', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length
  return c.html(
    <Layout title="プライバシーポリシー" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-3xl mx-auto px-4 py-8">
        <h1 class="text-2xl font-bold text-gray-800 mb-2">プライバシーポリシー</h1>
        <p class="text-sm text-gray-400 mb-8">最終更新日: 2025年1月1日</p>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6 text-sm text-gray-700 leading-relaxed">
          <section><h2 class="text-lg font-bold text-gray-800 mb-3">1. 収集する情報</h2><p>登録情報、投稿コンテンツ、利用状況（アクセスログ等）を収集します。</p></section>
          <section><h2 class="text-lg font-bold text-gray-800 mb-3">2. 利用目的</h2><p>サービスの提供・運営、ユーザーサポート、サービス改善のために利用します。</p></section>
          <section><h2 class="text-lg font-bold text-gray-800 mb-3">3. 第三者への提供</h2><p>法令に基づく場合を除き、個人情報を第三者に提供しません。</p></section>
        </div>
      </div>
    </Layout>
  )
})

app.get('/law', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length
  return c.html(
    <Layout title="特定商取引法に基づく表記" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-3xl mx-auto px-4 py-8">
        <h1 class="text-2xl font-bold text-gray-800 mb-8">特定商取引法に基づく表記</h1>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {[['販売業者','ココロザシラボ株式会社'],['代表者','代表取締役 山田太郎'],['所在地','東京都渋谷区〇〇1-2-3'],['電話番号','お問い合わせフォームよりご連絡ください'],['メール','info@kokorozashi-lab.example.com'],['販売価格','各サービスページに記載の金額（税込）'],['支払方法','クレジットカード（Visa、MasterCard等）'],['サービス提供','申込後3営業日以内にご連絡'],['キャンセル','ヒアリング前：全額返金、ヒアリング後：不可']].map(([l,v],i) => (
            <div class={`flex ${i%2===0?'bg-gray-50':'bg-white'}`}>
              <div class="w-40 flex-shrink-0 p-4 border-r border-gray-100"><span class="text-sm font-semibold text-gray-600">{l}</span></div>
              <div class="flex-1 p-4"><span class="text-sm text-gray-700">{v}</span></div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
})

app.get('/contact', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length
  return c.html(
    <Layout title="お問い合わせ" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-2xl mx-auto px-4 py-8">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-800 mb-2">お問い合わせ</h1>
          <p class="text-gray-500">お気軽にご連絡ください。通常3営業日以内にご返信します。</p>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <form class="space-y-5" onsubmit="this.preventDefault();alert('送信しました')">
            <div class="grid grid-cols-2 gap-4">
              <div><label class="block text-sm font-semibold text-gray-700 mb-1.5">姓 *</label><input type="text" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" /></div>
              <div><label class="block text-sm font-semibold text-gray-700 mb-1.5">名 *</label><input type="text" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" /></div>
            </div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1.5">メールアドレス *</label><input type="email" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" /></div>
            <div><label class="block text-sm font-semibold text-gray-700 mb-1.5">お問い合わせ内容 *</label><textarea rows={6} class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"></textarea></div>
            <button type="submit" class="w-full btn-primary py-3.5 rounded-xl text-sm font-bold"><i class="fas fa-paper-plane mr-2"></i>送信する</button>
          </form>
        </div>
      </div>
    </Layout>
  )
})

export default app
