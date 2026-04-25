import { Hono } from 'hono'
import { Layout } from '../components/Layout'
import {
  currentUser, dummyNotifications, dummyUsers,
  getUserByUsername, getVoiceJournalsByUser, getSongsByUser,
  formatRelativeDate, formatDuration, reactionLabels, formatDate
} from '../data/dummy'

const app = new Hono()

// User Page
app.get('/:username', (c) => {
  const username = c.req.param('username')
  const user = getUserByUsername(username)
  const unread = dummyNotifications.filter(n => !n.is_read).length

  if (!user) {
    return c.html(
      <Layout title="ユーザーが見つかりません" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
        <div class="max-w-2xl mx-auto px-4 py-16 text-center">
          <i class="fas fa-user text-6xl text-gray-200 mb-4 block"></i>
          <h1 class="text-2xl font-bold text-gray-700 mb-2">ユーザーが見つかりません</h1>
          <a href="/" class="btn-primary px-6 py-2.5 rounded-full text-sm font-medium inline-block mt-4">ホームへ</a>
        </div>
      </Layout>
    )
  }

  const voiceJournals = getVoiceJournalsByUser(user.id)
  const songs = getSongsByUser(user.id)
  const isOwnPage = user.id === currentUser.id

  return c.html(
    <Layout title={`${user.display_name}のページ`} currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">

          {/* Cover：ソング会員はゴールド、通常はブランドブルー */}
          <div
            class="h-32 md:h-40"
            style={user.can_post_kokorozashi_song
              ? 'background: #eba528'
              : 'background: #3085c7'}
          ></div>

          <div class="px-6 pb-6">
            <div class="flex items-end gap-4 -mt-12 mb-4">
              {/* アバター */}
              <div class="relative">
                <img
                  src={user.avatar_url}
                  alt={user.display_name}
                  class="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-4 border-white object-cover shadow-md"
                />
              </div>

              <div class="flex-1 min-w-0 pt-12">
                <div class="flex items-center gap-2 flex-wrap">
                  <h1 class="text-xl font-bold text-gray-800">{user.display_name}</h1>
                  {user.is_verified && (
                    <i class="fas fa-check-circle text-brand-500" title="認証済みユーザー"></i>
                  )}
                </div>
                <p class="text-sm text-gray-400">@{user.username}</p>
              </div>

              <div class="pt-12">
                {isOwnPage ? (
                  <a href="/mypage/edit" class="btn-outline px-4 py-2 rounded-full text-sm font-medium">
                    プロフィール編集
                  </a>
                ) : (
                  <button
                    onclick={`toggleFollow(this, '${user.username}')`}
                    data-following="false"
                    class="btn-primary px-5 py-2 rounded-full text-sm font-medium"
                  >
                    フォロー
                  </button>
                )}
              </div>
            </div>

            {/* ── ソング会員バッジ（名前の下・目立つ位置） ── */}
            {user.can_post_kokorozashi_song && (
              <div class="flex items-center gap-2 mb-4">
                <span class="inline-flex items-center gap-1.5 bg-[#eba528] text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  <i class="fas fa-music text-[10px]"></i>
                  ココロザシソング会員
                </span>
              </div>
            )}

            {/* Bio */}
            {user.bio && (
              <p class="text-sm text-gray-700 leading-relaxed mb-4">{user.bio}</p>
            )}

            {/* Stats */}
            <div class="flex gap-6 text-sm">
              <div>
                <span class="font-bold text-gray-800">{voiceJournals.length}</span>
                <span class="text-gray-500 ml-1">投稿</span>
              </div>
              <a href={`/user/${username}/following`} class="hover:text-brand-600">
                <span class="font-bold text-gray-800">{user.following_count}</span>
                <span class="text-gray-500 ml-1">フォロー中</span>
              </a>
              <a href={`/user/${username}/followers`} class="hover:text-brand-600">
                <span class="font-bold text-gray-800">{user.followers_count}</span>
                <span class="text-gray-500 ml-1">フォロワー</span>
              </a>
            </div>
          </div>
        </div>

        {/* ── ソング会員：楽曲ショーケース（タブより上・最優先表示） ── */}
        {user.can_post_kokorozashi_song && songs.length > 0 && (
          <div class="bg-white rounded-2xl shadow-sm border-2 border-[#eba528] overflow-hidden mb-6" id="songs-section">
            <div class="bg-[#eba528] px-5 py-3 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <i class="fas fa-music text-white"></i>
                <span class="text-white font-bold text-sm">ここロザシソング楽曲</span>
              </div>
              <span class="text-white/80 text-xs">{songs.length}曲</span>
            </div>
            <div class="p-4 space-y-3">
              {songs.map(song => (
                <a href={`/songs/${song.id}`} class="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 transition-colors group">
                  <img src={song.jacket_image_url} alt={song.title} class="w-12 h-12 rounded-xl object-cover flex-shrink-0 shadow-sm" />
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-gray-800 group-hover:text-[#eba528] transition-colors truncate">{song.title}</p>
                    <p class="text-xs text-gray-400 mt-0.5">{song.description?.slice(0, 40)}...</p>
                  </div>
                  <i class="fas fa-play text-gray-300 group-hover:text-[#eba528] transition-colors flex-shrink-0"></i>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div class="flex border-b border-gray-200 mb-6" id="profileTabs" id="songs-section">
          <button
            onclick="switchTab('vj')"
            id="tab-vj"
            class="flex-1 py-3 text-sm font-semibold text-brand-600 border-b-2 border-brand-500"
          >
ボイスジャーナル ({voiceJournals.length})
          </button>
          {songs.length > 0 && (
            <button
              onclick="switchTab('songs')"
              id="tab-songs"
              class="flex-1 py-3 text-sm font-semibold text-gray-500 hover:text-brand-600"
            >
ココロザシソング ({songs.length})
            </button>
          )}
        </div>

        {/* VJ Tab */}
        <div id="content-vj" class="space-y-4">
          {voiceJournals.length > 0 ? voiceJournals.map(vj => (
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 card-hover audio-card">
              <div class="flex items-start gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs text-gray-400">{formatRelativeDate(vj.created_at)}</span>
                    {vj.visibility === 'followers_only' && (
                      <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        <i class="fas fa-user-friends mr-1"></i>フォロワー限定
                      </span>
                    )}
                  </div>
                  <a href={`/voice-journal/${vj.id}`}>
                    <h2 class="font-bold text-gray-800 hover:text-brand-600 mb-2">{vj.title}</h2>
                  </a>
                  <p class="text-sm text-gray-500 line-clamp-2 mb-3">{vj.description}</p>

                  {/* Player */}
                  <div class="bg-brand-50 rounded-xl p-3">
                    <div class="flex items-center gap-3">
                      <button
                        id={`play-btn-${vj.id}`}
                        class="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
                        style="background: #3085c7"
                        onclick={`initAudioPlayer('${vj.id}', '')`}
                      >
                        <i class="fas fa-play text-xs"></i>
                      </button>
                      <div class="flex-1">
                        <div class="bg-white/60 rounded-full h-1.5">
                          <div id={`progress-${vj.id}`} class="audio-player-bar h-1.5 rounded-full" style="width:0%"></div>
                        </div>
                        <div class="flex justify-between text-xs text-gray-400 mt-1">
                          <span id={`current-time-${vj.id}`}>0:00</span>
                          <span>{formatDuration(vj.duration_seconds)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-1 mt-3 flex-wrap">
                    {Object.entries(reactionLabels).slice(0, 4).map(([type, info]) => (
                      <button onclick={`toggleReaction(this, '${type}')`} class="reaction-btn flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
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
            </div>
          )) : (
            <div class="text-center py-12 text-gray-400">
              <i class="fas fa-microphone text-4xl mb-3 block opacity-30"></i>
              <p>まだ投稿がありません</p>
            </div>
          )}
        </div>

        {/* Songs Tab */}
        <div id="content-songs" class="hidden">
          {songs.length > 0 ? (
            <div class="grid sm:grid-cols-2 gap-4">
              {songs.map(song => (
                <a href={`/songs/${song.id}`} class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover flex gap-3 p-4">
                  <img src={song.jacket_image_url} alt={song.title} class="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  <div class="flex-1 min-w-0">
                    <h3 class="font-bold text-gray-800 hover:text-brand-600 truncate">{song.title}</h3>
                    <p class="text-xs text-gray-500 line-clamp-2 mt-0.5">{song.description}</p>
                    <p class="text-xs text-gray-400 mt-1">{formatDate(song.created_at)}</p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div class="text-center py-12 text-gray-400">
              <i class="fas fa-music text-4xl mb-3 block opacity-30"></i>
              <p>ココロザシソングはまだありません</p>
            </div>
          )}
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        function switchTab(tab) {
          ['vj', 'songs'].forEach(t => {
            const btn = document.getElementById('tab-' + t);
            const content = document.getElementById('content-' + t);
            if (!btn || !content) return;
            if (t === tab) {
              btn.className = 'flex-1 py-3 text-sm font-semibold text-brand-600 border-b-2 border-brand-500';
              content.classList.remove('hidden');
            } else {
              btn.className = 'flex-1 py-3 text-sm font-semibold text-gray-500 hover:text-brand-600';
              content.classList.add('hidden');
            }
          });
        }
      `}} />
    </Layout>
  )
})

export default app
