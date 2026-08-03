# 毛糸管理アプリ

編み物用の毛糸を色・メーカー・素材・太さなどで記録し、似た毛糸の重複購入を防ぐための個人用 Web アプリ。毛糸ごとに、その毛糸で作った作品メモも記録できます。

## 技術構成

- Next.js (App Router) / React / TypeScript
- Tailwind CSS
- Supabase（Postgres, Auth, Storage）

## セットアップ

### 1. Supabase プロジェクトを準備

1. [Supabase](https://supabase.com) でプロジェクトを作成します。
2. `supabase/migrations/0001_init.sql` の内容を Supabase の SQL Editor で実行し、テーブル・RLS ポリシー・Storage バケット (`photos`) を作成します。
3. Authentication の設定で、メール確認が不要な場合は "Confirm email" を無効にしておくと、開発時にすぐログインできます。

### 2. 環境変数を設定

`.env.example` を `.env.local` にコピーし、Supabase プロジェクトの値を設定します。

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 依存関係のインストールと起動

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開いてください。ログイン後、毛糸・作品メモの登録ができます。

## ディレクトリ構成

- `app/login` - ログイン／新規登録
- `app/yarns` - 毛糸の一覧・登録・詳細編集
- `app/projects` - 作品メモの一覧・登録・詳細編集
- `lib/supabase` - Supabase クライアント（ブラウザ／サーバー／セッション更新用 proxy）
- `lib/plan.ts` - 無料プランの写真枚数制限ロジック（将来の決済導線を差し込む拡張ポイント）
- `proxy.ts` - 未認証ユーザーを `/login` へリダイレクトするセッション管理（Next.js 16 で `middleware` から改称）
- `supabase/migrations` - テーブル・RLS・Storage バケットの定義

## マネタイズ（MVP範囲）

毛糸・作品メモの写真は無料プランで1枚までです。2枚目以降をアップロードしようとすると「有料プランは現在準備中です」というモーダルが表示され、アップロードはブロックされます。実際の決済処理は未実装ですが、`user_profiles.plan` カラムと `lib/plan.ts` の判定ロジックに、将来 Stripe 等の決済導線を差し込める設計にしています。
