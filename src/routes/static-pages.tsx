import { Hono } from 'hono'
import { Layout } from '../components/Layout'
import { currentUser, dummyNotifications, dummyNews, dummyUsers, dummyVoiceJournals, dummySongs, formatDate } from '../data/dummy'

const app = new Hono()

// About
app.get('/about', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length

  return c.html(
    <Layout title="初めての方へ" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      {/* Hero */}
      <section class="bg-white py-16 border-b border-gray-100">
        <div class="max-w-4xl mx-auto px-4 text-center">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style="background: #3085c7">
            <i class="fas fa-microphone text-white text-2xl"></i>
          </div>
          <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">ココロザシラボへようこそ</h1>
          <p class="text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
            声と歌で「志」を発信し、同じ想いを持つ人と繋がる<br />コミュニティプラットフォームです。
          </p>
        </div>
      </section>

      <div class="max-w-4xl mx-auto px-4 py-12">
        {/* Features */}
        <div class="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: '🎙️', title: 'ボイスジャーナル', desc: 'ブラウザで録音してそのまま投稿。声で日記を書くように、想いをシェアしましょう。', link: '/voice-journals', linkText: 'みんなの投稿を見る' },
            { icon: '🎵', title: 'ココロザシソング', desc: 'あなたの志をヒアリングして、プロが楽曲化。本人歌唱の作品として永遠に残せます。', link: '/songs/about', linkText: 'サービスを詳しく見る' },
            { icon: '👥', title: 'コミュニティ', desc: 'フォローして、コメントやリアクションで繋がろう。声と想いが人と人をつなぎます。', link: '/signup', linkText: '登録して始める' },
          ].map(f => (
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center card-hover">
              <div class="text-4xl mb-4">{f.icon}</div>
              <h3 class="font-bold text-gray-800 text-lg mb-2">{f.title}</h3>
              <p class="text-sm text-gray-600 leading-relaxed mb-4">{f.desc}</p>
              <a href={f.link} class="text-sm text-brand-600 font-semibold hover:underline">{f.linkText} →</a>
            </div>
          ))}
        </div>

        {/* How to Start */}
        <div class="bg-brand-50 rounded-3xl p-8 mb-16 border border-brand-100">
          <h2 class="text-2xl font-bold text-gray-800 mb-8 text-center">
            <i class="fas fa-rocket mr-2 text-brand-500"></i>始め方
          </h2>
          <div class="grid md:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'アカウントを作る', desc: 'メールアドレスまたはGoogleアカウントで無料登録' },
              { num: '02', title: '録音して投稿する', desc: 'ブラウザで録音してタイトルをつけるだけ。2分以内の声日記を投稿' },
              { num: '03', title: '繋がろう', desc: '気になるユーザーをフォローして、コメントやリアクションで交流' },
            ].map(s => (
              <div class="text-center">
                <div class="text-4xl font-bold logo-text mb-3">{s.num}</div>
                <h3 class="font-bold text-gray-800 mb-2">{s.title}</h3>
                <p class="text-sm text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
          <div class="text-center mt-8">
            <a href="/signup" class="btn-primary px-8 py-4 rounded-full font-bold text-base inline-block">
              <i class="fas fa-user-plus mr-2"></i>無料で始める
            </a>
          </div>
        </div>

        {/* CTA */}
        <div class="text-center">
          <p class="text-gray-600 mb-4">質問やご相談はお気軽に</p>
          <a href="/contact" class="btn-outline px-6 py-3 rounded-full text-sm font-medium inline-block">
            <i class="fas fa-envelope mr-2"></i>お問い合わせ
          </a>
        </div>
      </div>
    </Layout>
  )
})

