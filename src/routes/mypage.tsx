import { Hono } from 'hono'
import { Layout } from '../components/Layout'
import {
  currentUser, dummyNotifications, dummyVoiceJournals, dummySongs,
  getVoiceJournalsByUser, getSongsByUser,
  formatRelativeDate, formatDuration, reactionLabels, formatDate
} from '../data/dummy'

const app = new Hono()

// Mypage
app.get('/', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length
  const myVJs = getVoiceJournalsByUser(currentUser.id)
  const mySongs = getSongsByUser(currentUser.id)

  return c.html(
    <Layout title="マイページ" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-5xl mx-auto px-4 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div class="lg:col-span-1">
            {/* Profile Card */}
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
              <div class="text-center mb-4">
                <img src={currentUser.avatar_url} alt={currentUser.display_name} class="w-16 h-16 rounded-2xl mx-auto mb-3 border-2 border-brand-200" />
                <h2 class="font-bold text-gray-800">{currentUser.display_name}</h2>
                <p class="text-xs text-gray-400">@{currentUser.username}</p>
              </div>
              <div class="flex justify-around text-center py-3 border-t border-b border-gray-100 mb-4">
                <div>
                  <p class="font-bold text-gray-800 text-lg">{myVJs.length}</p>
                  <p class="text-xs text-gray-500">投稿</p>
                </div>
                <div>
                  <p class="font-bold text-gray-800 text-lg">{currentUser.following_count}</p>
                  <p class="text-xs text-gray-500">フォロー</p>
                </div>
                <div>
                  <p class="font-bold text-gray-800 text-lg">{currentUser.followers_count}</p>
                  <p class="text-xs text-gray-500">フォロワー</p>
                </div>
              </div>
              <a href="/mypage/edit" class="block w-full text-center btn-outline py-2 rounded-xl text-sm font-medium">
                プロフィール編集
              </a>
            </div>

            {/* Nav */}
            <nav class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {[
                { href: '/mypage', icon: 'fa-home', label: 'ダッシュボード', active: true },
                { href: '/mypage/posts/voice-journals', icon: 'fa-microphone', label: 'ボイスジャーナル' },
                { href: '/mypage/posts/songs', icon: 'fa-music', label: 'ココロザシソング' },
                { href: '/mypage/drafts', icon: 'fa-file-alt', label: '下書き' },
                { href: '/mypage/following', icon: 'fa-user-plus', label: 'フォロー中' },
                { href: '/mypage/followers', icon: 'fa-users', label: 'フォロワー' },
                { href: '/mypage/notifications', icon: 'fa-bell', label: '通知', badge: unread > 0 ? unread : null },
                { href: '/mypage/edit', icon: 'fa-cog', label: '設定' },
              ].map(item => (
                <a
                  href={item.href}
                  class={`flex items-center justify-between px-4 py-3 text-sm border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${item.active ? 'text-brand-600 font-semibold bg-brand-50' : 'text-gray-700'}`}
                >
                  <span class="flex items-center gap-3">
                    <i class={`fas ${item.icon} w-4 text-center ${item.active ? 'text-brand-500' : 'text-gray-400'}`}></i>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span class="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  )}
                </a>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div class="lg:col-span-3 space-y-6">
            {/* Quick Actions */}
            <div class="bg-brand-50 rounded-2xl border border-brand-100 p-5">
              <h3 class="section-heading mb-4">クイックアクション</h3>
              <div class="grid grid-cols-2 gap-3">
                <a href="/voice-journal/create" class="btn-primary py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                  <i class="fas fa-microphone"></i>ボイスジャーナルを投稿
                </a>
                <a href="/mypage/drafts" class="btn-outline py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                  <i class="fas fa-file-alt"></i>下書きを見る
                </a>
              </div>
            </div>

            {/* Notifications */}
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div class="flex items-center justify-between mb-4">
                <h3 class="section-heading">最新の通知</h3>
                <a href="/mypage/notifications" class="text-xs text-brand-600 hover:underline">すべて見る</a>
              </div>
              <div class="space-y-3">
                {dummyNotifications.slice(0, 3).map(notif => (
                  <a href={notif.link} class={`flex items-start gap-3 p-3 rounded-xl transition-colors ${notif.is_read ? 'hover:bg-gray-50' : 'bg-brand-50 hover:bg-brand-100'}`}>
                    <div class={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notif.type === 'reaction' ? 'bg-red-100 text-red-500' :
                      notif.type === 'comment' ? 'bg-blue-100 text-blue-500' :
                      'bg-green-100 text-green-500'
                    }`}>
                      <i class={`fas ${
                        notif.type === 'reaction' ? 'fa-heart' :
                        notif.type === 'comment' ? 'fa-comment' :
                        'fa-user-plus'
                      } text-xs`}></i>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm text-gray-700 line-clamp-2">{notif.message}</p>
                      <p class="text-xs text-gray-400 mt-0.5">{formatRelativeDate(notif.created_at)}</p>
                    </div>
                    {!notif.is_read && (
                      <div class="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </a>
                ))}
              </div>
            </div>

            {/* Recent VJs */}
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div class="flex items-center justify-between mb-4">
                <h3 class="section-heading">最近の投稿</h3>
                <a href="/mypage/posts/voice-journals" class="text-xs text-brand-600 hover:underline">すべて見る</a>
              </div>
              <div class="space-y-3">
                {myVJs.slice(0, 3).map(vj => (
                  <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-brand-50 transition-colors">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style="background: #3085c7">
                      <i class="fas fa-microphone text-white text-sm"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                      <a href={`/voice-journal/${vj.id}`} class="text-sm font-semibold text-gray-800 hover:text-brand-600 truncate block">{vj.title}</a>
                      <p class="text-xs text-gray-400">{formatRelativeDate(vj.created_at)} · {formatDuration(vj.duration_seconds)}</p>
                    </div>
                    <div class="text-xs text-gray-400 flex items-center gap-2">
                      <span><i class="far fa-comment mr-1"></i>{vj.comments_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Songs */}
            {mySongs.length > 0 && (
              <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="section-heading">ココロザシソング</h3>
                  <a href="/mypage/posts/songs" class="text-xs text-brand-600 hover:underline">すべて見る</a>
                </div>
                <div class="space-y-3">
                  {mySongs.map(song => (
                    <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors">
                      <img src={song.jacket_image_url} alt={song.title} class="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                      <div class="flex-1 min-w-0">
                        <a href={`/songs/${song.id}`} class="text-sm font-semibold text-gray-800 hover:text-brand-600 truncate block">{song.title}</a>
                        <p class="text-xs text-gray-400">{formatDate(song.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
})

// Notifications
app.get('/notifications', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length

  return c.html(
    <Layout title="通知" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-2xl mx-auto px-4 py-8">
        <div class="flex items-center justify-between mb-6">
          <h1 class="section-heading">通知</h1>
          <button class="text-xs text-brand-600 hover:underline">すべて既読にする</button>
        </div>

        <div class="space-y-2">
          {dummyNotifications.map(notif => (
            <a href={notif.link} class={`flex items-start gap-3 p-4 rounded-xl transition-colors ${notif.is_read ? 'bg-white hover:bg-gray-50 border border-gray-100' : 'bg-brand-50 hover:bg-brand-100 border border-brand-100'}`}>
              <div class={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                notif.type === 'reaction' ? 'bg-red-100 text-red-500' :
                notif.type === 'comment' ? 'bg-blue-100 text-blue-500' :
                'bg-green-100 text-green-500'
              }`}>
                <i class={`fas ${
                  notif.type === 'reaction' ? 'fa-heart' :
                  notif.type === 'comment' ? 'fa-comment' :
                  'fa-user-plus'
                } text-sm`}></i>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-700">{notif.message}</p>
                <p class="text-xs text-gray-400 mt-0.5">{formatRelativeDate(notif.created_at)}</p>
              </div>
              {!notif.is_read && (
                <div class="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0 mt-2"></div>
              )}
            </a>
          ))}
        </div>
      </div>
    </Layout>
  )
})

// VJ Posts
app.get('/posts/voice-journals', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length
  const myVJs = getVoiceJournalsByUser(currentUser.id)

  return c.html(
    <Layout title="ボイスジャーナル一覧" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-3xl mx-auto px-4 py-8">
        <div class="flex items-center justify-between mb-6">
          <h1 class="section-heading">ボイスジャーナル</h1>
          <a href="/voice-journal/create" class="btn-primary px-4 py-2 rounded-full text-sm font-medium">
            <i class="fas fa-plus mr-2"></i>投稿する
          </a>
        </div>
        <div class="space-y-4">
          {myVJs.map(vj => (
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div class="flex items-start gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs text-gray-400">{formatDate(vj.created_at)}</span>
                    <span class={`text-xs px-2 py-0.5 rounded-full ${
                      vj.visibility === 'public' ? 'bg-green-100 text-green-600' :
                      vj.visibility === 'followers_only' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {vj.visibility === 'public' ? '公開' : vj.visibility === 'followers_only' ? 'フォロワー限定' : '下書き'}
                    </span>
                  </div>
                  <a href={`/voice-journal/${vj.id}`} class="block font-bold text-gray-800 hover:text-brand-600 mb-1">{vj.title}</a>
                  <p class="text-sm text-gray-500 line-clamp-2 mb-2">{vj.description}</p>
                  <div class="flex items-center gap-4 text-xs text-gray-400">
                    <span><i class="fas fa-clock mr-1"></i>{formatDuration(vj.duration_seconds)}</span>
                    <span><i class="far fa-comment mr-1"></i>{vj.comments_count}コメント</span>
                    <span><i class="fas fa-heart mr-1"></i>{Object.values(vj.reactions_count || {}).reduce((a: number, b: number) => a + b, 0)}リアクション</span>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <a href={`/voice-journal/${vj.id}`} class="text-xs text-brand-600 hover:underline px-3 py-1.5 bg-brand-50 rounded-lg">詳細</a>
                  <button class="text-xs text-gray-500 hover:text-red-500 px-3 py-1.5 bg-gray-50 rounded-lg">削除</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
})

// Drafts
app.get('/drafts', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length
  const drafts = dummyVoiceJournals.filter(vj => vj.visibility === 'draft')

  return c.html(
    <Layout title="下書き" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-3xl mx-auto px-4 py-8">
        <h1 class="section-heading mb-6">下書き</h1>
        {drafts.length > 0 ? (
          <div class="space-y-4">
            {drafts.map(vj => (
              <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 class="font-bold text-gray-800 mb-1">{vj.title || '（タイトルなし）'}</h3>
                <p class="text-sm text-gray-500 mb-3">{formatDate(vj.created_at)}</p>
                <div class="flex gap-2">
                  <a href={`/voice-journal/create`} class="btn-primary px-4 py-2 rounded-full text-xs font-medium">編集して投稿</a>
                  <button class="btn-outline px-4 py-2 rounded-full text-xs font-medium">削除</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div class="text-center py-16 text-gray-400">
            <i class="fas fa-file-alt text-5xl mb-4 block opacity-30"></i>
            <p class="mb-4">下書きはありません</p>
            <a href="/voice-journal/create" class="btn-primary px-6 py-2.5 rounded-full text-sm font-medium inline-block">新しく作る</a>
          </div>
        )}
      </div>
    </Layout>
  )
})

// Following
app.get('/following', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length

  return c.html(
    <Layout title="フォロー中" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-2xl mx-auto px-4 py-8">
        <h1 class="section-heading mb-6">フォロー中</h1>
        <div class="space-y-3">
          {[...dummyNotifications].filter(n => n.type === 'follow').length > 0 ? null : null}
          {['u2', 'u3', 'u4'].map(uid => {
            const u = { id: uid, username: uid === 'u2' ? 'sho_dreams' : uid === 'u3' ? 'yuki_music' : 'kenji_future', display_name: uid === 'u2' ? '山田翔' : uid === 'u3' ? '鈴木ゆき' : '伊藤健司', avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`, bio: 'コミュニティメンバー', followers_count: 80, following_count: 40 }
            return (
              <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
                <a href={`/user/${u.username}`}>
                  <img src={u.avatar_url} alt={u.display_name} class="w-12 h-12 rounded-full" />
                </a>
                <div class="flex-1 min-w-0">
                  <a href={`/user/${u.username}`} class="font-semibold text-gray-800 hover:text-brand-600 block">{u.display_name}</a>
                  <p class="text-xs text-gray-400">@{u.username}</p>
                </div>
                <button
                  onclick="toggleFollow(this)"
                  data-following="true"
                  class="bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-300"
                >
                  フォロー中
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
})

// Followers
app.get('/followers', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length

  return c.html(
    <Layout title="フォロワー" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-2xl mx-auto px-4 py-8">
        <h1 class="section-heading mb-6">フォロワー</h1>
        <div class="space-y-3">
          {['u2', 'u3', 'u4', 'u5'].map(uid => {
            const names: Record<string, { name: string; username: string }> = {
              u2: { name: '山田翔', username: 'sho_dreams' },
              u3: { name: '鈴木ゆき', username: 'yuki_music' },
              u4: { name: '伊藤健司', username: 'kenji_future' },
              u5: { name: '佐藤めい', username: 'mei_hope' },
            }
            const u = names[uid]
            return (
              <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
                <a href={`/user/${u.username}`}>
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`} alt={u.name} class="w-12 h-12 rounded-full" />
                </a>
                <div class="flex-1 min-w-0">
                  <a href={`/user/${u.username}`} class="font-semibold text-gray-800 hover:text-brand-600 block">{u.name}</a>
                  <p class="text-xs text-gray-400">@{u.username}</p>
                </div>
                <button
                  onclick="toggleFollow(this)"
                  data-following="false"
                  class="btn-primary px-4 py-2 rounded-full text-sm font-medium"
                >
                  フォロー
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
})

// Profile Edit
app.get('/edit', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length

  return c.html(
    <Layout title="プロフィール編集" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-xl mx-auto px-4 py-8">
        <h1 class="section-heading mb-6">プロフィール編集</h1>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-4 mb-6">
            <img src={currentUser.avatar_url} alt="" class="w-20 h-20 rounded-2xl border-2 border-brand-200" />
            <div>
              <button class="btn-outline px-4 py-2 rounded-full text-sm font-medium block mb-2">
                <i class="fas fa-camera mr-2"></i>写真を変更
              </button>
              <p class="text-xs text-gray-400">JPG、PNG（最大5MB）</p>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">表示名</label>
              <input type="text" value={currentUser.display_name} class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">ユーザーID (@)</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                <input type="text" value={currentUser.username} class="w-full pl-7 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">自己紹介</label>
              <textarea rows={4} class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none">{currentUser.bio}</textarea>
              <p class="text-xs text-gray-400 mt-1 text-right">0/200</p>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">メールアドレス</label>
              <input type="email" value={currentUser.email} class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
            </div>
            <div class="flex gap-3 pt-2">
              <a href="/mypage" class="flex-1 btn-outline py-3 rounded-xl text-sm font-medium text-center">キャンセル</a>
              <button class="flex-1 btn-primary py-3 rounded-xl text-sm font-medium">保存する</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
})

export default app
