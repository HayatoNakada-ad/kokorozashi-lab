# ここロザシラボ

声と歌で「志」を発信し、同じ想いを持つ人と繋がるコミュニティプラットフォームです。

## プロジェクト概要

- **サービス名**: ここロザシラボ（Kokorozashi Lab）
- **コンセプト**: ユーザーが自分の思いや志を、声や歌で表現し、他ユーザーと交流できるコミュニティサイト
- **技術スタック**: Hono (JSX) + TypeScript + Cloudflare Pages + TailwindCSS

## 実装済み機能（MVP）

### ✅ 完了済み

- **トップページ** (`/`) - バナーカルーセル、フィード、今日のお題、新着一覧
- **ボイスジャーナル**
  - 一覧表示 (`/voice-journals`) - タグフィルター付き
  - 詳細表示 (`/voice-journal/:id`) - 音声プレイヤー、コメント、リアクション
  - 録音・作成 (`/voice-journal/create`) - ブラウザ録音、ファイルアップロード
- **ここロザシソング**
  - 紹介LP (`/songs/about`) - 作例、ユーザーボイス、制作の流れ、プラン
  - 作例一覧 (`/songs/showcase`)
  - 詳細 (`/songs/:id`) - 楽曲プレイヤー、コメント、リアクション
  - 申込フロー (`/songs/order`, `/songs/order/terms`, `/songs/order/complete`)
  - 申込LP (`/songs/create`)
- **ユーザーページ** (`/user/:username`) - プロフィール、投稿一覧、フォロー
- **マイページ**
  - ダッシュボード (`/mypage`)
  - 通知 (`/mypage/notifications`)
  - 投稿一覧 (`/mypage/posts/voice-journals`)
  - 下書き (`/mypage/drafts`)
  - フォロー中 (`/mypage/following`)
  - フォロワー (`/mypage/followers`)
  - プロフィール編集 (`/mypage/edit`)
- **コラム** (`/columns`, `/columns/:slug`)
- **認証** (`/login`, `/signup`, `/signup/terms`, `/signup/complete`, `/password/reset`)
- **静的ページ** (`/about`, `/news`, `/search`, `/terms`, `/privacy`, `/law`, `/contact`)
- **管理画面** (`/admin/*`) - ユーザー管理、投稿管理、申込管理等
- **共通** - ヘッダー（検索、ナビ、通知、ユーザーメニュー）、フッター

## 主要URL一覧

| パス | 説明 |
|------|------|
| `/` | トップページ |
| `/voice-journals` | ボイスジャーナル一覧 |
| `/voice-journal/create` | ボイスジャーナル作成（録音） |
| `/songs/about` | ここロザシソング紹介 |
| `/songs/create` | ここロザシソング申込 |
| `/songs/showcase` | ここロザシソング一覧 |
| `/mypage` | マイページ |
| `/admin` | 管理画面 |
| `/columns` | コラム一覧 |
| `/about` | 初めての方へ |

## データモデル

### ストレージ
- 現在はダミーデータ（`src/data/dummy.ts`）を使用
- 本番はCloudflare D1（SQLite）を想定

### 主要モデル
- `User` - ユーザー情報（`can_post_kokorozashi_song`フラグあり）
- `VoiceJournal` - ボイスジャーナル（音声URL、公開範囲、タグ）
- `KokorozashiSong` - ここロザシソング（ジャケット画像、音声）
- `Comment` - コメント（VJ / Song 両対応）
- `Reaction` - リアクション（5種類: ❤️共感🫂応援📣すごい✨泣いた😢）
- `Topic` - 今日のお題
- `Column` - コラム記事
- `SongOrder` - ここロザシソング申込

## デプロイ

```bash
# ローカル開発
npm run build
pm2 start ecosystem.config.cjs

# Cloudflare Pages デプロイ
npm run deploy
```

## 未実装（Should/Nice）

- [ ] 今日のお題詳細ページ（`/voice-journals/topics`）
- [ ] ハッシュタグ詳細ページ（`/voice-journals/tags`）
- [ ] ここロザシソング投稿機能（管理者権限付与フロー）
- [ ] リアルタイム通知
- [ ] おすすめフィード
- [ ] 音声ファイルのクラウドストレージ（Cloudflare R2）
- [ ] メール認証
- [ ] 決済連携（Stripe等）
- [ ] 実際のDB接続（Cloudflare D1）

## 推奨次ステップ

1. Cloudflare D1 でDBを作成・マイグレーション
2. Cloudflare R2 で音声ファイル保存
3. JWT認証の実装
4. Stripeによる決済連携
5. メール認証フローの実装
6. Cloudflare Pages へデプロイ

## デザイン

- **カラー**: ブランドカラー オレンジ系 (#d4821e, #e86c28)
- **フォント**: ヒラギノ角ゴ ProN / Hiragino Sans
- **UIライブラリ**: TailwindCSS (CDN) + Font Awesome

---

© 2025 ここロザシラボ
