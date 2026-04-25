import { Hono } from 'hono'
import { Layout } from '../components/Layout'
import {
  dummyBanners, dummyFeed, dummyVoiceJournals, dummySongs,
  dummyColumns, dummyTopics, currentUser, dummyNotifications,
  formatRelativeDate, formatDuration, reactionLabels, formatDate
} from '../data/dummy'

const app = new Hono()

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
                <a href={banner.link_url} class="flex-shrink-0 w-full block relative" style="min-width:100%">
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
                <button
                  onclick={`setBanner(${i})`}
                  class={`w-2 h-2 rounded-full transition-all ${i === 0 ? 'bg-white w-4' : 'bg-white/50'}`}
                  id={`dot-${i}`}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div class="max-w-7xl mx-auto px-4 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div class="lg:col-span-2 space-y-6">
            {/* Feed Header */}
            <div class="flex items-center justify-between">
              <h2 class="section-heading">フォロー中の投稿</h2>
              <a href="/voice-journals" class="text-sm text-brand-600 hover:underline">すべて見る</a>
            </div>

            {/* Feed Items */}
            {dummyFeed.map(item => {
              const vj = item.type === 'voice_journal' ? item.content as any : null
              const song = item.type === 'song' ? item.content as any : null

              return (
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover audio-card">
                  {/* User Info */}
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
                        {item.type === 'voice_journal' ? (
                          <span><i class="fas fa-microphone mr-1 text-brand-400"></i>ボイスジャーナルを投稿しました</span>
                        ) : (
                          <span><i class="fas fa-music mr-1 text-purple-400"></i>ココロザシソングを公開しました</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div class="p-4">
                    {vj && (
                      <div>
                        <a href={`/voice-journal/${vj.id}`} class="block mb-3">
                          <h3 class="font-bold text-gray-800 hover:text-brand-600 transition-colors line-clamp-2">{vj.title}</h3>
                        </a>
                        {/* Audio Player */}
                        <div class="bg-brand-50 rounded-xl p-3">
                          <div class="flex items-center gap-3">
                            <button
                              id={`play-btn-${vj.id}`}
                              class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-sm"
                              style="background: #3085c7"
                              onclick={`initAudioPlayer('${vj.id}', '')`}
                            >
                              <i class="fas fa-play text-sm"></i>
                            </button>
                            <div class="flex-1">
                              <div class="bg-gray-200 rounded-full h-1.5 cursor-pointer">
                                <div id={`progress-${vj.id}`} class="audio-player-bar h-1.5 rounded-full" style="width:0%"></div>
                              </div>
                              <div class="flex justify-between text-xs text-gray-400 mt-1">
                                <span id={`current-time-${vj.id}`}>0:00</span>
                                <div class="wave-animation">
                                  <span></span><span></span><span></span><span></span><span></span>
                                </div>
                                <span>{formatDuration(vj.duration_seconds)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Tags */}
                        {vj.tags && vj.tags.length > 0 && (
                          <div class="flex flex-wrap gap-1.5 mt-2">
                            {vj.tags.map((tag: string) => (
                              <a href={`/voice-journals/tags?tag=${tag}`} class="tag-badge text-xs px-2 py-0.5 rounded-full">
                                #{tag}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {song && (
                      <div>
                        <div class="flex gap-3">
                          <a href={`/songs/${song.id}`}>
                            <img src={song.jacket_image_url} alt={song.title} class="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                          </a>
                          <div class="flex-1 min-w-0">
                            <a href={`/songs/${song.id}`} class="block">
                              <h3 class="font-bold text-gray-800 hover:text-brand-600 line-clamp-2">{song.title}</h3>
                            </a>
                            <p class="text-xs text-gray-500 mt-1 line-clamp-2">{song.description}</p>
                            {/* Audio Player */}
                            <div class="flex items-center gap-2 mt-2">
                              <button
                                id={`play-btn-${song.id}`}
                                class="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm"
                                style="background: #3085c7"
                                onclick={`initAudioPlayer('${song.id}', '')`}
                              >
                                <i class="fas fa-play text-xs"></i>
                              </button>
                              <div class="flex-1">
                                <div class="bg-gray-200 rounded-full h-1 cursor-pointer">
                                  <div id={`progress-${song.id}`} class="h-1 rounded-full" style="width:0%;background:#3085c7"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reactions & Comments */}
                  <div class="px-4 pb-4 flex items-center justify-between">
                    <div class="flex items-center gap-1 flex-wrap">
                      {Object.entries(reactionLabels).map(([type, info]) => {
                        const count = (item.content as any).reactions_count?.[type] || 0
                        return (
                          <button
                            onclick={`toggleReaction(this, '${type}')`}
                            class="reaction-btn flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600 bg-gray-50 hover:bg-brand-50 px-2 py-1 rounded-full border border-gray-100"
                          >
                            <span>{info.emoji}</span>
                            <span class="reaction-count">{count}</span>
                          </button>
                        )
                      })}
                    </div>
                    <a
                      href={item.type === 'voice_journal' ? `/voice-journal/${(item.content as any).id}` : `/songs/${(item.content as any).id}`}
                      class="text-xs text-gray-400 hover:text-brand-600 flex items-center gap-1"
                    >
                      <i class="far fa-comment"></i>
                      <span>{(item.content as any).comments_count}</span>
                    </a>
                  </div>
                </div>
              )
            })}

            <div class="text-center">
              <a href="/voice-journals" class="btn-outline px-8 py-3 rounded-full text-sm font-medium inline-block">
                もっと見る
              </a>
            </div>
          </div>

          {/* Sidebar */}
          <div class="space-y-6">
            {/* Today's Topic */}
            <div class="bg-brand-50 rounded-2xl border border-brand-100 p-5">
              <div class="flex items-center gap-2 mb-3">
                <span class="text-lg">🎙️</span>
                <h3 class="font-bold text-gray-800">今日のお題</h3>
              </div>
              <p class="text-xl font-bold text-brand-700 mb-2">「{activeTopic.title}」</p>
              <p class="text-sm text-gray-600 mb-4">{activeTopic.description}</p>
              <div class="flex items-center gap-2 mb-4">
                <span class="tag-badge text-xs px-2 py-1 rounded-full">#{activeTopic.hashtag}</span>
              </div>
              <a href="/voice-journal/create" class="btn-primary w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                <i class="fas fa-microphone"></i>
                このお題で投稿する
              </a>
            </div>

            {/* Quick Post */}
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 class="font-bold text-gray-800 mb-3">
                今の気持ちを声に
              </h3>
              <p class="text-sm text-gray-500 mb-4">思ったことをそのまま声で記録しよう</p>
              <a href="/voice-journal/create" class="btn-primary w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                <i class="fas fa-microphone"></i>
                録音して投稿する
              </a>
            </div>

            {/* New Songs */}
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold text-gray-800">
                  ココロザシソング
                </h3>
                <a href="/songs/showcase" class="text-xs text-brand-600 hover:underline">すべて</a>
              </div>
              {dummySongs.slice(0, 3).map(song => (
                <a href={`/songs/${song.id}`} class="flex items-center gap-3 py-2.5 border-b border-gray-50 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors last:border-0">
                  <img src={song.jacket_image_url} alt={song.title} class="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-800 truncate">{song.title}</p>
                    <p class="text-xs text-gray-400">{song.user?.display_name}</p>
                  </div>
                  <i class="fas fa-play text-xs text-gray-400"></i>
                </a>
              ))}
            </div>

            {/* Columns */}
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold text-gray-800">
                  コラム
                </h3>
                <a href="/columns" class="text-xs text-brand-600 hover:underline">すべて</a>
              </div>
              {dummyColumns.slice(0, 3).map(col => (
                <a href={`/columns/${col.slug}`} class="block py-2.5 border-b border-gray-50 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors last:border-0">
                  <p class="text-sm font-semibold text-gray-800 line-clamp-2">{col.title}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{col.category}</p>
                </a>
              ))}
            </div>

            {/* Song CTA */}
            <div class="rounded-2xl overflow-hidden" style="background: #3085c7">
              <div class="p-5 text-white">
                <p class="text-xs font-semibold opacity-80 mb-1">✨ 期間限定キャンペーン中</p>
                <h3 class="text-lg font-bold mb-2">あなたの志を<br />歌にしませんか？</h3>
                <p class="text-sm opacity-90 mb-4">プロが楽曲化。本人歌唱の作品として永遠に残せます。</p>
                <a href="/songs/about" class="block bg-white text-purple-600 font-bold text-sm py-2.5 rounded-xl text-center hover:bg-gray-50 transition-colors">
                  詳しく見る
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* New Voice Journals Section */}
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
                    <a href={`/user/${vj.user?.username}`}>
                      <img src={vj.user?.avatar_url} alt={vj.user?.display_name} class="w-8 h-8 rounded-full" />
                    </a>
                    <div>
                      <p class="text-xs font-semibold text-gray-700">{vj.user?.display_name}</p>
                      <p class="text-xs text-gray-400">{formatRelativeDate(vj.created_at)}</p>
                    </div>
                  </div>
                  <a href={`/voice-journal/${vj.id}`}>
                    <h3 class="font-bold text-gray-800 hover:text-brand-600 line-clamp-2 mb-2 text-sm">{vj.title}</h3>
                  </a>
                  {/* Mini Player */}
                  <div class="bg-brand-50 rounded-xl p-2.5 flex items-center gap-2">
                    <button
                      id={`play-btn-${vj.id}-card`}
                      class="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm flex-shrink-0"
                      style="background: #3085c7"
                      onclick={`initAudioPlayer('${vj.id}-card', '')`}
                    >
                      <i class="fas fa-play text-xs"></i>
                    </button>
                    <div class="flex-1">
                      <div class="bg-white/60 rounded-full h-1 cursor-pointer">
                        <div id={`progress-${vj.id}-card`} class="audio-player-bar h-1 rounded-full" style="width:0%"></div>
                      </div>
                      <div class="flex justify-between text-xs text-gray-400 mt-1">
                        <span id={`current-time-${vj.id}-card`}>0:00</span>
                        <span>{formatDuration(vj.duration_seconds)}</span>
                      </div>
                    </div>
                  </div>
                  {/* Reactions */}
                  <div class="flex items-center gap-1 mt-3 flex-wrap">
                    {Object.entries(reactionLabels).slice(0, 3).map(([type, info]) => (
                      <button
                        onclick={`toggleReaction(this, '${type}')`}
                        class="reaction-btn flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600 bg-gray-50 px-2 py-1 rounded-full"
                      >
                        <span>{info.emoji}</span>
                        <span class="reaction-count">{vj.reactions_count?.[type as keyof typeof vj.reactions_count] || 0}</span>
                      </button>
                    ))}
                    <a href={`/voice-journal/${vj.id}`} class="ml-auto text-xs text-gray-400 hover:text-brand-600 flex items-center gap-1">
                      <i class="far fa-comment"></i>{vj.comments_count}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Columns Section */}
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

        {/* Podcast Section */}
        <section class="mt-12">
          <div class="flex items-center justify-between mb-6">
            <h2 class="section-heading">Podcast</h2>
          </div>
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-16 h-16 rounded-xl flex items-center justify-center" style="background: linear-gradient(135deg, #1DB954, #1aa34a)">
                <i class="fab fa-spotify text-white text-2xl"></i>
              </div>
              <div>
                <h3 class="font-bold text-gray-800">ココロザシラボ Podcast</h3>
                <p class="text-sm text-gray-500">声と志について語る番組</p>
              </div>
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
            <p class="text-base opacity-90 mb-8 max-w-xl mx-auto">
              思いや志をヒアリングして、プロが楽曲化。<br />
              本人歌唱の作品として、永遠に残せます。
            </p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/songs/create" class="bg-white text-brand-700 font-bold px-8 py-3 rounded-full hover:bg-gray-50 transition-colors">
                申し込む
              </a>
              <a href="/songs/about" class="bg-white/20 text-white font-semibold px-8 py-3 rounded-full hover:bg-white/30 transition-colors">
                詳しく見る
              </a>
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

        // Auto play banner
        setInterval(() => moveBanner(1), 5000);
      `}} />
    </Layout>
  )
})

export default app
