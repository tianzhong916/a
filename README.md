# LiveDanmaku

Android向けの、Twitch / YouTube Live視聴画面＋ニコニコ動画風弾幕UIの試作品です。静的ファイルだけで動くため、GitHub Pagesに公開できます。

## 現在できること
- YouTube動画ID / URLから公式YouTube埋め込みプレイヤーを表示
- Twitchチャンネル名 / URLから公式Twitchプレイヤーを表示
- サンプル弾幕のアニメーション
- 速度、文字サイズ、透明度、密度の変更
- 手入力したテストコメントを画面に流す
- PWA manifest / service workerの基本設定

## まだ実装していないこと
**実際のTwitch / YouTubeライブコメントの自動取得は未実装です。** 現在流れるコメントはサンプル、または入力したプレビューコメントです。ライブコメント取得には、サービスごとのAPI・認証・利用条件を確認して追加する必要があります。秘密情報をブラウザ側のJavaScriptに埋め込まないでください。

## GitHub Pagesで公開する手順
1. GitHubで新しいリポジトリを作成します（例：`livedanmaku`）。
2. このZIPの中身をリポジトリのルートにアップロードします。`index.html`がルート直下にある状態にしてください。
3. リポジトリの **Settings → Pages** を開きます。
4. **Build and deployment → Deploy from a branch** を選びます。
5. Branchを `main`、フォルダを `/(root)` にして保存します。
6. 公開URLが表示されたら、AndroidのChromeで開きます。
7. Chromeのメニューから **ホーム画面に追加** または **アプリをインストール** を選びます。

## Twitchの注意
Twitchの埋め込みプレイヤーは `parent` パラメータを必要とします。この試作品は現在のホスト名を自動設定し、画面下に埋め込み先ドメインを表示します。GitHub Pagesの公開URLをChromeで直接開いてください。GitHubの編集画面や外部のプレビューiframe内から開くと、ホスト名が一致しない場合があります。Twitch公式仕様では埋め込みプレイヤーの表示領域は少なくとも400x300pxが必要です。

## テスト方法
- YouTube：公開ライブまたは動画のURL / IDを入力して「開く」
- Twitch：チャンネル名を入力して「開く」
- プレイヤーの上に流れる文字は、現状サンプル弾幕です
- 「弾幕プレビュー」から任意のテスト文字列を流せます

## ファイル
- `index.html`：画面構造
- `style.css`：スマホ向けデザイン
- `app.js`：プレイヤー切り替えと弾幕アニメーション
- `manifest.webmanifest`：PWA設定
- `sw.js`：基本的なオフラインキャッシュ
