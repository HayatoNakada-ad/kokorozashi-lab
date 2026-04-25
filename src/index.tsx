import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { Layout } from './components/Layout'
import {
  currentUser, dummyNotifications, dummyNews, dummyUsers, dummyVoiceJournals, dummySongs,
  formatDate, dummyBanners, dummyFeed, dummyColumns, dummyTopics,
  formatRelativeDate, formatDuration, reactionLabels, getVoiceJournalById,
  getSongById, getColumnBySlug, getCommentsForTarget, getUserByUsername,
  getVoiceJournalsByUser, getSongsByUser, dummyNotifications as notifs, dummyComments
} from './data/dummy'

const app = new Hono()

// Static files
app.use('/static/*', serveStatic({ root: './' }))

// ==================== HOME ====================
app.get('/', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length
  const activeTopic = dummyTopics[0]

  return c.html(
    <Layout title="ホーム" currentUser={currentUser} unreadNotifications={unread}>
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
                <button onclick={`setBanner(${i})`} class={`rounded-full transition-all bg-white ${i === 0 ? 'w-4 h-2' : 'w-2 h-2 opacity-50'}`} id={`dot-${i}`}></button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div class="max-w-7xl mx-auto px-4 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div class="lg:col-span-2 space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="section-heading">フォロー中の投稿</h2>
              <a href="/voice-journals" class="text-sm text-brand-600 hover:underline">すべて見る</a>
            </div>

            {dummyFeed.map(item => {
              const vj = item.type === 'voice_journal' ? item.content as any : null
              const song = item.type === 'song' ? item.content as any : null
              return (
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover audio-card">
                  <div class="flex items-center gap-3 p-4 pb-0">
                    <a href={`/user/${item.user.username}`}>
                      <img src={item.user.avatar_url} alt={item.user.display_name} class="w-10 h-10 rounded-full object-cover" />
                    </a>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <a href={`/user/${item.user.username}`} class="font-semibold text-sm text-gray-800 hover:text-brand-600">{item.user.display_name}</a>
                        <span class="text-xs text-gray-400">{formatRelativeDate(item.created_at)}</span>
                      </div>
                      <p class="text-xs text-gray-500">
                        {item.type === 'voice_journal' ? <span><i class="fas fa-microphone mr-1 text-brand-400"></i>ボイスジャーナルを投稿</span> : <span><i class="fas fa-music mr-1 text-purple-400"></i>ココロザシソングを公開</span>}
                      </p>
                    </div>
                  </div>
                  <div class="p-4">
                    {vj && (
                      <div>
                        <a href={`/voice-journal/${vj.id}`}><h3 class="font-bold text-gray-800 hover:text-brand-600 line-clamp-2 mb-3">{vj.title}</h3></a>
                        <div class="bg-brand-50 rounded-xl p-3">
                          <div class="flex items-center gap-3">
                            <button id={`play-btn-${vj.id}`} class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-sm" style="background: #3085c7" onclick={`initAudioPlayer('${vj.id}', '')`}>
                              <i class="fas fa-play text-sm"></i>
                            </button>
                            <div class="flex-1">
                              <div class="bg-gray-200 rounded-full h-1.5"><div id={`progress-${vj.id}`} class="audio-player-bar h-1.5 rounded-full" style="width:0%"></div></div>
                              <div class="flex justify-between text-xs text-gray-400 mt-1">
                                <span id={`current-time-${vj.id}`}>0:00</span>
                                <div class="wave-animation"><span></span><span></span><span></span><span></span><span></span></div>
                                <span>{formatDuration(vj.duration_seconds)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {vj.tags?.length > 0 && <div class="flex flex-wrap gap-1.5 mt-2">{vj.tags.map((t: string) => <a href={`/voice-journals?tag=${t}`} class="tag-badge text-xs px-2 py-0.5 rounded-full">#{t}</a>)}</div>}
                      </div>
                    )}
                    {song && (
                      <div class="flex gap-3">
                        <a href={`/songs/${song.id}`}><img src={song.jacket_image_url} alt={song.title} class="w-16 h-16 rounded-xl object-cover flex-shrink-0" /></a>
                        <div class="flex-1 min-w-0">
                          <a href={`/songs/${song.id}`}><h3 class="font-bold text-gray-800 hover:text-brand-600 line-clamp-2 mb-1">{song.title}</h3></a>
                          <p class="text-xs text-gray-500 line-clamp-2">{song.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div class="px-4 pb-4 flex items-center justify-between">
                    <div class="flex items-center gap-1 flex-wrap">
                      {Object.entries(reactionLabels).map(([type, info]) => (
                        <button onclick={`toggleReaction(this, '${type}')`} class="reaction-btn flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600 bg-gray-50 hover:bg-brand-50 px-2 py-1 rounded-full border border-gray-100">
                          <span>{info.emoji}</span><span class="reaction-count">{(item.content as any).reactions_count?.[type] || 0}</span>
                        </button>
                      ))}
                    </div>
                    <a href={item.type === 'voice_journal' ? `/voice-journal/${(item.content as any).id}` : `/songs/${(item.content as any).id}`} class="text-xs text-gray-400 hover:text-brand-600 flex items-center gap-1">
                      <i class="far fa-comment"></i><span>{(item.content as any).comments_count}</span>
                    </a>
                  </div>
                </div>
              )
            })}
            <div class="text-center"><a href="/voice-journals" class="btn-outline px-8 py-3 rounded-full text-sm font-medium inline-block">もっと見る</a></div>
          </div>

          {/* Sidebar */}
          <div class="space-y-6">
            <div class="bg-brand-50 rounded-2xl border border-brand-100 p-5">
              <div class="flex items-center gap-2 mb-3"><span class="text-lg">🎙️</span><h3 class="font-bold text-gray-800">今日のお題</h3></div>
              <p class="text-xl font-bold text-brand-700 mb-2">「{activeTopic.title}」</p>
              <p class="text-sm text-gray-600 mb-4">{activeTopic.description}</p>
              <div class="flex items-center gap-2 mb-4"><span class="tag-badge text-xs px-2 py-1 rounded-full">#{activeTopic.hashtag}</span></div>
              <a href="/voice-journal/create" class="btn-primary w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"><i class="fas fa-microphone"></i>このお題で投稿する</a>
            </div>
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 class="section-heading mb-3">今の気持ちを声に</h3>
              <p class="text-sm text-gray-500 mb-4">思ったことをそのまま声で記録しよう</p>
              <a href="/voice-journal/create" class="btn-primary w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"><i class="fas fa-microphone"></i>録音して投稿する</a>
            </div>
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div class="flex items-center justify-between mb-4"><h3 class="font-bold text-gray-800"><i class="fas fa-music mr-2 text-purple-500"></i>ココロザシソング</h3><a href="/songs/showcase" class="text-xs text-brand-600 hover:underline">すべて</a></div>
              {dummySongs.slice(0, 3).map(song => (
                <a href={`/songs/${song.id}`} class="flex items-center gap-3 py-2.5 border-b border-gray-50 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors last:border-0">
                  <img src={song.jacket_image_url} alt={song.title} class="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  <div class="flex-1 min-w-0"><p class="text-sm font-semibold text-gray-800 truncate">{song.title}</p><p class="text-xs text-gray-400">{song.user?.display_name}</p></div>
                  <i class="fas fa-play text-xs text-gray-400"></i>
                </a>
              ))}
            </div>
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div class="flex items-center justify-between mb-4"><h3 class="section-heading">コラム</h3><a href="/columns" class="text-xs text-brand-600 hover:underline">すべて</a></div>
              {dummyColumns.slice(0, 3).map(col => (
                <a href={`/columns/${col.slug}`} class="block py-2.5 border-b border-gray-50 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors last:border-0">
                  <p class="text-sm font-semibold text-gray-800 line-clamp-2">{col.title}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{col.category}</p>
                </a>
              ))}
            </div>
            <div class="rounded-2xl overflow-hidden" style="background: #3085c7">
              <div class="p-5 text-white">
                <p class="text-xs font-semibold opacity-80 mb-1">✨ 期間限定キャンペーン中</p>
                <h3 class="text-lg font-bold mb-2">あなたの志を歌にしませんか？</h3>
                <p class="text-sm opacity-90 mb-4">プロが楽曲化。本人歌唱の作品として永遠に残せます。</p>
                <a href="/songs/about" class="block bg-white text-purple-600 font-bold text-sm py-2.5 rounded-xl text-center hover:bg-gray-50">詳しく見る</a>
              </div>
            </div>
          </div>
        </div>

        {/* New VJs */}
        <section class="mt-12">
          <div class="flex items-center justify-between mb-6">
            <h2 class="section-heading">新着ボイスジャーナル</h2>
            <a href="/voice-journals" class="text-sm text-brand-600 hover:underline">すべて見る</a>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dummyVoiceJournals.slice(0, 6).map(vj => (
              <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover audio-card">
                <div class="p-4">
                  <div class="flex items-center gap-2 mb-3">
                    <a href={`/user/${vj.user?.username}`}><img src={vj.user?.avatar_url} alt="" class="w-8 h-8 rounded-full" /></a>
                    <div><p class="text-xs font-semibold text-gray-700">{vj.user?.display_name}</p><p class="text-xs text-gray-400">{formatRelativeDate(vj.created_at)}</p></div>
                  </div>
                  <a href={`/voice-journal/${vj.id}`}><h3 class="font-bold text-gray-800 hover:text-brand-600 line-clamp-2 mb-2 text-sm">{vj.title}</h3></a>
                  <div class="bg-brand-50 rounded-xl p-2.5 flex items-center gap-2">
                    <button id={`play-btn-${vj.id}-card`} class="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm flex-shrink-0" style="background: #3085c7" onclick={`initAudioPlayer('${vj.id}-card', '')`}>
                      <i class="fas fa-play text-xs"></i>
                    </button>
                    <div class="flex-1">
                      <div class="bg-white/60 rounded-full h-1"><div id={`progress-${vj.id}-card`} class="audio-player-bar h-1 rounded-full" style="width:0%"></div></div>
                      <div class="flex justify-between text-xs text-gray-400 mt-1">
                        <span id={`current-time-${vj.id}-card`}>0:00</span><span>{formatDuration(vj.duration_seconds)}</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-1 mt-3 flex-wrap">
                    {Object.entries(reactionLabels).slice(0, 3).map(([type, info]) => (
                      <button onclick={`toggleReaction(this, '${type}')`} class="reaction-btn flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                        <span>{info.emoji}</span><span class="reaction-count">{vj.reactions_count?.[type as keyof typeof vj.reactions_count] || 0}</span>
                      </button>
                    ))}
                    <a href={`/voice-journal/${vj.id}`} class="ml-auto text-xs text-gray-400 hover:text-brand-600 flex items-center gap-1"><i class="far fa-comment"></i>{vj.comments_count}</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Columns */}
        <section class="mt-12">
          <div class="flex items-center justify-between mb-6">
            <h2 class="section-heading">コラム</h2>
            <a href="/columns" class="text-sm text-brand-600 hover:underline">すべて見る</a>
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
        </section>

        {/* Podcast */}
        <section class="mt-12">
          <h2 class="section-heading mb-6">Podcast</h2>
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-16 h-16 rounded-xl flex items-center justify-center" style="background: linear-gradient(135deg, #1DB954, #1aa34a)"><i class="fab fa-spotify text-white text-2xl"></i></div>
              <div><h3 class="font-bold text-gray-800">ココロザシラボ Podcast</h3><p class="text-sm text-gray-500">声と志について語る番組</p></div>
            </div>
            <div class="bg-gray-100 rounded-xl p-6 text-center text-gray-500">
              <i class="fab fa-spotify text-4xl text-green-500 mb-2 block"></i>
              <p class="text-sm">Spotify埋め込みプレイヤーがここに表示されます</p>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section class="mt-12 rounded-3xl overflow-hidden" style="background: #3085c7">
          <div class="px-8 py-12 text-white text-center">
            <p class="text-sm font-semibold opacity-80 mb-2">✨ ココロザシソング</p>
            <h2 class="text-2xl md:text-4xl font-bold mb-4">あなたの志が、歌になる</h2>
            <p class="text-base opacity-90 mb-8 max-w-xl mx-auto">思いや志をヒアリングして、プロが楽曲化。<br />本人歌唱の作品として、永遠に残せます。</p>
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
      `}} />
    </Layout>
  )
})

// ==================== VOICE JOURNALS ====================
app.get('/voice-journals', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length
  const tag = c.req.query('tag')
  const filtered = tag ? dummyVoiceJournals.filter(vj => vj.tags?.includes(tag)) : dummyVoiceJournals

  return c.html(
    <Layout title="ボイスジャーナル一覧" currentUser={currentUser} unreadNotifications={unread}>
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
    <Layout title={vj.title} currentUser={currentUser} unreadNotifications={unread}>
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
    <Layout title="ボイスジャーナルを作る" currentUser={currentUser} unreadNotifications={unread}>
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
    <Layout title="投稿完了" currentUser={currentUser} unreadNotifications={unread}>
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
    <Layout title="初めての方へ" currentUser={currentUser} unreadNotifications={unread}>
      <section class="bg-white py-16 border-b border-gray-100">
        <div class="max-w-4xl mx-auto px-4 text-center">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style="background: #3085c7"><i class="fas fa-microphone text-white text-2xl"></i></div>
          <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">ココロザシラボへようこそ</h1>
          <p class="text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">声と歌で「志」を発信し、同じ想いを持つ人と繋がるコミュニティプラットフォームです。</p>
        </div>
      </section>
      <div class="max-w-4xl mx-auto px-4 py-12">
        <div class="grid md:grid-cols-3 gap-6 mb-16">
          {[{icon:'🎙️',t:'ボイスジャーナル',d:'ブラウザで録音してそのまま投稿。声で日記を書くように、想いをシェアしましょう。',l:'/voice-journals',lt:'みんなの投稿を見る'},{icon:'🎵',t:'ココロザシソング',d:'あなたの志をヒアリングして、プロが楽曲化。本人歌唱の作品として永遠に残せます。',l:'/songs/about',lt:'サービスを詳しく見る'},{icon:'👥',t:'コミュニティ',d:'フォローして、コメントやリアクションで繋がろう。声と想いが人と人をつなぎます。',l:'/signup',lt:'登録して始める'}].map(f => (
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center card-hover">
              <div class="text-4xl mb-4">{f.icon}</div>
              <h3 class="font-bold text-gray-800 text-lg mb-2">{f.t}</h3>
              <p class="text-sm text-gray-600 leading-relaxed mb-4">{f.d}</p>
              <a href={f.l} class="text-sm text-brand-600 font-semibold hover:underline">{f.lt} →</a>
            </div>
          ))}
        </div>
        <div class="bg-brand-50 rounded-3xl p-8 mb-16 border border-brand-100">
          <h2 class="section-heading text-2xl mb-8 text-center">始め方</h2>
          <div class="grid md:grid-cols-3 gap-6">
            {[{n:'01',t:'アカウントを作る',d:'メールアドレスまたはGoogleで無料登録'},{n:'02',t:'録音して投稿する',d:'ブラウザで録音して2分以内の声日記を投稿'},{n:'03',t:'繋がろう',d:'フォローして、コメントやリアクションで交流'}].map(s => (
              <div class="text-center"><div class="text-4xl font-bold logo-text mb-3">{s.n}</div><h3 class="font-bold text-gray-800 mb-2">{s.t}</h3><p class="text-sm text-gray-600">{s.d}</p></div>
            ))}
          </div>
          <div class="text-center mt-8"><a href="/signup" class="btn-primary px-8 py-4 rounded-full font-bold text-base inline-block"><i class="fas fa-user-plus mr-2"></i>無料で始める</a></div>
        </div>
      </div>
    </Layout>
  )
})

app.get('/news', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length
  return c.html(
    <Layout title="お知らせ" currentUser={currentUser} unreadNotifications={unread}>
      <div class="max-w-3xl mx-auto px-4 py-8">
        <h1 class="section-heading text-2xl mb-6">お知らせ</h1>
        <div class="space-y-4">
          {dummyNews.map(news => (
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div class="flex items-start gap-3">
                <div class="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-2"></div>
                <div>
                  <h2 class="font-bold text-gray-800 mb-1">{news.title}</h2>
                  <p class="text-sm text-gray-600 mb-2">{news.body}</p>
                  <p class="text-xs text-gray-400">{formatDate(news.published_at)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
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
    <Layout title={q ? `「${q}」の検索結果` : '検索'} currentUser={currentUser} unreadNotifications={unread}>
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
    <Layout title="利用規約" currentUser={currentUser} unreadNotifications={unread}>
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
    <Layout title="プライバシーポリシー" currentUser={currentUser} unreadNotifications={unread}>
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
    <Layout title="特定商取引法に基づく表記" currentUser={currentUser} unreadNotifications={unread}>
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
    <Layout title="お問い合わせ" currentUser={currentUser} unreadNotifications={unread}>
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
