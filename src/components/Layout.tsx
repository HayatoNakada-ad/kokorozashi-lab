import type { FC } from 'hono/jsx'
import { dummyNotifications } from '../data/dummy'

export const Layout: FC<{ children?: any; title?: string; description?: string; currentUser?: any; unreadNotifications?: number; notifications?: any[] }> = ({
  children,
  title = 'ココロザシラボ',
  description = '声と歌で想いを発信するコミュニティサイト',
  currentUser,
  unreadNotifications = 0,
  notifications,
}) => {
  // notificationsが渡されない場合はdummyを使用（SSRでpropの配列渡しに問題があるため）
  const notifData = (notifications && notifications.length > 0) ? notifications : dummyNotifications
  const isLoggedIn = !!currentUser

  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title} | ココロザシラボ</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/static/favicon.svg" type="image/svg+xml" />
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="/static/styles.css" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  brand: {
                    50: '#eef5fc',
                    100: '#d5e8f7',
                    200: '#acd1ef',
                    300: '#74b2e3',
                    400: '#4896d6',
                    500: '#3085c7',
                    600: '#2469a3',
                    700: '#1e5282',
                    800: '#1a4167',
                    900: '#163654',
                  },
                  warm: {
                    50: '#fef8ec',
                    100: '#fdefd0',
                    200: '#fbdda0',
                    300: '#f8c464',
                    400: '#f4a92e',
                    500: '#eba528',
                    600: '#cc8a1a',
                    700: '#a86d14',
                    800: '#875615',
                    900: '#6e4714',
                  }
                },
                fontFamily: {
                  sans: ['Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Meiryo', 'sans-serif'],
                }
              }
            }
          }
        `}} />
        <style dangerouslySetInnerHTML={{ __html: `
          body { font-family: 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; }
          .logo-text { 
            color: #3085c7;
          }
          .btn-primary {
            background: #3085c7;
            color: white;
            transition: all 0.2s;
          }
          .btn-primary:hover {
            background: #2469a3;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(48,133,199,0.3);
          }
          .btn-outline {
            border: 2px solid #3085c7;
            color: #3085c7;
            transition: all 0.2s;
          }
          .btn-outline:hover {
            background: #3085c7;
            color: white;
          }
          .card-hover {
            transition: all 0.2s;
          }
          .card-hover:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          }
          .audio-player-bar {
            background: #3085c7;
            height: 4px;
            border-radius: 2px;
          }
          .tag-badge {
            background: #eef5fc;
            color: #2469a3;
            border: 1px solid #acd1ef;
          }
          /* ── セクション見出し（ジャンプ率強調）── */
          .section-heading {
            font-size: 1.4rem !important;
            font-weight: 900 !important;
            color: #0f172a !important;
            letter-spacing: -0.03em !important;
            line-height: 1.15 !important;
          }
          .section-heading-sub {
            font-size: 0.7rem !important;
            font-weight: 500 !important;
            color: #94a3b8 !important;
            letter-spacing: 0.08em !important;
            text-transform: uppercase !important;
            margin-bottom: 0.2rem !important;
          }
          .reaction-btn {
            transition: all 0.15s;
          }
          .reaction-btn:hover {
            transform: scale(1.1);
          }
          .dropdown-menu {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            z-index: 100;
          }
          .dropdown:hover .dropdown-menu,
          .dropdown.active .dropdown-menu {
            display: block;
          }
          .search-overlay {
            display: none;
          }
          .search-overlay.active {
            display: flex;
          }
          @media (max-width: 768px) {
            .mobile-hidden { display: none; }
            .mobile-menu { display: block; }
          }
          @media (min-width: 769px) {
            .mobile-menu { display: none; }
          }
          .wave-animation {
            display: inline-flex;
            gap: 2px;
            align-items: center;
          }
          .wave-animation span {
            display: inline-block;
            width: 3px;
            height: 12px;
            background: #3085c7;
            border-radius: 2px;
            animation: wave 1s ease-in-out infinite;
          }
          .wave-animation span:nth-child(2) { animation-delay: 0.1s; }
          .wave-animation span:nth-child(3) { animation-delay: 0.2s; }
          .wave-animation span:nth-child(4) { animation-delay: 0.3s; }
          .wave-animation span:nth-child(5) { animation-delay: 0.4s; }
          @keyframes wave {
            0%, 100% { height: 6px; }
            50% { height: 16px; }
          }
          .playing .wave-animation span { animation-play-state: running; }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}} />
      </head>
      <body class="bg-gray-50 min-h-screen flex flex-col">
        {/* Header */}
        <header class="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
          <div class="max-w-7xl mx-auto px-4">
            <div class="flex items-center justify-between h-16">
              {/* Logo */}
              <a href="/" class="flex items-center gap-2 flex-shrink-0">
                <div class="w-8 h-8 rounded-full flex items-center justify-center" style="background: #3085c7">
                  <i class="fas fa-microphone text-white text-sm"></i>
                </div>
                <span class="logo-text text-xl font-bold tracking-tight">ココロザシラボ</span>
              </a>

              {/* Desktop Nav */}
              <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                <a href="/about" class="hover:text-brand-600 transition-colors">初めての方へ</a>

                {/* ココロザシソング リンク */}
                <a href="/songs/about" class="hover:text-brand-600 transition-colors">ココロザシソング</a>

                <a href="/columns" class="hover:text-brand-600 transition-colors">コラム</a>
              </nav>

              {/* Search */}
              <div class="flex-1 max-w-xs mx-4 hidden md:block">
                <div class="relative">
                  <input
                    type="text"
                    placeholder="ユーザー、投稿を検索"
                    class="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:bg-white transition-all"
                    onkeydown="if(event.key==='Enter'){window.location='/search?q='+this.value}"
                  />
                  <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                </div>
              </div>

              {/* Right Actions */}
              <div class="flex items-center gap-3">
                {/* Create VJ Button */}
                <a
                  href={isLoggedIn ? '/voice-journal/create' : '/login'}
                  class="btn-primary hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                >
                  <i class="fas fa-microphone text-xs"></i>
                  <span class="hidden lg:inline">ボイスジャーナルを作る</span>
                  <span class="lg:hidden">録音</span>
                </a>

                {isLoggedIn ? (
                  <>
                    {/* Notification - YouTube風フローティングパネル */}
                    <div class="relative" id="notifDropdown">
                      <button
                        onclick="toggleNotifPanel()"
                        class="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center w-10 h-10"
                        aria-label="通知"
                      >
                        <i class="fas fa-bell text-xl"></i>
                        {unreadNotifications > 0 && (
                          <span class="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                            {unreadNotifications > 99 ? '99+' : unreadNotifications}
                          </span>
                        )}
                      </button>

                      {/* フローティング通知パネル - JS動的レンダリング */}
                      <div
                        id="notifPanel"
                        class="hidden absolute right-0 top-12 w-[360px] max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                        style="max-height: 480px;"
                      >
                        {/* パネルヘッダー */}
                        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
                          <h3 class="font-bold text-gray-900 text-base">通知</h3>
                          <a href="/mypage/notifications" class="text-xs text-brand-600 hover:underline font-medium">すべて見る</a>
                        </div>
                          {/* 通知リストをSSRで直接描画 */}
                        <div id="notifList" class="overflow-y-auto" style="max-height: 400px;">
                          {notifData && notifData.length > 0 ? (
                            <>
                              {notifData.slice(0, 10).map((n: any) => {
                                const bgMap: Record<string, string> = { reaction: '#fee2e2', comment: '#dbeafe', follow: '#dcfce7' }
                                const iconMap: Record<string, string> = { reaction: 'fa-heart', comment: 'fa-comment', follow: 'fa-user-plus' }
                                const colorMap: Record<string, string> = { reaction: '#ef4444', comment: '#3b82f6', follow: '#22c55e' }
                                const bg = bgMap[n.type] || '#f3f4f6'
                                const icon = iconMap[n.type] || 'fa-bell'
                                const color = colorMap[n.type] || '#6b7280'
                                const dateStr = n.created_at ? new Date(n.created_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }) : ''
                                return (
                                  <a
                                    href={n.link || '/mypage/notifications'}
                                    onclick="closeNotifPanel()"
                                    style={`display:flex;align-items:flex-start;gap:12px;padding:12px 16px;border-bottom:1px solid #f9fafb;text-decoration:none;${!n.is_read ? 'background:#eef5fc;' : ''}`}
                                  >
                                    <div style="position:relative;flex-shrink:0">
                                      <div style={`width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${bg}`}>
                                        <i class={`fas ${icon} text-sm`} style={`color:${color}`}></i>
                                      </div>
                                      {!n.is_read && (
                                        <span style="position:absolute;left:-4px;top:50%;transform:translateY(-50%);width:8px;height:8px;background:#3085c7;border-radius:50%;display:block"></span>
                                      )}
                                    </div>
                                    <div style="flex:1;min-width:0">
                                      <p style={`font-size:14px;line-height:1.4;color:${!n.is_read ? '#0f172a' : '#374151'};font-weight:${!n.is_read ? '600' : '400'};margin:0 0 2px`}>{n.message}</p>
                                      <p style="font-size:12px;color:#9ca3af;margin:0">{dateStr}</p>
                                    </div>
                                  </a>
                                )
                              })}
                            </>
                          ) : (
                            <div class="py-12 text-center text-gray-400">
                              <i class="fas fa-bell text-3xl mb-3 block opacity-30"></i>
                              <p class="text-sm">通知はありません</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* User Menu */}
                    <div class="dropdown relative" id="userDropdown">
                      <button onclick="toggleDropdown('userDropdown')" class="flex items-center gap-2">
                        <img
                          src={currentUser.avatar_url}
                          alt={currentUser.display_name}
                          class="w-8 h-8 rounded-full object-cover border-2 border-brand-200"
                        />
                      </button>
                      <div class="dropdown-menu right-0 left-auto bg-white rounded-xl shadow-lg border border-gray-100 w-52 py-2">
                        <div class="px-4 py-2 border-b border-gray-100 mb-1">
                          <p class="font-semibold text-sm text-gray-800">{currentUser.display_name}</p>
                          <p class="text-xs text-gray-500">@{currentUser.username}</p>
                        </div>
                        <a href="/mypage" class="block px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                          <i class="fas fa-home mr-2 text-gray-400"></i>マイページ
                        </a>
                        <a href={`/user/${currentUser.username}`} class="block px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                          <i class="fas fa-user mr-2 text-gray-400"></i>プロフィール
                        </a>
                        <a href="/mypage/posts/voice-journals" class="block px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                          <i class="fas fa-microphone mr-2 text-gray-400"></i>ボイスジャーナル
                        </a>
                        <a href="/mypage/drafts" class="block px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                          <i class="fas fa-file-alt mr-2 text-gray-400"></i>下書き
                        </a>
                        <a href="/mypage/edit" class="block px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                          <i class="fas fa-cog mr-2 text-gray-400"></i>設定
                        </a>
                        <div class="border-t border-gray-100 mt-1 pt-1">
                          <a href="/logout" class="block px-4 py-2 hover:bg-gray-50 text-sm text-red-500">
                            <i class="fas fa-sign-out-alt mr-2"></i>ログアウト
                          </a>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <a href="/login" class="btn-outline px-4 py-2 rounded-full text-sm font-medium">
                    ログイン
                  </a>
                )}

                {/* Mobile Menu */}
                <button onclick="toggleMobileMenu()" class="md:hidden p-2 text-gray-500">
                  <i class="fas fa-bars text-lg"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <div id="mobileMenu" class="hidden md:hidden border-t border-gray-100 bg-white">
            <div class="px-4 py-3 space-y-2">
              <div class="relative mb-3">
                <input
                  type="text"
                  placeholder="検索"
                  class="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-brand-300"
                  onkeydown="if(event.key==='Enter'){window.location='/search?q='+this.value}"
                />
                <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              </div>
              <a href="/about" class="block py-2 text-sm text-gray-700 hover:text-brand-600">初めての方へ</a>
              <a href="/songs/about" class="block py-2 text-sm text-gray-700 hover:text-brand-600">ココロザシソング</a>
              <a href="/columns" class="block py-2 text-sm text-gray-700 hover:text-brand-600">コラム</a>
              <a href="/voice-journal/create" class="block btn-primary text-center py-2 rounded-full text-sm font-medium mt-2">
                <i class="fas fa-microphone mr-2"></i>ボイスジャーナルを作る
              </a>
            </div>
          </div>
        </header>

        {/* Main */}
        <main class="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer class="bg-gray-900 text-gray-400 mt-16">
          <div class="max-w-7xl mx-auto px-4 py-12">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div class="md:col-span-2">
                <div class="flex items-center gap-2 mb-4">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center" style="background: #3085c7">
                    <i class="fas fa-microphone text-white text-sm"></i>
                  </div>
                  <span class="text-white text-lg font-bold">ココロザシラボ</span>
                </div>
                <p class="text-sm leading-relaxed">
                  声と歌で想いを発信するコミュニティサイト。<br />
                  あなたの志を、声に、歌に。
                </p>
                <div class="flex gap-3 mt-4">
                  <a href="#" class="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-brand-600 transition-colors">
                    <i class="fab fa-twitter text-sm"></i>
                  </a>
                  <a href="#" class="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-brand-600 transition-colors">
                    <i class="fab fa-instagram text-sm"></i>
                  </a>
                  <a href="#" class="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-brand-600 transition-colors">
                    <i class="fab fa-youtube text-sm"></i>
                  </a>
                </div>
              </div>
              <div>
                <h4 class="text-white font-semibold mb-3 text-sm">サービス</h4>
                <ul class="space-y-2 text-sm">
                  <li><a href="/about" class="hover:text-white transition-colors">初めての方へ</a></li>
                  <li><a href="/voice-journals" class="hover:text-white transition-colors">ボイスジャーナル</a></li>
                  <li><a href="/songs/about" class="hover:text-white transition-colors">ココロザシソング</a></li>
                  <li><a href="/columns" class="hover:text-white transition-colors">コラム</a></li>
                  <li><a href="/news" class="hover:text-white transition-colors">お知らせ</a></li>
                </ul>
              </div>
              <div>
                <h4 class="text-white font-semibold mb-3 text-sm">サポート</h4>
                <ul class="space-y-2 text-sm">
                  <li><a href="/terms" class="hover:text-white transition-colors">利用規約</a></li>
                  <li><a href="/privacy" class="hover:text-white transition-colors">プライバシーポリシー</a></li>
                  <li><a href="/law" class="hover:text-white transition-colors">特定商取引法に基づく表記</a></li>
                  <li><a href="/contact" class="hover:text-white transition-colors">お問い合わせ</a></li>
                </ul>
              </div>
            </div>
            <div class="border-t border-gray-700 pt-6 text-xs text-center">
              <p>&copy; 2025 ココロザシラボ. All rights reserved.</p>
            </div>
          </div>
        </footer>

        <script dangerouslySetInnerHTML={{ __html: `
          function toggleDropdown(id) {
            const el = document.getElementById(id);
            el.classList.toggle('active');
            document.querySelectorAll('.dropdown').forEach(d => {
              if (d.id !== id) d.classList.remove('active');
            });
            // 通知パネルを閉じる
            closeNotifPanel();
          }

          function toggleMobileMenu() {
            const menu = document.getElementById('mobileMenu');
            menu.classList.toggle('hidden');
          }

          function toggleNotifPanel() {
            const panel = document.getElementById('notifPanel');
            const isHidden = panel.classList.contains('hidden');
            // 他のドロップダウンを閉じる
            document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
            if (isHidden) {
              panel.classList.remove('hidden');
            } else {
              panel.classList.add('hidden');
            }
          }

          function closeNotifPanel() {
            const panel = document.getElementById('notifPanel');
            if (panel) panel.classList.add('hidden');
          }

          document.addEventListener('click', function(e) {
            if (!e.target.closest('.dropdown')) {
              document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
            }
            // 通知パネル外クリックで閉じる
            if (!e.target.closest('#notifDropdown')) {
              closeNotifPanel();
            }
          });

          // Audio player functionality
          function initAudioPlayer(playerId, audioUrl) {
            const btn = document.getElementById('play-btn-' + playerId);
            const progress = document.getElementById('progress-' + playerId);
            const currentTime = document.getElementById('current-time-' + playerId);
            const duration = document.getElementById('duration-' + playerId);
            
            if (!btn) return;
            
            let audio = null;
            let isPlaying = false;
            
            btn.addEventListener('click', function() {
              if (!audio) {
                if (!audioUrl) {
                  // Demo: create a simple oscillator tone
                  simulatePlay(btn, progress, currentTime, playerId);
                  return;
                }
                audio = new Audio(audioUrl);
                audio.addEventListener('timeupdate', function() {
                  const pct = audio.duration ? (audio.currentTime / audio.duration * 100) : 0;
                  if (progress) progress.style.width = pct + '%';
                  if (currentTime) currentTime.textContent = formatTime(audio.currentTime);
                });
                audio.addEventListener('loadedmetadata', function() {
                  if (duration) duration.textContent = formatTime(audio.duration);
                });
                audio.addEventListener('ended', function() {
                  isPlaying = false;
                  btn.innerHTML = '<i class="fas fa-play"></i>';
                  btn.parentElement?.parentElement?.classList.remove('playing');
                  if (progress) progress.style.width = '0%';
                });
              }
              
              if (isPlaying) {
                audio.pause();
                isPlaying = false;
                btn.innerHTML = '<i class="fas fa-play"></i>';
                btn.closest('.audio-card')?.classList.remove('playing');
              } else {
                audio.play();
                isPlaying = true;
                btn.innerHTML = '<i class="fas fa-pause"></i>';
                btn.closest('.audio-card')?.classList.add('playing');
              }
            });
          }

          function simulatePlay(btn, progress, currentTimeEl, id) {
            let time = 0;
            const total = 90;
            btn.innerHTML = '<i class="fas fa-pause"></i>';
            btn.closest('.audio-card')?.classList.add('playing');
            
            const interval = setInterval(function() {
              time++;
              if (progress) progress.style.width = (time / total * 100) + '%';
              if (currentTimeEl) currentTimeEl.textContent = formatTime(time);
              if (time >= total) {
                clearInterval(interval);
                btn.innerHTML = '<i class="fas fa-play"></i>';
                btn.closest('.audio-card')?.classList.remove('playing');
                if (progress) progress.style.width = '0%';
                if (currentTimeEl) currentTimeEl.textContent = '0:00';
              }
            }, 1000);
            
            btn.dataset.interval = interval;
            btn.onclick = function() {
              clearInterval(interval);
              btn.innerHTML = '<i class="fas fa-play"></i>';
              btn.closest('.audio-card')?.classList.remove('playing');
              if (progress) progress.style.width = '0%';
              btn.onclick = null;
            };
          }

          function formatTime(secs) {
            const m = Math.floor(secs / 60);
            const s = Math.floor(secs % 60);
            return m + ':' + s.toString().padStart(2, '0');
          }

          // Reaction toggle
          function toggleReaction(btn, type) {
            btn.classList.toggle('active-reaction');
            const countEl = btn.querySelector('.reaction-count');
            if (countEl) {
              const count = parseInt(countEl.textContent || '0');
              countEl.textContent = btn.classList.contains('active-reaction') ? count + 1 : count - 1;
            }
          }

          // Follow toggle
          function toggleFollow(btn, username) {
            const isFollowing = btn.dataset.following === 'true';
            if (isFollowing) {
              btn.dataset.following = 'false';
              btn.textContent = 'フォロー';
              btn.classList.remove('bg-gray-200', 'text-gray-700');
              btn.classList.add('btn-primary');
            } else {
              btn.dataset.following = 'true';
              btn.textContent = 'フォロー中';
              btn.classList.remove('btn-primary');
              btn.classList.add('bg-gray-200', 'text-gray-700');
            }
          }
        `}} />
      </body>
    </html>
  )
}
