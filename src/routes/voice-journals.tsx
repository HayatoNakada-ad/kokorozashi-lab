import { Hono } from 'hono'
import { Layout } from '../components/Layout'
import {
  dummyVoiceJournals, dummySongs, currentUser, dummyNotifications,
  formatRelativeDate, formatDuration, reactionLabels, getVoiceJournalById,
  getCommentsForTarget, formatDate
} from '../data/dummy'

const app = new Hono()

// Voice Journal List
app.get('/', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length
  const tag = c.req.query('tag')
  const filtered = tag
    ? dummyVoiceJournals.filter(vj => vj.tags?.includes(tag))
    : dummyVoiceJournals

  return c.html(
    <Layout title="ボイスジャーナル一覧" currentUser={currentUser} unreadNotifications={unread}>
      <div class="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">
              <i class="fas fa-microphone mr-2 text-brand-500"></i>ボイスジャーナル
            </h1>
            {tag && (
              <p class="text-sm text-gray-500 mt-1">#{tag} の投稿</p>
            )}
          </div>
          <a href="/voice-journal/create" class="btn-primary px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2">
            <i class="fas fa-microphone text-xs"></i>投稿する
          </a>
        </div>

        {/* Filter Tags */}
        <div class="flex gap-2 overflow-x-auto pb-2 mb-6">
          {['日常', '気づき', '志', '音楽', '教育', '保育', '地域', '学び'].map(t => (
            <a
              href={`/voice-journals?tag=${t}`}
              class={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${tag === t ? 'bg-brand-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300'}`}
            >
              #{t}
            </a>
          ))}
        </div>

        {/* List */}
        <div class="space-y-4">
          {filtered.map(vj => (
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover audio-card">
              <div class="p-5">
                <div class="flex items-start gap-3">
                  <a href={`/user/${vj.user?.username}`} class="flex-shrink-0">
                    <img src={vj.user?.avatar_url} alt={vj.user?.display_name} class="w-11 h-11 rounded-full" />
                  </a>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-0.5">
                      <a href={`/user/${vj.user?.username}`} class="text-sm font-semibold text-gray-800 hover:text-brand-600">
                        {vj.user?.display_name}
                      </a>
                      <span class="text-xs text-gray-400">{formatRelativeDate(vj.created_at)}</span>
                    </div>
                    <a href={`/voice-journal/${vj.id}`}>
                      <h2 class="font-bold text-gray-800 hover:text-brand-600 text-base mb-2 line-clamp-2">{vj.title}</h2>
                    </a>
                    <p class="text-sm text-gray-500 line-clamp-2 mb-3">{vj.description}</p>

                    {/* Audio Player */}
                    <div class="bg-brand-50 rounded-xl p-3">
                      <div class="flex items-center gap-3">
                        <button
                          id={`play-btn-${vj.id}`}
                          class="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm flex-shrink-0"
                          style="background: linear-gradient(135deg, #d4821e, #e86c28)"
                          onclick={`initAudioPlayer('${vj.id}', '')`}
                        >
                          <i class="fas fa-play text-sm"></i>
                        </button>
                        <div class="flex-1">
                          <div class="bg-white/60 rounded-full h-1.5 cursor-pointer">
                            <div id={`progress-${vj.id}`} class="audio-player-bar h-1.5 rounded-full" style="width:0%"></div>
                          </div>
                          <div class="flex justify-between text-xs text-gray-400 mt-1.5">
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
                      <div class="flex flex-wrap gap-1.5 mt-3">
                        {vj.tags.map(t => (
                          <a href={`/voice-journals?tag=${t}`} class="tag-badge text-xs px-2 py-0.5 rounded-full">
                            #{t}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div class="flex items-center justify-between mt-3">
                      <div class="flex items-center gap-1 flex-wrap">
                        {Object.entries(reactionLabels).map(([type, info]) => (
                          <button
                            onclick={`toggleReaction(this, '${type}')`}
                            class="reaction-btn flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600 bg-gray-50 hover:bg-brand-50 px-2 py-1 rounded-full border border-gray-100"
                          >
                            <span>{info.emoji}</span>
                            <span class="reaction-count">{vj.reactions_count?.[type as keyof typeof vj.reactions_count] || 0}</span>
                          </button>
                        ))}
                      </div>
                      <a href={`/voice-journal/${vj.id}`} class="text-xs text-gray-400 hover:text-brand-600 flex items-center gap-1">
                        <i class="far fa-comment"></i>{vj.comments_count}件
                      </a>
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
            <p class="text-sm mb-6">最初のボイスジャーナルを投稿してみましょう</p>
            <a href="/voice-journal/create" class="btn-primary px-8 py-3 rounded-full text-sm font-medium inline-block">
              投稿する
            </a>
          </div>
        )}
      </div>
    </Layout>
  )
})

// Voice Journal Detail
app.get('/detail/:id', (c) => {
  const id = c.req.param('id')
  const vj = getVoiceJournalById(id)
  const unread = dummyNotifications.filter(n => !n.is_read).length

  if (!vj) {
    return c.html(
      <Layout title="見つかりません" currentUser={currentUser} unreadNotifications={unread}>
        <div class="max-w-2xl mx-auto px-4 py-16 text-center">
          <i class="fas fa-microphone text-6xl text-gray-200 mb-4 block"></i>
          <h1 class="text-2xl font-bold text-gray-700 mb-2">投稿が見つかりません</h1>
          <a href="/voice-journals" class="btn-primary px-6 py-2.5 rounded-full text-sm font-medium inline-block mt-4">
            一覧に戻る
          </a>
        </div>
      </Layout>
    )
  }

  const comments = getCommentsForTarget('voice_journal', id)

  return c.html(
    <Layout title={vj.title} currentUser={currentUser} unreadNotifications={unread}>
      <div class="max-w-3xl mx-auto px-4 py-8">
        {/* Back */}
        <a href="/voice-journals" class="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-6">
          <i class="fas fa-arrow-left"></i>ボイスジャーナル一覧
        </a>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 md:p-8">
            {/* Author */}
            <div class="flex items-center gap-3 mb-5">
              <a href={`/user/${vj.user?.username}`}>
                <img src={vj.user?.avatar_url} alt={vj.user?.display_name} class="w-12 h-12 rounded-full" />
              </a>
              <div>
                <a href={`/user/${vj.user?.username}`} class="font-bold text-gray-800 hover:text-brand-600">
                  {vj.user?.display_name}
                </a>
                <p class="text-xs text-gray-400">@{vj.user?.username} · {formatDate(vj.created_at)}</p>
              </div>
              <button
                onclick={`toggleFollow(this, '${vj.user?.username}')`}
                data-following="false"
                class="btn-primary ml-auto px-4 py-1.5 rounded-full text-sm font-medium"
              >
                フォロー
              </button>
            </div>

            {/* Title */}
            <h1 class="text-2xl font-bold text-gray-800 mb-3">{vj.title}</h1>

            {/* Audio Player */}
            <div class="bg-brand-50 rounded-2xl p-5 mb-5 audio-card">
              <div class="flex items-center gap-4">
                <button
                  id={`play-btn-${vj.id}`}
                  class="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0"
                  style="background: linear-gradient(135deg, #d4821e, #e86c28)"
                  onclick={`initAudioPlayer('${vj.id}', '')`}
                >
                  <i class="fas fa-play text-lg"></i>
                </button>
                <div class="flex-1">
                  <div class="bg-white/60 rounded-full h-2 cursor-pointer mb-2">
                    <div id={`progress-${vj.id}`} class="audio-player-bar h-2 rounded-full" style="width:0%"></div>
                  </div>
                  <div class="flex justify-between text-sm text-gray-500">
                    <span id={`current-time-${vj.id}`}>0:00</span>
                    <div class="wave-animation">
                      <span></span><span></span><span></span><span></span><span></span>
                    </div>
                    <span id={`duration-${vj.id}`}>{formatDuration(vj.duration_seconds)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <p class="text-gray-700 leading-relaxed mb-4">{vj.description}</p>

            {/* Tags */}
            {vj.tags && vj.tags.length > 0 && (
              <div class="flex flex-wrap gap-2 mb-6">
                {vj.tags.map(t => (
                  <a href={`/voice-journals?tag=${t}`} class="tag-badge text-sm px-3 py-1 rounded-full">
                    #{t}
                  </a>
                ))}
              </div>
            )}

            {/* Reactions */}
            <div class="border-t border-gray-100 pt-5 mb-6">
              <h3 class="text-sm font-semibold text-gray-600 mb-3">リアクション</h3>
              <div class="flex flex-wrap gap-2">
                {Object.entries(reactionLabels).map(([type, info]) => (
                  <button
                    onclick={`toggleReaction(this, '${type}')`}
                    class="reaction-btn flex items-center gap-2 text-sm text-gray-600 hover:text-brand-600 bg-gray-50 hover:bg-brand-50 px-4 py-2 rounded-full border border-gray-200 hover:border-brand-300 font-medium"
                  >
                    <span class="text-lg">{info.emoji}</span>
                    <span>{info.label}</span>
                    <span class="reaction-count text-gray-400 text-xs ml-1">
                      {vj.reactions_count?.[type as keyof typeof vj.reactions_count] || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Share */}
            <div class="border-t border-gray-100 pt-4 mb-6">
              <h3 class="text-sm font-semibold text-gray-600 mb-3">シェア</h3>
              <div class="flex gap-2">
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(vj.title)}&url=${encodeURIComponent(`https://kokorozashi-lab.com/voice-journal/${vj.id}`)}`} target="_blank" class="flex items-center gap-2 text-sm bg-sky-50 text-sky-500 hover:bg-sky-100 px-4 py-2 rounded-full border border-sky-200">
                  <i class="fab fa-twitter"></i>X (Twitter)
                </a>
                <button onclick="copyLink()" class="flex items-center gap-2 text-sm bg-gray-50 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
                  <i class="fas fa-link"></i>リンクをコピー
                </button>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div class="border-t border-gray-100 bg-gray-50 p-6 md:p-8">
            <h3 class="font-bold text-gray-800 mb-5">
              <i class="far fa-comment mr-2 text-brand-500"></i>コメント ({comments.length}件)
            </h3>

            {/* Comment Form */}
            <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <div class="flex gap-3">
                <img src={currentUser.avatar_url} alt="" class="w-9 h-9 rounded-full flex-shrink-0" />
                <div class="flex-1">
                  <textarea
                    placeholder="コメントを入力..."
                    rows={3}
                    class="w-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none resize-none"
                  ></textarea>
                  <div class="flex justify-end mt-2">
                    <button class="btn-primary px-5 py-2 rounded-full text-sm font-medium">
                      コメントする
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comment List */}
            <div class="space-y-4">
              {comments.map(comment => (
                <div class="flex gap-3">
                  <a href={`/user/${comment.user?.username}`} class="flex-shrink-0">
                    <img src={comment.user?.avatar_url} alt={comment.user?.display_name} class="w-9 h-9 rounded-full" />
                  </a>
                  <div class="flex-1 bg-white rounded-xl border border-gray-100 p-3">
                    <div class="flex items-center gap-2 mb-1">
                      <a href={`/user/${comment.user?.username}`} class="text-sm font-semibold text-gray-800 hover:text-brand-600">
                        {comment.user?.display_name}
                      </a>
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

      <script dangerouslySetInnerHTML={{ __html: `
        function copyLink() {
          navigator.clipboard.writeText(window.location.href).then(() => {
            alert('リンクをコピーしました');
          });
        }
      `}} />
    </Layout>
  )
})

// Voice Journal Create
app.get('/create', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length

  return c.html(
    <Layout title="ボイスジャーナルを作る" currentUser={currentUser} unreadNotifications={unread}>
      <div class="max-w-2xl mx-auto px-4 py-8">
        {/* Progress */}
        <div class="flex items-center gap-2 mb-8">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style="background: #d4821e">1</div>
            <span class="text-sm font-semibold text-brand-600">録音</span>
          </div>
          <div class="flex-1 h-0.5 bg-gray-200"></div>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-gray-200 text-gray-500">2</div>
            <span class="text-sm text-gray-400">設定</span>
          </div>
          <div class="flex-1 h-0.5 bg-gray-200"></div>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-gray-200 text-gray-500">3</div>
            <span class="text-sm text-gray-400">完了</span>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 md:p-8">
            <h1 class="text-xl font-bold text-gray-800 mb-2">ボイスジャーナルを録音</h1>
            <p class="text-sm text-gray-500 mb-8">最大2分間、声で日記を投稿できます</p>

            {/* Recorder */}
            <div class="bg-brand-50 rounded-2xl p-8 text-center mb-6" id="recorderArea">
              {/* Status */}
              <div id="recorderStatus" class="mb-6">
                <div class="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4" style="background: linear-gradient(135deg, #faefd8, #f4daa9)" id="recordBtn">
                  <button
                    onclick="startRecording()"
                    class="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg"
                    style="background: linear-gradient(135deg, #d4821e, #e86c28)"
                    id="mainRecordBtn"
                  >
                    <i class="fas fa-microphone text-3xl"></i>
                  </button>
                </div>
                <p class="text-sm text-gray-500">タップして録音開始</p>
              </div>

              {/* Timer */}
              <div id="timerDisplay" class="hidden mb-4">
                <div class="text-4xl font-bold text-brand-600 mb-1" id="timerText">0:00</div>
                <div class="text-sm text-gray-500">残り <span id="remainingTime">2:00</span></div>
                <div class="mt-3 bg-white/60 rounded-full h-2 w-full max-w-xs mx-auto">
                  <div id="timerProgress" class="audio-player-bar h-2 rounded-full" style="width:0%"></div>
                </div>
              </div>

              {/* Controls */}
              <div id="recordingControls" class="hidden flex justify-center gap-3 mt-4">
                <button onclick="pauseRecording()" class="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full text-sm font-medium text-gray-700 border border-gray-200 shadow-sm">
                  <i class="fas fa-pause"></i>一時停止
                </button>
                <button onclick="stopRecording()" class="flex items-center gap-2 text-white px-5 py-2.5 rounded-full text-sm font-medium" style="background: #ef4444">
                  <i class="fas fa-stop"></i>録音完了
                </button>
              </div>

              {/* Recorded Preview */}
              <div id="recordedPreview" class="hidden">
                <div class="bg-white rounded-xl p-4 mb-4 text-left">
                  <p class="text-sm font-semibold text-gray-700 mb-2">録音完了！</p>
                  <div class="flex items-center gap-3">
                    <button
                      id="play-btn-preview"
                      onclick="playPreview()"
                      class="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style="background: linear-gradient(135deg, #d4821e, #e86c28)"
                    >
                      <i class="fas fa-play text-sm"></i>
                    </button>
                    <div class="flex-1">
                      <div class="bg-gray-100 rounded-full h-1.5">
                        <div class="audio-player-bar h-1.5 rounded-full" id="previewProgress" style="width:0%"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex justify-center gap-3">
                  <button onclick="reRecord()" class="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full text-sm font-medium text-gray-700 border border-gray-200">
                    <i class="fas fa-redo"></i>録り直す
                  </button>
                  <button onclick="proceedToSettings()" class="flex items-center gap-2 text-white px-5 py-2.5 rounded-full text-sm font-medium btn-primary">
                    次へ進む <i class="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Upload Option */}
            <div class="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-brand-300 transition-colors cursor-pointer" onclick="document.getElementById('fileInput').click()">
              <i class="fas fa-upload text-2xl text-gray-300 mb-2 block"></i>
              <p class="text-sm font-medium text-gray-600">音声ファイルをアップロード</p>
              <p class="text-xs text-gray-400 mt-1">MP3, WAV, M4A対応 (最大50MB)</p>
              <input type="file" id="fileInput" accept="audio/*" class="hidden" onchange="handleFileUpload(event)" />
            </div>
          </div>
        </div>

        {/* Settings Form (initially hidden) */}
        <div id="settingsForm" class="hidden mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 md:p-8">
            <h2 class="text-xl font-bold text-gray-800 mb-6">投稿設定</h2>

            <div class="space-y-5">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">タイトル <span class="text-red-500">*</span></label>
                <input
                  type="text"
                  id="vjTitle"
                  placeholder="今日の気持ちや出来事"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent text-sm"
                  maxlength={100}
                />
                <p class="text-xs text-gray-400 mt-1 text-right"><span id="titleCount">0</span>/100</p>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">説明・本文</label>
                <textarea
                  id="vjDescription"
                  placeholder="声日記の補足や感想を書いてみましょう"
                  rows={4}
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent text-sm resize-none"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">ハッシュタグ</label>
                <input
                  type="text"
                  id="vjTags"
                  placeholder="#日常 #気づき (スペースで区切って入力)"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">公開範囲</label>
                <div class="space-y-2">
                  {[
                    { value: 'public', label: '全体公開', desc: 'すべてのユーザーが閲覧できます', icon: 'fa-globe' },
                    { value: 'followers_only', label: 'フォロワー限定', desc: 'フォロワーのみ閲覧できます', icon: 'fa-user-friends' },
                    { value: 'draft', label: '下書き', desc: '自分のみ閲覧できます', icon: 'fa-lock' },
                  ].map(opt => (
                    <label class="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-colors has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50">
                      <input type="radio" name="visibility" value={opt.value} class="text-brand-500" checked={opt.value === 'public'} />
                      <i class={`fas ${opt.icon} text-brand-500 w-5 text-center`}></i>
                      <div>
                        <p class="text-sm font-semibold text-gray-700">{opt.label}</p>
                        <p class="text-xs text-gray-400">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div class="flex gap-3 pt-2">
                <button onclick="saveDraft()" class="flex-1 btn-outline py-3 rounded-xl text-sm font-medium">
                  <i class="fas fa-save mr-2"></i>下書き保存
                </button>
                <button onclick="submitPost()" class="flex-1 btn-primary py-3 rounded-xl text-sm font-medium">
                  <i class="fas fa-paper-plane mr-2"></i>投稿する
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        let mediaRecorder = null;
        let chunks = [];
        let recordingInterval = null;
        let elapsedSeconds = 0;
        const MAX_SECONDS = 120;

        async function startRecording() {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            chunks = [];
            
            mediaRecorder.ondataavailable = e => chunks.push(e.data);
            mediaRecorder.onstop = () => {
              showPreview();
            };
            
            mediaRecorder.start(100);
            
            document.getElementById('recorderStatus').classList.add('hidden');
            document.getElementById('timerDisplay').classList.remove('hidden');
            document.getElementById('recordingControls').classList.remove('hidden');
            document.getElementById('recordingControls').classList.add('flex');
            document.getElementById('mainRecordBtn').style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            document.getElementById('mainRecordBtn').innerHTML = '<i class="fas fa-stop text-3xl"></i>';
            document.getElementById('mainRecordBtn').onclick = stopRecording;
            
            startTimer();
          } catch (err) {
            alert('マイクへのアクセスを許可してください');
          }
        }

        function startTimer() {
          elapsedSeconds = 0;
          recordingInterval = setInterval(() => {
            elapsedSeconds++;
            updateTimer();
            if (elapsedSeconds >= MAX_SECONDS) {
              stopRecording();
            }
          }, 1000);
        }

        function updateTimer() {
          const mins = Math.floor(elapsedSeconds / 60);
          const secs = elapsedSeconds % 60;
          document.getElementById('timerText').textContent = mins + ':' + secs.toString().padStart(2, '0');
          
          const remaining = MAX_SECONDS - elapsedSeconds;
          const rm = Math.floor(remaining / 60);
          const rs = remaining % 60;
          document.getElementById('remainingTime').textContent = rm + ':' + rs.toString().padStart(2, '0');
          document.getElementById('timerProgress').style.width = (elapsedSeconds / MAX_SECONDS * 100) + '%';
        }

        function pauseRecording() {
          if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.pause();
            clearInterval(recordingInterval);
          } else if (mediaRecorder && mediaRecorder.state === 'paused') {
            mediaRecorder.resume();
            startTimer();
          }
        }

        function stopRecording() {
          if (recordingInterval) clearInterval(recordingInterval);
          if (mediaRecorder) {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(t => t.stop());
          }
        }

        function showPreview() {
          document.getElementById('timerDisplay').classList.add('hidden');
          document.getElementById('recordingControls').classList.add('hidden');
          document.getElementById('recordedPreview').classList.remove('hidden');
        }

        function reRecord() {
          document.getElementById('recordedPreview').classList.add('hidden');
          document.getElementById('recorderStatus').classList.remove('hidden');
          document.getElementById('timerDisplay').classList.add('hidden');
        }

        function playPreview() {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          
          const btn = document.getElementById('play-btn-preview');
          audio.play();
          btn.innerHTML = '<i class="fas fa-pause text-sm"></i>';
          
          let time = 0;
          const dur = elapsedSeconds;
          const progInterval = setInterval(() => {
            time++;
            document.getElementById('previewProgress').style.width = (time / dur * 100) + '%';
            if (time >= dur) clearInterval(progInterval);
          }, 1000);
          
          audio.onended = () => {
            btn.innerHTML = '<i class="fas fa-play text-sm"></i>';
          };
          
          btn.onclick = () => {
            if (!audio.paused) {
              audio.pause();
              btn.innerHTML = '<i class="fas fa-play text-sm"></i>';
            } else {
              audio.play();
              btn.innerHTML = '<i class="fas fa-pause text-sm"></i>';
            }
          };
        }

        function proceedToSettings() {
          document.getElementById('settingsForm').classList.remove('hidden');
          document.getElementById('settingsForm').scrollIntoView({ behavior: 'smooth' });
        }

        function handleFileUpload(event) {
          const file = event.target.files[0];
          if (file) {
            showPreview();
          }
        }

        function saveDraft() {
          alert('下書きに保存しました');
          window.location.href = '/mypage/drafts';
        }

        function submitPost() {
          const title = document.getElementById('vjTitle').value;
          if (!title.trim()) {
            alert('タイトルを入力してください');
            return;
          }
          window.location.href = '/voice-journal/create/complete';
        }

        // Title counter
        document.getElementById('vjTitle')?.addEventListener('input', function() {
          document.getElementById('titleCount').textContent = this.value.length;
        });
      `}} />
    </Layout>
  )
})

// Complete page
app.get('/create/complete', (c) => {
  const unread = dummyNotifications.filter(n => !n.is_read).length

  return c.html(
    <Layout title="投稿完了" currentUser={currentUser} unreadNotifications={unread}>
      <div class="max-w-lg mx-auto px-4 py-16 text-center">
        <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style="background: linear-gradient(135deg, #d4821e, #e86c28)">
          <i class="fas fa-check text-white text-3xl"></i>
        </div>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">投稿しました！</h1>
        <p class="text-gray-500 mb-8">あなたの声が届きました。ありがとうございます 🎉</p>

        <div class="flex flex-col gap-3">
          <a href="/voice-journals" class="btn-primary py-3 rounded-xl font-medium">
            <i class="fas fa-list mr-2"></i>投稿一覧を見る
          </a>
          <a href="/mypage" class="btn-outline py-3 rounded-xl font-medium">
            <i class="fas fa-home mr-2"></i>マイページへ
          </a>
          <a href="/voice-journal/create" class="text-sm text-brand-600 hover:underline mt-2">
            続けて投稿する
          </a>
        </div>
      </div>
    </Layout>
  )
})

export default app
