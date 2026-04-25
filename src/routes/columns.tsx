import { Hono } from 'hono'
import { Layout } from '../components/Layout'
import {
  dummyColumns, currentUser, dummyNotifications,
  getColumnBySlug, formatDate
} from '../data/dummy'

const app = new Hono()

app.get('/', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length

  return c.html(
    <Layout title="コラム" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-5xl mx-auto px-4 py-8">
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-gray-800 mb-2">
            <i class="fas fa-book-open mr-2 text-green-500"></i>コラム
          </h1>
          <p class="text-gray-500">声と志にまつわるコンテンツをお届けします</p>
        </div>

        {/* Featured */}
        <div class="mb-8">
          <a href={`/columns/${dummyColumns[0].slug}`} class="block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover">
            <div class="md:flex">
              <img src={dummyColumns[0].thumbnail_url} alt={dummyColumns[0].title} class="w-full md:w-80 h-48 md:h-auto object-cover" />
              <div class="p-6 flex flex-col justify-center">
                <span class="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full inline-block mb-3">{dummyColumns[0].category}</span>
                <h2 class="text-xl font-bold text-gray-800 mb-2 hover:text-brand-600">{dummyColumns[0].title}</h2>
                <p class="text-sm text-gray-600 leading-relaxed mb-4">{dummyColumns[0].summary}</p>
                <p class="text-xs text-gray-400">{formatDate(dummyColumns[0].published_at)}</p>
              </div>
            </div>
          </a>
        </div>

        {/* Grid */}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyColumns.slice(1).map(col => (
            <a href={`/columns/${col.slug}`} class="block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover">
              <img src={col.thumbnail_url} alt={col.title} class="w-full aspect-video object-cover" />
              <div class="p-5">
                <span class="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full inline-block mb-2">{col.category}</span>
                <h3 class="font-bold text-gray-800 hover:text-brand-600 line-clamp-2 mb-2">{col.title}</h3>
                <p class="text-sm text-gray-500 line-clamp-2 mb-3">{col.summary}</p>
                <p class="text-xs text-gray-400">{formatDate(col.published_at)}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </Layout>
  )
})

app.get('/:slug', (c) => {
  const slug = c.req.param('slug')
  const col = getColumnBySlug(slug)
  const unread = dummyNotifications.filter(n => !n.is_read).length

  if (!col) {
    return c.html(
      <Layout title="見つかりません" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
        <div class="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 class="text-2xl font-bold text-gray-700 mb-4">コラムが見つかりません</h1>
          <a href="/columns" class="btn-primary px-6 py-2.5 rounded-full text-sm font-medium inline-block">一覧に戻る</a>
        </div>
      </Layout>
    )
  }

  const related = dummyColumns.filter(c => c.slug !== slug).slice(0, 2)

  return c.html(
    <Layout title={col.title} currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-3xl mx-auto px-4 py-8">
        <a href="/columns" class="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-6">
          <i class="fas fa-arrow-left"></i>コラム一覧
        </a>

        <article class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <img src={col.thumbnail_url} alt={col.title} class="w-full aspect-video object-cover" />
          <div class="p-6 md:p-8">
            <span class="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full inline-block mb-4">{col.category}</span>
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-3">{col.title}</h1>
            <p class="text-sm text-gray-400 mb-6">{formatDate(col.published_at)}</p>

            <div class="prose prose-gray max-w-none text-sm leading-relaxed text-gray-700">
              {col.body.split('\n').map(line => {
                if (line.startsWith('## ')) return <h2 class="text-xl font-bold text-gray-800 mt-8 mb-4">{line.replace('## ', '')}</h2>
                if (line.startsWith('### ')) return <h3 class="text-lg font-bold text-gray-800 mt-6 mb-3">{line.replace('### ', '')}</h3>
                if (line.match(/^\d+\./)) return <li class="ml-5 list-decimal mb-1">{line.replace(/^\d+\.\s/, '')}</li>
                if (line.startsWith('- ')) return <li class="ml-5 list-disc mb-1">{line.replace('- ', '')}</li>
                if (line.startsWith('**') && line.endsWith('**')) return <p class="font-bold text-gray-800 mb-2">{line.replace(/\*\*/g, '')}</p>
                if (line.trim() === '') return <div class="mb-3"></div>
                return <p class="mb-3">{line}</p>
              })}
            </div>

            {/* Share */}
            <div class="border-t border-gray-100 mt-8 pt-6">
              <h3 class="text-sm font-semibold text-gray-600 mb-3">シェア</h3>
              <div class="flex gap-2">
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(col.title)}`} target="_blank" class="flex items-center gap-2 text-sm bg-sky-50 text-sky-500 hover:bg-sky-100 px-4 py-2 rounded-full border border-sky-200">
                  <i class="fab fa-twitter"></i>X
                </a>
                <button onclick="navigator.clipboard.writeText(window.location.href)" class="flex items-center gap-2 text-sm bg-gray-50 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
                  <i class="fas fa-link"></i>コピー
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* Related */}
        {related.length > 0 && (
          <div class="mt-8">
            <h2 class="font-bold text-gray-800 mb-4">関連コラム</h2>
            <div class="grid md:grid-cols-2 gap-4">
              {related.map(r => (
                <a href={`/columns/${r.slug}`} class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover flex gap-3 p-4">
                  <img src={r.thumbnail_url} alt={r.title} class="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  <div class="flex-1 min-w-0">
                    <h3 class="font-bold text-gray-800 hover:text-brand-600 text-sm line-clamp-2">{r.title}</h3>
                    <p class="text-xs text-gray-400 mt-1">{formatDate(r.published_at)}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
})

export default app
