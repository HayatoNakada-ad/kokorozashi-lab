import { Hono } from 'hono'
import { Layout } from '../components/Layout'
import {
  dummySongs, currentUser, dummyNotifications, dummyUsers,
  formatRelativeDate, reactionLabels, getSongById,
  getCommentsForTarget, formatDate
} from '../data/dummy'

const app = new Hono()

// Songs About Page
app.get('/about', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length

  const steps = [
    { num: 1, icon: 'fa-file-signature', title: '申し込み', desc: 'フォームからお申し込み。プランを選んでください。' },
    { num: 2, icon: 'fa-comments', title: 'ヒアリング', desc: 'あなたの想いや志をオンラインでじっくりお聞きします。' },
    { num: 3, icon: 'fa-lightbulb', title: 'コンセプト整理', desc: '想いを言葉として整理し、楽曲のコンセプトを固めます。' },
    { num: 4, icon: 'fa-guitar', title: '楽曲制作', desc: 'プロの音楽家があなたのために楽曲を制作します。' },
    { num: 5, icon: 'fa-microphone', title: '歌唱・収録', desc: 'あなた自身が歌い、レコーディングします。' },
    { num: 6, icon: 'fa-compact-disc', title: '完成・納品', desc: 'マスタリングを経て楽曲が完成。データで納品します。' },
    { num: 7, icon: 'fa-globe', title: 'サイト公開（任意）', desc: 'ココロザシラボで作品として公開できます。' },
  ]

  const plans = [
    {
      name: 'スタンダード',
      price: '¥88,000',
      desc: 'はじめてでも安心のベーシックプラン',
      features: ['ヒアリング（90分）', '楽曲制作一式', '歌唱サポート', '収録・ミキシング', 'MP3データ納品'],
      for: '初めて楽曲制作に挑戦したい方',
      color: 'brand',
    },
    {
      name: 'プレミアム',
      price: '¥165,000',
      desc: '本格的な作品として残したい方へ',
      features: ['ヒアリング（120分）', '楽曲制作一式', '歌唱サポート（2回）', '収録・ミキシング・マスタリング', 'MP3・WAVデータ納品', 'ジャケット写真撮影', 'MVサポート'],
      for: '本格的な作品として残したい方',
      color: 'purple',
    },
  ]

  const faqs = [
    { q: '歌が上手くなくても大丈夫ですか？', a: 'はい、大丈夫です。プロがあなたの声に合わせて楽曲を制作し、歌唱もサポートします。歌の上手さよりも、想いが伝わることを大切にしています。' },
    { q: 'ジャンルは選べますか？', a: 'はい、ポップス・フォーク・ロック・バラードなど、ご希望のジャンルをお選びいただけます。ヒアリングの際に詳しくご相談ください。' },
    { q: '完成までどれくらいかかりますか？', a: '申し込みから完成まで、通常4〜8週間程度です。お急ぎの場合はご相談ください。' },
    { q: '修正はできますか？', a: 'ヒアリング後のコンセプト段階で1回、楽曲完成後に1回の修正が含まれています。' },
    { q: 'サイトで公開しないことはできますか？', a: 'もちろんです。サイト公開は任意です。プライベートな作品として大切にしていただけます。' },
    { q: '法人・団体でも依頼できますか？', a: 'はい、承っております。企業理念の楽曲化や、団体の歌づくりなど、お気軽にご相談ください。' },
  ]

  return c.html(
    <Layout title="ココロザシソングとは" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      {/* Hero */}
      <section class="relative overflow-hidden py-20 md:py-28" style="background: #1e5282">
        <div class="absolute inset-0 opacity-20">
          <div class="absolute inset-0" style=""></div>
        </div>
        <div class="max-w-4xl mx-auto px-4 text-center relative z-10">
          <p class="text-purple-200 text-sm font-semibold mb-4 tracking-wider">✨ KOKOROZASHI SONG</p>
          <h1 class="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            あなたの「志」が、<br />
            <span class="text-yellow-300">歌になる</span>
          </h1>
          <p class="text-purple-100 text-base md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            思いや志をヒアリングして、プロが楽曲化。<br />
            あなた自身の声で歌う、世界にひとつの作品を。
          </p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/songs/create" class="bg-yellow-400 text-gray-900 font-bold px-8 py-4 rounded-full text-base hover:bg-yellow-300 transition-colors shadow-lg">
              <i class="fas fa-music mr-2"></i>申し込む
            </a>
            <a href="/contact" class="bg-white/20 text-white font-semibold px-8 py-4 rounded-full text-base hover:bg-white/30 transition-colors border border-white/30">
              <i class="fas fa-envelope mr-2"></i>まず相談する
            </a>
          </div>
        </div>
      </section>

      {/* What is */}
      <section class="py-16 bg-white">
        <div class="max-w-4xl mx-auto px-4">
          <div class="text-center mb-12">
            <p class="text-brand-500 font-semibold text-sm mb-2">ABOUT</p>
            <h2 class="text-2xl md:text-3xl font-bold text-gray-800">ココロザシソングとは</h2>
          </div>
          <div class="grid md:grid-cols-2 gap-8 items-center">
            <div class="space-y-4">
              {[
                { icon: '🎤', title: '想いをヒアリング', desc: 'あなたの思いや志を丁寧にお聞きし、楽曲のコンセプトを一緒に作り上げます。' },
                { icon: '🎵', title: 'プロが楽曲化', desc: 'プロの音楽クリエイターがあなた専用の楽曲を制作。メロディも歌詞もオリジナルです。' },
                { icon: '🎙️', title: 'あなたが歌う', desc: '本人歌唱を前提とした楽曲制作。あなたの声でしか歌えない一曲になります。' },
                { icon: '🌟', title: '作品として残す', desc: '完成した楽曲はデータで納品。サイト内で作品として公開することもできます。' },
              ].map(item => (
                <div class="flex gap-4 items-start">
                  <div class="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center flex-shrink-0 text-2xl">
                    {item.icon}
                  </div>
                  <div>
                    <h3 class="font-bold text-gray-800 mb-1">{item.title}</h3>
                    <p class="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div class="rounded-2xl overflow-hidden">
              <img src="https://picsum.photos/seed/songabout/600/400" alt="ココロザシソング" class="w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Song Examples */}
      <section class="py-16 bg-gray-50">
        <div class="max-w-5xl mx-auto px-4">
          <div class="text-center mb-12">
            <p class="text-brand-500 font-semibold text-sm mb-2">WORKS</p>
            <h2 class="text-2xl md:text-3xl font-bold text-gray-800">作例</h2>
            <p class="text-gray-500 mt-2">実際に制作された楽曲の一部をご紹介します</p>
          </div>
          <div class="grid md:grid-cols-3 gap-6">
            {dummySongs.map(song => (
              <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover">
                <div class="relative">
                  <img src={song.jacket_image_url} alt={song.title} class="w-full aspect-square object-cover" />
                  <div class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <a href={`/songs/${song.id}`} class="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg">
                      <i class="fas fa-play text-brand-600 text-xl ml-1"></i>
                    </a>
                  </div>
                </div>
                <div class="p-4">
                  <h3 class="font-bold text-gray-800 mb-1">{song.title}</h3>
                  <div class="flex items-center gap-2 mb-2">
                    <img src={song.user?.avatar_url} alt="" class="w-5 h-5 rounded-full" />
                    <p class="text-xs text-gray-500">{song.user?.display_name}</p>
                  </div>
                  <p class="text-xs text-gray-500 line-clamp-2">{song.description}</p>
                  <a href={`/songs/${song.id}`} class="text-xs text-brand-600 hover:underline mt-2 inline-block">
                    詳しく見る →
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div class="text-center mt-8">
            <a href="/songs/showcase" class="btn-outline px-8 py-3 rounded-full text-sm font-medium inline-block">
              すべての作例を見る
            </a>
          </div>
        </div>
      </section>

      {/* User Voice */}
      <section class="py-16 bg-white">
        <div class="max-w-4xl mx-auto px-4">
          <div class="text-center mb-12">
            <p class="text-brand-500 font-semibold text-sm mb-2">USER VOICE</p>
            <h2 class="text-2xl md:text-3xl font-bold text-gray-800">ご利用者の声</h2>
          </div>
          <div class="grid md:grid-cols-2 gap-6">
            {[
              {
                user: dummyUsers[0],
                before: '自分の想いをうまく言葉にできなくて悩んでいました',
                after: '楽曲になることで、想いが整理され、多くの人に伝わるようになりました',
                comment: '「声にするだけでこんなに気持ちが整理されるんだ」と驚きました。プロの方と一緒に作り上げる過程がとても豊かな体験でした。',
              },
              {
                user: dummyUsers[1],
                before: '教育への想いはあるけど、どう表現すればいいかわからなかった',
                after: '子どもたちへのメッセージが一曲に。学校での反響がすごかった',
                comment: 'まさか自分が歌うとは思っていなかったけど、完成した瞬間に涙が出ました。',
              },
            ].map(v => (
              <div class="bg-brand-50 rounded-2xl p-6 border border-brand-100">
                <div class="flex items-center gap-3 mb-4">
                  <img src={v.user.avatar_url} alt={v.user.display_name} class="w-12 h-12 rounded-full border-2 border-brand-200" />
                  <div>
                    <p class="font-bold text-gray-800">{v.user.display_name}</p>
                    <p class="text-xs text-gray-500">@{v.user.username}</p>
                  </div>
                </div>
                <div class="space-y-2 mb-4">
                  <div class="flex items-start gap-2">
                    <span class="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded flex-shrink-0">Before</span>
                    <p class="text-sm text-gray-600">{v.before}</p>
                  </div>
                  <div class="flex items-start gap-2">
                    <span class="text-xs font-bold text-brand-600 bg-brand-100 px-2 py-0.5 rounded flex-shrink-0">After</span>
                    <p class="text-sm text-brand-700 font-medium">{v.after}</p>
                  </div>
                </div>
                <blockquote class="text-sm text-gray-700 italic border-l-3 border-brand-300 pl-3">
                  「{v.comment}」
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section class="py-16 bg-gray-50">
        <div class="max-w-4xl mx-auto px-4">
          <div class="text-center mb-12">
            <p class="text-brand-500 font-semibold text-sm mb-2">PROCESS</p>
            <h2 class="text-2xl md:text-3xl font-bold text-gray-800">制作の流れ</h2>
          </div>
          <div class="space-y-4">
            {steps.map((step, i) => (
              <div class="flex items-start gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style="background: #3085c7">
                    <i class={`fas ${step.icon}`}></i>
                  </div>
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-bold text-brand-500">STEP {step.num}</span>
                  </div>
                  <h3 class="font-bold text-gray-800 mb-1">{step.title}</h3>
                  <p class="text-sm text-gray-600">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div class="absolute left-10 mt-14 text-gray-300">
                    <i class="fas fa-chevron-down"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section class="py-16 bg-white">
        <div class="max-w-4xl mx-auto px-4">
          <div class="text-center mb-12">
            <p class="text-brand-500 font-semibold text-sm mb-2">PLAN</p>
            <h2 class="text-2xl md:text-3xl font-bold text-gray-800">プラン紹介</h2>
          </div>
          <div class="grid md:grid-cols-2 gap-6">
            {plans.map(plan => (
              <div class={`rounded-2xl border-2 ${plan.color === 'brand' ? 'border-brand-200' : 'border-purple-200 relative overflow-hidden'} shadow-sm p-6 bg-white`}>
                {plan.color === 'purple' && (
                  <div class="absolute top-4 right-4">
                    <span class="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">人気</span>
                  </div>
                )}
                <h3 class={`text-xl font-bold mb-1 ${plan.color === 'brand' ? 'text-brand-700' : 'text-purple-700'}`}>{plan.name}</h3>
                <p class="text-sm text-gray-500 mb-3">{plan.desc}</p>
                <p class={`text-3xl font-bold mb-5 ${plan.color === 'brand' ? 'text-brand-600' : 'text-purple-600'}`}>{plan.price}</p>
                <ul class="space-y-2 mb-5">
                  {plan.features.map(f => (
                    <li class="flex items-center gap-2 text-sm text-gray-700">
                      <i class={`fas fa-check text-xs ${plan.color === 'brand' ? 'text-brand-500' : 'text-purple-500'}`}></i>
                      {f}
                    </li>
                  ))}
                </ul>
                <p class={`text-xs font-semibold mb-4 ${plan.color === 'brand' ? 'text-brand-600' : 'text-purple-600'} bg-${plan.color === 'brand' ? 'brand' : 'purple'}-50 px-3 py-2 rounded-lg`}>
                  <i class="fas fa-user mr-1"></i>{plan.for}
                </p>
                <a href="/songs/order" class={`block text-center py-3 rounded-xl font-bold text-sm ${plan.color === 'brand' ? 'btn-primary' : 'bg-purple-500 hover:bg-purple-600 text-white'} transition-colors`}>
                  このプランで申し込む
                </a>
              </div>
            ))}
          </div>
          <p class="text-center text-xs text-gray-400 mt-4">※ 表示価格は税込です。決済は安全なオンライン決済で行います。</p>
        </div>
      </section>

      {/* FAQ */}
      <section class="py-16 bg-gray-50">
        <div class="max-w-3xl mx-auto px-4">
          <div class="text-center mb-12">
            <p class="text-brand-500 font-semibold text-sm mb-2">FAQ</p>
            <h2 class="text-2xl md:text-3xl font-bold text-gray-800">よくある質問</h2>
          </div>
          <div class="space-y-3">
            {faqs.map((faq, i) => (
              <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button
                  onclick={`toggleFaq(${i})`}
                  class="w-full flex items-center justify-between p-5 text-left"
                >
                  <span class="font-semibold text-gray-800 text-sm pr-4">
                    <span class="text-brand-500 mr-2">Q.</span>{faq.q}
                  </span>
                  <i class="fas fa-chevron-down text-gray-400 flex-shrink-0" id={`faq-icon-${i}`}></i>
                </button>
                <div class="hidden px-5 pb-5" id={`faq-body-${i}`}>
                  <p class="text-sm text-gray-600 leading-relaxed pl-5">
                    <span class="text-brand-500 font-semibold">A.</span> {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="py-20" style="background: #1e5282">
        <div class="max-w-2xl mx-auto px-4 text-center">
          <p class="text-purple-200 text-sm font-semibold mb-4">あなたの番です</p>
          <h2 class="text-2xl md:text-4xl font-bold text-white mb-4">想いを、歌に変えよう</h2>
          <p class="text-purple-200 mb-8">まずは相談だけでも大丈夫。お気軽にご連絡ください。</p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/songs/order" class="bg-yellow-400 text-gray-900 font-bold px-8 py-4 rounded-full hover:bg-yellow-300 transition-colors shadow-lg">
              <i class="fas fa-music mr-2"></i>申し込む
            </a>
            <a href="/contact" class="bg-white/20 text-white font-semibold px-8 py-4 rounded-full hover:bg-white/30 transition-colors border border-white/30">
              <i class="fas fa-envelope mr-2"></i>まず相談する
            </a>
          </div>
        </div>
      </section>

      <script dangerouslySetInnerHTML={{ __html: `
        function toggleFaq(i) {
          const body = document.getElementById('faq-body-' + i);
          const icon = document.getElementById('faq-icon-' + i);
          body.classList.toggle('hidden');
          icon.style.transform = body.classList.contains('hidden') ? '' : 'rotate(180deg)';
        }
      `}} />
    </Layout>
  )
})

// Songs Create/Order LP
app.get('/create', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length

  return c.html(
    <Layout title="ココロザシソングを作る" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-3xl mx-auto px-4 py-12">
        <div class="text-center mb-10">
          <p class="text-brand-500 font-semibold text-sm mb-2">KOKOROZASHI SONG</p>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-3">あなたの志を、歌にしよう</h1>
          <p class="text-gray-500">まずはプランを選んでお申し込みください</p>
        </div>

        <div class="grid md:grid-cols-2 gap-6 mb-10">
          {[
            { name: 'スタンダード', price: '¥88,000', icon: 'fa-star', color: 'brand', link: '/songs/order?plan=standard' },
            { name: 'プレミアム', price: '¥165,000', icon: 'fa-crown', color: 'purple', link: '/songs/order?plan=premium', badge: '人気' },
          ].map(plan => (
            <a href={plan.link} class={`block rounded-2xl border-2 ${plan.color === 'brand' ? 'border-brand-200 hover:border-brand-400' : 'border-purple-200 hover:border-purple-400'} p-6 bg-white transition-all card-hover text-center relative`}>
              {plan.badge && (
                <span class="absolute top-4 right-4 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">{plan.badge}</span>
              )}
              <div class={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${plan.color === 'brand' ? 'bg-brand-50' : 'bg-purple-50'}`}>
                <i class={`fas ${plan.icon} text-2xl ${plan.color === 'brand' ? 'text-brand-500' : 'text-purple-500'}`}></i>
              </div>
              <h3 class={`text-xl font-bold mb-2 ${plan.color === 'brand' ? 'text-brand-700' : 'text-purple-700'}`}>{plan.name}</h3>
              <p class={`text-3xl font-bold ${plan.color === 'brand' ? 'text-brand-600' : 'text-purple-600'}`}>{plan.price}</p>
              <p class="text-xs text-gray-400 mt-1 mb-4">（税込）</p>
              <span class={`inline-block text-center py-2.5 px-6 rounded-xl font-bold text-sm ${plan.color === 'brand' ? 'btn-primary' : 'bg-purple-500 text-white hover:bg-purple-600'} transition-colors`}>
                このプランで申し込む
              </span>
            </a>
          ))}
        </div>

        <div class="bg-brand-50 rounded-2xl p-6 border border-brand-100 text-center">
          <p class="text-sm text-gray-600 mb-3">まずは相談だけでも大丈夫です</p>
          <a href="/contact" class="btn-outline px-6 py-2.5 rounded-full text-sm font-medium inline-block">
            <i class="fas fa-envelope mr-2"></i>無料相談する
          </a>
        </div>
      </div>
    </Layout>
  )
})

// Showcase
app.get('/showcase', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length

  return c.html(
    <Layout title="ココロザシソング公開事例" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-5xl mx-auto px-4 py-8">
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-gray-800 mb-2">
            <i class="fas fa-music mr-2 text-purple-500"></i>ココロザシソング
          </h1>
          <p class="text-gray-500">制作された楽曲の一覧</p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummySongs.map(song => (
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover audio-card">
              <div class="relative">
                <img src={song.jacket_image_url} alt={song.title} class="w-full aspect-square object-cover" />
                <div class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <button
                    id={`play-btn-${song.id}`}
                    class="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg"
                    onclick={`initAudioPlayer('${song.id}', '')`}
                  >
                    <i class="fas fa-play text-purple-600 text-xl ml-1"></i>
                  </button>
                </div>
              </div>
              <div class="p-4">
                <div class="flex items-center gap-2 mb-2">
                  <img src={song.user?.avatar_url} alt="" class="w-6 h-6 rounded-full" />
                  <a href={`/user/${song.user?.username}`} class="text-xs text-gray-500 hover:text-brand-600">{song.user?.display_name}</a>
                </div>
                <a href={`/songs/${song.id}`}>
                  <h3 class="font-bold text-gray-800 hover:text-brand-600 mb-1">{song.title}</h3>
                </a>
                <p class="text-xs text-gray-500 line-clamp-2 mb-3">{song.description}</p>
                <div class="bg-gray-100 rounded-full h-1 mb-2">
                  <div id={`progress-${song.id}`} class="h-1 rounded-full" style="width:0%;background:#3085c7"></div>
                </div>
                <div class="flex items-center justify-between text-xs text-gray-400">
                  <span id={`current-time-${song.id}`}>0:00</span>
                </div>
                <div class="flex items-center gap-1 mt-3 flex-wrap">
                  {Object.entries(reactionLabels).slice(0, 3).map(([type, info]) => (
                    <button onclick={`toggleReaction(this, '${type}')`} class="reaction-btn flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                      <span>{info.emoji}</span>
                      <span class="reaction-count">{song.reactions_count?.[type as keyof typeof song.reactions_count] || 0}</span>
                    </button>
                  ))}
                  <a href={`/songs/${song.id}`} class="ml-auto text-xs text-gray-400 hover:text-brand-600">
                    <i class="far fa-comment mr-1"></i>{song.comments_count}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
})

// Song Detail
app.get('/detail/:id', (c) => {
  const id = c.req.param('id')
  const song = getSongById(id)
  const unread = dummyNotifications.filter(n => !n.is_read).length

  if (!song) {
    return c.html(
      <Layout title="見つかりません" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
        <div class="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 class="text-2xl font-bold text-gray-700 mb-4">楽曲が見つかりません</h1>
          <a href="/songs/showcase" class="btn-primary px-6 py-2.5 rounded-full text-sm font-medium inline-block">一覧に戻る</a>
        </div>
      </Layout>
    )
  }

  const comments = getCommentsForTarget('song', id)

  return c.html(
    <Layout title={song.title} currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-3xl mx-auto px-4 py-8">
        <a href="/songs/showcase" class="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-6">
          <i class="fas fa-arrow-left"></i>ココロザシソング一覧
        </a>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 md:p-8">
            <div class="flex gap-5 mb-6">
              <img src={song.jacket_image_url} alt={song.title} class="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover shadow-md flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <h1 class="text-xl md:text-2xl font-bold text-gray-800 mb-2">{song.title}</h1>
                <div class="flex items-center gap-2 mb-3">
                  <a href={`/user/${song.user?.username}`}>
                    <img src={song.user?.avatar_url} alt="" class="w-7 h-7 rounded-full" />
                  </a>
                  <a href={`/user/${song.user?.username}`} class="text-sm text-gray-600 hover:text-brand-600">{song.user?.display_name}</a>
                  <button
                    onclick={`toggleFollow(this, '${song.user?.username}')`}
                    data-following="false"
                    class="btn-primary px-3 py-1 rounded-full text-xs font-medium ml-2"
                  >
                    フォロー
                  </button>
                </div>
                <p class="text-xs text-gray-400">{formatDate(song.created_at)}</p>
                <div class="flex items-center gap-2 mt-3">
                  <span class="bg-purple-100 text-purple-600 text-xs font-semibold px-3 py-1 rounded-full">
                    <i class="fas fa-music mr-1"></i>ココロザシソング
                  </span>
                </div>
              </div>
            </div>

            {/* Player */}
            <div class="rounded-2xl p-5 mb-5 audio-card" style="background: #eef5fc">
              <div class="flex items-center gap-4">
                <button
                  id={`play-btn-${song.id}`}
                  class="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0"
                  style="background: #3085c7"
                  onclick={`initAudioPlayer('${song.id}', '')`}
                >
                  <i class="fas fa-play text-lg ml-1"></i>
                </button>
                <div class="flex-1">
                  <div class="bg-white/60 rounded-full h-2 mb-2">
                    <div id={`progress-${song.id}`} class="h-2 rounded-full" style="width:0%;background:#3085c7"></div>
                  </div>
                  <div class="flex justify-between text-sm text-purple-500">
                    <span id={`current-time-${song.id}`}>0:00</span>
                    <span id={`duration-${song.id}`}>--:--</span>
                  </div>
                </div>
              </div>
            </div>

            <p class="text-gray-700 leading-relaxed mb-5">{song.description}</p>

            {/* Reactions */}
            <div class="border-t border-gray-100 pt-5 mb-5">
              <h3 class="text-sm font-semibold text-gray-600 mb-3">リアクション</h3>
              <div class="flex flex-wrap gap-2">
                {Object.entries(reactionLabels).map(([type, info]) => (
                  <button
                    onclick={`toggleReaction(this, '${type}')`}
                    class="reaction-btn flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 bg-gray-50 hover:bg-purple-50 px-4 py-2 rounded-full border border-gray-200 hover:border-purple-300"
                  >
                    <span class="text-lg">{info.emoji}</span>
                    <span>{info.label}</span>
                    <span class="reaction-count text-gray-400 text-xs ml-1">{song.reactions_count?.[type as keyof typeof song.reactions_count] || 0}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Share */}
            <div class="border-t border-gray-100 pt-4">
              <div class="flex gap-2">
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(song.title)}&url=${encodeURIComponent(`https://kokorozashi-lab.com/songs/${song.id}`)}`} target="_blank" class="flex items-center gap-2 text-sm bg-sky-50 text-sky-500 hover:bg-sky-100 px-4 py-2 rounded-full border border-sky-200">
                  <i class="fab fa-twitter"></i>X
                </a>
                <button onclick="navigator.clipboard.writeText(window.location.href)" class="flex items-center gap-2 text-sm bg-gray-50 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
                  <i class="fas fa-link"></i>コピー
                </button>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div class="border-t border-gray-100 bg-gray-50 p-6 md:p-8">
            <h3 class="font-bold text-gray-800 mb-5">
              <i class="far fa-comment mr-2 text-purple-500"></i>コメント ({comments.length}件)
            </h3>
            <div class="bg-white rounded-xl border border-gray-200 p-4 mb-5">
              <div class="flex gap-3">
                <img src={currentUser.avatar_url} alt="" class="w-9 h-9 rounded-full flex-shrink-0" />
                <div class="flex-1">
                  <textarea placeholder="コメントを入力..." rows={3} class="w-full text-sm text-gray-700 focus:outline-none resize-none"></textarea>
                  <div class="flex justify-end mt-2">
                    <button class="px-5 py-2 rounded-full text-sm font-medium text-white" style="background: #3085c7">コメントする</button>
                  </div>
                </div>
              </div>
            </div>
            <div class="space-y-4">
              {comments.map(comment => (
                <div class="flex gap-3">
                  <img src={comment.user?.avatar_url} alt="" class="w-9 h-9 rounded-full flex-shrink-0" />
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
    </Layout>
  )
})

// Order flow
app.get('/order', (c) => {
  const plan = c.req.query('plan') || 'standard'
  const unread = dummyNotifications.filter(n => !n.is_read).length

  const planInfo = plan === 'premium'
    ? { name: 'プレミアム', price: '¥165,000' }
    : { name: 'スタンダード', price: '¥88,000' }

  return c.html(
    <Layout title="ココロザシソング申込" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-xl mx-auto px-4 py-12">
        {/* Progress */}
        <div class="flex items-center gap-2 mb-8 text-xs">
          {['プラン選択', '申込フォーム', '規約確認', '確認', '決済', '完了'].map((step, i) => (
            <>
              <div class={`flex items-center gap-1 ${i === 1 ? 'text-brand-600 font-semibold' : 'text-gray-400'}`}>
                <div class={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${i === 1 ? 'bg-brand-500 text-white' : i < 1 ? 'bg-brand-200 text-white' : 'bg-gray-200 text-gray-400'}`}>{i + 1}</div>
                <span class="hidden sm:inline">{step}</span>
              </div>
              {i < 5 && <div class="flex-1 h-0.5 bg-gray-200"></div>}
            </>
          ))}
        </div>

        <div class="bg-brand-50 rounded-2xl p-4 mb-6 border border-brand-100 flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold text-gray-700">選択プラン</p>
            <p class="text-lg font-bold text-brand-700">{planInfo.name}</p>
          </div>
          <p class="text-2xl font-bold text-brand-600">{planInfo.price}</p>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h1 class="text-xl font-bold text-gray-800 mb-6">申込フォーム</h1>
          <form class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">姓 <span class="text-red-500">*</span></label>
                <input type="text" placeholder="田中" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">名 <span class="text-red-500">*</span></label>
                <input type="text" placeholder="はるか" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">メールアドレス <span class="text-red-500">*</span></label>
              <input type="email" placeholder="hello@example.com" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">電話番号</label>
              <input type="tel" placeholder="090-0000-0000" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">ご要望・お伝えしたいこと</label>
              <textarea rows={4} placeholder="楽曲に込めたい想いや、参考にしてほしい楽曲など、何でもお聞かせください" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"></textarea>
            </div>
            <a href="/songs/order/terms" class="block w-full btn-primary py-3.5 rounded-xl text-sm font-bold text-center mt-2">
              次へ（規約確認）
            </a>
          </form>
        </div>
      </div>
    </Layout>
  )
})

app.get('/order/terms', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length
  return c.html(
    <Layout title="規約確認" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-xl mx-auto px-4 py-12">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h1 class="text-xl font-bold text-gray-800 mb-4">利用規約の確認</h1>
          <div class="h-60 overflow-y-auto border border-gray-200 rounded-xl p-4 text-sm text-gray-600 mb-5 leading-relaxed">
            <h3 class="font-bold mb-2">ココロザシソング利用規約</h3>
            <p class="mb-3">本規約は、ココロザシラボが提供するココロザシソングサービス（以下「本サービス」）の利用条件を定めるものです。</p>
            <p class="mb-3">第1条（サービス内容）本サービスは、利用者の想いや志をヒアリングし、プロの音楽家が楽曲を制作するサービスです。</p>
            <p class="mb-3">第2条（著作権）制作された楽曲の著作権は利用者に帰属します。ただし、サービス紹介等の目的でココロザシラボが使用することに同意いただく場合があります。</p>
            <p class="mb-3">第3条（キャンセル）ヒアリング完了後のキャンセルはお受けできません。</p>
            <p>第4条（個人情報）取得した個人情報はプライバシーポリシーに基づき適切に管理します。</p>
          </div>
          <label class="flex items-center gap-3 mb-5 cursor-pointer">
            <input type="checkbox" id="agreeCheck" class="w-4 h-4 text-brand-500" />
            <span class="text-sm text-gray-700">利用規約に同意する</span>
          </label>
          <a href="/songs/order/complete" onclick="if(!document.getElementById('agreeCheck').checked){alert('規約に同意してください');return false;}" class="block w-full btn-primary py-3.5 rounded-xl text-sm font-bold text-center">
            同意して申込を完了する
          </a>
        </div>
      </div>
    </Layout>
  )
})

app.get('/order/complete', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length
  return c.html(
    <Layout title="申込完了" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-lg mx-auto px-4 py-16 text-center">
        <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style="background: #3085c7">
          <i class="fas fa-check text-white text-3xl"></i>
        </div>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">申込が完了しました！</h1>
        <p class="text-gray-500 mb-2">ありがとうございます。3営業日以内にご連絡いたします。</p>
        <p class="text-sm text-gray-400 mb-8">確認メールをお送りしましたのでご確認ください。</p>
        <div class="flex flex-col gap-3">
          <a href="/" class="btn-primary py-3 rounded-xl font-medium">ホームへ</a>
          <a href="/songs/about" class="btn-outline py-3 rounded-xl font-medium">ココロザシソングについて</a>
        </div>
      </div>
    </Layout>
  )
})

// Song detail by :id (shorthand for /detail/:id)
app.get('/:id', (c) => {
  const id = c.req.param('id')
  const song = getSongById(id)
  const unread = dummyNotifications.filter(n => !n.is_read).length

  if (!song) {
    return c.html(
      <Layout title="見つかりません" currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
        <div class="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 class="text-2xl font-bold text-gray-700 mb-4">楽曲が見つかりません</h1>
          <a href="/songs/showcase" class="btn-primary px-6 py-2.5 rounded-full text-sm font-medium inline-block">一覧に戻る</a>
        </div>
      </Layout>
    )
  }

  const comments = getCommentsForTarget('song', id)

  return c.html(
    <Layout title={song.title} currentUser={currentUser} unreadNotifications={unread} notifications={dummyNotifications}>
      <div class="max-w-3xl mx-auto px-4 py-8">
        <a href="/songs/showcase" class="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-6"><i class="fas fa-arrow-left"></i>ココロザシソング一覧</a>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 md:p-8">
            <div class="flex gap-5 mb-6">
              <img src={song.jacket_image_url} alt={song.title} class="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover shadow-md flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <h1 class="text-xl md:text-2xl font-bold text-gray-800 mb-2">{song.title}</h1>
                <div class="flex items-center gap-2 mb-3">
                  <a href={`/user/${song.user?.username}`}><img src={song.user?.avatar_url} alt="" class="w-7 h-7 rounded-full" /></a>
                  <a href={`/user/${song.user?.username}`} class="text-sm text-gray-600 hover:text-brand-600">{song.user?.display_name}</a>
                  <button onclick={`toggleFollow(this, '${song.user?.username}')`} data-following="false" class="btn-primary px-3 py-1 rounded-full text-xs font-medium ml-2">フォロー</button>
                </div>
                <p class="text-xs text-gray-400">{formatDate(song.created_at)}</p>
                <div class="flex items-center gap-2 mt-3">
                  <span class="bg-purple-100 text-purple-600 text-xs font-semibold px-3 py-1 rounded-full"><i class="fas fa-music mr-1"></i>ココロザシソング</span>
                </div>
              </div>
            </div>
            <div class="rounded-2xl p-5 mb-5 audio-card" style="background: #eef5fc">
              <div class="flex items-center gap-4">
                <button id={`play-btn-${song.id}`} class="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0" style="background: #3085c7" onclick={`initAudioPlayer('${song.id}', '')`}><i class="fas fa-play text-lg ml-1"></i></button>
                <div class="flex-1">
                  <div class="bg-white/60 rounded-full h-2 mb-2"><div id={`progress-${song.id}`} class="h-2 rounded-full" style="width:0%;background:#3085c7"></div></div>
                  <div class="flex justify-between text-sm text-purple-500"><span id={`current-time-${song.id}`}>0:00</span><span>--:--</span></div>
                </div>
              </div>
            </div>
            <p class="text-gray-700 leading-relaxed mb-5">{song.description}</p>
            <div class="border-t border-gray-100 pt-5 mb-5">
              <h3 class="text-sm font-semibold text-gray-600 mb-3">リアクション</h3>
              <div class="flex flex-wrap gap-2">
                {Object.entries(reactionLabels).map(([type, info]) => (
                  <button onclick={`toggleReaction(this, '${type}')`} class="reaction-btn flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 bg-gray-50 hover:bg-purple-50 px-4 py-2 rounded-full border border-gray-200 hover:border-purple-300">
                    <span class="text-lg">{info.emoji}</span><span>{info.label}</span><span class="reaction-count text-gray-400 text-xs ml-1">{song.reactions_count?.[type as keyof typeof song.reactions_count] || 0}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div class="border-t border-gray-100 bg-gray-50 p-6 md:p-8">
            <h3 class="font-bold text-gray-800 mb-5"><i class="far fa-comment mr-2 text-purple-500"></i>コメント ({comments.length}件)</h3>
            <div class="bg-white rounded-xl border border-gray-200 p-4 mb-5">
              <div class="flex gap-3">
                <img src={currentUser.avatar_url} alt="" class="w-9 h-9 rounded-full flex-shrink-0" />
                <div class="flex-1"><textarea placeholder="コメントを入力..." rows={3} class="w-full text-sm text-gray-700 focus:outline-none resize-none"></textarea><div class="flex justify-end mt-2"><button class="px-5 py-2 rounded-full text-sm font-medium text-white" style="background: #3085c7">コメントする</button></div></div>
              </div>
            </div>
            <div class="space-y-4">
              {comments.map(comment => (
                <div class="flex gap-3">
                  <img src={comment.user?.avatar_url} alt="" class="w-9 h-9 rounded-full flex-shrink-0" />
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
    </Layout>
  )
})

export default app