// News
app.get('/news', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length

  return c.html(
    <Layout title="お知らせ" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-3xl mx-auto px-4 py-8">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">
          <i class="fas fa-bullhorn mr-2 text-brand-500"></i>お知らせ
        </h1>
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

// Search
app.get('/search', (c) => {
  const q = c.req.query('q') || ''
  const tab = c.req.query('tab') || 'all'
  const unread = dummyNotifications.filter(n => !n.is_read).length

  const filteredUsers = q ? dummyUsers.filter((u: any) =>
    u.display_name.includes(q) || u.username.includes(q) || u.bio?.includes(q)
  ) : []
  const filteredVJs = q ? dummyVoiceJournals.filter((vj: any) =>
    vj.title.includes(q) || vj.description?.includes(q)
  ) : []
  const filteredSongs = q ? dummySongs.filter((s: any) =>
    s.title.includes(q) || s.description?.includes(q)
  ) : []

  return c.html(
    <Layout title={q ? `「${q}」の検索結果` : '検索'} currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-4xl mx-auto px-4 py-8">
        {/* Search Box */}
        <div class="relative mb-6">
          <input
            type="text"
            value={q}
            id="searchInput"
            placeholder="ユーザー、ボイスジャーナル、ココロザシソングを検索"
            class="w-full pl-12 pr-4 py-4 text-base border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent shadow-sm"
            onkeydown="if(event.key==='Enter'){window.location='/search?q='+this.value+'&tab=all'}"
          />
          <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
          {q && (
            <button onclick="document.getElementById('searchInput').value='';window.location='/search'" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          )}
        </div>

        {q ? (
          <>
            <p class="text-sm text-gray-500 mb-4">「{q}」の検索結果</p>

            {/* Tabs */}
            <div class="flex border-b border-gray-200 mb-6">
              {[
                { key: 'all', label: 'すべて', count: filteredUsers.length + filteredVJs.length + filteredSongs.length },
                { key: 'users', label: 'ユーザー', count: filteredUsers.length },
                { key: 'voice-journals', label: 'ボイスジャーナル', count: filteredVJs.length },
                { key: 'songs', label: 'ココロザシソング', count: filteredSongs.length },
              ].map(t => (
                <a
                  href={`/search?q=${q}&tab=${t.key}`}
                  class={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${tab === t.key ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  {t.label} ({t.count})
                </a>
              ))}
            </div>

            {/* Results */}
            <div class="space-y-4">
              {(tab === 'all' || tab === 'users') && filteredUsers.length > 0 && (
                <div>
                  {tab === 'all' && <h2 class="font-bold text-gray-700 mb-3 text-sm">ユーザー</h2>}
                  {filteredUsers.map((u: any) => (
                    <a href={`/user/${u.username}`} class="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:bg-brand-50 transition-colors">
                      <img src={u.avatar_url} alt={u.display_name} class="w-12 h-12 rounded-full" />
                      <div>
                        <p class="font-bold text-gray-800">{u.display_name}</p>
                        <p class="text-sm text-gray-400">@{u.username}</p>
                        {u.bio && <p class="text-xs text-gray-500 mt-0.5 line-clamp-1">{u.bio}</p>}
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {(tab === 'all' || tab === 'voice-journals') && filteredVJs.length > 0 && (
                <div>
                  {tab === 'all' && <h2 class="font-bold text-gray-700 mb-3 text-sm mt-6">ボイスジャーナル</h2>}
                  {filteredVJs.map((vj: any) => (
                    <a href={`/voice-journal/${vj.id}`} class="flex items-start gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:bg-brand-50 transition-colors">
                      <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style="background: #3085c7">
                        <i class="fas fa-microphone text-white text-sm"></i>
                      </div>
                      <div>
                        <p class="font-bold text-gray-800">{vj.title}</p>
                        <p class="text-sm text-gray-500 line-clamp-1">{vj.description}</p>
                        <p class="text-xs text-gray-400 mt-0.5">{vj.user?.display_name}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {(tab === 'all' || tab === 'songs') && filteredSongs.length > 0 && (
                <div>
                  {tab === 'all' && <h2 class="font-bold text-gray-700 mb-3 text-sm mt-6">ココロザシソング</h2>}
                  {filteredSongs.map((s: any) => (
                    <a href={`/songs/${s.id}`} class="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:bg-brand-50 transition-colors">
                      <img src={s.jacket_image_url} alt={s.title} class="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      <div>
                        <p class="font-bold text-gray-800">{s.title}</p>
                        <p class="text-xs text-gray-400">{s.user?.display_name}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {filteredUsers.length === 0 && filteredVJs.length === 0 && filteredSongs.length === 0 && (
                <div class="text-center py-12 text-gray-400">
                  <i class="fas fa-search text-4xl mb-3 block opacity-30"></i>
                  <p>「{q}」の検索結果が見つかりませんでした</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div class="text-center py-12 text-gray-400">
            <i class="fas fa-search text-4xl mb-3 block opacity-30"></i>
            <p>検索ワードを入力してください</p>
          </div>
        )}
      </div>
    </Layout>
  )
})

// Terms
app.get('/terms', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length
  return c.html(
    <Layout title="利用規約" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-3xl mx-auto px-4 py-8">
        <h1 class="text-2xl font-bold text-gray-800 mb-2">利用規約</h1>
        <p class="text-sm text-gray-400 mb-8">最終更新日: 2025年1月1日</p>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 prose prose-gray max-w-none text-sm leading-relaxed text-gray-700 space-y-6">
          <section>
            <h2 class="text-lg font-bold text-gray-800 mb-3">第1条（目的）</h2>
            <p>本規約は、ココロザシラボ（以下「当サービス」）の利用条件を定めるものです。登録ユーザーの皆さまには、本規約に従って当サービスをご利用いただきます。</p>
          </section>
          <section>
            <h2 class="text-lg font-bold text-gray-800 mb-3">第2条（利用登録）</h2>
            <p>当サービスにおいては、登録希望者が本規約に同意の上、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。</p>
          </section>
          <section>
            <h2 class="text-lg font-bold text-gray-800 mb-3">第3条（禁止事項）</h2>
            <p>ユーザーは、当サービスの利用にあたり、以下の行為をしてはなりません。</p>
            <ul class="list-disc ml-5 mt-2 space-y-1">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>当社または第三者の知的財産権・肖像権・プライバシー等を侵害する行為</li>
              <li>他のユーザーへの嫌がらせや誹謗中傷</li>
              <li>スパム行為</li>
            </ul>
          </section>
          <section>
            <h2 class="text-lg font-bold text-gray-800 mb-3">第4条（コンテンツの権利）</h2>
            <p>ユーザーが投稿した音声・テキスト等のコンテンツの著作権はユーザーに帰属します。ただし、ユーザーは当社に対して、当サービスの運営に必要な範囲で使用・利用する権利を許諾するものとします。</p>
          </section>
          <section>
            <h2 class="text-lg font-bold text-gray-800 mb-3">第5条（免責事項）</h2>
            <p>当社は、当サービスに関してユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。</p>
          </section>
        </div>
      </div>
    </Layout>
  )
})

// Privacy
app.get('/privacy', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length
  return c.html(
    <Layout title="プライバシーポリシー" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-3xl mx-auto px-4 py-8">
        <h1 class="text-2xl font-bold text-gray-800 mb-2">プライバシーポリシー</h1>
        <p class="text-sm text-gray-400 mb-8">最終更新日: 2025年1月1日</p>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 text-sm leading-relaxed text-gray-700 space-y-6">
          <section>
            <h2 class="text-lg font-bold text-gray-800 mb-3">1. 収集する情報</h2>
            <p>当サービスでは、以下の情報を収集します。</p>
            <ul class="list-disc ml-5 mt-2 space-y-1">
              <li>登録情報（氏名、メールアドレス等）</li>
              <li>投稿コンテンツ（音声データ、テキスト等）</li>
              <li>利用状況（アクセスログ、操作履歴等）</li>
            </ul>
          </section>
          <section>
            <h2 class="text-lg font-bold text-gray-800 mb-3">2. 情報の利用目的</h2>
            <ul class="list-disc ml-5 mt-2 space-y-1">
              <li>サービスの提供・運営</li>
              <li>ユーザーサポート</li>
              <li>サービス改善・新機能開発</li>
              <li>利用規約違反への対応</li>
            </ul>
          </section>
          <section>
            <h2 class="text-lg font-bold text-gray-800 mb-3">3. 情報の共有</h2>
            <p>当社は、法令に基づく場合を除き、ユーザーの個人情報を第三者に提供しません。</p>
          </section>
          <section>
            <h2 class="text-lg font-bold text-gray-800 mb-3">4. お問い合わせ</h2>
            <p>プライバシーポリシーに関するお問い合わせは、<a href="/contact" class="text-brand-600 hover:underline">お問い合わせフォーム</a>よりご連絡ください。</p>
          </section>
        </div>
      </div>
    </Layout>
  )
})

// Law
app.get('/law', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length
  return c.html(
    <Layout title="特定商取引法に基づく表記" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-3xl mx-auto px-4 py-8">
        <h1 class="text-2xl font-bold text-gray-800 mb-8">特定商取引法に基づく表記</h1>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {[
            { label: '販売業者', value: 'ココロザシラボ株式会社' },
            { label: '代表者', value: '代表取締役 山田太郎' },
            { label: '所在地', value: '東京都渋谷区〇〇1-2-3' },
            { label: '電話番号', value: 'お問い合わせフォームよりご連絡ください' },
            { label: 'メールアドレス', value: 'info@kokorozashi-lab.example.com' },
            { label: '販売価格', value: '各サービスページに記載の金額（税込）' },
            { label: '支払方法', value: 'クレジットカード（Visa、MasterCard、JCB、AMEX）' },
            { label: '支払時期', value: '申込完了時に決済' },
            { label: 'サービス提供時期', value: '申込後、担当者よりご連絡（通常3営業日以内）' },
            { label: 'キャンセル・返品', value: 'ヒアリング完了後のキャンセルはお受けできません。ヒアリング前のキャンセルは全額返金いたします。' },
          ].map((row, i) => (
            <div class={`flex ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
              <div class="w-40 flex-shrink-0 p-4 border-r border-gray-100">
                <span class="text-sm font-semibold text-gray-600">{row.label}</span>
              </div>
              <div class="flex-1 p-4">
                <span class="text-sm text-gray-700">{row.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
})

// Contact
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
          <form class="space-y-5" onsubmit="handleContact(event)">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">姓 <span class="text-red-500">*</span></label>
                <input type="text" placeholder="田中" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" required />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">名 <span class="text-red-500">*</span></label>
                <input type="text" placeholder="はるか" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" required />
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">メールアドレス <span class="text-red-500">*</span></label>
              <input type="email" placeholder="hello@example.com" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" required />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">お問い合わせ種別</label>
              <select class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white">
                <option>サービスについて</option>
                <option>ココロザシソングについて</option>
                <option>アカウントについて</option>
                <option>不具合・バグ報告</option>
                <option>その他</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">お問い合わせ内容 <span class="text-red-500">*</span></label>
              <textarea rows={6} placeholder="お問い合わせ内容をご記入ください" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none" required></textarea>
            </div>
            <button type="submit" class="w-full btn-primary py-3.5 rounded-xl text-sm font-bold">
              <i class="fas fa-paper-plane mr-2"></i>送信する
            </button>
          </form>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: `
        function handleContact(e) {
          e.preventDefault();
          alert('お問い合わせを送信しました。ありがとうございます！');
          window.location.href = '/';
        }
      `}} />
    </Layout>
  )
})

export default app
