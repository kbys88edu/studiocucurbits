import type { Localized } from './products';

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  items?: string[];
}

export interface LegalDocument {
  title: string;
  description: string;
  intro: string;
  sections: LegalSection[];
}

export type LegalSlug = 'privacy' | 'terms' | 'license' | 'refund' | 'business';

/**
 * Draft legal copy. Every document is rendered with LegalDraftNotice until the
 * wording is reviewed and approved; see docs/CONTENT_GUIDE.md before removing
 * that notice. The privacy document describes the processors the site actually
 * uses today, so it must be updated whenever that stack changes.
 */
export const sellerDisclosure = {
  operator: 'Sachie Kobayashi (Studio Cucurbits.)',
  representative: 'Sachie Kobayashi / 小林 祥恵',
  postalCode: '〒150-0043',
  address: '東京都渋谷区道玄坂1-10-8 渋谷道玄坂東急ビル2F-C',
  addressEn: 'Shibuya Dogenzaka Tokyu Building 2F-C, 1-10-8 Dogenzaka, Shibuya-ku, Tokyo 150-0043, Japan',
  phone: '050-5530-1800',
  phoneHours: '平日 10:00-18:00 JST',
  phoneHoursEn: 'Weekdays 10:00-18:00 JST',
  email: 'info@sachiekobayashi.com',
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
            'Purchase: name, email and payment details, collected by Paddle as the seller of record and never by this site.',
          ],
        },
        {
          heading: 'Who processes it',
          items: [
            'MailerLite — newsletter delivery. The subscription form posts directly to MailerLite.',
            'GitHub Pages — website hosting, which records standard server request logs.',
            'Paddle.com Market Ltd — our reseller and Merchant of Record. Paddle takes the order, the payment details and the tax, and issues the receipt. Card details never reach this site.',
          ],
        },
        {
          heading: 'What is not done',
          items: [
            'No advertising or cross-site tracking.',
            'No sale or rental of personal data.',
            'No profiling that produces automated decisions about you.',
          ],
        },
        {
          heading: 'Retention',
          paragraphs: ['Newsletter addresses are kept until you unsubscribe. Purchase and receipt records are kept as long as tax and accounting rules require.'],
        },
        {
          heading: 'Your requests',
          paragraphs: ['You can ask for a copy of your data, ask for corrections, or ask for deletion. Every newsletter email also carries a one-click unsubscribe link.'],
        },
        {
          heading: 'Contact',
          paragraphs: [`Send privacy requests to ${sellerDisclosure.email}.`],
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
            '購入：氏名・メールアドレス・支払い情報。これらは販売者であるPaddleが取得し、本サイトが受け取ることはありません。',
          ],
        },
        {
          heading: '処理者',
          items: [
            'MailerLite — ニュースレターの配信。登録フォームはMailerLiteへ直接送信されます。',
            'GitHub Pages — ウェブサイトのホスティング。標準的なサーバーリクエストログが記録されます。',
            'Paddle.com Market Ltd — 当社の再販業者およびMerchant of Record。注文・支払い情報・税の取り扱いと領収書の発行を行います。カード情報が本サイトに渡ることはありません。',
          ],
        },
        {
          heading: '行わないこと',
          items: [
            '広告目的の利用およびサイト横断のトラッキング。',
            '個人データの販売および貸与。',
            '自動的な決定を伴うプロファイリング。',
          ],
        },
        {
          heading: '保存期間',
          paragraphs: ['ニュースレターのアドレスは登録解除まで保存します。購入および領収の記録は、税務・会計上必要な期間保存します。'],
        },
        {
          heading: 'ご請求',
          paragraphs: ['保有データの開示、訂正、削除をご請求いただけます。ニュースレターの各メールには登録解除リンクを記載しています。'],
        },
        {
          heading: 'お問い合わせ',
          paragraphs: [`プライバシーに関するご請求は、${sellerDisclosure.email} へお送りください。`],
        },
      ],
    },
  },
  terms: {
    en: {
      title: 'Terms',
      description: 'Terms for using this website and buying Studio Cucurbits. products.',
      intro: 'These terms cover the use of this website and the purchase of products sold through it. Use of a purchased plugin is governed by the License.',
      sections: [
        {
          heading: 'The site',
          paragraphs: ['This site is published as-is. Pages describing forthcoming products state their current development state and may change before release.'],
        },
        {
          heading: 'Orders',
          paragraphs: ['Our order process is conducted by our online reseller Paddle.com. Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service enquiries and handles returns. A purchase is complete when Paddle confirms the payment and the download and licence details are issued. Prices are shown in the currency selected at checkout, and any tax due is calculated and charged by Paddle.'],
        },
        {
          heading: 'Delivery',
          paragraphs: ['Products are delivered digitally. No physical item is shipped. If delivery does not arrive, contact support and it will be reissued.'],
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
          paragraphs: ['注文処理はオンライン再販業者であるPaddle.comが行います。Paddle.comは全ての注文におけるMerchant of Record（販売者）であり、カスタマーサービスと返品の対応もPaddleが行います。購入は、Paddleによる決済の確認と、ダウンロードおよびライセンス情報の発行をもって完了します。価格は決済時に選択された通貨で表示し、課税される場合の税額はPaddleが計算して請求します。'],
        },
        {
          heading: '提供方法',
          paragraphs: ['製品はデジタルデータとして提供します。物理的な商品の発送はありません。提供が届かない場合は、サポートまでご連絡いただければ再発行します。'],
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
      title: 'License',
      description: 'What you may do with a Studio Cucurbits. plugin you have bought.',
      intro: 'Buying a product grants you a licence to use it. You do not acquire ownership of the software itself.',
      sections: [
        {
          heading: 'What you may do',
          items: [
            'Install and use the plugin on the computers you personally work on.',
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
          paragraphs: ['A licence covers one person. For several people working at the same time, buy one licence per person. Get in touch about larger installations.'],
        },
        {
          heading: 'Updates',
          paragraphs: ['Updates within a major version are included. A future major version may be a separate purchase.'],
        },
        {
          heading: 'Ending the licence',
          paragraphs: ['The licence ends if these conditions are broken. On a refund the licence ends and the plugin must be uninstalled.'],
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
            'ご自身が作業に使用するコンピューターへのインストールと使用。',
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
          paragraphs: ['1ライセンスは1名を対象とします。複数の方が同時に使用される場合は、人数分のライセンスをご購入ください。大規模な導入についてはご相談ください。'],
        },
        {
          heading: 'アップデート',
          paragraphs: ['同一メジャーバージョン内のアップデートは含まれます。将来のメジャーバージョンは別途購入となる場合があります。'],
        },
        {
          heading: 'ライセンスの終了',
          paragraphs: ['本条件に違反した場合、ライセンスは終了します。返金を受けた場合もライセンスは終了し、プラグインをアンインストールしていただきます。'],
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
          paragraphs: [`Write to ${sellerDisclosure.email} from the email address used at purchase. Paddle is the Merchant of Record and processes the refund to the original payment method; how long it takes to appear depends on your card issuer.`],
        },
        {
          heading: 'Before asking',
          paragraphs: ['If the problem is installation or compatibility, contact support first. Most of these are resolved quickly, and a working plugin is a better outcome than a refund. Asking first does not reduce your right to a refund inside the window.'],
        },
        {
          heading: 'After the licence ends',
          paragraphs: ['A refunded licence stops being valid. Please uninstall the plugin. Work you already produced with it remains yours.'],
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
          paragraphs: [`ご購入時のメールアドレスを添えて、${sellerDisclosure.email} へご連絡ください。Merchant of RecordであるPaddleが、ご購入時の支払い方法へ返金します。着金までの期間はカード発行会社により異なります。`],
        },
        {
          heading: 'ご連絡の前に',
          paragraphs: ['インストールや対応環境の問題であれば、まずサポートへご連絡ください。多くは短時間で解決し、動作する製品をお使いいただけるほうが良い結果になります。先にご相談いただいても、期間内の返金を受ける権利は変わりません。'],
        },
        {
          heading: 'ライセンスの終了',
          paragraphs: ['返金されたライセンスは無効になります。プラグインはアンインストールしてください。すでに制作された作品はご自身のものです。'],
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
            `Email: ${sellerDisclosure.email}`,
          ],
        },
        {
          heading: 'Price and additional costs',
          paragraphs: ['Each product page shows the price for that product. Any consumption tax is applied at checkout. You are responsible for your own internet connection charges; there are no shipping or handling fees, because nothing is shipped.'],
        },
        {
          heading: 'Payment',
          paragraphs: ['Card payment through Paddle.com Market Ltd, our reseller and Merchant of Record. Payment is taken when the order is placed.'],
        },
        {
          heading: 'Delivery',
          paragraphs: ['Download and licence details are issued immediately after payment is confirmed. If they do not arrive, contact us and they will be reissued.'],
        },
        {
          heading: 'Returns and refunds',
          paragraphs: ['A refund can be requested within 14 days of purchase, without giving a reason. The full conditions are on the Refunds page. Because products are delivered digitally, a refunded licence stops being valid and the plugin must be uninstalled.'],
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
            `メールアドレス：${sellerDisclosure.email}`,
          ],
        },
        {
          heading: '販売価格・商品代金以外の必要料金',
          paragraphs: ['販売価格は各製品ページに表示します。消費税が課される場合は決済時に加算されます。インターネット接続に必要な通信料はお客様のご負担となります。デジタル製品のため、送料および手数料はいただきません。'],
        },
        {
          heading: '支払方法・支払時期',
          paragraphs: ['再販業者かつMerchant of RecordであるPaddle.com Market Ltdを通じたクレジットカード決済です。ご注文時にお支払いが確定します。'],
        },
        {
          heading: '商品の引渡時期',
          paragraphs: ['決済の確認後、ダウンロードおよびライセンス情報を直ちに発行します。届かない場合はご連絡ください。再発行いたします。'],
        },
        {
          heading: '返品・キャンセル（返品特約）',
          paragraphs: ['ご購入から14日以内であれば、理由を問わず返金をご請求いただけます。詳細は返金ポリシーに記載しています。デジタル製品のため、返金されたライセンスは無効となり、プラグインはアンインストールしていただきます。'],
        },
        {
          heading: '動作環境',
          paragraphs: ['対応するプラグインフォーマットとオペレーティングシステムは、各製品ページに掲載しています。ご購入前にご確認ください。'],
        },
      ],
    },
  },
};
