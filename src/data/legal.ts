import type { Localized } from './products';

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  items?: string[];
  links?: Array<{ label: string; href: string }>;
}

export interface LegalDocument {
  title: string;
  description: string;
  intro: string;
  sections: LegalSection[];
}

export type LegalSlug = 'privacy' | 'terms' | 'license' | 'refund' | 'business';

/**
 * Owner-approved legal copy, effective on the revision date below.
 * Update the SC-Docs mirrors from this source when publishing changes.
 */
export const legalRevision = '2026-09-27';

export const sellerDisclosure = {
  operator: 'Sachie Kobayashi (Studio Cucurbits.)',
  representative: 'Sachie Kobayashi / 小林 祥恵',
  postalCode: '〒150-0043',
  address: '東京都渋谷区道玄坂1-10-8 渋谷道玄坂東急ビル2F-C',
  addressEn: 'Shibuya Dogenzaka Tokyu Building 2F-C, 1-10-8 Dogenzaka, Shibuya-ku, Tokyo 150-0043, Japan',
  phone: '050-5530-1800',
  phoneHours: '平日 10:00-18:00 JST',
  phoneHoursEn: 'Weekdays 10:00-18:00 JST',
  // Purpose-specific mailboxes on the company domain. Never publish a personal address.
  email: {
    refunds: 'refunds@studiocucurbits.com',
    privacy: 'info@studiocucurbits.com',
    support: 'support@studiocucurbits.com',
    contact: 'contact@studiocucurbits.com',
  },
} as const;

