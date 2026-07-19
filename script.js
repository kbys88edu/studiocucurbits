(function () {
  var root = document.querySelector('.site-shell');
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.site-nav');
  var buttons = document.querySelectorAll('[data-language]');

  if (!root || !toggle || !nav) return;

  var copy = {
    ja: {
      nav: ['スタジオ', 'サービス', 'AI / 人間', '人物', '作品', '制作工程'],
      menu: 'メニュー',
      inquiry: 'お問い合わせ',
      kicker: '音楽 / サウンド / AI / クリエイティブ・テクノロジー',
      hero: 'AIは音を広げる。人間の耳が意味を決める。',
      enter: 'スタジオへ <span aria-hidden="true">↓</span>',
      labels: ['01 / スタジオ', '02 / 実践', '03 / サービス', '04 / 人々', '05 / 作品', '06 / 制作工程'],
      headings: ['研究を、<br>音楽と体験へ。', '音を、背景ではなく<br>構造として扱う。', '核となる<br>専門性', '人々', '作品', '制作工程'],
      overview: [
        'Studio Cucurbits. は、作曲、サウンドデザイン、音声AI、空間音響、映像、パフォーマンスを横断する、音楽とクリエイティブ・テクノロジーのスタジオです。',
        '作曲家・クリエイティブテクノロジストの小林祥恵と、音声AIリサーチャーのFrederik Bousによる継続的な協働を基盤に、作品、映像、舞台、展示、プロダクトなど、複数領域にまたがるプロジェクトのための音響構造とAIオーディオを設計しています。',
        '小林祥恵は、器楽、電子音響、映像、VR、インタラクティブ・メディアを横断して活動する作曲家です。IRCAM Cursusでコンピュータ音楽を学び、Klangforum Wien、Ensemble Modern、Proton Ensemble、Contrechampsなどの演奏家・団体との協働を通して、身体、楽器、空間、テクノロジーの関係を扱う作品を制作してきました。作曲に加え、Max/MSP、TouchDesigner、WebXRなどを用いた音響システムやインタラクティブ作品の設計にも取り組んでいます。',
        'Frederik Bousは、音声合成、声質変換、歌声合成、音楽生成を専門とする音声AIリサーチャーです。SupertoneのResearch Scientistとして、音声合成や声質変換に用いられるNANSYの研究開発に携わり、IRCAMではニューラル音声変換に関する博士研究を行いました。制御可能かつ解釈可能な生成モデル、自己教師あり表現学習、ニューラル音声コーデックを主な研究領域としています。',
        'Studio Cucurbits. が目指すのは、芸術表現と研究開発を並列に置くことではなく、双方を一つの制作プロセスとして統合することです。声、音色、身体の動き、楽器、空間の響きを編集可能な素材として捉え、それぞれのプロジェクトに必要な表現、機能、体験へと変換します。',
        'AIによって広がる可能性を、人間の耳、身体、演奏行為、そして作品を取り巻く文脈への責任と結びつけること。それが、Studio Cucurbits. の制作姿勢です。'
      ],
      flow: ['研究', '素材', '体験'],
      practice: ['映像と身体的な空間のための音響構造。', 'コンセプト、身体、声、楽器、空間、技術の関係から、作品全体を支える音響構造を設計します。'],
      services: ['映像、舞台、パフォーマンスのためのオリジナル作曲。', '物語、空間、プロダクトに固有の音響設計。', '音声変換、生成音響、AIを用いた創作支援。', '展示、建築、舞台のための空間音響と実装。', 'ブランドやプロダクトのための聴覚的なアイデンティティ。', '実験的な音響システム、ソフトウェア、インタラクション。'],
      aiLabels: ['拡張', '判断'],
      aiHeadings: ['AIは音を<br>広げる。', '人間の耳が<br>意味を決める。'],
      aiCopy: ['探索の速度と音色の可能性を拡張する。', '文脈、沈黙、演奏、責任を引き受ける。'],
      roles: ['創設者 / 作曲家 / クリエイティブテクノロジスト', 'リサーチサイエンティスト / 音声AI'],
      website: 'ウェブサイト ↗',
      workLabels: ['パフォーマンス / AIオーディオ', 'インスタレーション / プロジェクション', '研究 / 声'],
      workTitles: ['Day 0 —<br>トランス・インストゥルメンタリズム', '空間のためのスコア', '素材としての声'],
      workCopy: ['音声、身体、楽器、空間を横断するパフォーマンスのための音響構造。', '映像と空間に応答する音響システム。', '声を編集可能な素材として扱う制作と研究。'],
      workCaption: 'パフォーマンス制作 / 空間音響',
      processHeadings: ['ブリーフ / リスニング', '方向性 / プロトタイプ', '制作 / 納品'],
      processCopy: ['目的、制約、聴き手、現場の条件を読み取る。', '音のスケッチ、素材、システムを試作する。', '制作、実装、調整、運用まで伴走する。'],
      contact: ['お問い合わせ', '話しましょう。'],
      footer: ['Studio Cucurbits. / 音楽とクリエイティブ・テクノロジー', '© 2026']
    },
    en: {
      nav: ['Studio', 'Services', 'AI / Human', 'People', 'Work', 'Process'],
      menu: 'Menu',
      inquiry: 'Inquiry',
      kicker: 'Music / Sound / AI / Creative Technology',
      hero: 'AI can expand sound. Human listening decides meaning.',
      enter: 'Enter studio <span aria-hidden="true">↓</span>',
      labels: ['01 / Studio', '02 / Practice', '03 / Services', '04 / People', '05 / Selected Work', '06 / Process'],
      headings: ['Research into<br>music and experience.', 'Sound is not background.<br>It is structure.', 'Core<br>competencies', 'People', 'Work', 'Process'],
      overview: [
        'Studio Cucurbits. is a music and creative technology studio working across composition, sound design, voice AI, spatial sound, moving image, and performance.',
        'Built on the ongoing collaboration of composer and creative technologist Sachie Kobayashi and voice-AI researcher Frederik Bous, we design sonic structures and AI audio for projects across art, film, stage, exhibition, and product.',
        'Sachie Kobayashi is a composer working across instrumental music, electroacoustics, moving image, VR, and interactive media. She studied computer music at IRCAM Cursus and has collaborated with performers and ensembles including Klangforum Wien, Ensemble Modern, Proton Ensemble, and Contrechamps. Alongside composition, she develops sound systems and interactive works with Max/MSP, TouchDesigner, and WebXR.',
        'Frederik Bous is a voice-AI researcher specializing in speech synthesis, voice conversion, singing synthesis, and music generation. As a Research Scientist at Supertone, he contributes to the research and development of NANSY for speech synthesis and voice conversion. His PhD research at IRCAM focused on neural voice conversion. His interests include controllable and interpretable generative models, self-supervised representation learning, and neural audio codecs.',
        'Studio Cucurbits. does not place artistic expression and research side by side. We integrate both into a single production process, treating voice, timbre, bodily movement, instruments, and the resonance of space as editable material and translating them into the expression, function, and experience each project needs.',
        'We connect the possibilities expanded by AI with responsibility to human listening, the body, acts of performance, and the context surrounding each work. This is Studio Cucurbits.\' practice.'
      ],
      flow: ['Research', 'Material', 'Experience'],
      practice: ['Sonic structures for cinematic and physical spaces.', 'We design sonic structures that support the full work through the relationships between concept, body, voice, instrument, space, and technology.'],
      services: ['Original composition for film, stage, and performance.', 'Sonic design specific to narrative, space, and product.', 'Voice transformation, generative audio, and AI-supported creation.', 'Spatial sound and implementation for exhibitions, architecture, and stage.', 'Auditory identities for brands and products.', 'Experimental audio systems, software, and interaction.'],
      aiLabels: ['Extension', 'Judgment'],
      aiHeadings: ['AI can expand<br>sound.', 'Human listening<br>decides meaning.'],
      aiCopy: ['Extending the speed of exploration and the possibilities of timbre.', 'Taking responsibility for context, silence, performance, and meaning.'],
      roles: ['Founder / Composer / Creative Technologist', 'Research Scientist / Voice AI'],
      website: 'Website ↗',
      workLabels: ['Performance / AI Audio', 'Installation / Projection', 'Research / Voice'],
      workTitles: ['Day 0 —<br>Trans-instrumentalism', 'Spatial scores', 'Voice as material'],
      workCopy: ['A sonic structure for performance across voice, body, instrument, and space.', 'Audio systems responsive to moving image and space.', 'Research and production that treat voice as editable material.'],
      workCaption: 'Performance production / spatial sound',
      processHeadings: ['Brief / Listening', 'Direction / Prototype', 'Production / Delivery'],
      processCopy: ['Reading the purpose, constraints, audience, and conditions of the site.', 'Prototyping sound sketches, materials, and systems.', 'Supporting production, implementation, tuning, and operation.'],
      contact: ['Inquiry', 'Start a conversation.'],
      footer: ['Studio Cucurbits. / Music and Creative Technology', '© 2026']
    }
  };

  function setAll(selector, values, html) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length && i < values.length; i += 1) {
      if (html) nodes[i].innerHTML = values[i];
      else nodes[i].textContent = values[i];
    }
  }

  function setLanguage(language) {
    var text = copy[language] || copy.ja;
    document.documentElement.lang = language;
    root.setAttribute('data-language', language);
    setAll('.site-nav a', text.nav);
    toggle.textContent = text.menu;
    document.querySelector('.nav-inquiry').textContent = text.inquiry;
    document.querySelector('.kicker').textContent = text.kicker;
    document.querySelector('.hero-copy').textContent = text.hero;
    setAll('.hero .text-link', [text.enter], true);
    setAll('.section-label > p', text.labels);
    setAll('.section-label h2', text.headings, true);
    setAll('.overview-column p', text.overview);
    setAll('.studio-flow li', text.flow);
    setAll('.practice-copy p', text.practice);
    setAll('.service-list p', text.services);
    setAll('.ai-section article > p', text.aiLabels);
    setAll('.ai-section h2', text.aiHeadings, true);
    setAll('.ai-section span', text.aiCopy);
    setAll('.person-card > p', text.roles);
    setAll('.person-card .text-link', [text.website, text.website]);
    setAll('.work-grid span', text.workLabels);
    setAll('.work-grid h3', text.workTitles, true);
    setAll('.work-grid p', text.workCopy);
    setAll('.work-wide figcaption', [text.workCaption]);
    setAll('.process-list h3', text.processHeadings);
    setAll('.process-list p', text.processCopy);
    setAll('.contact > p', [text.contact[0]]);
    setAll('.contact h2', [text.contact[1]]);
    setAll('footer span', text.footer);

    for (var i = 0; i < buttons.length; i += 1) {
      var active = buttons[i].getAttribute('data-language') === language;
      buttons[i].setAttribute('aria-pressed', String(active));
    }

    try { window.localStorage.setItem('studio-cucurbits-language', language); } catch (error) {}
  }

  function setupScrollReveal() {
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var revealTargets = document.querySelectorAll('.site-shell > main > section, .hero-inner, .service-list article, .person-card, .work-grid article, .process-list li, .overview-column, .practice-main figure, .ai-section article, .work-wide');
    var lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

    if (!revealTargets.length || reducedMotion) {
      for (var i = 0; i < revealTargets.length; i += 1) {
        revealTargets[i].classList.add('is-revealed');
        revealTargets[i].style.setProperty('--reveal-duration', '1s');
      }
      return;
    }

    for (var i = 0; i < revealTargets.length; i += 1) {
      var target = revealTargets[i];
      var isHeroElement = target.classList.contains('hero-inner');
      var isWideWork = target.classList.contains('work-wide');
      var delayGroup = i;

      target.classList.add('reveal-on-scroll');
      target.style.setProperty('--reveal-delay', String(delayGroup * 45) + 'ms');

      if (!isHeroElement && !isWideWork && i % 2 === 0) {
        target.classList.add('reveal-from-left');
      } else if (!isHeroElement && !isWideWork) {
        target.classList.add('reveal-from-right');
      }
    }

    var io = new IntersectionObserver(function (entries, observer) {
      for (var j = 0; j < entries.length; j += 1) {
        var entry = entries[j];
        var target = entry.target;
        if (entry.isIntersecting) {
          target.style.setProperty('--reveal-duration', '1s');
          entry.target.classList.add('is-revealed');
        } else {
          if (window.scrollY < lastScrollY) {
            target.style.setProperty('--reveal-duration', '320ms');
          } else {
            target.style.setProperty('--reveal-duration', '1s');
          }
          target.classList.remove('is-revealed');
        }
      }
      lastScrollY = window.scrollY;
    }, {
      threshold: 0.16,
      rootMargin: '0px 0px -10% 0px'
    });

    for (var k = 0; k < revealTargets.length; k += 1) {
      io.observe(revealTargets[k]);
    }
  }

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  nav.addEventListener('click', function () {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  });

  for (var i = 0; i < buttons.length; i += 1) {
    buttons[i].addEventListener('click', function () { setLanguage(this.getAttribute('data-language')); });
  }

  var saved = 'ja';
  try { saved = window.localStorage.getItem('studio-cucurbits-language') || saved; } catch (error) {}
  setLanguage(saved);
  setupScrollReveal();
})();
