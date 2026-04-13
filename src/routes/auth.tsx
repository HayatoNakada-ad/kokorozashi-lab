import { Hono } from 'hono'
import { Layout } from '../components/Layout'

const app = new Hono()

app.get('/', (c) => {
  return c.html(
    <Layout title="ログイン">
      <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div class="w-full max-w-md">
          {/* Logo */}
          <div class="text-center mb-8">
            <a href="/" class="inline-flex items-center gap-2 mb-4">
              <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: #3085c7">
                <i class="fas fa-microphone text-white"></i>
              </div>
              <span class="logo-text text-2xl font-bold">ココロザシラボ</span>
            </a>
            <h1 class="text-xl font-bold text-gray-800">ログイン</h1>
            <p class="text-sm text-gray-500 mt-1">アカウントにサインインしてください</p>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* SNS Login */}
            <div class="space-y-3 mb-5">
              <button class="w-full flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <img src="https://www.google.com/favicon.ico" alt="Google" class="w-5 h-5" />
                Googleでログイン
              </button>
              <button class="w-full flex items-center gap-3 bg-black rounded-xl px-4 py-3 text-sm font-medium text-white hover:bg-gray-900 transition-colors">
                <i class="fab fa-twitter"></i>
                X（Twitter）でログイン
              </button>
            </div>

            <div class="flex items-center gap-3 my-5">
              <div class="flex-1 h-px bg-gray-200"></div>
              <span class="text-xs text-gray-400">または</span>
              <div class="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Email Login */}
            <form class="space-y-4" onsubmit="handleLogin(event)">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">メールアドレス</label>
                <input
                  type="email"
                  id="loginEmail"
                  placeholder="hello@example.com"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">パスワード</label>
                <div class="relative">
                  <input
                    type="password"
                    id="loginPassword"
                    placeholder="パスワード"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent"
                    required
                  />
                  <button type="button" onclick="togglePassword('loginPassword')" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <i class="fas fa-eye" id="loginPasswordIcon"></i>
                  </button>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" class="rounded" />
                  <span class="text-sm text-gray-600">ログイン状態を保持</span>
                </label>
                <a href="/password/reset" class="text-sm text-brand-600 hover:underline">パスワードを忘れた方</a>
              </div>
              <button type="submit" class="w-full btn-primary py-3.5 rounded-xl text-sm font-bold">
                ログイン
              </button>
            </form>
          </div>

          <p class="text-center text-sm text-gray-500 mt-6">
            アカウントをお持ちでない方は
            <a href="/signup" class="text-brand-600 font-semibold hover:underline ml-1">新規登録</a>
          </p>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        function handleLogin(e) {
          e.preventDefault();
          // Demo: just redirect
          window.location.href = '/';
        }

        function togglePassword(id) {
          const input = document.getElementById(id);
          const icon = document.getElementById(id + 'Icon');
          if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
          } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
          }
        }
      `}} />
    </Layout>
  )
})

app.get('/', (c) => {
  return c.html(
    <Layout title="新規登録">
      <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div class="w-full max-w-md">
          <div class="text-center mb-8">
            <a href="/" class="inline-flex items-center gap-2 mb-4">
              <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background: #3085c7">
                <i class="fas fa-microphone text-white"></i>
              </div>
              <span class="logo-text text-2xl font-bold">ココロザシラボ</span>
            </a>
            <h1 class="text-xl font-bold text-gray-800">アカウント作成</h1>
            <p class="text-sm text-gray-500 mt-1">声と想いのコミュニティへようこそ</p>
          </div>

          {/* Progress */}
          <div class="flex items-center gap-2 text-xs mb-6">
            {['情報入力', '規約確認', '確認', '仮登録完了', '本登録完了'].map((s, i) => (
              <>
                <div class={`flex items-center gap-1 ${i === 0 ? 'text-brand-600' : 'text-gray-400'}`}>
                  <div class={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${i === 0 ? 'bg-brand-500 text-white' : 'bg-gray-200'}`}>{i + 1}</div>
                  <span class="hidden sm:inline">{s}</span>
                </div>
                {i < 4 && <div class="flex-1 h-0.5 bg-gray-200"></div>}
              </>
            ))}
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* SNS */}
            <div class="space-y-3 mb-5">
              <button class="w-full flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <img src="https://www.google.com/favicon.ico" alt="Google" class="w-5 h-5" />
                Googleで登録
              </button>
            </div>

            <div class="flex items-center gap-3 my-5">
              <div class="flex-1 h-px bg-gray-200"></div>
              <span class="text-xs text-gray-400">または</span>
              <div class="flex-1 h-px bg-gray-200"></div>
            </div>

            <form class="space-y-4" onsubmit="handleSignup(event)">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">表示名 <span class="text-red-500">*</span></label>
                <input type="text" placeholder="田中はるか" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" required />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">ユーザーID <span class="text-red-500">*</span></label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                  <input type="text" placeholder="haruka_voice" class="w-full pl-7 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" required />
                </div>
                <p class="text-xs text-gray-400 mt-1">英数字とアンダースコアのみ使用できます</p>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">メールアドレス <span class="text-red-500">*</span></label>
                <input type="email" placeholder="hello@example.com" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" required />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">パスワード <span class="text-red-500">*</span></label>
                <input type="password" placeholder="8文字以上" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" required minlength={8} />
                <p class="text-xs text-gray-400 mt-1">8文字以上、英数字を含めてください</p>
              </div>

              <a href="/signup/terms" class="block w-full btn-primary py-3.5 rounded-xl text-sm font-bold text-center">
                次へ（規約確認）
              </a>
            </form>
          </div>

          <p class="text-center text-sm text-gray-500 mt-6">
            すでにアカウントをお持ちの方は
            <a href="/login" class="text-brand-600 font-semibold hover:underline ml-1">ログイン</a>
          </p>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        function handleSignup(e) {
          e.preventDefault();
          window.location.href = '/signup/terms';
        }
      `}} />
    </Layout>
  )
})

app.get('/terms', (c) => {
  return c.html(
    <Layout title="利用規約">
      <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div class="w-full max-w-md">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h1 class="text-xl font-bold text-gray-800 mb-4">利用規約の確認</h1>
            <div class="h-64 overflow-y-auto border border-gray-200 rounded-xl p-4 text-sm text-gray-600 mb-5 leading-relaxed">
              <h3 class="font-bold mb-2">ココロザシラボ 利用規約</h3>
              <p class="mb-3">第1条（目的）本規約は、ココロザシラボ（以下「当サービス」）の利用条件を定めるものです。</p>
              <p class="mb-3">第2条（利用登録）登録申請者が本規約に同意の上、当社の定める方法によって利用登録を申請した場合に、利用登録が完了するものとします。</p>
              <p class="mb-3">第3条（禁止事項）法令または公序良俗に違反する行為、犯罪行為に関連する行為、当社または第三者の知的財産権を侵害する行為を禁止します。</p>
              <p class="mb-3">第4条（コンテンツの権利）ユーザーが投稿した音声・テキストの著作権はユーザーに帰属します。ただし、当サービスはサービス運営に必要な範囲でこれを利用できるものとします。</p>
              <p>第5条（免責事項）当社はユーザーが投稿したコンテンツについて責任を負いません。</p>
            </div>
            <label class="flex items-center gap-3 mb-5 cursor-pointer">
              <input type="checkbox" id="agreeTerms" class="w-4 h-4" />
              <span class="text-sm text-gray-700">利用規約に同意する</span>
            </label>
            <label class="flex items-center gap-3 mb-5 cursor-pointer">
              <input type="checkbox" id="agreePrivacy" class="w-4 h-4" />
              <span class="text-sm text-gray-700">
                <a href="/privacy" class="text-brand-600 hover:underline" target="_blank">プライバシーポリシー</a>に同意する
              </span>
            </label>
            <a
              href="/signup/complete"
              onclick="if(!document.getElementById('agreeTerms').checked||!document.getElementById('agreePrivacy').checked){alert('規約とプライバシーポリシーに同意してください');return false;}"
              class="block w-full btn-primary py-3.5 rounded-xl text-sm font-bold text-center"
            >
              同意して登録を完了する
            </a>
          </div>
        </div>
      </div>
    </Layout>
  )
})

app.get('/complete', (c) => {
  return c.html(
    <Layout title="登録完了">
      <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div class="w-full max-w-md text-center">
          <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style="background: #3085c7">
            <i class="fas fa-check text-white text-3xl"></i>
          </div>
          <h1 class="text-2xl font-bold text-gray-800 mb-2">登録完了！</h1>
          <p class="text-gray-500 mb-2">ココロザシラボへようこそ！</p>
          <p class="text-sm text-gray-400 mb-8">確認メールをお送りしました。メール内のリンクをクリックして本登録を完了してください。</p>
          <a href="/" class="btn-primary px-8 py-3 rounded-full font-medium inline-block">
            ホームへ
          </a>
        </div>
      </div>
    </Layout>
  )
})

app.get('/reset', (c) => {
  return c.html(
    <Layout title="パスワードリセット">
      <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div class="w-full max-w-md">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h1 class="text-xl font-bold text-gray-800 mb-2">パスワードリセット</h1>
            <p class="text-sm text-gray-500 mb-5">登録済みのメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。</p>
            <div class="space-y-4">
              <input type="email" placeholder="hello@example.com" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
              <button class="w-full btn-primary py-3 rounded-xl text-sm font-bold">リセットメールを送信</button>
            </div>
            <p class="text-center text-sm text-gray-500 mt-4">
              <a href="/login" class="text-brand-600 hover:underline">ログインに戻る</a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
})

export default app