export const legalDocuments: Record<LegalSlug, Localized<LegalDocument>> = {
  privacy: {
    en: {
      title: 'Privacy',
      description: 'How Studio Cucurbits. handles personal data on this site.',
      intro: 'This page describes what this website collects, who processes it, and how to ask for it to be removed.',
      sections: [
        {
          heading: 'What this site collects',
          paragraphs: ['This site is a static site. It sets no cookies of its own and asks for no account.'],
          items: [
            'Newsletter: your email address, when you submit the subscription form.',
            'Analytics: aggregate page and interaction counts, with no cookie and no cross-site identifier.',
            'Purchase: Paddle collects your name, email and payment details as the Merchant of Record. It sends our licensing service the customer and purchase information described below.',
            'Licence: if you buy a licence, our activation service holds the records needed to activate it. They are listed below.',
          ],
        },
        {
          heading: 'Who processes it',
          items: [
            'MailerLite — newsletter delivery. The subscription form posts directly to MailerLite.',
            'GitHub Pages — website hosting, which records standard server request logs.',
            'Paddle.com Market Ltd — our reseller and Merchant of Record. Paddle takes the order, the payment details and the tax, and issues the receipt. Payment details are entered through Paddle checkout.',
            'Amazon Web Services (AWS) — hosting for the activation service, its database and encrypted processing queues, and setup and recovery email delivery through Amazon SES. Access is restricted to service roles and authorized support and operations staff.',
          ],
          links: [
            { label: 'MailerLite privacy policy', href: 'https://www.mailerlite.com/legal/privacy-policy' },
            { label: 'GitHub privacy statement', href: 'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement' },
            { label: 'Paddle privacy policy', href: 'https://www.paddle.com/legal/privacy' },
            { label: 'AWS privacy notice', href: 'https://aws.amazon.com/privacy/' },
          ],
        },
        {
          heading: 'What we do not do',
          items: [
            'This site does not run advertising or cross-site tracking of its own.',
            'We do not sell or rent personal data.',
            'We do not use your licence data for advertising or profiling. Purchase, refund and chargeback notifications are processed automatically to update licence access.',
          ],
        },
        {
          heading: 'What we cannot speak for',
          paragraphs: [
            'These statements describe our use of the services above. Providers also describe their own handling of personal data, cookies and service logs in their policies, linked above. Those policies should be read alongside this notice.',
          ],
        },
        {
          heading: 'What a licence record holds',
          paragraphs: ['Buying a licence creates a record in our activation service. It holds:'],
          items: [
            'A customer identifier, which products you bought, and how many of your three computers are in use.',
            'Your Paddle customer identifier and initial checkout email, retained as the setup and recovery email. The account is bound to that customer identifier; accounts are not merged because they share an email address. Later checkout email changes do not automatically change this binding or recovery email.',
            'Paddle transaction and adjustment identifiers, the product price identifier, purchase, refund and chargeback status, and relevant timestamps, to keep licence access consistent with your purchase.',
            'A one-way hash of your licence code. The code itself is never stored, which is why we cannot read it back to you.',
            'For each activated computer: a device fingerprint, the name you choose for that computer, and the activation identifiers and times.',
            'Records of activation requests and their signed results, so a retry or a seat replacement cannot go wrong.',
            'Your IP address is used during a request to limit abuse. The activation application does not store or log the raw address; hosting providers may handle request data under their own policies.',
          ],
        },
        {
          heading: 'Purchase notifications and setup',
          paragraphs: [
            'After a confirmed purchase, checkout offers secure licence setup in the same browser tab. We also email a one-time setup link to the retained initial checkout email as a backup. Your activation code is shown once in your browser after you confirm setup in the tab or use a setup or recovery link; we do not email the code in plaintext.',
            'The licence database and ordinary application logs do not retain payment-card details, billing addresses or tax details. Authenticated notifications from Paddle can contain personal data while they await processing or failure investigation in encrypted queues. They are not copied into the licence database or ordinary logs.',
          ],
        },
        {
          heading: 'Retention',
          paragraphs: [
            'Newsletter addresses are kept until you unsubscribe. Paddle retains payment and receipt records under its own policy and applicable tax and accounting requirements.',
            'Licence records, including the Paddle account binding, retained email, purchase status, grants and revocations, are kept while the licence exists. They are what makes activation work: without them we cannot activate a new computer for you, move a seat, or recognize the licence you paid for. Ask us to delete them and the licence stops being usable on any new computer.',
            'Paddle event-processing receipts and ordinary application logs have a 14-day retention period. Receipt expiry is set from creation; database expiry deletion is asynchronous and may occur later. Successfully processed notifications are deleted from the encrypted queue; failed notifications can remain in encrypted queues for up to 14 days.',
            'Setup and recovery email jobs remain in the delivery queue for up to one day; failed jobs can remain in its encrypted failure queue for up to 14 days. Recovery links expire after 15 minutes; deletion of their database records is asynchronous.',
            'A licence already installed on a computer keeps working offline even after we delete our records. Removing the record prevents future activations; it does not reach into a machine and remove what is already there.',
          ],
        },
        {
          heading: 'Your requests',
          paragraphs: ['You can ask for a copy of your data, ask for corrections, or ask for deletion through the contact below. We verify the request and explain any required retention or backup limitations. Requests concerning payment records may also need Paddle’s own process. Every newsletter email also carries a one-click unsubscribe link.'],
        },
        {
          heading: 'Contact',
          paragraphs: [`Send privacy requests to ${sellerDisclosure.email.privacy}.`],
        },
      ],
    },
    ja: {
      title: 'プライバシー',
      description: 'Studio Cucurbits.が本サイトで個人データをどう扱うかについて。',
      intro: 'このページでは、本サイトが取得する情報、その処理者、削除の依頼方法を説明します。',
      sections: [
        {
          heading: '取得する情報',
          paragraphs: ['本サイトは静的サイトです。独自のCookieは設定せず、アカウント登録も求めません。'],
          items: [
            'ニュースレター：登録フォームを送信したときのメールアドレス。',
            'アクセス解析：Cookieおよびサイト横断の識別子を用いない、集計値としてのページ閲覧数と操作回数。',
            '購入：Merchant of RecordであるPaddleが氏名・メールアドレス・支払い情報を取得します。Paddleは以下に記載する顧客情報と購入情報を当方のライセンスサービスに送信します。',
            'ライセンス：ライセンスをご購入いただいた場合、認証に必要な記録を当方の認証サービスが保持します。内容は以下に記載します。',
          ],
        },
        {
          heading: '処理者',
          items: [
            'MailerLite — ニュースレターの配信。登録フォームはMailerLiteへ直接送信されます。',
            'GitHub Pages — ウェブサイトのホスティング。標準的なサーバーリクエストログが記録されます。',
            'Paddle.com Market Ltd — 当社の再販業者およびMerchant of Record。注文・支払い情報・税の取り扱いと領収書の発行を行います。支払い情報はPaddleの決済画面で入力します。',
            'Amazon Web Services（AWS）— 認証サービス、データベース、暗号化された処理キューのホスティング、およびAmazon SESによる初期設定・復旧メールの配信。アクセスはサービス用の権限と、許可されたサポート・運用担当者に制限します。',
          ],
          links: [
            { label: 'MailerLite privacy policy', href: 'https://www.mailerlite.com/legal/privacy-policy' },
            { label: 'GitHub privacy statement', href: 'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement' },
            { label: 'Paddle privacy policy', href: 'https://www.paddle.com/legal/privacy' },
            { label: 'AWS privacy notice', href: 'https://aws.amazon.com/privacy/' },
          ],
        },
        {
          heading: '当方が行わないこと',
          items: [
            '本サイト自身による広告目的の利用およびサイト横断のトラッキング。',
            '個人データの販売および貸与。',
            'ライセンス情報の広告・プロファイリングへの利用は行いません。購入・返金・チャージバックの通知は、ライセンスの利用権を更新するために自動処理します。',
          ],
        },
        {
          heading: '当方が保証できない範囲',
          paragraphs: [
            '本記載は、当方による上記サービスの利用について説明するものです。各事業者は、個人データ、Cookie、サービスのログについての自社の取り扱いも、上記リンク先の方針で説明しています。本通知と併せてご確認ください。',
          ],
        },
        {
          heading: 'ライセンス記録の内容',
          paragraphs: ['ライセンスをご購入いただくと、当方の認証サービスに記録が作成されます。内容は次のとおりです。'],
          items: [
            'お客様の識別子、購入された製品、3台のうち何台を使用中か。',
            'Paddleの顧客識別子と、初期設定・復旧先として保持する最初の決済時のメールアドレス。アカウントはこの顧客識別子に紐付け、メールアドレスが同じでも統合しません。その後の決済時のメールアドレス変更によって、この紐付けや復旧先が自動的に変更されることはありません。',
            'Paddleの取引・調整の識別子、製品価格の識別子、購入・返金・チャージバックの状態と関連する日時。ライセンスの利用権を購入状況と一致させるために使用します。',
            'ライセンスコードの一方向ハッシュ。コード自体は保存していないため、当方から読み出してお伝えすることはできません。',
            '認証した各コンピューターについて、デバイスの識別値、お客様が付けた名称、認証の識別子と日時。',
            '認証リクエストとその署名済み結果の記録。再試行や台数の入れ替えが破綻しないために必要です。',
            'IPアドレスはリクエスト処理中に不正利用を制限するために使用します。認証アプリケーションは生のアドレスを保存もログ記録もしません。ホスティング事業者は、自社の方針に従ってリクエストのデータを取り扱う場合があります。',
          ],
        },
        {
          heading: '購入通知と初期設定',
          paragraphs: [
            '購入の確認後、決済を行った同じブラウザーのタブで安全にライセンスを初期設定できます。予備として、保持している最初の決済時のメールアドレスにも一度限りの初期設定リンクを送信します。認証コードは、同じタブで初期設定を確定するか、初期設定または復旧リンクをブラウザーで確認した後に一度だけ表示します。コードを平文でメール送信することはありません。',
            'ライセンス用データベースと通常のアプリケーションログには、カード情報、請求先住所、税務情報を保存しません。Paddleからの認証済み通知には個人データが含まれる場合があり、処理待ちや失敗の調査中は暗号化されたキューに保持します。通知本文をライセンス用データベースや通常のログにコピーすることはありません。',
          ],
        },
        {
          heading: '保存期間',
          paragraphs: [
            'ニュースレターのアドレスは登録解除まで保存します。Paddleは、自社の方針と適用される税務・会計上の要件に従って支払いと領収の記録を保持します。',
            'Paddleとのアカウントの紐付け、保持するメールアドレス、購入状態、利用権の付与・失効を含むライセンス記録は、ライセンスが存在する間保存します。これは認証そのものを成立させる記録であり、削除すると新しいコンピューターでの認証、台数の入れ替え、ご購入いただいたライセンスの確認ができなくなります。',
            'Paddleのイベント処理記録と通常のアプリケーションログの保存期間は14日です。処理記録の期限は作成時から設定します。データベースの期限切れ記録の削除は非同期のため、実際の削除が後になる場合があります。処理に成功した通知は暗号化されたキューから削除し、失敗した通知は暗号化されたキューに最大14日間残る場合があります。',
            '初期設定・復旧メールの配信ジョブは配信キューに最大1日、失敗したジョブは暗号化された失敗用キューに最大14日間残る場合があります。復旧リンクは15分で期限切れになりますが、データベースの記録の削除は非同期です。',
            'すでにコンピューターにインストールされたライセンスは、当方が記録を削除した後もオフラインで動作し続けます。記録の削除は以後の認証を止めるものであり、お手元の端末から削除するものではありません。',
          ],
        },
        {
          heading: 'ご請求',
          paragraphs: ['以下の連絡先から、保有データの開示、訂正、削除をご請求いただけます。ご本人の請求であることを確認し、必要な保存やバックアップに関する制約をご説明します。支払い記録に関する請求には、Paddleの手続きも必要となる場合があります。ニュースレターの各メールには登録解除リンクを記載しています。'],
        },
        {
          heading: 'お問い合わせ',
          paragraphs: [`プライバシーに関するご請求は、${sellerDisclosure.email.privacy} へお送りください。`],
        },
      ],
    },
  },
  terms: {
    en: {
      title: 'Terms',
      description: 'Terms for using this website and buying Studio Cucurbits. products.',
      intro: 'These terms cover the use of this website and the purchase of products sold through it. Use of a purchased plugin is governed by the Licence.',
      sections: [
        {
          heading: 'The site',
          paragraphs: ['This site is published as-is. Pages describing forthcoming products state their current development state and may change before release.'],
        },
        {
          heading: 'Orders',
          paragraphs: ['Our order process is conducted by our online reseller Paddle.com. Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service enquiries and handles returns. Licences are one-time purchases, with a base price in US dollars. Paddle automatically selects a checkout currency where available and shows the final price before payment, including any tax it calculates and charges. A purchase is complete when Paddle confirms the payment and the licence setup details are issued.'],
        },
        {
          heading: 'Delivery',
          paragraphs: [
            'Products are delivered digitally. No physical item is shipped. Public downloads let you try the plugin in demo mode before buying; downloading does not grant a paid licence.',
            'After payment is confirmed, checkout offers secure initial licence setup in the same browser tab. We also email a one-time setup link to the initial checkout address retained for your licence account as a backup. Confirm setup in the tab or from the email to see your activation code once and use it to activate the plugin. The code is not emailed in plaintext. If you cannot use tab setup or the email does not arrive, contact support for help with delivery or recovery.',
          ],
        },
        {
          heading: 'Compatibility',
          paragraphs: ['The supported formats and operating systems published on the product page are the supported set. Compatibility outside that set is not promised, and a host or system outside it is not a defect.'],
        },
        {
          heading: 'Refunds',
          paragraphs: ['Refunds are covered by the Refund policy.'],
        },
        {
          heading: 'Liability',
          paragraphs: ['Studio Cucurbits. is not liable for lost work, lost recordings or lost income arising from use of a product. Keep backups of your projects and render important work before relying on any audio plugin.'],
        },
        {
          heading: 'Changes',
          paragraphs: ['These terms may change. The version in force is the one published at the time of your order.'],
        },
      ],
    },
    ja: {
      title: '利用規約',
      description: '本サイトの利用およびStudio Cucurbits.製品の購入に関する規約。',
      intro: '本規約は、本サイトの利用と、本サイトを通じた製品の購入について定めます。購入後のプラグインの利用にはライセンスが適用されます。',
      sections: [
        {
          heading: '本サイトについて',
          paragraphs: ['本サイトは現状のまま公開しています。発売前の製品を説明するページは、その時点の開発状況を示すものであり、発売までに変更される場合があります。'],
        },
        {
          heading: 'ご注文',
          paragraphs: ['注文処理はオンライン再販業者であるPaddle.comが行います。Paddle.comは全ての注文におけるMerchant of Record（販売者）であり、カスタマーサービスと返品の対応もPaddleが行います。ライセンスは買い切りで、基本価格は米ドルです。Paddleは対応する決済通貨を自動的に選択し、計算・請求する税額を含む最終価格を支払い前に表示します。購入は、Paddleによる決済の確認とライセンスの初期設定情報の発行をもって完了します。'],
        },
        {
          heading: '提供方法',
          paragraphs: [
            '製品はデジタルデータとして提供します。物理的な商品の発送はありません。公開ダウンロードにより、購入前にプラグインをデモモードでお試しいただけます。ダウンロードだけでは有料ライセンスは付与されません。',
            '決済の確認後、決済を行った同じブラウザーのタブで安全にライセンスを初期設定できます。予備として、ライセンスアカウントに保持している最初の決済時のメールアドレスにも一度限りの初期設定リンクを送信します。同じタブで初期設定を確定するか、メールのリンクを確認すると認証コードが一度だけ表示され、このコードでプラグインを認証できます。コードを平文でメール送信することはありません。タブで初期設定できない場合や初期設定メールが届かない場合は、配信や復旧についてサポートまでご連絡ください。',
          ],
        },
        {
          heading: '対応環境',
          paragraphs: ['製品ページに掲載した対応フォーマットとオペレーティングシステムが対応範囲です。範囲外の環境での動作は保証せず、範囲外のホストや環境で動作しないことは不具合には当たりません。'],
        },
        {
          heading: '返金',
          paragraphs: ['返金については返金ポリシーに定めます。'],
        },
        {
          heading: '責任の範囲',
          paragraphs: ['製品の使用に起因する制作物の消失、録音の消失、逸失利益について、Studio Cucurbits.は責任を負いません。プロジェクトのバックアップを保持し、重要な作業では書き出しを行ったうえでご利用ください。'],
        },
        {
          heading: '変更',
          paragraphs: ['本規約は変更される場合があります。適用されるのは、ご注文の時点で公開されていた版です。'],
        },
      ],
    },
  },
  license: {
    en: {
      title: 'Licence',
      description: 'What you may do with a Studio Cucurbits. plugin you have bought.',
      intro: 'Buying a product grants you a licence to use it. You do not acquire ownership of the software itself.',
      sections: [
        {
          heading: 'What you may do',
          items: [
            'Install and use the plugin on up to three of your own active computers.',
            'Use it in commercial work. Music, sound design and audio you produce with it are yours, and no further fee or credit is owed.',
            'Keep your own backup copies of the installer.',
          ],
        },
        {
          heading: 'What you may not do',
          items: [
            'Share, resell, sublicense or redistribute the plugin or its installer.',
            'Publish the licence details issued to you.',
            'Reverse engineer, decompile or repackage the plugin, except where that right cannot be excluded by law.',
            'Redistribute the factory presets as a preset product of your own.',
          ],
        },
        {
          heading: 'Studios and teams',
          paragraphs: ['A licence covers one person on up to three active computers. For several people working at the same time, buy one licence per person. Get in touch about larger installations.'],
        },
        {
          heading: 'Updates',
          paragraphs: ['Updates within a major version are included. A future major version may be a separate purchase.'],
        },
        {
          heading: 'Ending the licence',
          paragraphs: [
            'The licence ends if these conditions are broken. It also ends when a full refund is approved, including when cumulative approved refunds reach the full purchase price, or when a chargeback is approved. When the licence ends, the plugin must be uninstalled.',
            'Partial refunds are offered only to apply a later discount. The licence remains active while cumulative approved refunds stay below the full purchase price. Pending or rejected refunds do not change access. Chargeback warnings and pending chargebacks do not change access.',
            'An approved chargeback reversal restores access through a new licence grant; the previously revoked grant remains revoked.',
          ],
        },
      ],
    },
    ja: {
      title: 'ライセンス',
      description: '購入されたStudio Cucurbits.製品でできることについて。',
      intro: '製品の購入により、その製品を使用するライセンスが付与されます。ソフトウェアそのものの所有権が移転するものではありません。',
      sections: [
        {
          heading: 'できること',
          items: [
            'ご自身のコンピューター最大3台までのインストールと使用。',
            '商用の制作での使用。制作された音楽、サウンドデザイン、音声はご自身のものであり、追加の料金やクレジット表記は必要ありません。',
            'インストーラーのバックアップの保持。',
          ],
        },
        {
          heading: 'できないこと',
          items: [
            'プラグインおよびインストーラーの共有、転売、サブライセンス、再配布。',
            '発行されたライセンス情報の公開。',
            'リバースエンジニアリング、逆コンパイル、再パッケージ化。ただし法令により排除できない範囲を除きます。',
            'ファクトリープリセットを、ご自身のプリセット製品として再配布すること。',
          ],
        },
        {
          heading: 'スタジオ・チームでの利用',
          paragraphs: ['1ライセンスは1名・最大3台までを対象とします。複数の方が同時に使用される場合は、人数分のライセンスをご購入ください。大規模な導入についてはご相談ください。'],
        },
        {
          heading: 'アップデート',
          paragraphs: ['同一メジャーバージョン内のアップデートは含まれます。将来のメジャーバージョンは別途購入となる場合があります。'],
        },
        {
          heading: 'ライセンスの終了',
          paragraphs: [
            '本条件に違反した場合、ライセンスは終了します。全額返金が承認された場合（承認済み返金の累計が購入代金の全額に達した場合を含みます）、またはチャージバックが承認された場合も終了します。ライセンスの終了時には、プラグインをアンインストールしていただきます。',
            '一部返金は、後日実施される割引を適用する場合にのみ行います。承認済み返金の累計が購入代金の全額に達しない間、ライセンスは有効です。保留中または却下された返金では利用権は変わりません。チャージバックの警告や保留中のチャージバックでも利用権は変わりません。',
            'チャージバックの取消しが承認された場合、新たなライセンスの付与により利用権を回復します。以前に失効した付与は、失効したままです。',
          ],
        },
      ],
    },
  },
  refund: {
    en: {
      title: 'Refunds',
      description: 'When and how to get a refund on a Studio Cucurbits. product.',
      intro: 'Audio plugins cannot be returned like a physical object, so the policy is simple: if it does not work for you, ask.',
      sections: [
        {
          heading: 'The window',
          paragraphs: ['Ask for a refund within 14 days of purchase and it will be issued. You do not have to justify the request.'],
        },
        {
          heading: 'How to ask',
          paragraphs: [`Write to ${sellerDisclosure.email.refunds} from the email address used at purchase. Paddle is the Merchant of Record and processes the refund to the original payment method; how long it takes to appear depends on your card issuer.`],
        },
        {
          heading: 'Before asking',
          links: [{ label: 'Installation and support', href: '/support/' }],
          paragraphs: [`If the problem is installation or compatibility, write to ${sellerDisclosure.email.support} first. Most of these are resolved quickly, and a working plugin is a better outcome than a refund. Asking first does not reduce your right to a refund inside the window.`],
        },
        {
          heading: 'Refunds and licence access',
          paragraphs: [
            'An approved full refund ends the licence, including when cumulative approved refunds reach the full purchase price. Please uninstall the plugin when the licence ends. Work you already produced with it remains yours.',
            'Partial refunds are offered only to apply a later discount. The licence remains active while cumulative approved refunds stay below the full purchase price. Pending or rejected refunds do not change access.',
            'An approved chargeback ends the licence; a warning or pending chargeback does not. An approved chargeback reversal restores access through a new licence grant; the previously revoked grant remains revoked.',
          ],
        },
        {
          heading: 'Limits',
          paragraphs: ['Repeated buy-and-refund on the same product may be declined. Nothing here reduces the rights you have under the consumer law that applies to you.'],
        },
      ],
    },
    ja: {
      title: '返金',
      description: 'Studio Cucurbits.製品の返金の条件と手続き。',
      intro: 'オーディオプラグインは物理的な商品のように返品できません。そのため方針は単純です。うまく動かない場合は、ご連絡ください。',
      sections: [
        {
          heading: '期間',
          paragraphs: ['ご購入から14日以内にご連絡いただければ返金します。理由の説明は必要ありません。'],
        },
        {
          heading: 'お手続き',
          paragraphs: [`ご購入時のメールアドレスを添えて、${sellerDisclosure.email.refunds} へご連絡ください。Merchant of RecordであるPaddleが、ご購入時の支払い方法へ返金します。着金までの期間はカード発行会社により異なります。`],
        },
        {
          heading: 'ご連絡の前に',
          links: [{ label: 'インストールとサポート', href: '/ja/support/' }],
          paragraphs: [`インストールや対応環境の問題であれば、まず ${sellerDisclosure.email.support} へご連絡ください。多くは短時間で解決し、動作する製品をお使いいただけるほうが良い結果になります。先にご相談いただいても、期間内の返金を受ける権利は変わりません。`],
        },
        {
          heading: '返金とライセンスの利用権',
          paragraphs: [
            '全額返金が承認された場合、ライセンスは終了します。承認済み返金の累計が購入代金の全額に達した場合も同様です。ライセンスが終了した場合は、プラグインをアンインストールしてください。すでに制作された作品はご自身のものです。',
            '一部返金は、後日実施される割引を適用する場合にのみ行います。承認済み返金の累計が購入代金の全額に達しない間、ライセンスは有効です。保留中または却下された返金では利用権は変わりません。',
            '承認されたチャージバックによりライセンスは終了しますが、警告や保留中のチャージバックでは終了しません。チャージバックの取消しが承認された場合、新たなライセンスの付与により利用権を回復します。以前に失効した付与は、失効したままです。',
          ],
        },
        {
          heading: '制限',
          paragraphs: ['同一製品での購入と返金の反復についてはお断りする場合があります。本ポリシーは、お客様に適用される消費者法上の権利を制限するものではありません。'],
        },
      ],
    },
  },
  business: {
    en: {
      title: 'Business information',
      description: 'Seller, contact and trading details for Studio Cucurbits.',
      intro: 'The seller behind this site, and the trading terms required for online sales in Japan.',
      sections: [
        {
          heading: 'Seller',
          items: [
            `Operator: ${sellerDisclosure.operator}`,
            `Representative: ${sellerDisclosure.representative}`,
            `Address: ${sellerDisclosure.addressEn}`,
            `Phone: ${sellerDisclosure.phone} (${sellerDisclosure.phoneHoursEn})`,
            `Email: ${sellerDisclosure.email.contact}`,
            `Support: ${sellerDisclosure.email.support}`,
          ],
        },
        {
          heading: 'Price and additional costs',
          paragraphs: ['Each product page shows the one-time licence price in US dollars. Paddle automatically selects a checkout currency where available and shows the final price, including any applicable tax, before payment. You are responsible for your own internet connection charges; there are no shipping or handling fees, because nothing is shipped.'],
        },
        {
          heading: 'Payment',
          paragraphs: ['Card payment through Paddle.com Market Ltd, our reseller and Merchant of Record. Payment is taken when the order is placed.'],
        },
        {
          heading: 'Delivery',
          paragraphs: ['Public downloads are available to try in demo mode before purchase. After payment is confirmed, checkout offers secure initial licence setup in the same browser tab. We also email a one-time setup link to the initial checkout address retained for your licence account as a backup. The activation code is shown once after you confirm setup in the tab or from the email; it is not emailed in plaintext. If you cannot use tab setup or the email does not arrive, contact us for help with delivery or recovery.'],
        },
        {
          heading: 'Returns and refunds',
          paragraphs: ['A refund can be requested within 14 days of purchase, without giving a reason. The full conditions are on the Refunds page. An approved full refund, including cumulative approved refunds reaching the full purchase price, ends the licence and requires the plugin to be uninstalled. Partial refunds apply only to later discounts and keep the licence active while cumulative approved refunds remain below the full purchase price. Pending or rejected refunds do not change access.'],
        },
        {
          heading: 'Operating requirements',
          paragraphs: ['The supported plugin formats and operating systems are published on each product page. Check them before buying.'],
        },
      ],
    },
    ja: {
      title: '特定商取引法に基づく表記',
      description: 'Studio Cucurbits.の販売事業者情報および取引条件。',
      intro: '特定商取引法に基づき、販売事業者と取引条件を表示します。',
      sections: [
        {
          heading: '販売業者',
          items: [
            `事業者名：${sellerDisclosure.operator}`,
            `運営統括責任者：${sellerDisclosure.representative}`,
            `所在地：${sellerDisclosure.postalCode} ${sellerDisclosure.address}`,
            `電話番号：${sellerDisclosure.phone}（${sellerDisclosure.phoneHours}）`,
            `メールアドレス：${sellerDisclosure.email.contact}`,
            `サポート：${sellerDisclosure.email.support}`,
          ],
        },
        {
          heading: '販売価格・商品代金以外の必要料金',
          paragraphs: ['買い切りライセンスの販売価格は各製品ページに米ドルで表示します。Paddleは対応する決済通貨を自動的に選択し、適用される税額を含む最終価格を支払い前に表示します。インターネット接続に必要な通信料はお客様のご負担となります。デジタル製品のため、送料および手数料はいただきません。'],
        },
        {
          heading: '支払方法・支払時期',
          paragraphs: ['再販業者かつMerchant of RecordであるPaddle.com Market Ltdを通じたクレジットカード決済です。ご注文時にお支払いが確定します。'],
        },
        {
          heading: '商品の引渡時期',
          paragraphs: ['ご購入前に公開ダウンロードをデモモードでお試しいただけます。決済の確認後、決済を行った同じブラウザーのタブで安全にライセンスを初期設定できます。予備として、ライセンスアカウントに保持している最初の決済時のメールアドレスにも一度限りの初期設定リンクを送信します。同じタブで初期設定を確定するか、メールのリンクを確認すると認証コードが一度だけ表示されます。コードを平文でメール送信することはありません。タブで初期設定できない場合や初期設定メールが届かない場合は、配信や復旧についてご連絡ください。'],
        },
        {
          heading: '返品・キャンセル（返品特約）',
          paragraphs: ['ご購入から14日以内であれば、理由を問わず返金をご請求いただけます。詳細は返金ポリシーに記載しています。全額返金が承認された場合（承認済み返金の累計が購入代金の全額に達した場合を含みます）、ライセンスは終了し、プラグインをアンインストールしていただきます。一部返金は後日の割引を適用する場合に限り、承認済み返金の累計が購入代金の全額に達しない間、ライセンスは有効です。保留中または却下された返金では利用権は変わりません。'],
        },
        {
          heading: '動作環境',
          paragraphs: ['対応するプラグインフォーマットとオペレーティングシステムは、各製品ページに掲載しています。ご購入前にご確認ください。'],
        },
      ],
    },
  },
};
