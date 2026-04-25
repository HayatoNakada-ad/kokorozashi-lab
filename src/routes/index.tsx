import { Hono } from 'hono'
import { Layout } from '../components/Layout'
import {
  dummyBanners, dummyFeed, dummyVoiceJournals, dummySongs,
  dummyColumns, dummyTopics, currentUser, dummyNotifications,
  formatRelativeDate, formatDuration, reactionLabels, formatDate
} from '../data/dummy'

const app = new Hono()

// ─── フォロー中フィードページ ───────────────────────────────
app.get('/following-feed', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length
  const filter = c.req.query('filter') || 'all'

  const filtered = dummyFeed.filter(item =>
    filter === 'all' ? true : item.type === filter
  )

  return c.html(
    <Layout title="フォロー中の投稿" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-2xl mx-auto px-4 py-8">
        <div class="mb-6">
          <h1 class="section-heading mb-4">フォロー中の投稿</h1>
          <div class="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'すべて', count: dummyFeed.length },
              { key: 'voice_journal', label: 'ボイスジャーナル', count: dummyFeed.filter(i => i.type === 'voice_journal').length },
              { key: 'song', label: 'ソング', count: dummyFeed.filter(i => i.type === 'song').length },
            ].map(tab => (
              <a
                href={`/following-feed?filter=${tab.key}`}
                class={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
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
          <div class="space-y-4">
            {filtered.map(item => {
              const vj = item.type === 'voice_journal' ? item.content as any : null
              const song = item.type === 'song' ? item.content as any : null
              const topReactions = Object.entries(reactionLabels)
                .sort((a, b) => ((item.content as any).reactions_count?.[b[0]] || 0) - ((item.content as any).reactions_count?.[a[0]] || 0))
                .slice(0, 3)
              return (
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover audio-card">
                  <div class="flex items-center gap-3 p-4 pb-0">
                    <a href={`/user/${item.user.username}`}>
                      <img src={item.user.avatar_url} alt={item.user.display_name} class="w-10 h-10 rounded-full object-cover" />
                    </a>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <a href={`/user/${item.user.username}`} class="font-semibold text-sm text-gray-800 hover:text-brand-600">
                          {item.user.display_name}
                        </a>
                        <span class="text-xs text-gray-400">{formatRelativeDate(item.created_at)}</span>
                      </div>
                      <p class="text-xs text-gray-500">
                        {item.type === 'voice_journal'
                          ? <span><i class="fas fa-microphone mr-1 text-brand-400"></i>ボイスジャーナルを投稿</span>
                          : <span><i class="fas fa-music mr-1 text-[#eba528]"></i>ここロザシソングを公開</span>}
                      </p>
                    </div>
                  </div>
                  <div class="p-4">
                    {vj && (
                      <div>
                        <a href={`/voice-journal/${vj.id}`} class="block mb-3">
                          <h3 class="font-bold text-gray-800 hover:text-brand-600 line-clamp-2">{vj.title}</h3>
                        </a>
                        <div class="bg-brand-50 rounded-xl p-3">
                          <div class="flex items-center gap-3">
                            <button id={`play-btn-${vj.id}`} class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-sm" style="background:#3085c7" onclick={`initAudioPlayer('${vj.id}', '')`}>
                              <i class="fas fa-play text-sm"></i>
                            </button>
                            <div class="flex-1">
                              <div class="bg-gray-200 rounded-full h-1.5">
                                <div id={`progress-${vj.id}`} class="audio-player-bar h-1.5 rounded-full" style="width:0%"></div>
                              </div>
                              <div class="flex justify-between text-xs text-gray-400 mt-1">
                                <span id={`current-time-${vj.id}`}>0:00</span>
                                <span>{formatDuration(vj.duration_seconds)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {vj.tags?.length > 0 && (
                          <div class="flex flex-wrap gap-1.5 mt-2">
                            {vj.tags.map((tag: string) => (
                              <a href={`/voice-journals?tag=${tag}`} class="tag-badge text-xs px-2 py-0.5 rounded-full">#{tag}</a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {song && (
                      <div class="flex gap-3">
                        <a href={`/songs/${song.id}`}>
                          <img src={song.jacket_image_url} alt={song.title} class="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                        </a>
                        <div class="flex-1 min-w-0">
                          <a href={`/songs/${song.id}`}><h3 class="font-bold text-gray-800 hover:text-brand-600 line-clamp-2 mb-1">{song.title}</h3></a>
                          <p class="text-xs text-gray-500 line-clamp-2 mb-2">{song.description}</p>
                          <div class="flex items-center gap-2">
                            <button id={`play-btn-${song.id}`} class="w-8 h-8 rounded-full flex items-center justify-center text-white" style="background:#3085c7" onclick={`initAudioPlayer('${song.id}', '')`}>
                              <i class="fas fa-play text-xs"></i>
                            </button>
                            <div class="flex-1">
                              <div class="bg-gray-200 rounded-full h-1">
                                <div id={`progress-${song.id}`} class="h-1 rounded-full" style="width:0%;background:#3085c7"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div class="px-4 pb-4 flex items-center justify-between">
                    <div class="flex items-center gap-1">
                      {topReactions.map(([type, info]) => {
                        const count = (item.content as any).reactions_count?.[type] || 0
                        return (
                          <button onclick={`toggleReaction(this, '${type}')`} class="reaction-btn flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600 bg-gray-50 hover:bg-brand-50 px-2 py-1 rounded-full border border-gray-100">
                            <span>{info.emoji}</span>
                            <span class="reaction-count">{count}</span>
                          </button>
                        )
                      })}
                    </div>
                    <a href={item.type === 'voice_journal' ? `/voice-journal/${(item.content as any).id}` : `/songs/${(item.content as any).id}`} class="text-xs text-gray-400 hover:text-brand-600 flex items-center gap-1">
                      <i class="far fa-comment"></i>
                      <span>{(item.content as any).comments_count}</span>
                    </a>
                  </div>
                </div>
              )
            })}
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
  const recommendedVJs = dummyVoiceJournals.filter(v => v.user?.id !== currentUser.id).slice(0, 4)

  return c.html(
    <Layout title="ホーム" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>

      {/* Hero Banner Carousel */}
      <section class="bg-white border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 py-6">
          <div class="relative overflow-hidden rounded-2xl" id="bannerCarousel">
            <div class="flex" id="bannerSlider" style="transition: transform 0.4s ease;">
              {dummyBanners.map((banner, i) => (
                <a href={banner.link_url} class="flex-shrink-0 w-full block" style="min-width:100%">
                  <div class="aspect-[3/1] md:aspect-[4/1] rounded-2xl overflow-hidden relative" style={`background: ${i === 0 ? '#3085c7' : i === 1 ? '#2469a3' : '#1e5282'}`}>
                    <div class="absolute inset-0 flex items-center px-8 md:px-16">
                      <div class="text-white">
                        <span class="text-xs font-semibold bg-white/20 rounded-full px-3 py-1 mb-3 inline-block">
                          {banner.type === 'campaign' ? '🎁 キャンペーン' : banner.type === 'feature' ? '✨ 特集' : '📢 お知らせ'}
                        </span>
                        <h2 class="text-xl md:text-3xl font-bold mb-2">{banner.title}</h2>
                        {banner.subtitle && <p class="text-sm md:text-base opacity-90">{banner.subtitle}</p>}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
            <button onclick="moveBanner(-1)" class="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full shadow flex items-center justify-center hover:bg-white">
              <i class="fas fa-chevron-left text-gray-600"></i>
            </button>
            <button onclick="moveBanner(1)" class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full shadow flex items-center justify-center hover:bg-white">
              <i class="fas fa-chevron-right text-gray-600"></i>
            </button>
            <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {dummyBanners.map((_, i) => (
                <button onclick={`setBanner(${i})`} id={`dot-${i}`} class={`h-2 rounded-full transition-all ${i === 0 ? 'bg-white w-4' : 'bg-white/50 w-2'}`}></button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div class="max-w-4xl mx-auto px-4 py-8">

        {/* ── フォロー中の投稿（noteスタイル・2-3列グリッド） ── */}
        <section class="mb-10">
          <div class="flex items-center justify-between mb-4">
            <h2 class="section-heading">フォロー中</h2>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {dummyFeed.slice(0, 6).map(item => {
              const vj = item.type === 'voice_journal' ? item.content as any : null
              const song = item.type === 'song' ? item.content as any : null
              const topReactions = Object.entries(reactionLabels)
                .sort((a, b) => ((item.content as any).reactions_count?.[b[0]] || 0) - ((item.content as any).reactions_count?.[a[0]] || 0))
                .slice(0, 3)
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
                    </div>
                    <div class="flex items-center gap-0.5">
                      {topReactions.map(([type, info]) => {
                        const count = (item.content as any).reactions_count?.[type] || 0
                        return (
                          <button onclick={`toggleReaction(this, '${type}')`} class="reaction-btn flex items-center gap-0.5 text-[10px] text-gray-500 bg-gray-50 px-1 py-0.5 rounded-full border border-gray-100">
                            <span>{info.emoji}</span>
                            <span class="reaction-count">{count}</span>
                          </button>
                        )
                      })}
                      <a href={href} class="ml-auto text-[10px] text-gray-400 flex items-center gap-0.5">
                        <i class="far fa-comment"></i>
                        <span>{(item.content as any).comments_count}</span>
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div class="text-center mt-4">
            <a href="/following-feed" class="btn-outline px-8 py-2.5 rounded-full text-sm font-medium inline-block">
              もっと見る
            </a>
          </div>
        </section>

        {/* ── おすすめ投稿（noteスタイル・2-3列グリッド） ── */}
        <section class="mb-10">
          <div class="flex items-center justify-between mb-4">
            <h2 class="section-heading">おすすめ</h2>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {recommendedVJs.slice(0, 6).map(vj => (
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden card-hover audio-card">
                <div class="relative">
                  <div class="w-full aspect-square bg-brand-50 flex flex-col items-center justify-center relative overflow-hidden">
                    <button
                      id={`play-btn-rec-${vj.id}-h`}
                      class="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md"
                      style="background:#3085c7"
                      onclick={`initAudioPlayer('rec-${vj.id}-h', '')`}
                    >
                      <i class="fas fa-play text-xs"></i>
                    </button>
                    <div id={`progress-rec-${vj.id}-h`} class="absolute bottom-0 left-0 h-1 rounded-full" style="width:0%;background:#3085c7"></div>
                    <span id={`current-time-rec-${vj.id}-h`} class="absolute bottom-1.5 right-2 text-[10px] text-brand-600">{formatDuration(vj.duration_seconds)}</span>
                  </div>
                  <span class="absolute top-1.5 left-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white" style="background:#eba528">おすすめ</span>
                </div>
                <div class="p-2.5">
                  <a href={`/voice-journal/${vj.id}`}>
                    <p class="font-bold text-gray-800 hover:text-brand-600 line-clamp-2 text-xs leading-snug mb-1.5">{vj.title}</p>
                  </a>
                  <div class="flex items-center gap-1 mb-1.5">
                    <img src={vj.user?.avatar_url} alt={vj.user?.display_name} class="w-4 h-4 rounded-full object-cover flex-shrink-0" />
                    <span class="text-[10px] text-gray-500 truncate">{vj.user?.display_name}</span>
                  </div>
                  <div class="flex items-center gap-0.5">
                    {Object.entries(reactionLabels).slice(0, 3).map(([type, info]) => (
                      <button onclick={`toggleReaction(this, '${type}')`} class="reaction-btn flex items-center gap-0.5 text-[10px] text-gray-500 bg-gray-50 px-1 py-0.5 rounded-full border border-gray-100">
                        <span>{info.emoji}</span>
                        <span class="reaction-count">{vj.reactions_count?.[type as keyof typeof vj.reactions_count] || 0}</span>
                      </button>
                    ))}
                    <a href={`/voice-journal/${vj.id}`} class="ml-auto text-[10px] text-gray-400 flex items-center gap-0.5">
                      <i class="far fa-comment"></i>
                      <span>{vj.comments_count}</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div class="text-center mt-4">
            <a href="/voice-journals" class="btn-outline px-8 py-2.5 rounded-full text-sm font-medium inline-block">
              もっと見る
            </a>
          </div>
        </section>

        {/* ── 新着ボイスジャーナル（noteスタイル・2-3列グリッド） ── */}
        <section class="mb-10">
          <div class="flex items-center justify-between mb-4">
            <h2 class="section-heading">新着ボイスジャーナル</h2>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {dummyVoiceJournals.slice(0, 6).map(vj => (
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
                    {Object.entries(reactionLabels).slice(0, 3).map(([type, info]) => (
                      <button onclick={`toggleReaction(this, '${type}')`} class="reaction-btn flex items-center gap-0.5 text-[10px] text-gray-500 bg-gray-50 px-1 py-0.5 rounded-full border border-gray-100">
                        <span>{info.emoji}</span>
                        <span class="reaction-count">{vj.reactions_count?.[type as keyof typeof vj.reactions_count] || 0}</span>
                      </button>
                    ))}
                    <a href={`/voice-journal/${vj.id}`} class="ml-auto text-[10px] text-gray-400 flex items-center gap-0.5">
                      <i class="far fa-comment"></i>
                      <span>{vj.comments_count}</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div class="text-center mt-4">
            <a href="/voice-journals" class="btn-outline px-8 py-2.5 rounded-full text-sm font-medium inline-block">
              もっと見る
            </a>
          </div>
        </section>

        {/* ── 今の気持ちを声に（投稿セクション直後） ── */}
        <section class="bg-brand-50 rounded-2xl border border-brand-100 p-6 mb-10">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div class="flex-1">
              <p class="section-heading-sub mb-1">声で記録しよう</p>
              <h3 class="section-heading">今の気持ちを声に</h3>
              <p class="text-sm text-gray-500 mt-1">思ったことをそのまま声で記録しよう</p>
            </div>
            <a href="/voice-journal/create" class="btn-primary px-6 py-3 rounded-xl text-sm font-medium flex items-center gap-2 flex-shrink-0">
              <i class="fas fa-microphone"></i>
              録音して投稿する
            </a>
          </div>
        </section>

        {/* ── コラム ── */}
        <section class="mb-10">
          <div class="flex items-center justify-between mb-5">
            <h2 class="section-heading">コラム</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dummyColumns.map(col => (
              <a href={`/columns/${col.slug}`} class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover block">
                <img src={col.thumbnail_url} alt={col.title} class="w-full aspect-video object-cover" />
                <div class="p-4">
                  <span class="text-xs text-brand-600 font-semibold bg-brand-50 px-2 py-0.5 rounded-full">{col.category}</span>
                  <h3 class="font-bold text-gray-800 mt-2 mb-1 line-clamp-2">{col.title}</h3>
                  <p class="text-sm text-gray-500 line-clamp-2">{col.summary}</p>
                  <p class="text-xs text-gray-400 mt-2">{formatDate(col.published_at)}</p>
                </div>
              </a>
            ))}
          </div>
          <div class="text-center mt-5">
            <a href="/columns" class="btn-outline px-8 py-2.5 rounded-full text-sm font-medium inline-block">
              もっと見る
            </a>
          </div>
        </section>

        {/* ── Podcast ── */}
        <section class="mb-10">
          <h2 class="section-heading mb-5">Podcast</h2>
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-16 h-16 rounded-xl flex items-center justify-center" style="background: #1DB954">
                <i class="fab fa-spotify text-white text-2xl"></i>
              </div>
              <div>
                <h3 class="font-bold text-gray-800">ここロザシラボ Podcast</h3>
                <p class="text-sm text-gray-500">声と志について語る番組</p>
              </div>
            </div>
            <div class="bg-gray-100 rounded-xl p-6 text-center text-gray-500">
              <i class="fab fa-spotify text-4xl text-green-500 mb-2 block"></i>
              <p class="text-sm">Spotify埋め込みプレイヤーがここに表示されます</p>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section class="rounded-3xl overflow-hidden mb-4" style="background:#3085c7">
          <div class="px-8 py-12 text-white text-center">
            <p class="text-sm font-semibold opacity-80 mb-2">✨ ここロザシソング</p>
            <h2 class="text-2xl md:text-4xl font-bold mb-4">あなたの志が、歌になる</h2>
            <p class="text-base opacity-90 mb-8 max-w-xl mx-auto">
              思いや志をヒアリングして、プロが楽曲化。<br />
              本人歌唱の作品として、永遠に残せます。
            </p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/songs/create" class="bg-white text-brand-700 font-bold px-8 py-3 rounded-full hover:bg-gray-50 transition-colors">申し込む</a>
              <a href="/songs/about" class="bg-white/20 text-white font-semibold px-8 py-3 rounded-full hover:bg-white/30 transition-colors">詳しく見る</a>
            </div>
          </div>
        </section>

      </div>

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
