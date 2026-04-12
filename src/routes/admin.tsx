import { Hono } from 'hono'
import { Layout } from '../components/Layout'
import {
  dummyUsers, dummyVoiceJournals, dummySongs, dummyColumns, dummyNews,
  dummyTopics, dummyComments, formatDate, formatRelativeDate, formatDuration
} from '../data/dummy'

const app = new Hono()

const AdminLayout = ({ children, title }: { children?: any; title: string }) => (
  <html lang="ja">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title} | 管理画面 - ココロザシラボ</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
      <style>{`
        body { font-family: 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; }
        .admin-sidebar { width: 240px; }
      `}</style>
    </head>
    <body class="bg-gray-100 min-h-screen flex">
      {/* Sidebar */}
      <aside class="admin-sidebar bg-gray-900 text-gray-300 min-h-screen flex flex-col flex-shrink-0">
        <div class="p-4 border-b border-gray-700">
          <a href="/" class="text-white font-bold text-sm">ココロザシラボ</a>
          <p class="text-xs text-gray-500 mt-0.5">管理画面</p>
        </div>
        <nav class="flex-1 p-3 space-y-1">
          {[
            { href: '/admin', icon: 'fa-home', label: 'ダッシュボード' },
            { href: '/admin/users', icon: 'fa-users', label: 'ユーザー管理' },
            { href: '/admin/voice-journals', icon: 'fa-microphone', label: 'ボイスジャーナル' },
            { href: '/admin/songs', icon: 'fa-music', label: 'ココロザシソング' },
            { href: '/admin/comments', icon: 'fa-comments', label: 'コメント管理' },
            { href: '/admin/topics', icon: 'fa-lightbulb', label: 'お題管理' },
            { href: '/admin/columns', icon: 'fa-book-open', label: 'コラム管理' },
            { href: '/admin/news', icon: 'fa-bullhorn', label: 'お知らせ管理' },
            { href: '/admin/orders', icon: 'fa-shopping-cart', label: '申込管理' },
          ].map(item => (
            <a href={item.href} class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-gray-700 hover:text-white transition-colors">
              <i class={`fas ${item.icon} w-4 text-center text-gray-400`}></i>
              {item.label}
            </a>
          ))}
        </nav>
        <div class="p-3 border-t border-gray-700">
          <a href="/" class="flex items-center gap-2 text-xs text-gray-400 hover:text-white">
            <i class="fas fa-external-link-alt"></i>サイトへ戻る
          </a>
        </div>
      </aside>

      {/* Main */}
      <div class="flex-1 flex flex-col min-h-screen">
        <header class="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between">
          <h1 class="font-semibold text-gray-800">{title}</h1>
          <div class="flex items-center gap-3 text-sm text-gray-500">
            <span>管理者: admin</span>
            <a href="/logout" class="text-red-500 hover:underline text-xs">ログアウト</a>
          </div>
        </header>
        <main class="flex-1 p-6">
          {children}
        </main>
      </div>
    </body>
  </html>
)

