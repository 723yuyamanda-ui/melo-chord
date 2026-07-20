// src/constants/aiReviews.ts

// 12キーそれぞれの音楽的な「響きの個性・属性」を定義
const KEY_CHARACTERISTICS: Record<string, { label: string; vibe: string; color: string }> = {
    "C":  { label: "Cメジャー", vibe: "純粋でまっすぐな、一切の曇りがない王道の響き", color: "雲一つない青空" },
    "C#": { label: "C#メジャー", vibe: "どこか非現実的で、夜のネオンのように艶やかな浮遊感", color: "深夜のサイバーシティ" },
    "D":  { label: "Dメジャー", vibe: "ギタリストが最も輝く、力強く瑞々しい生命力に溢れた響き", color: "眩しい太陽の光" },
    "D#": { label: "D#メジャー", vibe: "胸の奥を締め付ける、ボカロ曲やストリングスが最もエモく鳴り響くピッチ", color: "夕暮れ時の切なさ" },
    "E":  { label: "Eメジャー", vibe: "エネルギッシュで、感情の熱量がストレートに爆発するアッパーな響き", color: "ステージのスポットライト" },
    "F":  { label: "Fメジャー", vibe: "どこか優しく暖かで、包み込むような包容力と人間味のある響き", color: "温かい木漏れ日" },
    "F#": { label: "F#メジャー", vibe: "洗練されたお洒落さと、大人の哀愁が同居するドラマチックな響き", color: "トワイライトの街並み" },
    "G":  { label: "Gメジャー", vibe: "軽快でキャッチー、誰もが自然と笑顔になるアコースティックな響き", color: "爽やかな朝の風" },
    "G#": { label: "G#メジャー", vibe: "重厚でどこか神秘的。リスナーの涙腺を激しく揺さぶる劇的な響き", color: "祈りや宿命の夜空" },
    "A":  { label: "Aメジャー", vibe: "華やかで開放的。青春のきらめきがそのまま音になったような響き", color: "輝くステップ" },
    "A#": { label: "A#メジャー", vibe: "都会的で洗練されており、チルでLo-Fiな空間に最も溶け込む響き", color: "冷えたカクテルとネオン" },
    "B":  { label: "Bメジャー", vibe: "鋭く研ぎ澄まされ、張り詰めた空気感と内省的な美しさを持つ響き", color: "美しく冷たい結晶" }
  };
  
  export const AI_REVIEWS_MASTER: Record<string, (keyName: string) => string> = {
    // 👑 王道・J-POP
    "pop-1": (key) => {
      const info = KEY_CHARACTERISTICS[key] || { label: `${key}メジャー`, vibe: "調和の取れた響き", color: "音楽空間" };
      return `王道ヒットチャート進行が、${info.label}の持つ「${info.vibe}」と完璧に融合。まるで${info.color}のような世界観が広がり、サビに入った瞬間に圧倒的な主人公感が生まれ、胸を締め付けるメロディを極限まで引き立てます。`;
    },
    "pop-2": (key) => {
      const info = KEY_CHARACTERISTICS[key] || { label: `${key}メジャー`, vibe: "調和の取れた響き", color: "音楽空間" };
      return `伝統のカノン進行。${info.label}へ向かって美しく階段を降りていくベースラインが、キー特有の「${info.color}」の空気感を纏うことで、リスナーの記憶に深く眠るノスタルジーと涙腺を激しく刺激する、絶対的な感動をもたらします。`;
    },
    "pop-3": (key) => {
      const info = KEY_CHARACTERISTICS[key] || { label: `${key}メジャー`, vibe: "調和の取れた響き", color: "音楽空間" };
      return `疾走感抜群のリフレイン進行。${info.label}がもたらす「${info.vibe}」の要素が加わることで、切なさと力強さが絶妙なバランスでループし、${info.color}を駆け抜けるような中毒性の高いフックを量産できます。`;
    },
    "pop-4": (key) => {
      const info = KEY_CHARACTERISTICS[key] || { label: `${key}メジャー`, vibe: "調和の取れた響き", color: "音楽空間" };
      return `感情を爆発させる切な王道進行。${info.label}特有の「${info.color}」を想起させるエモーショナルな響きが、マイナーコードへの着地に劇的なドラマ性を与え、J-POPの真髄とも言える切ない歌詞の世界観に抜群の説得力を与えます。`;
    },
    "pop-5": (key) => {
      const info = KEY_CHARACTERISTICS[key] || { label: `${key}メジャー`, vibe: "調和の取れた響き", color: "音楽空間" };
      return `突き抜けるJ-ROCK進行。${info.label}の持つ「${info.vibe}」が、壁のように厚いバッキングの上で炸裂。${info.color}をバックに前を向いて力強く駆け出すような、凄まじい前進のエネルギーを楽曲に宿らせます。`;
    },
  
    // ☀️ ポジティブ
    "pos-1": (key) => {
      const info = KEY_CHARACTERISTICS[key] || { label: `${key}メジャー`, vibe: "調和の取れた響き", color: "音楽空間" };
      return `圧倒的な明るさと日常の幸福感。${info.label}の「${info.vibe}」という特性がそのまま活きるシンプルな並びだからこそ、まるで${info.color}のような飾らない笑顔や元気いっぱいのポップソングに100%マッチします。`;
    },
    "pos-2": (key) => {
      const info = KEY_CHARACTERISTICS[key] || { label: `${key}メジャー`, vibe: "調和の取れた響き", color: "音楽空間" };
      return `一歩ずつ踏み出していく前進のグルーヴ。${info.label}（${info.color}のイメージ）が持つ晴れやかな響きが、物語の始まりを予感させるハッピーな推進力を生み出し、聴く人すべての背中を力強く押してくれます。`;
    },
    "pos-3": (key) => {
      const info = KEY_CHARACTERISTICS[key] || { label: `${key}メジャー`, vibe: "調和の取れた響き", color: "音楽空間" };
      return `温もりとお洒落さが同居するカフェサウンド。${info.label}の主要和音を滑らかに巡るワークが、キー本来の「${info.vibe}」と共鳴。気取らない大人の休日や、心地よいミディアムポップスに最高の彩りを添えます。`;
    },
    "pos-4": (key) => {
      const info = KEY_CHARACTERISTICS[key] || { label: `${key}メジャー`, vibe: "調和の取れた響き", color: "音楽空間" };
      return `雲一つない開放感を描くブライト進行。${info.label}が持つ「${info.color}」のエッセンスがコードの躍動感をさらに高め、旅立ちや青春のハイライトシーンをこれ以上ないほど瑞々しく鮮やかに仕立て上げます。`;
    },
    "pos-5": (key) => {
      const info = KEY_CHARACTERISTICS[key] || { label: `${key}メジャー`, vibe: "調和の取れた響き", color: "音楽空間" };
      return `ゴールテープの向こう側に広がる感動のビクトリー進行。${info.label}の誇り高き「${info.vibe}」がリスナーの心を最大級に鼓舞し、スタジアム全体が${info.color}のような歓喜に包まれるような、熱い一体感を生みます。`;
    },
  
    // 🌃 切ない・エモ
    "emo-1": (key) => {
      const info = KEY_CHARACTERISTICS[key] || { label: `${key}メジャー`, vibe: "調和の取れた響き", color: "音楽空間" };
      return `夕暮れの街並みが脳裏に浮かぶセンチメンタリズム。${info.label}のトニックへ向かう切ない傾斜が、キー固有の「${info.vibe}」と融け合うことで、ボカロバラードのような「孤独な夜」や${info.color}の情景を鮮烈に描き出します。`;
    },
    "emo-2": (key) => {
      const info = KEY_CHARACTERISTICS[key] || { label: `${key}メジャー`, vibe: "調和の取れた響き", color: "音楽空間" };
      return `静まり返った夜の雨を連想させるディープな哀愁。少しダークで影のあるコード展開が、${info.label}の「${info.color}」の空気感と混ざり合い、リスナーの心の奥底にあるノスタルジーをこれでもかと刺激します。`;
    },
    "emo-3": (key) => {
      const info = KEY_CHARACTERISTICS[key] || { label: `${key}メジャー`, vibe: "調和の取れた響き", color: "音楽空間" };
      return `セピア色の写真を見つめているような回想の響き。繊細なコードのつながりが、${info.label}の持つ「${info.vibe}」によってさらに研ぎ澄まされ、過ぎ去った美しい${info.color}の日々を愛おしむような、極上の余韻を残します。`;
    },
    "emo-4": (key) => {
      const info = KEY_CHARACTERISTICS[key] || { label: `${key}メジャー`, vibe: "調和の取れた響き", color: "音楽空間" };
      return `ヒリヒリとしたエモロックの衝動。洗練された影と疾走感が同居する並びが、${info.label}の「${info.color}」のような独自の鋭さと美学をまとい、独自の個性を持つ楽曲に、唯一無二の鋭いエッジを与えます。`;
    },
    "emo-5": (key) => {
      const info = KEY_CHARACTERISTICS[key] || { label: `${key}メジャー`, vibe: "調和の取れた響き", color: "音楽空間" };
      return `張り裂けそうな胸の痛みをリアルに描き出す至高の悲哀進行。${info.label}が持つ「${info.vibe}」の重みがドラマチックに作用し、主人公が${info.color}の中で立ち尽くすような劇的なクライマックスを飾ります。`;
    },
  
    // ✨ アニソン劇的
    "ani-1": (key) => {
      const info = KEY_CHARACTERISTICS[key] || { label: `${key}メジャー`, vibe: "調和の取れた響き", color: "音楽空間" };
      return `仕込んだ瞬間に運命に抗う主人公の姿が再生される劇的構成。${info.label}の「${info.vibe}」がドラマ性を極限まで高め、まるで${info.color}の中に解き放たれたかのような、アニソン主题歌特有の圧倒的な風格を纏わせます。`;
    },
    "ani-2": (key) => {
      const info = KEY_CHARACTERISTICS[key] || { label: `${key}メジャー`, vibe: "調和の取れた響き", color: "音楽空間" };
      return `ゴシックでダーク、かつシンフォニックな世界観。退廃的な美しさが、${info.label}の「${info.color}」を想起させる冷徹な響きと交わることで、宿命を背負ったダークヒロインの戦闘テーマに最高峰の説得力を付与します。`;
    },
    "ani-3": (key) => {
      const info = KEY_CHARACTERISTICS[key] || { label: `${key}メジャー`, vibe: "調和の取れた響き", color: "音楽空間" };
      return `限界を突破して加速するアニロックのエネルギー。急激なドライブ感を与えるコード配置が、${info.label}本来の「${info.vibe}」によってさらにブーストされ、${info.color}の嵐を駆け抜けるようなボルテージを生み出します。`;
    },
    "ani-4": (key) => {
      const info = KEY_CHARACTERISTICS[key] || { label: `${key}メジャー`, vibe: "調和の取れた響き", color: "音楽空間" };
      return `果てしない大地へ旅立つ広大なファンタジー進行。叙事詩のような壮大な響きが、${info.label}の「${info.color}」のスケール感と奇跡的にシンクロし、仲間との深い絆や、壮大な冒険のハイライトを感動的に演出します。`;
    },
    "ani-5": (key) => {
      const info = KEY_CHARACTERISTICS[key] || { label: `${key}メジャー`, vibe: "調和の取れた響き", color: "音楽空間" };
      return `絶望の淵から何度でも立ち上がる、強固な絆を描く進行。目まぐるしく変わる色彩が、${info.label}の「${info.vibe}」によってスリリングに研ぎ澄まされ、${info.color}の瞬きのような圧倒的カタルシスをもたらします。`;
    },
  
    // 🍸 アーバンお洒落
    "urb-1": (key) => {
      const info = KEY_CHARACTERISTICS[key] || { label: `${key}メジャー`, vibe: "調和の取れた響き", color: "音楽空間" };
      return `ネオンが滲む深夜のドライブや極上のチルアウト空間。ジャズのテンションを含んだ進行が、${info.label}の「${info.vibe}」と融け合うことで、まさに${info.color}のような洗練された大人の哀愁と色気を部屋に満たします。`;
    },
    "urb-2": (key) => {
      const info = KEY_CHARACTERISTICS[key] || { label: `${key}メジャー`, vibe: "調和の取れた響き", color: "音楽空間" };
      return `現代に蘇るシティポップ直系のダンサブルなグルーヴ。気怠い都会の夜を演出するフックが、${info.label}の「${info.color}」のきらめきと完全に調和し、洋楽ライクで圧倒的にセンスの良いステップを刻み出します。`;
    },
    "urb-3": (key) => {
      const info = KEY_CHARACTERISTICS[key] || { label: `${key}メジャー`, vibe: "調和の取れた響き", color: "音楽空間" };
      return `Lo-Fiやチルホップに最適な心地よいラウンジサウンド。あえて解決を遅らせる浮遊感が、${info.label}本来の「${info.vibe}」と優しく溶け合い、深夜のベッドルームを${info.color}の深い癒やしでしっとりと包み込みます。`;
    },
    "urb-4": (key) => {
      const info = KEY_CHARACTERISTICS[key] || { label: `${key}メジャー`, vibe: "調和の取れた響き", color: "音楽空間" };
      return `冷えたカクテルが似合う本格派のジャジーステップ。洗練されたテンションの響きが、${info.label}の「${info.color}」のような高級感溢れる大人の質感と混ざり合い、リスナーを一瞬にして極上の社交場へと誘います。`;
    },
    "urb-5": (key) => {
      const info = KEY_CHARACTERISTICS[key] || { label: `${key}メジャー`, vibe: "調和の取れた響き", color: "音楽空間" };
      return `ベルベットのような手触りの甘美なR&B空間。都会的で贅沢な重低音が、${info.label}の持つ「${info.vibe}」によって極限までメロウに響き渡り、${info.color}のような深くハイエンドな質感を創り出します。`;
    }
  };