// Dashboard
app.get('/', (c) => {
  const stats = [
    { label: 'ユーザー数', value: dummyUsers.length, icon: 'fa-users', color: 'blue' },
    { label: 'ボイスジャーナル', value: dummyVoiceJournals.length, icon: 'fa-microphone', color: 'orange' },
    { label: 'ココロザシソング', value: dummySongs.length, icon: 'fa-music', color: 'purple' },
    { label: '申込件数', value: 5, icon: 'fa-shopping-cart', color: 'green' },
  ]

  return c.html(
    <AdminLayout title="ダッシュボード">
      {/* Stats */}
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(stat => (
          <div class="bg-white rounded-xl border border-gray-200 p-4">
            <div class="flex items-center justify-between mb-2">
              <p class="text-sm text-gray-500">{stat.label}</p>
              <div class={`w-8 h-8 rounded-lg flex items-center justify-center bg-${stat.color}-100`}>
                <i class={`fas ${stat.icon} text-${stat.color}-500 text-sm`}></i>
              </div>
            </div>
            <p class="text-2xl font-bold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div class="bg-white rounded-xl border border-gray-200">
          <div class="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 class="font-semibold text-gray-800 text-sm">最新ユーザー</h2>
            <a href="/admin/users" class="text-xs text-blue-600 hover:underline">すべて見る</a>
          </div>
          <div class="divide-y divide-gray-50">
            {dummyUsers.slice(0, 4).map(user => (
              <div class="flex items-center gap-3 p-3 hover:bg-gray-50">
                <img src={user.avatar_url} alt={user.display_name} class="w-8 h-8 rounded-full" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-800 truncate">{user.display_name}</p>
                  <p class="text-xs text-gray-400">@{user.username}</p>
                </div>
                <div class="flex items-center gap-1">
                  {user.can_post_kokorozashi_song && (
                    <span class="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">Song</span>
                  )}
                  {user.is_verified && (
                    <span class="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded">認証</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent VJs */}
        <div class="bg-white rounded-xl border border-gray-200">
          <div class="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 class="font-semibold text-gray-800 text-sm">最新投稿</h2>
            <a href="/admin/voice-journals" class="text-xs text-blue-600 hover:underline">すべて見る</a>
          </div>
          <div class="divide-y divide-gray-50">
            {dummyVoiceJournals.slice(0, 4).map(vj => (
              <div class="flex items-center gap-3 p-3 hover:bg-gray-50">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-100 flex-shrink-0">
                  <i class="fas fa-microphone text-orange-500 text-xs"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-800 truncate">{vj.title}</p>
                  <p class="text-xs text-gray-400">{vj.user?.display_name} · {formatRelativeDate(vj.created_at)}</p>
                </div>
                <span class={`text-xs px-1.5 py-0.5 rounded ${vj.visibility === 'public' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  {vj.visibility === 'public' ? '公開' : 'FL限定'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
})

// Users
app.get('/users', (c) => {
  return c.html(
    <AdminLayout title="ユーザー管理">
      <div class="bg-white rounded-xl border border-gray-200">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 class="font-semibold text-gray-800">ユーザー一覧 ({dummyUsers.length}件)</h2>
          <input type="text" placeholder="ユーザー検索..." class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-300" />
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th class="px-4 py-3 text-left">ユーザー</th>
                <th class="px-4 py-3 text-left">登録日</th>
                <th class="px-4 py-3 text-left">状態</th>
                <th class="px-4 py-3 text-left">Song権限</th>
                <th class="px-4 py-3 text-left">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              {dummyUsers.map(user => (
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <img src={user.avatar_url} alt="" class="w-7 h-7 rounded-full" />
                      <div>
                        <p class="font-semibold text-gray-800">{user.display_name}</p>
                        <p class="text-xs text-gray-400">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-gray-500 text-xs">{formatDate(user.created_at)}</td>
                  <td class="px-4 py-3">
                    <span class={`text-xs px-2 py-0.5 rounded-full ${user.is_verified ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      {user.is_verified ? '認証済み' : '未認証'}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <button class={`text-xs px-2 py-1 rounded-lg font-semibold ${user.can_post_kokorozashi_song ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                      {user.can_post_kokorozashi_song ? '✓ あり' : '✗ なし'}
                    </button>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <a href={`/user/${user.username}`} target="_blank" class="text-xs text-blue-600 hover:underline">表示</a>
                      <button class="text-xs text-orange-600 hover:underline">権限変更</button>
                      <button class="text-xs text-red-500 hover:underline">停止</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
})

// VoiceJournals
app.get('/voice-journals', (c) => {
  return c.html(
    <AdminLayout title="ボイスジャーナル管理">
      <div class="bg-white rounded-xl border border-gray-200">
        <div class="p-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-800">ボイスジャーナル一覧 ({dummyVoiceJournals.length}件)</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th class="px-4 py-3 text-left">タイトル</th>
                <th class="px-4 py-3 text-left">投稿者</th>
                <th class="px-4 py-3 text-left">時間</th>
                <th class="px-4 py-3 text-left">公開範囲</th>
                <th class="px-4 py-3 text-left">投稿日</th>
                <th class="px-4 py-3 text-left">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              {dummyVoiceJournals.map(vj => (
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3">
                    <p class="font-semibold text-gray-800 max-w-xs truncate">{vj.title}</p>
                  </td>
                  <td class="px-4 py-3 text-gray-500 text-xs">{vj.user?.display_name}</td>
                  <td class="px-4 py-3 text-gray-500 text-xs">{formatDuration(vj.duration_seconds)}</td>
                  <td class="px-4 py-3">
                    <span class={`text-xs px-2 py-0.5 rounded-full ${vj.visibility === 'public' ? 'bg-green-100 text-green-600' : vj.visibility === 'followers_only' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                      {vj.visibility === 'public' ? '公開' : vj.visibility === 'followers_only' ? 'FL限定' : '下書き'}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-gray-500 text-xs">{formatDate(vj.created_at)}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <a href={`/voice-journal/${vj.id}`} target="_blank" class="text-xs text-blue-600 hover:underline">表示</a>
                      <button class="text-xs text-orange-600 hover:underline">非公開</button>
                      <button class="text-xs text-red-500 hover:underline">削除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
})

// Songs
app.get('/songs', (c) => {
  return c.html(
    <AdminLayout title="ココロザシソング管理">
      <div class="bg-white rounded-xl border border-gray-200">
        <div class="p-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-800">ココロザシソング一覧 ({dummySongs.length}件)</h2>
        </div>
        <div class="divide-y divide-gray-50">
          {dummySongs.map(song => (
            <div class="flex items-center gap-4 p-4 hover:bg-gray-50">
              <img src={song.jacket_image_url} alt={song.title} class="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-800 truncate">{song.title}</p>
                <p class="text-xs text-gray-400">{song.user?.display_name} · {formatDate(song.created_at)}</p>
              </div>
              <span class={`text-xs px-2 py-0.5 rounded-full ${song.visibility === 'public' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                {song.visibility === 'public' ? '公開' : 'FL限定'}
              </span>
              <div class="flex items-center gap-2">
                <a href={`/songs/${song.id}`} target="_blank" class="text-xs text-blue-600 hover:underline">表示</a>
                <button class="text-xs text-red-500 hover:underline">削除</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
})

// Topics
app.get('/topics', (c) => {
  return c.html(
    <AdminLayout title="お題管理">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold text-gray-800">今日のお題</h2>
        <button class="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600">
          <i class="fas fa-plus mr-2"></i>新規作成
        </button>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
        {dummyTopics.map(topic => (
          <div class="p-4 flex items-center gap-4">
            <div class="flex-1">
              <p class="font-semibold text-gray-800">{topic.title}</p>
              <p class="text-xs text-gray-500 mt-0.5">#{topic.hashtag}</p>
              <p class="text-xs text-gray-400">{formatDate(topic.start_date)} 〜 {formatDate(topic.end_date)}</p>
            </div>
            <div class="flex items-center gap-2">
              <button class="text-xs text-blue-600 hover:underline">編集</button>
              <button class="text-xs text-red-500 hover:underline">削除</button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
})

// Orders
app.get('/orders', (c) => {
  const orders = [
    { id: 'ord1', name: '田中はるか', email: 'haruka@example.com', plan: 'スタンダード', status: '制作中', payment: '支払い済', date: '2025-01-10' },
    { id: 'ord2', name: '山田翔', email: 'sho@example.com', plan: 'プレミアム', status: '完了', payment: '支払い済', date: '2025-01-05' },
    { id: 'ord3', name: '佐藤めい', email: 'mei@example.com', plan: 'スタンダード', status: 'ヒアリング待ち', payment: '支払い済', date: '2025-01-15' },
  ]

  return c.html(
    <AdminLayout title="申込管理">
      <div class="bg-white rounded-xl border border-gray-200">
        <div class="p-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-800">申込一覧 ({orders.length}件)</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th class="px-4 py-3 text-left">申込者</th>
                <th class="px-4 py-3 text-left">プラン</th>
                <th class="px-4 py-3 text-left">ステータス</th>
                <th class="px-4 py-3 text-left">決済</th>
                <th class="px-4 py-3 text-left">申込日</th>
                <th class="px-4 py-3 text-left">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              {orders.map(order => (
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3">
                    <p class="font-semibold text-gray-800">{order.name}</p>
                    <p class="text-xs text-gray-400">{order.email}</p>
                  </td>
                  <td class="px-4 py-3 text-gray-600">{order.plan}</td>
                  <td class="px-4 py-3">
                    <span class={`text-xs px-2 py-0.5 rounded-full ${order.status === '完了' ? 'bg-green-100 text-green-600' : order.status === '制作中' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <span class="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">{order.payment}</span>
                  </td>
                  <td class="px-4 py-3 text-gray-500 text-xs">{order.date}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <button class="text-xs text-blue-600 hover:underline">詳細</button>
                      <button class="text-xs text-purple-600 hover:underline">Song権限付与</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
})

// Comments
app.get('/comments', (c) => {
  return c.html(
    <AdminLayout title="コメント管理">
      <div class="bg-white rounded-xl border border-gray-200">
        <div class="p-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-800">コメント一覧</h2>
        </div>
        <div class="divide-y divide-gray-50">
          {dummyComments.map((comment: any) => (
            <div class="p-4 flex items-start gap-3 hover:bg-gray-50">
              <img src={comment.user?.avatar_url} alt="" class="w-8 h-8 rounded-full flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-semibold text-gray-800">{comment.user?.display_name}</span>
                  <span class="text-xs text-gray-400">{formatRelativeDate(comment.created_at)}</span>
                  <span class={`text-xs px-1.5 py-0.5 rounded ${comment.target_type === 'voice_journal' ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'}`}>
                    {comment.target_type === 'voice_journal' ? 'VJ' : 'Song'}
                  </span>
                </div>
                <p class="text-sm text-gray-700">{comment.body}</p>
              </div>
              <div class="flex items-center gap-2">
                <button class="text-xs text-red-500 hover:underline">削除</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
})

// News admin
app.get('/news', (c) => {
  return c.html(
    <AdminLayout title="お知らせ管理">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold text-gray-800">お知らせ一覧</h2>
        <button class="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <i class="fas fa-plus mr-2"></i>新規作成
        </button>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
        {dummyNews.map(news => (
          <div class="p-4 flex items-start gap-3 hover:bg-gray-50">
            <div class="flex-1">
              <p class="font-semibold text-gray-800">{news.title}</p>
              <p class="text-sm text-gray-500 mt-0.5">{news.body}</p>
              <p class="text-xs text-gray-400 mt-1">{formatDate(news.published_at)}</p>
            </div>
            <div class="flex items-center gap-2">
              <button class="text-xs text-blue-600 hover:underline">編集</button>
              <button class="text-xs text-red-500 hover:underline">削除</button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
})

// Columns admin
app.get('/columns', (c) => {
  return c.html(
    <AdminLayout title="コラム管理">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold text-gray-800">コラム一覧</h2>
        <button class="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <i class="fas fa-plus mr-2"></i>新規作成
        </button>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
        {dummyColumns.map(col => (
          <div class="flex items-center gap-4 p-4 hover:bg-gray-50">
            <img src={col.thumbnail_url} alt="" class="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-800 truncate">{col.title}</p>
              <p class="text-xs text-gray-400">{col.category} · {formatDate(col.published_at)}</p>
            </div>
            <div class="flex items-center gap-2">
              <a href={`/columns/${col.slug}`} target="_blank" class="text-xs text-blue-600 hover:underline">表示</a>
              <button class="text-xs text-orange-600 hover:underline">編集</button>
              <button class="text-xs text-red-500 hover:underline">削除</button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
})

export default app
